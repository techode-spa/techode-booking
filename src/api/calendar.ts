import { google } from "googleapis";
import type { TimeSlot, DayAvailability } from "../types";

interface CalendarConfig {
  calendarId: string;
  credentials: string;
  timezone: string;
  availableDays: number[];
  availableHours: { start: number; end: number };
  duration: number;
  bufferMinutes: number;
}

function getAuth(credentials: string) {
  let parsed: Record<string, string>;
  try {
    // Try base64 first
    parsed = JSON.parse(Buffer.from(credentials, "base64").toString("utf-8"));
  } catch {
    // Try raw JSON
    parsed = JSON.parse(credentials);
  }

  return new google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });
}

export async function getAvailability(
  config: CalendarConfig,
  month: number, // 0-indexed
  year: number
): Promise<DayAvailability[]> {
  const auth = getAuth(config.credentials);
  const calendar = google.calendar({ version: "v3", auth });

  // Build date range for the month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0); // Last day of month

  const now = new Date();

  const freeBusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: new Date(endDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      timeZone: config.timezone,
      items: [{ id: config.calendarId }],
    },
  });

  const busySlots =
    freeBusyRes.data.calendars?.[config.calendarId]?.busy || [];

  const results: DayAvailability[] = [];

  for (let day = 1; day <= endDate.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();

    // Skip unavailable days
    if (!config.availableDays.includes(dayOfWeek)) continue;

    // Skip past dates
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;

    const slots: TimeSlot[] = [];

    for (let hour = config.availableHours.start; hour < config.availableHours.end; hour++) {
      const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + config.duration * 60 * 1000);

      // Skip slots in the past
      if (slotStart <= now) {
        slots.push({ hour, minute: 0, available: false });
        continue;
      }

      // Check if slot overlaps with any busy period (including buffer)
      const bufferMs = config.bufferMinutes * 60 * 1000;
      const slotStartWithBuffer = new Date(slotStart.getTime() - bufferMs);
      const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferMs);

      const isBusy = busySlots.some((busy) => {
        const busyStart = new Date(busy.start!);
        const busyEnd = new Date(busy.end!);
        return slotStartWithBuffer < busyEnd && slotEndWithBuffer > busyStart;
      });

      slots.push({ hour, minute: 0, available: !isBusy });
    }

    // Only include days that have at least one available slot
    if (slots.some((s) => s.available)) {
      results.push({ date: dateStr, slots });
    }
  }

  return results;
}

export async function createEvent(
  config: CalendarConfig,
  date: string, // YYYY-MM-DD
  time: string, // HH:MM
  attendee: { name: string; email: string; service: string; message: string }
) {
  const auth = getAuth(config.credentials);
  const calendar = google.calendar({ version: "v3", auth });

  const startDateTime = `${date}T${time}:00`;
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + config.duration * 60 * 1000);

  // Verify slot is still available
  const freeBusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(start.getTime() - config.bufferMinutes * 60 * 1000).toISOString(),
      timeMax: new Date(end.getTime() + config.bufferMinutes * 60 * 1000).toISOString(),
      timeZone: config.timezone,
      items: [{ id: config.calendarId }],
    },
  });

  const busySlots =
    freeBusyRes.data.calendars?.[config.calendarId]?.busy || [];

  if (busySlots.length > 0) {
    throw new Error("SLOT_TAKEN");
  }

  const description = [
    `Servicio: ${attendee.service}`,
    attendee.message ? `Mensaje: ${attendee.message}` : "",
    `Email: ${attendee.email}`,
  ]
    .filter(Boolean)
    .join("\n");

  const event = await calendar.events.insert({
    calendarId: config.calendarId,
    requestBody: {
      summary: `Llamada Techode — ${attendee.name}`,
      description,
      start: { dateTime: start.toISOString(), timeZone: config.timezone },
      end: { dateTime: end.toISOString(), timeZone: config.timezone },
      attendees: [{ email: attendee.email, displayName: attendee.name }],
    },
  });

  return event.data;
}
