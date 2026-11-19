import { beforeEach, describe, expect, it } from "vitest";
import tutorial from "@/data/contracts/00-tutorial.json";
import acme from "@/data/contracts/01-first-hack.json";
import bitacora from "@/data/contracts/02-data-heist.json";
import clinical from "@/data/contracts/03-espejo-clinico.json";
import shelter from "@/data/contracts/04-archivo-de-turno.json";
import dayOne from "@/data/contracts/10-dia-1-bienvenida.json";
import dayTwo from "@/data/contracts/11-dia-2-logs.json";
import dayThree from "@/data/contracts/12-dia-3-proceso-raro.json";
import dayFour from "@/data/contracts/13-dia-4-phishing.json";
import dayFive from "@/data/contracts/14-dia-5-logs-web.json";
import daySix from "@/data/contracts/15-dia-6-contrasenas.json";
import daySeven from "@/data/contracts/16-dia-7-informe.json";
import { acceptContract, submitContract } from "@/engine/contracts";
import { addXp, getTierConfig } from "@/engine/reputation";
import type { Contract } from "@/lib/types";
import { useGameStore } from "@/store";

const work = [dayOne, dayTwo, dayThree, dayFour, dayFive, daySix, daySeven] as readonly Contract[];
const darknet = [tutorial, acme, bitacora, clinical, shelter] as readonly Contract[];
const store = () => useGameStore.getState();

describe("Darknet, riesgo y equilibrio", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it.each([
    [clinical, "/export/resumen-publico.txt", 30],
    [shelter, "/export/incidente-analizado.txt", 45],
  ] as const)("registra el rastro de la copia virtual de $id", (data, path, risk) => {
    const game = store().game;
    useGameStore.setState({
      game: acceptContract({ ...game, player: addXp(game.player, 500) }, data as Contract),
    });
    for (const cmd of [
      "buy nmap",
      "buy ssh",
      "nmap " + data.target.hostname,
      "ssh " + data.target.hostname,
    ]) {
      expect(store().runCommand(cmd).error, cmd).toBeUndefined();
    }

    expect(store().runCommand("download /export/no-existe.txt").error).toBeDefined();
    expect(store().game.traceLevel).toBe(0);
    expect(store().runCommand("download " + path).error).toBeUndefined();
    expect(store().game.traceLevel).toBe(risk);
    expect(store().runCommand("download " + path).error).toBeUndefined();
    expect(store().game.traceLevel).toBe(risk);
    expect(store().game.activeContract?.objectives.every((objective) => objective.completed)).toBe(
      true,
    );
    store().submitContract();
    expect(store().game.completedContracts).toContain(data.id);
    expect(store().game.traceLevel).toBe(0);
  });

  it("llega a elite_hacker con trabajo y darknet, sin poder hacerlo por un solo canal", () => {
    const threshold = getTierConfig("elite_hacker").minXp;
    const total = (contracts: readonly Contract[]) =>
      contracts.reduce((sum, contract) => sum + contract.reward.xp, 0);
    expect(total(work)).toBe(1400);
    expect(total(darknet)).toBe(1860);
    expect(total(work)).toBeLessThan(threshold);
    expect(total(darknet)).toBeLessThan(threshold);

    let game = store().game;
    for (const contract of [...work, tutorial, acme] as readonly Contract[]) {
      const accepted = acceptContract(game, contract);
      game = submitContract({
        ...accepted,
        activeContract: {
          ...contract,
          objectives: contract.objectives.map((objective) => ({ ...objective, completed: true })),
        },
      });
    }

    expect(game.player).toMatchObject({ xp: threshold, reputation: "elite_hacker" });
  });
});
