import { describe, expect, it } from "vitest";
import ping from "@/terminal/commands/ping";

describe("ping", () => {
  it("devuelve cuatro respuestas con latencias fijas para el host simulado", () => {
    const result = ping(["10.20.0.1"]);
    expect(result.output).toEqual([
      "PING gateway.nodoseguro.test (10.20.0.1)",
      "Respuesta desde 10.20.0.1: secuencia=1 tiempo=1 ms",
      "Respuesta desde 10.20.0.1: secuencia=2 tiempo=1 ms",
      "Respuesta desde 10.20.0.1: secuencia=3 tiempo=1 ms",
      "Respuesta desde 10.20.0.1: secuencia=4 tiempo=1 ms",
      "4 enviados, 4 recibidos, 0 % de pérdida",
    ]);
    expect(ping(["GATEWAY.NODOSEGURO.TEST."])).toEqual(result);
    expect(ping(["10.20.0.1"])).toEqual(result);
  });

  it("indica el uso con argumentos inválidos y limita los destinos a la simulación", () => {
    expect(ping([])).toHaveProperty("error", "Uso: ping <host>");
    expect(ping(["10.20.0.1", "extra"])).toHaveProperty("error", "Uso: ping <host>");
    expect(ping(["desconocido.test"])).toHaveProperty("error", "Host inalcanzable");
    expect(ping(["203.0.113.45"])).toHaveProperty("error", "Host inalcanzable");
  });
});
