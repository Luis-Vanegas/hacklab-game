import { describe, expect, it } from "vitest";
import type { CommandContext } from "@/lib/types";
import { executeCommand } from "@/terminal/CommandParser";
import { acmeContract, archiveContract, directory, makeContext } from "./fixtures";

function purchase(tool: string, ctx: CommandContext): CommandContext {
  const result = executeCommand("buy " + tool, ctx);
  const { playerCredits, unlockTool } = result.stateChanges ?? {};
  if (playerCredits === undefined || unlockTool === undefined) {
    throw new Error(result.error ?? "La compra quedó incompleta.");
  }

  return {
    ...ctx,
    gameState: {
      ...ctx.gameState,
      unlockedTools: [...ctx.gameState.unlockedTools, unlockTool],
      player: { ...ctx.gameState.player, credits: playerCredits },
    },
  };
}

describe("Recorridos de los contratos simulados", () => {
  it("completa los comandos de Acme con el inventario y una copia virtual", () => {
    const base = makeContext();
    const ctx = purchase(
      "ssh",
      purchase("nmap", {
        ...base,
        gameState: { ...base.gameState, activeContract: acmeContract },
      }),
    );
    expect(executeCommand("nmap acme.example", ctx).highlights).toContainEqual({
      text: "ftp",
      kind: "finding",
      note: expect.any(String),
    });
    const session = executeCommand("ssh acme.example", ctx).stateChanges?.connectedTo;
    expect(session).toBe("acme.example");
    const copy = executeCommand("download /entrega/turno.txt", {
      ...ctx,
      connectedTo: session ?? null,
    });
    expect(copy.filesystemChanges?.[0]?.path).toBe("/home/user/turno.txt");
  });

  it("usa la ficha escrita para el escenario y lee la bitácora copiada", () => {
    const base = makeContext();
    const ctx = purchase("hydra", {
      ...base,
      gameState: {
        ...base.gameState,
        activeContract: archiveContract,
        unlockedTools: ["ssh"],
        player: { ...base.gameState.player, level: 6, xp: 500, reputation: "hacker" },
      },
    });
    expect(executeCommand("crack ficha", ctx).output).toEqual(["Ficha del escenario: FICHA-39"]);
    const session = executeCommand("ssh archivo.example FICHA-39", ctx).stateChanges?.connectedTo;
    expect(session).toBe("archivo.example");
    const copy = executeCommand("download /archivo/bitacora.txt", {
      ...ctx,
      connectedTo: session ?? null,
    });
    const saved = copy.filesystemChanges?.[0];
    expect(saved?.path).toBe("/home/user/bitacora.txt");
    if (!saved?.node) throw new Error("Falta la copia de la bitácora.");

    const filesystem = directory("/", {
      home: directory("home", { user: directory("user", { [saved.node.name]: saved.node }) }),
    });
    expect(executeCommand("cat bitacora.txt", { ...ctx, filesystem }).output).toContain(
      "Simulacro 39. El servicio de respaldo inició a las 02:17.",
    );
  });
});
