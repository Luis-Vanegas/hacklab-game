import { describe, expect, it } from "vitest";
import hostname from "@/terminal/commands/hostname";

describe("hostname", () => {
  it("muestra el nombre y su alias virtual de forma determinista", () => {
    expect(hostname([])).toEqual({ output: ["nodo-ws-07"] });
    expect(hostname([])).toEqual(hostname([]));
    expect(hostname(["-a"])).toEqual({ output: ["nodo-ws-07.nodoseguro.test"] });
  });

  it("rechaza otras opciones y argumentos", () => {
    expect(hostname(["-x"])).toMatchObject({ error: "Uso: hostname [-a]" });
    expect(hostname(["-a", "extra"])).toHaveProperty("error");
  });
});
