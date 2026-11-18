import { beforeEach, describe, expect, it } from "vitest";
import { loadSession, useGameStore } from "@/store/gameStore";
import { load } from "@/lib/persistence";

const store = () => useGameStore.getState();
const completed = () =>
  store().game.activeContract?.objectives.filter((o) => o.completed).length ?? 0;

describe("gameStore", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("ejecuta un comando, devuelve su salida y lo guarda en el historial", () => {
    const result = store().runCommand("ls");
    expect(result.output).toContain("notes");
    expect(store().history).toEqual(["ls"]);
  });

  it("ignora la entrada vacía", () => {
    store().runCommand("   ");
    expect(store().history).toEqual([]);
  });

  it("registra los objetivos del tutorial al ejecutar los comandos correctos", () => {
    expect(store().acceptContract("00-tutorial")).toBe(true);
    store().runCommand("ls");
    store().runCommand("cat notes");
    store().runCommand("whoami");
    expect(completed()).toBe(3);
  });

  it("no acepta un segundo contrato ni uno inexistente", () => {
    expect(store().acceptContract("no-existe")).toBe(false);
    expect(store().acceptContract("00-tutorial")).toBe(true);
    expect(store().acceptContract("00-tutorial")).toBe(false);
  });

  it("al entregar el contrato paga y vuelve a modo libre", () => {
    const credits = store().game.player.credits;
    store().acceptContract("00-tutorial");
    store().runCommand("ls");
    store().submitContract();
    expect(store().game.activeContract).toBeNull();
    expect(store().game.player.credits).toBeGreaterThan(credits);
    expect(store().game.completedContracts).toEqual(["00-tutorial"]);
  });

  it("guarda la partida tras cada comando y la recupera", () => {
    store().runCommand("pwd");
    expect(load()?.commandHistory).toEqual(["pwd"]);
    expect(loadSession().history).toEqual(["pwd"]);
  });

  it("descarta una partida guardada corrupta", () => {
    localStorage.setItem("hacklab-game-save", JSON.stringify({ version: 1, gameState: { x: 1 } }));
    const session = loadSession();
    expect(session.game.phase).toBe("playing");
    expect(session.history).toEqual([]);
  });

  it("descarta un guardado con contrato activo mal formado o jugador incompleto", () => {
    const base = JSON.parse(JSON.stringify(store().game)) as Record<string, unknown>;
    for (const gameState of [
      { ...base, activeContract: {} },
      { ...base, player: { xp: 0, credits: 1 } },
      { ...base, phase: "zzz" },
    ]) {
      localStorage.setItem(
        "hacklab-game-save",
        JSON.stringify({ version: 1, gameState, commandHistory: [] }),
      );
      const session = loadSession();
      expect(session.game.activeContract).toBeNull();
      expect(session.game.player.reputation).toBe("script_kiddie");
      expect(session.game.phase).toBe("playing");
    }
  });

  it("en game_over no deja aceptar ni entregar contratos", () => {
    useGameStore.setState({ game: { ...store().game, phase: "game_over", traceLevel: 100 } });
    expect(store().acceptContract("00-tutorial")).toBe(false);

    const credits = store().game.player.credits;
    store().submitContract();
    expect(store().game.phase).toBe("game_over");
    expect(store().game.player.credits).toBe(credits);
  });

  it("al entregar cierra la sesión remota", () => {
    store().acceptContract("00-tutorial");
    useGameStore.setState({ game: { ...store().game, connectedTo: "acme.example" } });
    store().submitContract();
    expect(store().game.connectedTo).toBeNull();
  });
});
