import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("find", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      plan: directory("plan", {
        "a.txt": file("a.txt", ""),
        "dos.md": file("dos.md", ""),
        interno: directory("interno", {
          "ñ.txt": file("ñ.txt", ""),
          ".oculto.txt": file(".oculto.txt", "", true),
        }),
      }),
    }),
  });

  it("recorre el árbol virtual y admite asterisco e interrogación en nombres", () => {
    const result = executeCommand('find plan -name "*.txt"', ctx);
    expect(result.output).toEqual([
      "/plan/a.txt",
      "/plan/interno/.oculto.txt",
      "/plan/interno/ñ.txt",
    ]);
    expect(executeCommand('find plan -name "*.txt"', ctx)).toEqual(result);
    expect(executeCommand('find /plan -name "?.txt"', ctx).output).toEqual([
      "/plan/a.txt",
      "/plan/interno/ñ.txt",
    ]);
    expect(executeCommand("find plan -name interno", ctx).output).toEqual(["/plan/interno"]);
  });

  it("rechaza parámetros incompletos, opciones desconocidas y rutas inexistentes", () => {
    expect(executeCommand("find plan -name", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("find plan -path plan", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("find /ausente -name x", ctx)).toHaveProperty("error");
  });
});
