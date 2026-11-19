import { describe, expect, it, vi } from "vitest";

describe("gameStore al cargar el módulo", () => {
  it("no falla cuando ya existe una partida guardada", async () => {
    // Guarda una partida válida y vuelve a importar el store desde cero,
    // como pasa al recargar la página con progreso previo
    vi.resetModules();
    const { useGameStore } = await import("@/store/gameStore");
    useGameStore.getState().newGame();
    useGameStore.getState().runCommand("whoami");

    vi.resetModules();
    const fresh = await import("@/store/gameStore");
    expect(fresh.useGameStore.getState().history).toEqual(["whoami"]);
  });
});
