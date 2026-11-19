import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("wc", () => {
  it("cuenta saltos de línea, palabras y bytes UTF-8 de forma estable", () => {
    const ctx = makeContext({
      currentDir: "/",
      filesystem: directory("/", { acento: file("acento", "á a\nú") }),
    });

    const result = executeCommand("wc acento", ctx);
    expect(result.output).toEqual(["1 3 7 acento"]);
    expect(executeCommand("wc acento", ctx)).toEqual(result);
    expect(executeCommand("wc -l acento", ctx).output).toEqual(["1 acento"]);
  });

  it("rechaza opciones desconocidas y archivos faltantes", () => {
    const ctx = makeContext();
    expect(executeCommand("wc", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("wc -w notes", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("wc inexistente", ctx)).toHaveProperty("error");
  });
});
