import { describe, expect, it } from "vitest";
import crack from "@/terminal/commands/crack";
import { acmeContract, archiveContract as challenge, makeContext } from "./fixtures";

describe("crack", () => {
  const base = makeContext();

  it("lee el desenlace fijo del escenario sin modificar el contexto", () => {
    const ctx = {
      ...base,
      gameState: { ...base.gameState, activeContract: challenge, unlockedTools: ["hydra"] },
    };
    const result = crack(["ficha"], ctx);
    expect(result).toEqual({ output: ["Ficha del escenario: FICHA-39"], outputType: "success" });
    expect(crack(["ficha"], ctx)).toEqual(result);
  });

  it("rechaza argumentos y exige un desafío y una herramienta adquirida", () => {
    const ctx = { ...base, gameState: { ...base.gameState, activeContract: challenge } };
    expect(crack(["otro"], ctx)).toHaveProperty("error");
    expect(crack(["ficha"], ctx)).toMatchObject({
      error: "Adquiere la herramienta con buy hydra.",
    });
    expect(
      crack(["ficha"], {
        ...ctx,
        gameState: { ...ctx.gameState, activeContract: acmeContract },
      }),
    ).toMatchObject({ error: "Este contrato no tiene un desafío de ficha." });
  });
});
