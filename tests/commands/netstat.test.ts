import { describe, expect, it } from "vitest";
import netstat from "@/terminal/commands/netstat";

describe("netstat", () => {
  it("lista las conexiones virtuales, incluida la conexión sospechosa", () => {
    const result = netstat([]);
    expect(result.output[0]).toContain("Dirección remota");
    expect(result.output).toHaveLength(3);
    expect(result.output[1]).toMatch(/TCP +10\.20\.0\.15:51020 +10\.20\.0\.80:443 +ESTABLECIDA/u);
    expect(result.output[2]).toMatch(
      /TCP +10\.20\.0\.15:51021 +203\.0\.113\.45:4444 +ESTABLECIDA/u,
    );
    expect(netstat([])).toEqual(result);
  });

  it("indica el uso al recibir argumentos", () => {
    expect(netstat(["-a"])).toHaveProperty("error", "Uso: netstat");
  });
});
