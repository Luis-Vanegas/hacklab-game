import { describe, expect, it } from "vitest";
import pwd from "@/terminal/commands/pwd";
import { makeContext } from "./fixtures";

describe("pwd", () => {
  it("muestra el directorio del contexto en cada llamada", () => {
    const ctx = makeContext({ currentDir: "/etc" });
    const result = { output: ["/etc"] };
    expect(pwd([], ctx)).toEqual(result);
    expect(pwd([], ctx)).toEqual(result);
  });

  it("rechaza argumentos", () => {
    expect(pwd(["/etc"], makeContext())).toHaveProperty("error");
  });
});
