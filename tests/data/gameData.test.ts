import { describe, expect, it } from "vitest";
import tutorial from "@/data/contracts/00-tutorial.json";
import acme from "@/data/contracts/01-first-hack.json";
import archivo from "@/data/contracts/02-data-heist.json";
import progression from "@/data/levels/progression.json";
import shopData from "@/data/tools/shop.json";
import beginner from "@/data/tutorials/beginner.json";
import type { Contract, FileSystemNode, ReputationConfig, ToolDefinition } from "@/lib/types";
import { parseCommand } from "@/terminal/CommandParser";
import { commands } from "@/terminal/commands";
import { findVirtualNode } from "@/terminal/commands/virtualPath";

const contracts = [tutorial, acme, archivo] as readonly Contract[];
const shop: readonly ToolDefinition[] = shopData;
const tiers = progression.tiers as readonly ReputationConfig[];

function checkFilesystem(node: FileSystemNode, expectedName: string) {
  expect(node.name).toBe(expectedName);
  expect(node.permissions).toMatch(/^[d-][rwx-]{9}$/u);

  if (node.type === "dir") {
    for (const [name, child] of Object.entries(node.children)) {
      expect(name).not.toMatch(/\/|^(?:\.{1,2}|__proto__)$/u);
      checkFilesystem(child, name);
    }
  } else {
    expect(node.type).toBe("file");
    expect(typeof node.content).toBe("string");
  }
}

describe("Datos del juego", () => {
  it("valida contratos, objetivos, referencias narrativas y árboles virtuales", () => {
    expect(new Set(contracts.map((contract) => contract.id)).size).toBe(contracts.length);
    // cd se registra cuando la integración exponga el cambio de directorio.
    const knownCommands = new Set([...commands.map((command) => command.name), "cd"]);
    for (const contract of contracts) {
      expect(contract.title).not.toBe("");
      expect(contract.description).not.toBe("");
      expect(["beginner", "normal", "elite", "anonymous"]).toContain(contract.difficulty);
      expect(tiers.some((tier) => tier.tier === contract.requiredReputation)).toBe(true);
      expect(contract.reward.credits).toBeGreaterThanOrEqual(0);
      expect(contract.reward.xp).toBeGreaterThan(0);
      expect(contract.reward.partialMultiplier).toBeGreaterThanOrEqual(0);
      expect(contract.reward.partialMultiplier).toBeLessThanOrEqual(1);
      expect(contract.objectives.length).toBeGreaterThan(0);

      const objectiveIds = new Set(contract.objectives.map((objective) => objective.id));
      expect(objectiveIds.size).toBe(contract.objectives.length);
      for (const id of Object.keys(contract.story.hints)) expect(objectiveIds.has(id)).toBe(true);
      expect(contract.story.intro.length).toBeGreaterThan(0);
      expect(contract.story.onComplete.length).toBeGreaterThan(0);
      for (const objective of contract.objectives) {
        expect(knownCommands.has(objective.trigger.command)).toBe(true);
        expect(objective.completed).toBe(false);
        if (objective.trigger.command === "download") {
          const source = objective.trigger.args?.[0];
          expect(source).toMatch(/^\//u);
          expect(findVirtualNode(contract.target.filesystem, source ?? "")?.type).toBe("file");
          expect(objective.trigger.requiresConnection).toBe(true);
        }
      }
      expect(contract.target.filesystem.type).toBe("dir");
      checkFilesystem(contract.target.filesystem, "/");
      const ports = contract.target.ports.map((entry) => entry.port);
      expect(new Set(ports).size).toBe(ports.length);
      for (const port of ports)
        expect(Number.isInteger(port) && port > 0 && port <= 65535).toBe(true);
    }
  });

  it("hace coincidir IDs y niveles de la tienda con los rangos y los contratos", () => {
    expect(progression.xpPerLevel).toBeGreaterThan(0);
    expect(tiers.map((tier) => tier.tier)).toEqual([
      "script_kiddie",
      "hacker",
      "elite_hacker",
      "l33t",
      "anonymous",
    ]);
    expect(tiers.map((tier) => tier.minXp)).toEqual(
      [...new Set(tiers.map((tier) => tier.minXp))].sort((a, b) => a - b),
    );
    expect(tiers[0]?.minXp).toBe(0);
    expect(tiers.flatMap((tier) => tier.unlocksContracts).sort()).toEqual(
      contracts.map((contract) => contract.id).sort(),
    );
    expect(tiers.flatMap((tier) => tier.unlocksTools).sort()).toEqual(
      shop.map((tool) => tool.id).sort(),
    );
    expect(new Set(shop.map((tool) => tool.id)).size).toBe(shop.length);
    for (const tier of tiers) {
      const level = Math.floor(tier.minXp / progression.xpPerLevel) + 1;
      for (const contract of contracts.filter((entry) =>
        tier.unlocksContracts.includes(entry.id),
      )) {
        expect(contract.requiredReputation).toBe(tier.tier);
      }
      for (const tool of shop.filter((entry) => tier.unlocksTools.includes(entry.id))) {
        expect(tool.requiredLevel).toBe(level);
        expect(tool.price).toBeGreaterThan(0);
        expect(Number.isInteger(tool.traceModifier)).toBe(true);
        expect(commands.some((command) => command.name === tool.command)).toBe(true);
      }
    }
    const requiredTier = tiers.find((tier) => tier.tier === archivo.requiredReputation);
    expect(requiredTier).toBeDefined();
    expect(acme.reward.xp).toBeGreaterThanOrEqual(requiredTier?.minXp ?? Infinity);
  });

  it("vincula una pista a cada objetivo del tutorial con la sintaxis del parser", () => {
    expect(beginner.contractId).toBe(tutorial.id);
    expect(beginner.hints.map((hint) => hint.objectiveId)).toEqual(
      tutorial.objectives.map((objective) => objective.id),
    );
    expect([...new Set(beginner.hints.map((hint) => hint.level))]).toEqual([1, 2, 3]);
    for (const hint of beginner.hints) {
      const trigger = tutorial.objectives.find((goal) => goal.id === hint.objectiveId)?.trigger;
      expect(hint.text).not.toBe("");
      expect(parseCommand(hint.command)).toEqual({
        command: trigger?.command,
        args: trigger?.args ?? [],
      });
    }
  });
});
