import { describe, expect, it } from "vitest";
import { executeCommand, parseCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("CommandParser", () => {
  it("separa tokens, conserva espacios y admite ambos tipos de comillas", () => {
    expect(parseCommand(` CAT  "mis notas.txt" 'sin cambios' ""`)).toEqual({
      command: "cat",
      args: ["mis notas.txt", "sin cambios", ""],
    });
  });

  it("combina un fragmento entre comillas con el mismo argumento", () => {
    expect(parseCommand(`cat mis" notas".txt`)).toEqual({
      command: "cat",
      args: ["mis notas.txt"],
    });
  });

  it("ejecuta el comando registrado con los argumentos interpretados", () => {
    const ctx = makeContext();
    const result = executeCommand('cat "mis notas.txt"', ctx);
    expect(result).toEqual({ output: ["Nota con espacios"] });
    expect(executeCommand('cat "mis notas.txt"', ctx)).toEqual(result);
  });

  it("ignora líneas vacías y distingue errores de sintaxis y comandos desconocidos", () => {
    const ctx = makeContext();
    expect(executeCommand("  \t", ctx)).toEqual({ output: [] });
    expect(executeCommand('cat "notes', ctx)).toMatchObject({
      error: "Hay una comilla sin cerrar.",
    });
    expect(executeCommand('""', ctx)).toHaveProperty("error");
    expect(executeCommand("constructor", ctx)).toMatchObject({
      error: "Comando desconocido: constructor",
    });
  });
});
