import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("echo", () => {
  it("muestra el texto tal como lo entregan los argumentos del parser", () => {
    const ctx = makeContext();
    const result = executeCommand('echo "Hola  Medellín" desde acá', ctx);
    expect(result.output).toEqual(["Hola  Medellín desde acá"]);
    expect(executeCommand('echo "Hola  Medellín" desde acá', ctx)).toEqual(result);
    expect(executeCommand('echo ""', ctx).output).toEqual([""]);
  });

  it("indica cómo usarlo cuando falta el texto", () => {
    expect(executeCommand("echo", makeContext()).error).toMatch(/^Uso:/u);
  });
});
