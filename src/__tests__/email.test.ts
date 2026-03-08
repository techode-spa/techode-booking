import { describe, it, expect } from "vitest";
import { buildUserEmail, buildNotifyEmail } from "../api/email";

describe("buildUserEmail", () => {
  it("generates correct subject and HTML", () => {
    const result = buildUserEmail({
      name: "Christian",
      date: "2026-03-10",
      time: "15:00",
      service: "Desarrollo Web",
      duration: 60,
    });
    expect(result.subject).toContain("Solicitud de reunion recibida");
    expect(result.subject).toContain("2026-03-10");
    expect(result.html).toContain("Christian");
    expect(result.html).toContain("Desarrollo Web");
    expect(result.html).toContain("60 minutos");
    expect(result.html).toContain("10 de marzo de 2026");
  });

  it("escapes HTML in user input", () => {
    const result = buildUserEmail({
      name: '<script>alert("xss")</script>',
      date: "2026-03-10",
      time: "15:00",
      service: "Web",
      duration: 60,
    });
    expect(result.html).not.toContain("<script>");
    expect(result.html).toContain("&lt;script&gt;");
  });
});

describe("buildNotifyEmail", () => {
  it("generates notification with all fields", () => {
    const result = buildNotifyEmail({
      name: "Christian",
      email: "christian@test.com",
      date: "2026-06-15",
      time: "16:00",
      service: "Consultoria",
      message: "Need help with project",
      duration: 60,
      ip: "192.168.1.1",
    });
    expect(result.subject).toContain("Nueva solicitud de reunion");
    expect(result.html).toContain("christian@test.com");
    expect(result.html).toContain("Consultoria");
    expect(result.html).toContain("Need help with project");
    expect(result.html).toContain("192.168.1.1");
    expect(result.html).toContain("Pendiente de confirmacion");
    expect(result.html).toContain("15 de junio de 2026");
  });

  it("omits message row when message is empty", () => {
    const result = buildNotifyEmail({
      name: "Test",
      email: "test@test.com",
      date: "2026-03-10",
      time: "15:00",
      service: "Web",
      message: "",
      duration: 60,
      ip: "1.1.1.1",
    });
    expect(result.html).not.toContain("Mensaje</td>");
  });

  it("escapes HTML in all user fields", () => {
    const result = buildNotifyEmail({
      name: "<b>Bold</b>",
      email: "test@test.com",
      date: "2026-03-10",
      time: "15:00",
      service: '<img src=x onerror=alert(1)>',
      message: "Normal message",
      duration: 60,
      ip: "1.1.1.1",
    });
    expect(result.html).not.toContain("<b>Bold</b>");
    expect(result.html).toContain("&lt;b&gt;Bold&lt;/b&gt;");
    expect(result.html).not.toContain("<img");
  });

  it("formats all 12 months correctly", () => {
    const months = [
      { input: "01", expected: "enero" },
      { input: "02", expected: "febrero" },
      { input: "03", expected: "marzo" },
      { input: "04", expected: "abril" },
      { input: "05", expected: "mayo" },
      { input: "06", expected: "junio" },
      { input: "07", expected: "julio" },
      { input: "08", expected: "agosto" },
      { input: "09", expected: "septiembre" },
      { input: "10", expected: "octubre" },
      { input: "11", expected: "noviembre" },
      { input: "12", expected: "diciembre" },
    ];

    for (const { input, expected } of months) {
      const result = buildUserEmail({
        name: "Test",
        date: `2026-${input}-15`,
        time: "15:00",
        service: "Web",
        duration: 60,
      });
      expect(result.html).toContain(expected);
    }
  });
});
