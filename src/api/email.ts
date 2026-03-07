function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(date: string, time: string): string {
  const [year, month, day] = date.split("-");
  const months: Record<string, string> = {
    "01": "enero", "02": "febrero", "03": "marzo", "04": "abril",
    "05": "mayo", "06": "junio", "07": "julio", "08": "agosto",
    "09": "septiembre", "10": "octubre", "11": "noviembre", "12": "diciembre",
  };
  return `${parseInt(day)} de ${months[month]} de ${year}, ${time} hrs (Chile)`;
}

export function buildUserEmail(data: {
  name: string;
  date: string;
  time: string;
  service: string;
  duration: number;
}): { subject: string; html: string } {
  const dateFormatted = formatDate(data.date, data.time);

  return {
    subject: `Reunion confirmada — Techode | ${data.date} ${data.time}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080812; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2DBFAD; font-size: 20px; margin: 0;">Reunion confirmada</h1>
        </div>
        <p>Hola <strong>${escapeHtml(data.name)}</strong>,</p>
        <p>Tu reunion con Techode ha sido agendada:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px 0; color: #8888AA;">Fecha y hora</td><td style="padding: 8px 0;">${escapeHtml(dateFormatted)}</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Duracion</td><td style="padding: 8px 0;">${data.duration} minutos</td></tr>
          <tr><td style="padding: 8px 0; color: #8888AA;">Servicio</td><td style="padding: 8px 0;">${escapeHtml(data.service)}</td></tr>
        </table>
        <p style="color: #8888AA; font-size: 14px;">Si necesitas cancelar o reagendar, responde a este correo.</p>
        <hr style="border: none; border-top: 1px solid #1a1a2e; margin: 24px 0;" />
        <p style="color: #8888AA; font-size: 12px; text-align: center;">Techode — techode.dev</p>
      </div>
    `,
  };
}

export function buildNotifyEmail(data: {
  name: string;
  email: string;
  date: string;
  time: string;
  service: string;
  message: string;
  duration: number;
  ip: string;
}): { subject: string; html: string } {
  const dateFormatted = formatDate(data.date, data.time);

  return {
    subject: `Nueva reunion agendada — ${escapeHtml(data.name)} | ${data.date} ${data.time}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #080812; color: #ffffff; padding: 32px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #2DBFAD; font-size: 20px; margin: 0;">Nueva reunion agendada</h1>
        </div>
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
    `,
  };
}

export async function sendEmail(
  resendApiKey: string,
  to: string,
  from: string,
  subject: string,
  html: string
) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Resend error: ${error}`);
  }

  return res.json();
}
