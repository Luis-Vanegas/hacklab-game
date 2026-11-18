import { describe, expect, it } from "vitest";
import whoami from "@/terminal/commands/whoami";
import { makeContext } from "./fixtures";

describe("whoami", () => {
  it("muestra el usuario del contexto de forma determinista", () => {
    const ctx = makeContext({ user: "operador" });
    const result = { output: ["operador"] };
    expect(whoami([], ctx)).toEqual(result);
    expect(whoami([], ctx)).toEqual(result);
  });

  it("rechaza argumentos", () => {
    expect(whoami(["extra"], makeContext())).toHaveProperty("error");
  });
});
