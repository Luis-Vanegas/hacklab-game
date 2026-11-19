import { describe, expect, it, vi } from "vitest";
import date from "@/terminal/commands/date";

describe("date", () => {
  it("muestra la fecha del juego sin depender del reloj", () => {
    const output = { output: ["2026-11-18 08:15:00 COT (UTC-05:00)"] };
    vi.useFakeTimers();
    try {
      vi.setSystemTime(0);
      expect(date([])).toEqual(output);
      vi.setSystemTime(10000000);
      expect(date([])).toEqual(output);
    } finally {
      vi.useRealTimers();
    }
  });

  it("rechaza argumentos", () => {
    expect(date(["-a"])).toMatchObject({ error: "Uso: date" });
  });
});
