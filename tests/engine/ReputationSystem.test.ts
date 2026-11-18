import { describe, expect, it } from "vitest";
import { getNextTier, getTierConfig, getTierForXp } from "@/engine/reputation/ReputationSystem";

describe("ReputationSystem", () => {
  it("asigna el tier más alto alcanzado según la XP", () => {
    expect(getTierForXp(0).tier).toBe("script_kiddie");
    expect(getTierForXp(10_000).tier).toBe("anonymous");
  });

  it("devuelve null cuando no hay tier siguiente", () => {
    expect(getNextTier("anonymous")).toBeNull();
    expect(getNextTier("script_kiddie")).not.toBeNull();
  });

  it("encuentra la configuración de un tier existente", () => {
    expect(getTierConfig("anonymous").minXp).toBe(10_000);
  });
});
