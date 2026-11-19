import { beforeEach, describe, expect, it } from "vitest";
import { LOCAL_HOST, useGameStore } from "@/store";

// El prompt sin conexión debe mostrar el equipo del trabajo, no la darknet (ADR-005)
describe("host local", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().newGame();
  });

  it("es la estación de trabajo y coincide con el comando hostname", () => {
    expect(LOCAL_HOST).toBe("nodo-ws-07");
    expect(useGameStore.getState().runCommand("hostname").output).toEqual([LOCAL_HOST]);
  });
});
