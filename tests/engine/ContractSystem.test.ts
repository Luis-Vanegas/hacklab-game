import { describe, expect, it } from "vitest";
import { acceptContract, completeObjective, submitContract } from "@/engine/contracts";
import { createSession } from "@/engine/session";
import tutorialData from "@/data/contracts/00-tutorial.json";
import type { Contract } from "@/lib/types";

const tutorial = tutorialData as Contract;

function completeAll() {
  let game = acceptContract(createSession().game, tutorial);
  for (const objective of tutorial.objectives) game = completeObjective(game, objective.id);
  return game;
}

describe("submitContract", () => {
  it("paga la recompensa completa cuando todos los objetivos están hechos", () => {
    const before = createSession().game.player;
    const after = submitContract(completeAll()).player;
    expect(after.credits).toBe(before.credits + tutorial.reward.credits);
    expect(after.xp).toBe(before.xp + tutorial.reward.xp);
  });

  it("recalcula el nivel con la XP nueva", () => {
    const after = submitContract(completeAll()).player;
    expect(after.level).toBe(Math.floor(after.xp / 100) + 1);
  });

  it("aplica el multiplicador parcial si faltan objetivos", () => {
    const game = acceptContract(createSession().game, tutorial);
    const first = tutorial.objectives[0];
    if (!first) throw new Error("el tutorial no tiene objetivos");
    const partial = completeObjective(game, first.id);
    const ratio = 1 / tutorial.objectives.length;

    const after = submitContract(partial).player;
    expect(after.credits).toBe(
      game.player.credits +
        Math.floor(tutorial.reward.credits * ratio * tutorial.reward.partialMultiplier),
    );
  });
});
