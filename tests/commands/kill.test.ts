import { describe, expect, it } from "vitest";
import kill from "@/terminal/commands/kill";
import { makeContext } from "./fixtures";

describe("kill", () => {
  it("solo propone marcar el proceso virtual como detenido", () => {
    const ctx = makeContext();
    const result = kill(["4444"], ctx);
    expect(result).toMatchObject({
      output: ["Proceso virtual detenido: svch0st (4444)."],
      stateChanges: { storyFlags: { "process.stopped.4444": true } },
    });
    expect(kill(["4444"], ctx)).toEqual(result);
    expect(ctx.gameState.storyFlags).toEqual({});
  });

  it("permite reintentar sin volver a cambiar el estado", () => {
    const base = makeContext();
    const ctx = {
      ...base,
      gameState: { ...base.gameState, storyFlags: { "process.stopped.4444": true } },
    };
    expect(kill(["4444"], ctx)).toEqual({ output: ["El proceso virtual 4444 ya está detenido."] });
  });

  it("rechaza argumentos inválidos y PID desconocidos", () => {
    const ctx = makeContext();
    for (const args of [[], ["-1"], ["1e3"], ["4.4"], ["4444", "1"], ["9999"]]) {
      const result = kill(args, ctx);
      expect(result.error).toContain("Uso: kill <pid>");
      expect(result).not.toHaveProperty("stateChanges");
    }
  });
});
