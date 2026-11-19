import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("tail", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      muestra: file(
        "muestra",
        Array.from({ length: 12 }, (_, index) => String(index + 1)).join("\r\n") + "\r\n",
      ),
    }),
  });

  it("selecciona las últimas líneas sin introducir otra línea por el salto final", () => {
    const result = executeCommand("tail muestra", ctx);
    expect(result.output).toEqual(["3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]);
    expect(executeCommand("tail muestra", ctx)).toEqual(result);
    expect(executeCommand("tail -n 2 /muestra", ctx).output).toEqual(["11", "12"]);
    expect(executeCommand("tail -n 0 muestra", ctx).output).toEqual([]);
  });

  it("rechaza cantidades inválidas y distingue los archivos inexistentes", () => {
    for (const command of [
      "tail",
      "tail -n 2",
      "tail -n infinito muestra",
      "tail -n 9999999999999999999 muestra",
    ]) {
      expect(executeCommand(command, ctx).error).toMatch(/^Uso:/u);
    }
    expect(executeCommand("tail inexistente", ctx)).toHaveProperty("error");
  });
});
