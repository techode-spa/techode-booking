"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/api/index.ts
var api_exports = {};
__export(api_exports, {
  createBookingHandler: () => createBookingHandler
});
module.exports = __toCommonJS(api_exports);

// src/api/calendar.ts
var import_googleapis = require("googleapis");
function getAuth(credentials) {
  let parsed;
  try {
    parsed = JSON.parse(Buffer.from(credentials, "base64").toString("utf-8"));
  } catch {
    parsed = JSON.parse(credentials);
  }
  return new import_googleapis.google.auth.GoogleAuth({
    credentials: parsed,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });
}
async function getAvailability(config, month, year) {
  const auth = getAuth(config.credentials);
  const calendar = import_googleapis.google.calendar({ version: "v3", auth });
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  const now = /* @__PURE__ */ new Date();
  const freeBusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: startDate.toISOString(),
      timeMax: new Date(endDate.getTime() + 24 * 60 * 60 * 1e3).toISOString(),
      timeZone: config.timezone,
      items: [{ id: config.calendarId }]
    }
  });
  const busySlots = freeBusyRes.data.calendars?.[config.calendarId]?.busy || [];
  const results = [];
  for (let day = 1; day <= endDate.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();
    if (!config.availableDays.includes(dayOfWeek)) continue;
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;
    const slots = [];
    for (let hour = config.availableHours.start; hour < config.availableHours.end; hour++) {
      const slotStart = /* @__PURE__ */ new Date(`${dateStr}T${String(hour).padStart(2, "0")}:00:00`);
      const slotEnd = new Date(slotStart.getTime() + config.duration * 60 * 1e3);
      if (slotStart <= now) {
        slots.push({ hour, minute: 0, available: false });
        continue;
      }
      const bufferMs = config.bufferMinutes * 60 * 1e3;
      const slotStartWithBuffer = new Date(slotStart.getTime() - bufferMs);
      const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferMs);
      const isBusy = busySlots.some((busy) => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return slotStartWithBuffer < busyEnd && slotEndWithBuffer > busyStart;
      });
      slots.push({ hour, minute: 0, available: !isBusy });
    }
    if (slots.some((s) => s.available)) {
      results.push({ date: dateStr, slots });
    }
  }
  return results;
}
async function createEvent(config, date, time, attendee) {
  const auth = getAuth(config.credentials);
  const calendar = import_googleapis.google.calendar({ version: "v3", auth });
  const startDateTime = `${date}T${time}:00`;
  const start = new Date(startDateTime);
  const end = new Date(start.getTime() + config.duration * 60 * 1e3);
  const freeBusyRes = await calendar.freebusy.query({
    requestBody: {
      timeMin: new Date(start.getTime() - config.bufferMinutes * 60 * 1e3).toISOString(),
      timeMax: new Date(end.getTime() + config.bufferMinutes * 60 * 1e3).toISOString(),
      timeZone: config.timezone,
      items: [{ id: config.calendarId }]
    }
  });
  const busySlots = freeBusyRes.data.calendars?.[config.calendarId]?.busy || [];
  if (busySlots.length > 0) {
    throw new Error("SLOT_TAKEN");
  }
  const description = [
    `Servicio: ${attendee.service}`,
    attendee.message ? `Mensaje: ${attendee.message}` : "",
    `Email: ${attendee.email}`
  ].filter(Boolean).join("\n");
  const event = await calendar.events.insert({
    calendarId: config.calendarId,
    requestBody: {
      summary: `Llamada Techode \u2014 ${attendee.name}`,
      description,
      start: { dateTime: start.toISOString(), timeZone: config.timezone },
      end: { dateTime: end.toISOString(), timeZone: config.timezone },
      attendees: [{ email: attendee.email, displayName: attendee.name }]
    }
  });
  return event.data;
}

// src/api/rate-limiter.ts
var store = /* @__PURE__ */ new Map();
setInterval(() => {
  const now = Date.now();
  store.forEach((entry, key) => {
    if (now > entry.resetAt) store.delete(key);
  });
}, 10 * 60 * 1e3);
function checkRateLimit(ip, maxPerHour) {
  const now = Date.now();
  const entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + 60 * 60 * 1e3 });
    return true;
  }
  if (entry.count >= maxPerHour) {
    return false;
  }
  entry.count++;
  return true;
}

// src/api/email.ts
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function formatDate(date, time) {
  const [year, month, day] = date.split("-");
  const months = {
    "01": "enero",
    "02": "febrero",
    "03": "marzo",
    "04": "abril",
    "05": "mayo",
    "06": "junio",
    "07": "julio",
    "08": "agosto",
    "09": "septiembre",
    "10": "octubre",
    "11": "noviembre",
    "12": "diciembre"
  };
  const monthName = months[month] || month;
  return `${parseInt(day)} de ${monthName} de ${year}, ${time} hrs (Chile)`;
}
function buildUserEmail(data) {
  const dateFormatted = formatDate(data.date, data.time);
  return {
    subject: `Solicitud de reunion recibida \u2014 Techode | ${data.date} ${data.time}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080812; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2DBFAD; font-size: 20px; margin: 0;">Solicitud de reunion recibida</h1>
        </div>
        <p>Hola <strong>${escapeHtml(data.name)}</strong>,</p>
        <p>Hemos recibido tu solicitud de reunion con Techode. Nuestro equipo la revisara y te confirmaremos la cita a la brevedad.</p>
        <p style="font-weight: 500;">Detalles de tu solicitud:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #8888AA;">Fecha y hora solicitada</td><td style="padding: 8px 0;">${escapeHtml(dateFormatted)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Duracion</td><td style="padding: 8px 0;">${data.duration} minutos</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Servicio</td><td style="padding: 8px 0;">${escapeHtml(data.service)}</td></tr>
        </table>
        <p style="color: #8888AA; font-size: 14px;">Si necesitas modificar o cancelar tu solicitud, responde a este correo.</p>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px; text-align: center;">Techode \u2014 techode.dev</p>
      </div>
    `
  };
}
function buildNotifyEmail(data) {
  const dateFormatted = formatDate(data.date, data.time);
  return {
    subject: `Nueva solicitud de reunion \u2014 ${escapeHtml(data.name)} | ${data.date} ${data.time}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080812; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2DBFAD; font-size: 20px; margin: 0;">Nueva solicitud de reunion</h1>
        </div>
        <p style="color: #ff9900; font-size: 13px; margin-bottom: 16px;">Pendiente de confirmacion \u2014 responde al cliente para confirmar la cita.</p>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #8888AA;">Nombre</td><td style="padding: 8px 0;">${escapeHtml(data.name)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Email</td><td style="padding: 8px 0;">${escapeHtml(data.email)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Servicio</td><td style="padding: 8px 0;">${escapeHtml(data.service)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Fecha y hora</td><td style="padding: 8px 0;">${escapeHtml(dateFormatted)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Duracion</td><td style="padding: 8px 0;">${data.duration} minutos</td></tr>
          ${data.message ? `<tr><td style="padding: 8px 0; color: #8888AA;">Mensaje</td><td style="padding: 8px 0;">${escapeHtml(data.message)}</td></tr>` : ""}
        </table>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px;">IP: ${escapeHtml(data.ip)}</p>
      </div>
    `
  };
}
async function sendEmail(resendApiKey, to, from, subject, html) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to, subject, html })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend error: ${error}`);
  }
  return res.json();
}

// src/api/booking-handler.ts
var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validate(body) {
  const { name, email, service, message, date, time } = body;
  if (typeof name !== "string" || typeof email !== "string" || typeof service !== "string" || typeof date !== "string" || typeof time !== "string") {
    return "Campos invalidos";
  }
  if (message !== void 0 && message !== null && typeof message !== "string") {
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
  const dateObj = /* @__PURE__ */ new Date(trimDate + "T00:00:00");
  if (isNaN(dateObj.getTime())) return "Fecha invalida";
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
    time: trimTime
  };
}
function validateBookingSlot(date, time, availableDays, availableHours) {
  const dateObj = /* @__PURE__ */ new Date(date + "T00:00:00");
  const dayOfWeek = dateObj.getDay();
  const hour = parseInt(time.split(":")[0], 10);
  if (!availableDays.includes(dayOfWeek)) return "Dia no disponible";
  if (hour < availableHours.start || hour >= availableHours.end) return "Hora fuera de horario";
  const now = /* @__PURE__ */ new Date();
  const slotDate = /* @__PURE__ */ new Date(date + "T" + time + ":00");
  if (slotDate <= now) return "Horario ya pasado";
  return null;
}
function getLocalAvailability(month, year, availableDays, availableHours) {
  const now = /* @__PURE__ */ new Date();
  const endDate = new Date(year, month + 1, 0);
  const results = [];
  for (let day = 1; day <= endDate.getDate(); day++) {
    const date = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const dayOfWeek = date.getDay();
    if (!availableDays.includes(dayOfWeek)) continue;
    if (date < new Date(now.getFullYear(), now.getMonth(), now.getDate())) continue;
    const slots = [];
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
function createBookingHandler(options) {
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
    rateLimit = 5
  } = options;
  const useGoogleCalendar = !!(googleCalendarId && googleCredentials);
  const calendarConfig = useGoogleCalendar ? {
    calendarId: googleCalendarId,
    credentials: googleCredentials,
    timezone,
    availableDays,
    availableHours,
    duration,
    bufferMinutes
  } : null;
  return async (req) => {
    if (req.action !== "availability" && req.action !== "book") {
      return { status: 400, body: { error: "Accion invalida" } };
    }
    if (req.action === "availability") {
      const { month, year } = req.body;
      const now = /* @__PURE__ */ new Date();
      const m = typeof month === "number" && month >= 0 && month <= 11 ? month : now.getMonth();
      const y = typeof year === "number" && year >= now.getFullYear() && year <= now.getFullYear() + 1 ? year : now.getFullYear();
      try {
        const availability = useGoogleCalendar && calendarConfig ? await getAvailability(calendarConfig, m, y) : getLocalAvailability(m, y, availableDays, availableHours);
        return { status: 200, body: { availability } };
      } catch (err) {
        console.error("Calendar availability error:", err);
        return { status: 500, body: { error: "No se pudo obtener la disponibilidad" } };
      }
    }
    if (req.action === "book") {
      if (!checkRateLimit(req.ip, rateLimit)) {
        return { status: 429, body: { error: "Demasiadas solicitudes. Intenta mas tarde." } };
      }
      const result = validate(req.body);
      if (typeof result === "string") {
        return { status: 400, body: { error: result } };
      }
      const data = result;
      const slotError = validateBookingSlot(data.date, data.time, availableDays, availableHours);
      if (slotError) {
        return { status: 400, body: { error: slotError } };
      }
      try {
        if (useGoogleCalendar && calendarConfig) {
          await createEvent(calendarConfig, data.date, data.time, {
            name: data.name,
            email: data.email,
            service: data.service,
            message: data.message
          });
        }
        const userEmail = buildUserEmail({
          name: data.name,
          date: data.date,
          time: data.time,
          service: data.service,
          duration
        });
        await sendEmail(
          resendApiKey,
          data.email,
          `Techode <onboarding@resend.dev>`,
          userEmail.subject,
          userEmail.html
        );
        const notify = buildNotifyEmail({
          name: data.name,
          email: data.email,
          date: data.date,
          time: data.time,
          service: data.service,
          message: data.message,
          duration,
          ip: req.ip
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createBookingHandler
});
