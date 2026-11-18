import { describe, expect, it } from "vitest";
import ls from "@/terminal/commands/ls";
import { makeContext } from "./fixtures";

describe("ls", () => {
  it("ordena nombres, señala carpetas y omite archivos ocultos por defecto", () => {
    const ctx = makeContext();
    const result = ls([], ctx);
    expect(result).toEqual({ output: ["mis notas.txt", "notes", "sub/"] });
    expect(ls([], ctx)).toEqual(result);
    expect(ls(["-a"], ctx).output).toContain(".profile");
  });

  it("acepta rutas virtuales y rechaza archivos, opciones y rutas inválidas", () => {
    const ctx = makeContext();
    expect(ls(["../../etc"], ctx).output).toEqual(["passwd"]);
    expect(ls(["notes"], ctx)).toHaveProperty("error");
    expect(ls(["-x"], ctx)).toHaveProperty("error");
    expect(ls(["/no-existe"], ctx)).toHaveProperty("error");
    expect(ls(["a", "b"], ctx)).toHaveProperty("error");
  });
});
