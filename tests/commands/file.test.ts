import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("file", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      texto: file("texto", "Medellín\n"),
      pasos: file("pasos", "#!/bin/sh\n"),
      "bytes.py": file("bytes.py", "PK\0\u0003"),
      carpeta: directory("carpeta", {}),
    }),
  });

  it("distingue texto, script, binario y directorio por sus datos virtuales", () => {
    const result = executeCommand("file texto", ctx);
    expect(result.output).toEqual(["texto: texto"]);
    expect(executeCommand("file texto", ctx)).toEqual(result);
    expect(executeCommand("file pasos", ctx).output).toEqual(["pasos: script"]);
    expect(executeCommand("file bytes.py", ctx).output).toEqual(["bytes.py: binario"]);
    expect(executeCommand("file carpeta", ctx).output).toEqual(["carpeta: directorio"]);
  });

  it("rechaza argumentos inválidos y archivos inexistentes", () => {
    expect(executeCommand("file", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("file texto pasos", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("file inexistente", ctx)).toHaveProperty("error");
  });
});
