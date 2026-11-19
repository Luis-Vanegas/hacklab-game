import { beforeEach, describe, expect, it } from "vitest";
import { COMMAND_GUIDE, CONTRACTS, loadSession, useGameStore } from "@/store/gameStore";

const store = () => useGameStore.getState();

describe("eventos del juego en el store", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("un objetivo cumplido entra a la cola y se puede descartar", () => {
    store().acceptContract("00-tutorial");
    store().runCommand("ls");

    const [event] = store().events;
    expect(event).toMatchObject({ type: "objective_completed", objectiveId: "tut-01" });

    store().dismissEvent(event?.id ?? -1);
    expect(store().events).toEqual([]);
  });

  it("un comando fallido no genera eventos", () => {
    store().acceptContract("00-tutorial");
    store().runCommand("cat no-existe");
    expect(store().events).toEqual([]);
  });

  it("entregar el tutorial avisa el contrato completado", () => {
    store().acceptContract("00-tutorial");
    for (const line of ["ls", "cat notes", "cd /etc", "cat passwd", "whoami"]) {
      store().runCommand(line);
    }
    store().submitContract();

    expect(store().events.at(-1)).toMatchObject({
      type: "contract_completed",
      contractId: "00-tutorial",
    });
  });

  it("los ids de evento no se repiten", () => {
    store().acceptContract("00-tutorial");
    store().runCommand("ls");
    store().runCommand("cat notes");
    const ids = store().events.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("la intro vista se guarda y una partida nueva la reinicia", () => {
    expect(store().game.storyFlags.introSeen).toBeUndefined();
    store().markIntroSeen();
    store().markIntroSeen();

    expect(loadSession().game.storyFlags.introSeen).toBe(true);
    store().newGame();
    expect(store().game.storyFlags.introSeen).toBeUndefined();
  });
});

describe("datos públicos para la UI", () => {
  it("COMMAND_GUIDE trae el manual de cada comando, sin la función", () => {
    const cd = COMMAND_GUIDE.find((c) => c.name === "cd");
    expect(cd).toMatchObject({ usage: "cd [ruta]", example: "cd /etc" });
    expect(COMMAND_GUIDE.every((c) => !("run" in c))).toBe(true);
  });

  it("el juego carga todos los contratos de src/data, en orden y con canal", () => {
    const ids = CONTRACTS.map((c) => c.id);
    expect(ids).toEqual([...ids].sort());
    expect(ids).toContain("10-dia-1-bienvenida");
    expect(ids).toContain("04-archivo-de-turno");
    expect(CONTRACTS.filter((c) => c.channel === "work").length).toBeGreaterThanOrEqual(7);
    expect(CONTRACTS.every((c) => c.channel === "work" || c.channel === "darknet")).toBe(true);
  });

  it("una partida nueva arranca con los archivos de la estación de trabajo", () => {
    store().newGame();
    expect(store().runCommand("cat bienvenida.txt").error).toBeUndefined();
    expect(store().runCommand("cat /var/log/auth.log").error).toBeUndefined();
  });
});
