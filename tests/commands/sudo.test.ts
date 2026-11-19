import { describe, expect, it } from "vitest";
import sudo from "@/terminal/commands/sudo";
import { makeContext } from "./fixtures";

describe("sudo", () => {
  it("deniega el comando con el nombre del jugador y sin devolver cambios", () => {
    const ctx = makeContext({ user: "aprendiz" });
    const result = sudo(["kill", "4444"], ctx);
    expect(result.error).toBe(
      "aprendiz no está en el grupo sudoers. Este incidente será reportado.",
    );
    expect(result).not.toHaveProperty("stateChanges");
    expect(sudo(["kill", "4444"], ctx)).toEqual(result);
  });

  it("indica el uso si falta el comando", () => {
    expect(sudo([], makeContext())).toMatchObject({ error: "Uso: sudo <comando>" });
  });
});
