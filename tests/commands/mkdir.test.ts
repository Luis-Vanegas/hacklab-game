import { describe, expect, it } from "vitest";
import { useGameStore } from "@/store/gameStore";
import { executeCommand } from "@/terminal/CommandParser";
import { makeContext } from "./fixtures";

describe("mkdir", () => {
  it("crea un directorio virtual y se puede repetir sin duplicarlo", () => {
    const store = () => useGameStore.getState();
    store().newGame();

    const result = store().runCommand("mkdir carpeta");
    const saved = store().filesystem;
    expect(result.filesystemChanges).toMatchObject([
      {
        action: "create",
        path: "/home/user/carpeta",
        node: { type: "dir", name: "carpeta", children: {} },
      },
    ]);
    expect(store().runCommand("mkdir carpeta").filesystemChanges).toBeUndefined();
    expect(store().filesystem).toBe(saved);
    expect(store().runCommand("cd carpeta").cwd).toBe("/home/user/carpeta");
  });

  it("rechaza opciones no admitidas, archivos existentes y padres ausentes", () => {
    const ctx = makeContext();
    expect(executeCommand("mkdir -p carpeta", ctx).error).toMatch(/^Uso:/u);
    expect(executeCommand("mkdir notes", ctx)).toHaveProperty("error");
    expect(executeCommand("mkdir /ausente/carpeta", ctx)).toHaveProperty("error");
  });
});
