import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { directory, file, makeContext } from "./fixtures";

describe("sha256sum", () => {
  const ctx = makeContext({
    currentDir: "/",
    filesystem: directory("/", {
      abc: file("abc", "abc"),
      largo: file("largo", "a".repeat(1_000)),
      unicode: file("unicode", "Colombia 🇨🇴"),
      vacio: file("vacio", ""),
    }),
  });

  it("calcula SHA-256 de archivos cortos, largos, vacíos y con caracteres UTF-8", () => {
    const vectors = {
      abc: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      largo: "41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3",
      unicode: "2b484cad73c11622aaa600dde088bc0d268a1ce686fb2c53472a4ebffbb742a1",
      vacio: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    };

    for (const [path, expected] of Object.entries(vectors)) {
      const line = "sha256sum " + path;
      const result = executeCommand(line, ctx);
      expect(result.output).toEqual([expected + "  " + path]);
      expect(executeCommand(line, ctx)).toEqual(result);
    }
  });

  it("rechaza argumentos inválidos y rutas que no contienen un archivo", () => {
    expect(executeCommand("sha256sum", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("sha256sum abc vacio", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("sha256sum /", ctx)).toHaveProperty("error");
  });
});
