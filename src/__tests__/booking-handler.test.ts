import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBookingHandler } from "../api/booking-handler";

// Mock external dependencies
vi.mock("../api/calendar", () => ({
  getAvailability: vi.fn(),
  createEvent: vi.fn(),
}));

vi.mock("../api/email", () => ({
  buildUserEmail: vi.fn(() => ({ subject: "test", html: "<p>test</p>" })),
  buildNotifyEmail: vi.fn(() => ({ subject: "test", html: "<p>test</p>" })),
  sendEmail: vi.fn(() => Promise.resolve()),
}));

vi.mock("../api/rate-limiter", () => ({
  checkRateLimit: vi.fn(() => true),
}));

const baseOptions = {
  resendApiKey: "re_test",
  notifyEmail: "admin@test.com",
  availableDays: [1, 2, 3, 4, 5],
  availableHours: { start: 14, end: 19 },
  duration: 60,
  timezone: "America/Santiago",
};

function getNextWeekday(dayOfWeek: number): string {
  const now = new Date();
  const diff = ((dayOfWeek - now.getDay()) + 7) % 7 || 7;
  const target = new Date(now);
  target.setDate(now.getDate() + diff);
  const y = target.getFullYear();
  const m = String(target.getMonth() + 1).padStart(2, "0");
  const d = String(target.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

describe("createBookingHandler", () => {
  let handler: ReturnType<typeof createBookingHandler>;

  beforeEach(() => {
    vi.clearAllMocks();
    handler = createBookingHandler(baseOptions);
  });

  // --- ACTION VALIDATION ---

  it("rejects invalid action", async () => {
    const res = await handler({ action: "delete", body: {}, ip: "1.1.1.1" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Accion invalida");
  });

  // --- AVAILABILITY ---

  it("returns local availability for valid month/year", async () => {
    const now = new Date();
    const res = await handler({
      action: "availability",
      body: { month: now.getMonth(), year: now.getFullYear() },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
    expect(res.body.availability).toBeDefined();
    expect(Array.isArray(res.body.availability)).toBe(true);
  });

  it("handles invalid month gracefully", async () => {
    const res = await handler({
      action: "availability",
      body: { month: 99, year: 2026 },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
  });

  it("handles invalid year gracefully", async () => {
    const res = await handler({
      action: "availability",
      body: { month: 0, year: 1990 },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
  });

  // --- BOOKING VALIDATION ---

  it("rejects booking with missing fields", async () => {
    const res = await handler({
      action: "book",
      body: { name: "Test" },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Campos invalidos");
  });

  it("rejects booking with invalid email", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "not-an-email",
        service: "Web",
        date: getNextWeekday(1),
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email invalido");
  });

  it("rejects booking with name too long", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "A".repeat(101),
        email: "test@test.com",
        service: "Web",
        date: getNextWeekday(1),
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nombre invalido");
  });

  it("rejects booking with message too long", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        message: "X".repeat(501),
        date: getNextWeekday(1),
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Mensaje muy largo");
  });

  it("rejects booking with invalid date format", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: "08-03-2026",
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Fecha invalida");
  });

  it("rejects booking with invalid time format", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: getNextWeekday(1),
        time: "3pm",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Hora invalida");
  });

  it("rejects booking on unavailable day (weekend)", async () => {
    const saturday = getNextWeekday(6);
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: saturday,
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Dia no disponible");
  });

  it("rejects booking outside available hours", async () => {
    const monday = getNextWeekday(1);
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: monday,
        time: "09:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Hora fuera de horario");
  });

  it("rejects booking in the past", async () => {
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: "2020-01-06",
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Horario ya pasado");
  });

  it("accepts valid booking and sends emails", async () => {
    const monday = getNextWeekday(1);
    const res = await handler({
      action: "book",
      body: {
        name: "Christian",
        email: "christian@test.com",
        service: "Desarrollo Web",
        message: "Test project",
        date: monday,
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const { sendEmail } = await import("../api/email");
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("accepts booking with optional message omitted", async () => {
    const monday = getNextWeekday(1);
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: monday,
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  // --- RATE LIMITING ---

  it("rejects booking when rate limited", async () => {
    const { checkRateLimit } = await import("../api/rate-limiter");
    (checkRateLimit as ReturnType<typeof vi.fn>).mockReturnValueOnce(false);

    const monday = getNextWeekday(1);
    const res = await handler({
      action: "book",
      body: {
        name: "Test",
        email: "test@test.com",
        service: "Web",
        date: monday,
        time: "15:00",
      },
      ip: "1.1.1.1",
    });
    expect(res.status).toBe(429);
  });
});
