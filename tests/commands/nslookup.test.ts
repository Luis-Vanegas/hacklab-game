import { describe, expect, it } from "vitest";
import nslookup from "@/terminal/commands/nslookup";

describe("nslookup", () => {
  it("resuelve la intranet con el DNS simulado de forma determinista", () => {
    const result = nslookup(["intranet.nodoseguro.test"]);
    expect(result.output).toEqual([
      "Servidor DNS: 10.20.0.53",
      "Nombre: intranet.nodoseguro.test",
      "Dirección: 10.20.0.80",
    ]);
    expect(nslookup(["INTRANET.NODOSEGURO.TEST."])).toEqual(result);
    expect(nslookup(["intranet.nodoseguro.test"])).toEqual(result);
  });

  it("resuelve el nombre de la estación de trabajo y sus alias", () => {
    const expected = {
      output: [
        "Servidor DNS: 10.20.0.53",
        "Nombre: nodo-ws-07.nodoseguro.test",
        "Dirección: 10.20.0.15",
      ],
    };
    for (const input of ["nodo-ws-07.nodoseguro.test", "nodo-ws-07", "tutorial.nodoseguro.test"]) {
      expect(nslookup([input])).toEqual(expected);
    }
  });

  it("indica el uso con argumentos inválidos y rechaza los dominios sin registro", () => {
    expect(nslookup([""])).toHaveProperty("error", "Uso: nslookup <dominio>");
    expect(nslookup(["desconocido.test"])).toHaveProperty(
      "error",
      "Dominio sin registro en la red virtual.",
    );
  });
});
