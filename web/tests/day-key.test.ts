import { describe, it, expect } from "vitest";
import { localDayKey } from "@/lib/data/day-key";

describe("localDayKey", () => {
  it("23:30 em São Paulo ainda é o dia local, não o dia UTC", () => {
    expect(localDayKey(new Date("2026-11-01T02:30:00Z"))).toBe("2026-10-31");
  });
  it("meio-dia UTC é o mesmo dia", () => {
    expect(localDayKey(new Date("2026-10-31T12:00:00Z"))).toBe("2026-10-31");
  });
  it("aceita outro fuso", () => {
    expect(localDayKey(new Date("2026-11-01T02:30:00Z"), "Europe/Lisbon")).toBe("2026-11-01");
  });
});
