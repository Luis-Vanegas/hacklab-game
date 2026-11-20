import { beforeEach, describe, expect, it } from "vitest";
import acme from "@/data/contracts/01-first-hack.json";
import { addCapture, buildTopology, useGameStore } from "@/store/gameStore";
import type { Contract, Packet } from "@/lib/types";

const syn: Packet = {
  from: "10.20.0.15",
  to: "192.0.2.11",
  protocol: "TCP",
  info: "49152 → 22 [SYN]",
  size: 60,
  flags: ["SYN"],
};

describe("captura del último comando con paquetes (K6, useCapture)", () => {
  it("guarda el comando y sus paquetes", () => {
    expect(addCapture(null, { output: [], packets: [syn] }, "nmap acme")).toEqual({
      command: "nmap acme",
      packets: [syn],
    });
  });

  it("un comando sin paquetes conserva la captura anterior", () => {
    const previous = { command: "ping acme", packets: [syn] };
    expect(addCapture(previous, { output: ["ok"] }, "ls")).toBe(previous);
  });

  it("un comando con error no deja captura (atomicidad)", () => {
    expect(addCapture(null, { output: [], error: "x", packets: [syn] }, "nmap")).toBeNull();
  });

  it("una partida nueva empieza sin captura", () => {
    localStorage.clear();
    useGameStore.setState({ capture: { command: "nmap", packets: [syn] } });
    useGameStore.getState().newGame();
    expect(useGameStore.getState().capture).toBeNull();
  });
});

describe("topología del diagrama (K6, useTopology)", () => {
  beforeEach(() => localStorage.clear());

  it("sin contrato: estación local, router y DNS", () => {
    expect(buildTopology(null)).toEqual([
      { ip: "10.20.0.15", name: "nodo-ws-07", role: "local" },
      { ip: "10.20.0.1", name: "router", role: "router" },
      { ip: "10.20.0.53", name: "dns", role: "dns" },
    ]);
  });

  it("con contrato activo agrega su objetivo", () => {
    expect(buildTopology(acme as Contract).at(-1)).toEqual({
      ip: "192.0.2.11",
      name: "acme.example",
      role: "target",
    });
  });
});
