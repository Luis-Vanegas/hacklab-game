import { describe, expect, it } from "vitest";
import { COMMAND_GUIDE } from "@/store";
import { executeCommand } from "@/terminal/CommandParser";
import { commands } from "@/terminal/commands";
import { makeContext } from "./fixtures";

describe("Guía de comandos", () => {
  it("publica una tarjeta completa por comando registrado", () => {
    expect(COMMAND_GUIDE.map(({ name }) => name)).toEqual(commands.map(({ name }) => name));
    expect(new Set(COMMAND_GUIDE.map(({ name }) => name)).size).toBe(commands.length);

    for (const manual of COMMAND_GUIDE) {
      expect(["red", "archivos", "sistema", "seguridad", "juego"]).toContain(manual.category);
      expect(["script_kiddie", "hacker", "elite_hacker", "l33t", "anonymous"]).toContain(
        manual.unlockRank,
      );
      for (const text of [
        manual.usage,
        manual.description,
        manual.example,
        manual.learn,
        manual.realWorld,
      ]) {
        expect(text.trim().length).toBeGreaterThan(0);
      }
      expect(manual).not.toHaveProperty("run");
    }
  });

  it("conserva la ficha del alias y refleja el rango real del desafío de credenciales", () => {
    expect(COMMAND_GUIDE.find((manual) => manual.name === "ipconfig")?.aliases).toEqual([
      "ifconfig",
    ]);
    expect(COMMAND_GUIDE.find((manual) => manual.name === "crack")?.unlockRank).toBe("hacker");
    expect(COMMAND_GUIDE.find((manual) => manual.name === "ping")?.unlockRank).toBe(
      "script_kiddie",
    );
  });

  it("muestra categoría, aprendizaje, uso real y rango desde man", () => {
    const context = makeContext();
    const result = executeCommand("man ipconfig", context);

    expect(result.output).toEqual(
      expect.arrayContaining([
        "Categoría: Red",
        expect.stringMatching(/^Qué aprendes: /u),
        expect.stringMatching(/^En la vida real: /u),
        "Rango de desbloqueo: Aprendiz",
      ]),
    );
    expect(executeCommand("man ifconfig", context)).toEqual(result);
    expect(executeCommand("man crack", context).output).toContain("Rango de desbloqueo: Hacker");
  });
});
