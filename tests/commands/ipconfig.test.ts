import { describe, expect, it } from "vitest";
import { executeCommand, parseCommand } from "@/terminal/CommandParser";
import ipconfig from "@/terminal/commands/ipconfig";
import { makeContext } from "./fixtures";

describe("ipconfig", () => {
  it("muestra las interfaces virtuales, sus parámetros y los DNS", () => {
    const result = ipconfig([]);
    expect(result.output).toEqual([
      "Equipo: nodo-ws-07",
      "Interfaz eth0:",
      "  IPv4: 10.20.0.15/24",
      "  Máscara: 255.255.255.0",
      "  MAC: 02:20:00:00:00:15",
      "Interfaz wlan0:",
      "  IPv4: 10.20.1.15/24",
      "  Máscara: 255.255.255.0",
      "  MAC: 02:20:01:00:00:15",
      "Puerta de enlace: 10.20.0.1",
      "DNS: 10.20.0.53",
    ]);
    expect(ipconfig([])).toEqual(result);
  });

  it("reconoce ifconfig como alias al ejecutar y consultar la ayuda", () => {
    const ctx = makeContext();
    expect(parseCommand("IFCONFIG")).toEqual({ command: "ipconfig", args: [] });
    expect(executeCommand("ifconfig", ctx)).toEqual(ipconfig([]));
    expect(executeCommand("man ifconfig", ctx)).toEqual(executeCommand("man ipconfig", ctx));
  });

  it("indica el uso al recibir argumentos", () => {
    expect(ipconfig(["eth0"])).toHaveProperty("error", "Uso: ipconfig");
  });
});
