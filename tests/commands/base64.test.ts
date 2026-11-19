import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("base64", () => {
  it("codifica y decodifica texto UTF-8 y mantiene las cadenas vacías", () => {
    const ctx = makeContext();
    const result = executeCommand('base64 "Colombia 🇨🇴"', ctx);
    expect(result.output).toEqual(["Q29sb21iaWEg8J+HqPCfh7Q="]);
    expect(executeCommand('base64 "Colombia 🇨🇴"', ctx)).toEqual(result);
    expect(executeCommand("base64 -d Q29sb21iaWEg8J+HqPCfh7Q=", ctx).output).toEqual([
      "Colombia 🇨🇴",
    ]);
    expect(executeCommand('base64 ""', ctx).output).toEqual([""]);
    expect(executeCommand('base64 -d ""', ctx).output).toEqual([""]);
  });

  it("rechaza argumentos faltantes y datos que no son Base64 o texto UTF-8", () => {
    const ctx = makeContext();
    expect(executeCommand("base64 -d", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("base64 -d %%%", ctx).error).toContain("Uso: base64 -d");
    expect(executeCommand("base64 -d /w==", ctx)).toHaveProperty("error");
  });
});
