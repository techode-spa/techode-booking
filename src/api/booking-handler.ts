import type { BookingHandlerOptions, BookingResponse, BookingFormData, DayAvailability, TimeSlot } from "../types";
import { getAvailability, createEvent } from "./calendar";
import { checkRateLimit } from "./rate-limiter";
import { buildUserEmail, buildNotifyEmail, sendEmail } from "./email";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: Record<string, unknown>): BookingFormData | string {
  const { name, email, service, message, date, time } = body;

  if (typeof name !== "string" || typeof email !== "string" ||
      typeof service !== "string" || typeof date !== "string" ||
      typeof time !== "string") {
    return "Campos invalidos";
  }

  if (message !== undefined && message !== null && typeof message !== "string") {
    return "Campos invalidos";
  }

  const trimName = name.trim();
  const trimEmail = email.trim();
  const trimService = service.trim();
  const trimMessage = typeof message === "string" ? message.trim() : "";
  const trimDate = date.trim();
  const trimTime = time.trim();

  if (!trimName || trimName.length > 100) return "Nombre invalido";
  if (!trimEmail || trimEmail.length > 254 || !EMAIL_REGEX.test(trimEmail)) return "Email invalido";
  if (!trimService || trimService.length > 100) return "Servicio invalido";
  if (trimMessage.length > 500) return "Mensaje muy largo";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimDate)) return "Fecha invalida";
  if (!/^\d{2}:\d{2}$/.test(trimTime)) return "Hora invalida";

  // Validate date is a real date
  const dateObj = new Date(trimDate + "T00:00:00");
  if (isNaN(dateObj.getTime())) return "Fecha invalida";

  // Validate time components
  const [hourStr, minuteStr] = trimTime.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return "Hora invalida";

  return {
    name: trimName,
    email: trimEmail,
    service: trimService,
    message: trimMessage,
    date: trimDate,
    time: trimTime,
  };
}

function validateBookingSlot(
  date: string,
  time: string,
  availableDays: number[],
  availableHours: { start: number; end: number }
): string | null {
  const dateObj = new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();
  const hour = parseInt(time.split(":")[0], 10);

  // Check day is available
  if (!availableDays.includes(dayOfWeek)) return "Dia no disponible";

  // Check hour is within range
  if (hour < availableHours.start || hour >= availableHours.end) return "Hora fuera de horario";

  // Check date is not in the past
  const now = new Date();
  const slotDate = new Date(date + "T" + time + ":00");
  if (slotDate <= now) return "Horario ya pasado";

  return null;
}

/** Generate availability locally without Google Calendar */
function getLocalAvailability(
  month: number,
  year: number,
  availableDays: number[],
  availableHours: { start: number; end: number }
): DayAvailability[] {
  const now = new Date();
  const endDate = new Date(year, month + 1, 0);
  const results: DayAvailability[] = [];

  for (let day = 1; day <= endDate.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();

    if (!availableDays.includes(dayOfWeek)) continue;
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;

    const slots: TimeSlot[] = [];
    for (let hour = availableHours.start; hour < availableHours.end; hour++) {
      const slotStart = new Date(year, month, day, hour, 0);
      slots.push({ hour, minute: 0, available: slotStart > now });
    }

    if (slots.some((s) => s.available)) {
      results.push({ date: dateStr, slots });
    }
  }

  return results;
}

export function createBookingHandler(options: BookingHandlerOptions) {
  const {
    googleCalendarId,
    googleCredentials,
    resendApiKey,
    notifyEmail,
    availableDays = [1, 2, 3, 4, 5],
    availableHours = { start: 14, end: 19 },
    duration = 60,
    timezone = "America/Santiago",
    bufferMinutes = 15,
    rateLimit = 5,
  } = options;

  const useGoogleCalendar = !!(googleCalendarId && googleCredentials);

  const calendarConfig = useGoogleCalendar
    ? {
        calendarId: googleCalendarId!,
        credentials: googleCredentials!,
        timezone,
        availableDays,
        availableHours,
        duration,
        bufferMinutes,
      }
    : null;

  return async (req: {
    action: string;
    body: Record<string, unknown>;
    ip: string;
  }): Promise<BookingResponse> => {
    // Validate action
    if (req.action !== "availability" && req.action !== "book") {
      return { status: 400, body: { error: "Accion invalida" } };
    }

    // --- GET AVAILABILITY ---
    if (req.action === "availability") {
      const { month, year } = req.body as { month?: unknown; year?: unknown };
      const now = new Date();
      const m = typeof month === "number" && month >= 0 && month <= 11 ? month : now.getMonth();
      const y = typeof year === "number" && year >= now.getFullYear() && year <= now.getFullYear() + 1 ? year : now.getFullYear();

      try {
        const availability = useGoogleCalendar && calendarConfig
          ? await getAvailability(calendarConfig, m, y)
          : getLocalAvailability(m, y, availableDays, availableHours);
        return { status: 200, body: { availability } };
      } catch (err) {
        console.error("Calendar availability error:", err);
        return { status: 500, body: { error: "No se pudo obtener la disponibilidad" } };
      }
    }

    // --- BOOK APPOINTMENT ---
    if (req.action === "book") {
      if (!checkRateLimit(req.ip, rateLimit)) {
        return { status: 429, body: { error: "Demasiadas solicitudes. Intenta mas tarde." } };
      }

      const result = validate(req.body);
      if (typeof result === "string") {
        return { status: 400, body: { error: result } };
      }

      const data = result;

      // Validate slot is within allowed days/hours
      const slotError = validateBookingSlot(data.date, data.time, availableDays, availableHours);
      if (slotError) {
        return { status: 400, body: { error: slotError } };
      }

      try {
        // Create Google Calendar event (if configured)
        if (useGoogleCalendar && calendarConfig) {
          await createEvent(calendarConfig, data.date, data.time, {
            name: data.name,
            email: data.email,
            service: data.service,
            message: data.message,
          });
        }

        // Send confirmation email to user
        const userEmail = buildUserEmail({
          name: data.name,
          date: data.date,
          time: data.time,
          service: data.service,
          duration,
        });
        await sendEmail(
          resendApiKey,
          data.email,
          `Techode <onboarding@resend.dev>`,
          userEmail.subject,
          userEmail.html
        );

        // Send notification email to Techode
        const notify = buildNotifyEmail({
          name: data.name,
          email: data.email,
          date: data.date,
          time: data.time,
          service: data.service,
          message: data.message,
          duration,
          ip: req.ip,
        });
        await sendEmail(
          resendApiKey,
          notifyEmail,
          `Techode Booking <onboarding@resend.dev>`,
          notify.subject,
          notify.html
        );

        return { status: 200, body: { success: true } };
      } catch (err) {
        if (err instanceof Error && err.message === "SLOT_TAKEN") {
          return { status: 409, body: { error: "Este horario ya no esta disponible. Selecciona otro." } };
        }
        console.error("Booking error:", err);
        return { status: 500, body: { error: "Error al agendar. Intenta de nuevo." } };
      }
    }

    return { status: 400, body: { error: "Accion invalida" } };
  };
}
