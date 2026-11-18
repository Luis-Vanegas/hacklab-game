import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";

const store = () => useGameStore.getState();

describe("recorrido del tutorial con el store real", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("completa los 5 objetivos de 00-tutorial", () => {
    expect(store().acceptContract("00-tutorial")).toBe(true);

    for (const line of ["ls", "cat notes", "cd /etc", "cat passwd", "whoami"]) {
      expect(store().runCommand(line).error).toBeUndefined();
    }

    const objectives = store().game.activeContract?.objectives ?? [];
    expect(objectives).toHaveLength(5);
    expect(objectives.every((o) => o.completed)).toBe(true);
    expect(store().currentDir).toBe("/etc");
  });
});
