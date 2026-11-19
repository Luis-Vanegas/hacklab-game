import { describe, expect, it } from "vitest";
import ps from "@/terminal/commands/ps";
import { makeContext } from "./fixtures";

describe("ps", () => {
  it("lista los procesos activos de la estación virtual", () => {
    const ctx = makeContext();
    const result = ps([], ctx);
    expect(result.output).toContain("PID   USUARIO COMANDO");
    expect(result.output).toContain("4444  user    svch0st");
    expect(ps([], ctx)).toEqual(result);
  });

  it("oculta el proceso detenido sin afectar los demás", () => {
    const base = makeContext();
    const ctx = {
      ...base,
      gameState: { ...base.gameState, storyFlags: { "process.stopped.4444": true } },
    };
    expect(ps([], ctx).output).not.toContain("4444  user    svch0st");
    expect(ps([], ctx).output).toContain("730   user    terminal");
  });

  it("rechaza argumentos", () => {
    expect(ps(["-a"], makeContext())).toMatchObject({ error: "Uso: ps" });
  });
});
