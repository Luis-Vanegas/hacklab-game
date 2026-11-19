import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { commands } from "@/terminal/commands";
import { makeContext } from "./fixtures";

describe("help", () => {
  it("agrupa todos los comandos por categoría en orden estable", () => {
    const ctx = makeContext();
    const result = executeCommand("help", ctx);
    const sections = [
      ["Red", "red"],
      ["Archivos", "archivos"],
      ["Sistema", "sistema"],
      ["Seguridad", "seguridad"],
      ["Juego", "juego"],
    ];
    expect(result.output).toEqual(
      sections.flatMap(([title, category]) => [
        title,
        ...commands
          .filter((command) => command.category === category)
          .map((command) => "  " + command.usage + " — " + command.description),
      ]),
    );
    expect(executeCommand("help", ctx)).toEqual(result);
  });

  it("rechaza argumentos", () => {
    expect(executeCommand("help cat", makeContext())).toHaveProperty("error");
  });
});
