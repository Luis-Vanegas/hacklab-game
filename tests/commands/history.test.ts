import { describe, expect, it } from "vitest";
import history from "@/terminal/commands/history";
import { makeContext } from "./fixtures";

describe("history", () => {
  it("numera el historial del contexto, siempre igual", () => {
    const ctx = makeContext({ history: ["ls", "cat notes", "cd /etc"] });
    const result = { output: ["  1  ls", "  2  cat notes", "  3  cd /etc"] };
    expect(history([], ctx)).toEqual(result);
    expect(history([], ctx)).toEqual(result);
  });

  it("con historial vacío no muestra nada", () => {
    expect(history([], makeContext())).toEqual({ output: [] });
  });

  it("rechaza argumentos", () => {
    expect(history(["-c"], makeContext({ history: ["ls"] }))).toHaveProperty("error");
  });
});
