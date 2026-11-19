import { describe, expect, it } from "vitest";
import tutorial from "@/data/contracts/00-tutorial.json";
import { acceptContract } from "@/engine/contracts";
import { createSession, diffGameEvents } from "@/engine/session";
import type { Contract, GameState } from "@/lib/types";

const contract = tutorial as Contract;

function must<T>(value: T | null | undefined): T {
  if (value == null) throw new Error("dato de prueba ausente");
  return value;
}

function playing(): GameState {
  return acceptContract(createSession().game, contract);
}

describe("diffGameEvents", () => {
  it("sin cambios no produce eventos", () => {
    const game = playing();
    expect(diffGameEvents(game, game)).toEqual([]);
  });

  it("avisa cada objetivo recién completado", () => {
    const before = playing();
    const active = must(before.activeContract);
    const after: GameState = {
      ...before,
      activeContract: {
        ...active,
        objectives: active.objectives.map((o, i) => (i === 0 ? { ...o, completed: true } : o)),
      },
    };
    const first = must(active.objectives[0]);

    expect(diffGameEvents(before, after)).toEqual([
      { type: "objective_completed", objectiveId: first.id, description: first.description },
    ]);
  });

  it("avisa el contrato completado con lo que ganó el jugador", () => {
    const before = playing();
    const after: GameState = {
      ...before,
      activeContract: null,
      completedContracts: [contract.id],
      player: { ...before.player, credits: before.player.credits + 200, xp: 100 },
    };

    expect(diffGameEvents(before, after)).toEqual([
      {
        type: "contract_completed",
        contractId: contract.id,
        title: contract.title,
        credits: 200,
        xp: 100,
      },
    ]);
  });

  it("avisa la subida de rango", () => {
    const before = playing();
    const after: GameState = { ...before, player: { ...before.player, reputation: "hacker" } };

    expect(diffGameEvents(before, after)).toEqual([
      { type: "rank_up", from: "script_kiddie", to: "hacker" },
    ]);
  });

  it("la alarma de trace suena solo al cruzar el 75 %", () => {
    const low = { ...playing(), traceLevel: 70 };
    const high = { ...low, traceLevel: 80 };

    expect(diffGameEvents(low, high)).toEqual([{ type: "trace_alarm", level: 80 }]);
    expect(diffGameEvents(high, { ...high, traceLevel: 90 })).toEqual([]);
  });
});
