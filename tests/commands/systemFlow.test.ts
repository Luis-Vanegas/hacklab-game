import { beforeEach, describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";

const store = () => useGameStore.getState();

describe("Comandos del sistema integrados", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("refleja el estado del proceso ficticio entre comandos", () => {
    expect(store().runCommand("ps").output).toContain("4444  user    svch0st");
    expect(store().runCommand("sudo kill 4444")).toHaveProperty("error");
    expect(store().runCommand("ps").output).toContain("4444  user    svch0st");
    expect(store().runCommand("kill 4444").error).toBeUndefined();
    expect(store().runCommand("ps").output).not.toContain("4444  user    svch0st");
  });
});
