import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("grep", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      registro: file("registro", "ERROR [1]\nerror [2]\nerror error [3]\nAVISO [4]\n"),
    }),
  });

  it("filtra texto literal y cuenta líneas con una o más coincidencias", () => {
    const result = executeCommand("grep error registro", ctx);
    expect(result.output).toEqual(["error [2]", "error error [3]"]);
    expect(executeCommand("grep error registro", ctx)).toEqual(result);
    expect(executeCommand("grep -i -c error registro", ctx).output).toEqual(["3"]);
    expect(executeCommand("grep -ic error registro", ctx).output).toEqual(["3"]);
    expect(executeCommand('grep "[2]" registro', ctx).output).toEqual(["error [2]"]);
    expect(executeCommand("grep -c ausente registro", ctx).output).toEqual(["0"]);
  });

  it("rechaza opciones inválidas, argumentos faltantes y rutas sin archivo", () => {
    expect(executeCommand("grep -q error registro", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("grep error", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("grep error /", ctx)).toHaveProperty("error");
  });
});
