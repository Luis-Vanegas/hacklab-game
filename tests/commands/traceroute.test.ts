import { describe, expect, it } from "vitest";
import traceroute from "@/terminal/commands/traceroute";

describe("traceroute", () => {
  it("presenta los saltos simulados en orden hasta alcanzar el destino", () => {
    const result = traceroute(["archivo.example"]);
    expect(result.output).toEqual([
      "Ruta a archivo.example (198.51.100.22)",
      "1  10.20.0.1  1 ms",
      "2  198.51.100.1  10 ms",
      "3  198.51.100.22  19 ms",
    ]);
    expect(traceroute(["198.51.100.22"])).toEqual(result);
    expect(traceroute(["archivo.example"])).toEqual(result);
  });

  it("indica el uso con argumentos inválidos y rechaza los hosts desconocidos", () => {
    expect(traceroute([])).toHaveProperty("error", "Uso: traceroute <host>");
    expect(traceroute(["desconocido.test"])).toHaveProperty("error", "Host inalcanzable");
  });
});
