import { describe, expect, it } from "vitest";
import cd from "@/terminal/commands/cd";
import { makeContext } from "./fixtures";

describe("cd", () => {
  it("acepta rutas absolutas, relativas y ..", () => {
    expect(cd(["/etc"], makeContext())).toEqual({ output: [], cwd: "/etc" });
    expect(cd(["sub"], makeContext())).toEqual({ output: [], cwd: "/home/user/sub" });
    expect(cd([".."], makeContext())).toEqual({ output: [], cwd: "/home" });
    expect(cd(["../../etc"], makeContext())).toEqual({ output: [], cwd: "/etc" });
  });

  it("sin argumentos vuelve a /home/user", () => {
    expect(cd([], makeContext({ currentDir: "/etc" }))).toEqual({
      output: [],
      cwd: "/home/user",
    });
  });

  it("rechaza destinos inexistentes, archivos y argumentos de más", () => {
    for (const args of [["no-existe"], ["notes"], ["/etc", "/home"]]) {
      const result = cd(args, makeContext());
      expect(result).toHaveProperty("error");
      expect(result).not.toHaveProperty("cwd");
    }
  });

  it("devuelve lo mismo con el mismo contexto", () => {
    const ctx = makeContext();
    expect(cd(["/etc"], ctx)).toEqual(cd(["/etc"], ctx));
  });
});
