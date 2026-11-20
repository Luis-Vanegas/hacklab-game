import { describe, expect, it } from "vitest";
import { dnsQuery, httpRequest, icmpEcho, synScan, tcpHandshake } from "@/lib/packets";

const ME = "10.20.0.15";
const TARGET = "192.0.2.11";

describe("constructores de paquetes (K6, S5)", () => {
  it("tcpHandshake: SYN, SYN-ACK y ACK entre los dos equipos", () => {
    const packets = tcpHandshake(ME, TARGET, 22);
    expect(packets.map((p) => p.flags)).toEqual([["SYN"], ["SYN", "ACK"], ["ACK"]]);
    expect(packets.map((p) => [p.from, p.to])).toEqual([
      [ME, TARGET],
      [TARGET, ME],
      [ME, TARGET],
    ]);
    expect(packets.every((p) => p.protocol === "TCP" && p.size > 0)).toBe(true);
    expect(packets[0]?.info).toContain("→ 22");
  });

  it("synScan: SYN a cada puerto; SYN-ACK y RST si está abierto, RST-ACK si está cerrado", () => {
    const packets = synScan(ME, TARGET, [
      { port: 21, open: true },
      { port: 23, open: false },
    ]);
    expect(packets.map((p) => [p.from === ME ? "yo" : "objetivo", p.flags])).toEqual([
      ["yo", ["SYN"]],
      ["objetivo", ["SYN", "ACK"]],
      ["yo", ["RST"]],
      ["yo", ["SYN"]],
      ["objetivo", ["RST", "ACK"]],
    ]);
  });

  it("icmpEcho: petición y respuesta por cada secuencia", () => {
    const packets = icmpEcho(ME, TARGET, 2);
    expect(packets).toHaveLength(4);
    expect(packets.every((p) => p.protocol === "ICMP" && p.flags === undefined)).toBe(true);
    expect(packets[0]?.info).toContain("request");
    expect(packets[1]?.info).toContain("reply");
    expect(packets[3]?.info).toContain("seq=2");
  });

  it("dnsQuery: consulta al servidor y su respuesta con la IP", () => {
    const [query, answer] = dnsQuery(ME, "10.20.0.53", "acme.example", TARGET);
    expect(query).toMatchObject({ from: ME, to: "10.20.0.53", protocol: "DNS" });
    expect(query?.info).toContain("acme.example");
    expect(answer).toMatchObject({ from: "10.20.0.53", to: ME, protocol: "DNS" });
    expect(answer?.info).toContain(TARGET);
  });

  it("httpRequest: saludo TCP, GET y respuesta", () => {
    const packets = httpRequest(ME, TARGET, "/entrega");
    expect(packets.map((p) => p.protocol)).toEqual(["TCP", "TCP", "TCP", "HTTP", "HTTP"]);
    expect(packets[3]?.info).toBe("GET /entrega HTTP/1.1");
    expect(packets[4]).toMatchObject({ from: TARGET, to: ME, info: "HTTP/1.1 200 OK" });
  });

  it("son puros: los mismos datos dan los mismos paquetes (idempotencia)", () => {
    expect(synScan(ME, TARGET, [{ port: 22, open: true }])).toEqual(
      synScan(ME, TARGET, [{ port: 22, open: true }]),
    );
    expect(httpRequest(ME, TARGET)).toEqual(httpRequest(ME, TARGET));
  });
});
