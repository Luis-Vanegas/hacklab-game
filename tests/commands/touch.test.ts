import { describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("touch", () => {
  it("crea un archivo vacío y repetirlo conserva el árbol de la partida", () => {
    const store = () => useGameStore.getState();
    store().newGame();

    const line = 'touch "bitácora nueva.txt"';
    const result = store().runCommand(line);
    const saved = store().filesystem;
    expect(result.filesystemChanges).toMatchObject([
      {
        action: "create",
        path: "/home/user/bitácora nueva.txt",
        node: { type: "file", name: "bitácora nueva.txt", content: "" },
      },
    ]);
    expect(store().runCommand(line).filesystemChanges).toBeUndefined();
    expect(store().filesystem).toBe(saved);
    expect(store().runCommand('wc "bitácora nueva.txt"').output).toEqual([
      "0 0 0 bitácora nueva.txt",
    ]);
  });

  it("conserva archivos existentes y rechaza destinos que no puede crear", () => {
    const ctx = makeContext();
    expect(executeCommand("touch notes", ctx).filesystemChanges).toBeUndefined();
    expect(executeCommand("touch", ctx).error).toMatch(/^Uso:/u);
    for (const line of ["touch sub", "touch /ausente/nuevo", "touch __proto__"]) {
      expect(executeCommand(line, ctx)).toHaveProperty("error");
    }
  });
});
