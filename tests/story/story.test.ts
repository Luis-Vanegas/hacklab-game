import { describe, expect, it } from "vitest";
import { CHARACTERS, DARKNET_WELCOME, INTRO, WORK_WELCOME } from "@/store";
import { CONTRACTS } from "@/store/gameStore";

describe("intro", () => {
  it("tiene 5 viñetas: empieza de día y termina de noche", () => {
    expect(INTRO).toHaveLength(5);
    expect(INTRO[0]?.mood).toBe("day");
    expect(INTRO.at(-1)?.mood).toBe("night");
  });

  it("cada viñeta es corta para la máquina de escribir", () => {
    for (const slide of INTRO) {
      expect(slide.text.length).toBeGreaterThan(0);
      expect(slide.text.length).toBeLessThanOrEqual(160);
    }
  });

  it("los ids no se repiten", () => {
    expect(new Set(INTRO.map((s) => s.id)).size).toBe(INTRO.length);
  });
});

describe("personajes y diálogos", () => {
  it("las bienvenidas las dicen Marta (trabajo) y CIPHER (darknet)", () => {
    expect(WORK_WELCOME.every((l) => l.character === "MARTA")).toBe(true);
    expect(DARKNET_WELCOME.every((l) => l.character === "CIPHER")).toBe(true);
    expect(WORK_WELCOME.length).toBeGreaterThan(0);
    expect(DARKNET_WELCOME.length).toBeGreaterThan(0);
  });

  it("todo personaje que habla, en la historia o en un contrato, existe", () => {
    const contractLines = CONTRACTS.flatMap((c) => [
      ...c.story.intro,
      ...c.story.onComplete,
      ...Object.values(c.story.hints).flat(),
    ]);
    for (const line of [...WORK_WELCOME, ...DARKNET_WELCOME, ...contractLines]) {
      expect(CHARACTERS).toHaveProperty(line.character);
    }
  });
});
