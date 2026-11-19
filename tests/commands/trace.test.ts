import { describe, expect, it } from "vitest";
import trace from "@/terminal/commands/trace";
import { makeContext } from "./fixtures";

describe("trace", () => {
  it("muestra el porcentaje actual de forma determinista", () => {
    const ctx = makeContext();
    const result = { output: ["Nivel de rastreo: 18%"] };
    expect(trace([], ctx)).toEqual(result);
    expect(trace([], ctx)).toEqual(result);
  });

  it("rechaza argumentos", () => {
    expect(trace(["0"], makeContext())).toHaveProperty("error");
  });
});
