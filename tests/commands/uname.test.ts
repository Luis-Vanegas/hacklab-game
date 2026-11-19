import { describe, expect, it } from "vitest";
import uname from "@/terminal/commands/uname";

describe("uname", () => {
  it("muestra el nombre del sistema y permite consultar el detalle", () => {
    expect(uname([])).toEqual({ output: ["Linux"] });
    const full = uname(["-a"]);
    expect(full).toEqual({ output: ["Linux nodo-ws-07 6.8.0-hacklab x86_64 GNU/Linux"] });
    expect(uname(["-a"])).toEqual(full);
  });

  it("rechaza opciones y argumentos distintos de -a", () => {
    expect(uname(["-x"])).toMatchObject({ error: "Uso: uname [-a]" });
    expect(uname(["-a", "extra"])).toHaveProperty("error");
  });
});
