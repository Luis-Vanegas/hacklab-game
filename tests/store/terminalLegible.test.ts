import { beforeEach, describe, expect, it } from "vitest";
import { addFindings, useGameStore } from "@/store/gameStore";

const store = () => useGameStore.getState();

describe("nueva partida con nombre (S1)", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("usa el nombre válido en la partida nueva", () => {
    expect(store().newGame("luis")).toBeNull();
    expect(store().game.player.username).toBe("luis");
  });

  it("sin nombre la partida usa anonymous", () => {
    expect(store().newGame("")).toBeNull();
    expect(store().game.player.username).toBe("anonymous");
  });

  it("un nombre inválido devuelve el error y no crea partida", () => {
    store().newGame("luis");
    const before = store().game;
    expect(store().newGame("Luis Vanegas")).toContain("minúsculas");
    expect(store().game).toBe(before);
  });
});

describe("hallazgos de la partida (S3)", () => {
  const ftp = { text: "ftp", kind: "finding", note: "FTP envía la clave sin cifrar." } as const;

  it("guarda solo los finding con explicación, el más reciente primero y sin repetir", () => {
    const first = addFindings(
      [],
      { output: [], highlights: [ftp, { text: "docs", kind: "dir" }] },
      "nmap a",
    );
    expect(first).toEqual([{ text: "ftp", note: ftp.note, command: "nmap a" }]);

    const telnet = { text: "telnet", kind: "finding", note: "Telnet no cifra." } as const;
    const second = addFindings(first, { output: [], highlights: [telnet, ftp] }, "nmap b");
    expect(second.map((f) => f.text)).toEqual(["telnet", "ftp"]);
    expect(second.find((f) => f.text === "ftp")?.command).toBe("nmap b");
  });

  it("un comando con error no deja hallazgos (atomicidad)", () => {
    expect(addFindings([], { output: [], error: "x", highlights: [ftp] }, "nmap")).toEqual([]);
  });

  it("una partida nueva empieza sin hallazgos", () => {
    useGameStore.setState({ findings: [{ text: "ftp", note: "x", command: "nmap" }] });
    store().newGame();
    expect(store().findings).toEqual([]);
  });
});
