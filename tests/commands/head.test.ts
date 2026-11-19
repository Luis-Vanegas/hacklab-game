import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("head", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      muestra: file(
        "muestra",
        Array.from({ length: 12 }, (_, index) => String(index + 1)).join("\n") + "\n",
      ),
    }),
  });

  it("selecciona las diez primeras líneas o la cantidad indicada", () => {
    const result = executeCommand("head muestra", ctx);
    expect(result.output).toEqual(["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
    expect(executeCommand("head muestra", ctx)).toEqual(result);
    expect(executeCommand("head -n 2 /muestra", ctx).output).toEqual(["1", "2"]);
    expect(executeCommand("head -n 0 muestra", ctx).output).toEqual([]);
  });

  it("rechaza cantidades no enteras, opciones desconocidas y rutas sin archivo", () => {
    for (const command of [
      "head",
      "head -n -1 muestra",
      "head -n 2.2 muestra",
      "head -x muestra",
    ]) {
      expect(executeCommand(command, ctx).error).toMatch(/^Uso:/u);
    }
    expect(executeCommand("head /", ctx)).toHaveProperty("error");
  });
});
