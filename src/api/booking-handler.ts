import type { BookingHandlerOptions, BookingResponse, BookingFormData } from "../types";
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

  return {
    name: trimName,
    email: trimEmail,
    service: trimService,
    message: trimMessage,
    date: trimDate,
    time: trimTime,
  };
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

  const calendarConfig = {
    calendarId: googleCalendarId,
    credentials: googleCredentials,
    timezone,
    availableDays,
    availableHours,
    duration,
    bufferMinutes,
  };

  return async (req: {
    action: "availability" | "book";
    body: Record<string, unknown>;
    ip: string;
  }): Promise<BookingResponse> => {
    // --- GET AVAILABILITY ---
    if (req.action === "availability") {
      const { month, year } = req.body as { month?: number; year?: number };
      const now = new Date();
      const m = typeof month === "number" ? month : now.getMonth();
      const y = typeof year === "number" ? year : now.getFullYear();

      try {
        const availability = await getAvailability(calendarConfig, m, y);
        return { status: 200, body: { availability } };
      } catch (err) {
        console.error("Calendar availability error:", err);
        return { status: 500, body: { error: "No se pudo obtener la disponibilidad" } };
      }
    }

    // --- BOOK APPOINTMENT ---
    if (req.action === "book") {
      // Rate limit
      if (!checkRateLimit(req.ip, rateLimit)) {
        return { status: 429, body: { error: "Demasiadas solicitudes. Intenta mas tarde." } };
      }

      // Validate
      const result = validate(req.body);
      if (typeof result === "string") {
        return { status: 400, body: { error: result } };
      }

      const data = result;

      try {
        // Create Google Calendar event
        await createEvent(calendarConfig, data.date, data.time, {
          name: data.name,
          email: data.email,
          service: data.service,
          message: data.message,
        });

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
