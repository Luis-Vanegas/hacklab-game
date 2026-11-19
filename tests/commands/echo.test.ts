import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("echo", () => {
  it("muestra el texto tal como lo entregan los argumentos del parser", () => {
    const ctx = makeContext();
    const result = executeCommand('echo "Hola  día" desde acá', ctx);
    expect(result.output).toEqual(["Hola  día desde acá"]);
    expect(executeCommand('echo "Hola  día" desde acá', ctx)).toEqual(result);
    expect(executeCommand('echo ""', ctx).output).toEqual([""]);
    expect(executeCommand('echo inicio ">" fin', ctx)).toEqual({ output: ["inicio > fin"] });
  });

  it("solo devuelve cambios virtuales al redirigir y conserva los permisos al modificar", () => {
    const ctx = makeContext();
    const result = executeCommand('echo "nota nueva" > ~/informe.txt', ctx);
    expect(result.filesystemChanges).toMatchObject([
      { path: "/home/user/informe.txt", action: "create", node: { content: "nota nueva\n" } },
    ]);
    expect(executeCommand("echo revisar > /home/user/notes", ctx).filesystemChanges).toMatchObject([
      {
        path: "/home/user/notes",
        action: "modify",
        node: { permissions: "-rw-r--r--", content: "revisar\n" },
      },
    ]);
    expect(executeCommand("echo revisar > /etc", ctx).filesystemChanges).toBeUndefined();
    expect(executeCommand("echo revisar > a > b", ctx).error).toMatch(/^Uso:/u);
  });

  it("indica cómo usarlo cuando falta el texto", () => {
    expect(executeCommand("echo", makeContext()).error).toMatch(/^Uso:/u);
  });
});
