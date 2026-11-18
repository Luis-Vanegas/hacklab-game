import { describe, expect, it } from "vitest";
import { executeCommand } from "@/terminal/CommandParser";
import { commands } from "@/terminal/commands";
import { makeContext } from "./fixtures";

describe("help", () => {
  it("presenta exactamente el registro y es determinista", () => {
    const ctx = makeContext();
    const result = executeCommand("help", ctx);
    expect(result.output).toEqual(
      commands.map((command) => command.usage + " — " + command.description),
    );
    expect(executeCommand("help", ctx)).toEqual(result);
  });

  it("rechaza argumentos", () => {
    expect(executeCommand("help cat", makeContext())).toHaveProperty("error");
  });
});
