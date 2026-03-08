import { describe, it, expect, beforeEach, vi } from "vitest";

// Re-import fresh module for each test
let checkRateLimit: (ip: string, maxPerHour: number) => boolean;

beforeEach(async () => {
  vi.resetModules();
  const mod = await import("../api/rate-limiter");
  checkRateLimit = mod.checkRateLimit;
});

describe("checkRateLimit", () => {
  it("allows requests under the limit", () => {
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
    expect(checkRateLimit("1.1.1.1", 3)).toBe(true);
  });

  it("blocks requests over the limit", () => {
    expect(checkRateLimit("2.2.2.2", 2)).toBe(true);
    expect(checkRateLimit("2.2.2.2", 2)).toBe(true);
    expect(checkRateLimit("2.2.2.2", 2)).toBe(false);
    expect(checkRateLimit("2.2.2.2", 2)).toBe(false);
  });

  it("tracks IPs independently", () => {
    expect(checkRateLimit("3.3.3.3", 1)).toBe(true);
    expect(checkRateLimit("3.3.3.3", 1)).toBe(false);
    expect(checkRateLimit("4.4.4.4", 1)).toBe(true);
  });

  it("allows limit of 1", () => {
    expect(checkRateLimit("5.5.5.5", 1)).toBe(true);
    expect(checkRateLimit("5.5.5.5", 1)).toBe(false);
  });
});
