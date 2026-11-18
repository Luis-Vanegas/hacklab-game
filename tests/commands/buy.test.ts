import { describe, expect, it } from "vitest";
import buy from "@/terminal/commands/buy";
import { makeContext } from "./fixtures";

describe("buy", () => {
  it("propone saldo y desbloqueo en el mismo resultado, sin mutar el contexto", () => {
    const ctx = makeContext();
    const result = buy(["nmap"], ctx);
    expect(result.stateChanges).toEqual({ playerCredits: 420, unlockTool: "nmap" });
    expect(buy(["nmap"], ctx)).toEqual(result);
    expect(ctx.gameState.player.credits).toBe(500);
    expect(ctx.gameState.unlockedTools).toEqual([]);
  });

  it("acepta saldo exacto y evita cobrar una segunda vez después de aplicar la compra", () => {
    const ctx = makeContext();
    const exact = {
      ...ctx,
      gameState: { ...ctx.gameState, player: { ...ctx.gameState.player, credits: 80 } },
    };
    expect(buy(["nmap"], exact).stateChanges?.playerCredits).toBe(0);

    const purchased = {
      ...exact,
      gameState: {
        ...exact.gameState,
        unlockedTools: ["nmap"],
        player: { ...exact.gameState.player, credits: 0 },
      },
    };
    expect(buy(["nmap"], purchased)).toEqual({
      output: ["Ya tienes Visor de inventario."],
      outputType: "info",
    });
  });

  it("rechaza uso incorrecto, herramientas desconocidas, nivel bajo y falta de saldo", () => {
    const ctx = makeContext();
    expect(buy([], ctx)).toHaveProperty("error");
    expect(buy(["desconocida"], ctx)).toHaveProperty("error");
    expect(buy(["hydra"], ctx)).toMatchObject({ error: "Nivel requerido: 6" });
    const poor = {
      ...ctx,
      gameState: { ...ctx.gameState, player: { ...ctx.gameState.player, credits: 79 } },
    };
    expect(buy(["nmap"], poor)).toMatchObject({ error: "Créditos insuficientes." });
    expect(buy(["nmap"], poor)).not.toHaveProperty("stateChanges");
  });
});
