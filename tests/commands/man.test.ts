import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("man", () => {
  it("muestra el uso y un ejemplo del comando registrado", () => {
    const ctx = makeContext();
    const result = executeCommand("man CAT", ctx);
    expect(result.output).toContain("Uso: cat <archivo>");
    expect(result.output).toContain("Ejemplo: cat notes");
    expect(executeCommand("man CAT", ctx)).toEqual(result);
  });

  it("rechaza un comando ausente o desconocido", () => {
    const ctx = makeContext();
    expect(executeCommand("man", ctx)).toHaveProperty("error");
    expect(executeCommand("man inexistente", ctx)).toHaveProperty("error");
  });
});
