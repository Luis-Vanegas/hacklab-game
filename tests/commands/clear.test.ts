import { describe, expect, it } from "vitest";
import clear from "@/terminal/commands/clear";

// `clear` no lee el contexto: su resultado depende solo de los argumentos.
describe("clear", () => {
  it("pide limpiar la pantalla sin salida, siempre igual", () => {
    const result = { output: [], clearScreen: true };
    expect(clear([])).toEqual(result);
    expect(clear([])).toEqual(result);
  });

  it("rechaza argumentos sin pedir limpieza", () => {
    const result = clear(["-x"]);
    expect(result).toHaveProperty("error");
    expect(result).not.toHaveProperty("clearScreen");
  });
});
