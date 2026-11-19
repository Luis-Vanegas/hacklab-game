import { describe, expect, it } from "vitest";
import whois from "@/terminal/commands/whois";

describe("whois", () => {
  it("presenta la titularidad y las fechas del registro ficticio", () => {
    const result = whois(["nodoseguro.test"]);
    expect(result.output).toEqual([
      "Dominio: nodoseguro.test",
      "Titular: Nodo Seguro",
      "Creación: 2024-02-19",
      "Actualización: 2026-02-19",
      "Vencimiento: 2027-02-19",
    ]);
    expect(whois(["intranet.nodoseguro.test"])).toEqual(result);
    expect(whois(["nodoseguro.test"])).toEqual(result);
  });

  it("indica el uso con argumentos inválidos y rechaza los dominios sin registro", () => {
    expect(whois([])).toHaveProperty("error", "Uso: whois <dominio>");
    expect(whois(["desconocido.nodoseguro.test"])).toHaveProperty(
      "error",
      "Dominio sin registro en la red virtual.",
    );
  });
});
