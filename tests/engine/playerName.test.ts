import { describe, expect, it } from "vitest";
import { marksFindings } from "@/engine/reputation";
import { createInitialState, setUsername, validateUsername } from "@/engine/state";

describe("nombre del jugador (S1)", () => {
  it("acepta nombres de usuario de Linux", () => {
    for (const name of ["luis", "ana-maria", "neo_99", "a", "abcdefghijklmnop"]) {
      expect(validateUsername(name)).toBeNull();
    }
  });

  it("rechaza mayúsculas, espacios, símbolos, tildes y más de 16 caracteres", () => {
    for (const name of ["Luis", "ana maria", "neo!", "josé", "9lives", "-x", "abcdefghijklmnopq"]) {
      expect(validateUsername(name)).toContain("minúsculas");
    }
  });

  it("setUsername cambia el nombre y es idempotente", () => {
    const state = createInitialState();
    const named = setUsername(state, "luis");
    expect(named.player.username).toBe("luis");
    expect(setUsername(named, "luis")).toBe(named);
  });
});

describe("hallazgos marcados solo al empezar (S4)", () => {
  it("se marcan con script_kiddie y hacker, y no desde elite_hacker", () => {
    expect(marksFindings("script_kiddie")).toBe(true);
    expect(marksFindings("hacker")).toBe(true);
    expect(marksFindings("elite_hacker")).toBe(false);
    expect(marksFindings("l33t")).toBe(false);
    expect(marksFindings("anonymous")).toBe(false);
  });
});
