import { describe, expect, it } from "vitest";
import cat from "@/terminal/commands/cat";
import { makeContext } from "./fixtures";

describe("cat", () => {
  it("lee rutas absolutas y relativas y conserva los saltos de línea", () => {
    const ctx = makeContext();
    const result = cat(["./sub/../notes"], ctx);
    expect(result).toEqual({ output: ["Bienvenida", "Paso dos"] });
    expect(cat(["/home/user/notes"], ctx)).toEqual(result);
    expect(cat(["./sub/../notes"], ctx)).toEqual(result);
  });

  it("rechaza la ausencia de archivo, los directorios y las claves heredadas", () => {
    const ctx = makeContext();
    for (const args of [[], ["sub"], ["/constructor"], ["/__proto__"], ["notes", "notes"]]) {
      expect(cat(args, ctx)).toHaveProperty("error");
    }
  });
});
