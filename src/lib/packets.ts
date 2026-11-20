// Constructores puros de paquetes simulados para la vista de ataques (K6).
// Los comandos los usan para describir qué "enviaron"; no tocan el engine ni la red real.
// Son deterministas (puerto de origen y tamaños fijos): el mismo comando da la misma captura.

import type { Packet, TcpFlag } from "./types";

// ponytail: un solo puerto efímero fijo; basta para leer la captura y la hace reproducible
const SOURCE_PORT = 49152;

// Tamaños típicos en el cable (Ethernet incluido), solo para comparar paquetes entre sí
const SIZE = { syn: 74, ack: 66, rst: 54, icmp: 98, dnsQuery: 76, dnsAnswer: 92 } as const;

function tcp(from: string, to: string, srcPort: number, dstPort: number, flags: TcpFlag[]): Packet {
  const size = flags.includes("SYN") ? SIZE.syn : flags.includes("RST") ? SIZE.rst : SIZE.ack;
  return {
    from,
    to,
    protocol: "TCP",
    info: `${srcPort} → ${dstPort} [${flags.join(", ")}]`,
    size,
    flags,
  };
}

// Saludo de tres pasos: el cliente pide abrir, el servidor acepta y el cliente confirma
export function tcpHandshake(from: string, to: string, port: number): Packet[] {
  return [
    tcp(from, to, SOURCE_PORT, port, ["SYN"]),
    tcp(to, from, port, SOURCE_PORT, ["SYN", "ACK"]),
    tcp(from, to, SOURCE_PORT, port, ["ACK"]),
  ];
}

// Escaneo SYN (medio abierto): nunca completa el saludo. Abierto responde SYN-ACK y el
// escáner corta con RST; cerrado responde RST-ACK.
export function synScan(
  from: string,
  to: string,
  ports: readonly { readonly port: number; readonly open: boolean }[],
): Packet[] {
  return ports.flatMap(({ port, open }) => [
    tcp(from, to, SOURCE_PORT, port, ["SYN"]),
    ...(open
      ? [
          tcp(to, from, port, SOURCE_PORT, ["SYN", "ACK"]),
          tcp(from, to, SOURCE_PORT, port, ["RST"]),
        ]
      : [tcp(to, from, port, SOURCE_PORT, ["RST", "ACK"])]),
  ]);
}

export function icmpEcho(from: string, to: string, count = 1): Packet[] {
  return Array.from({ length: count }, (_, i) => i + 1).flatMap((seq) => [
    { from, to, protocol: "ICMP", info: `Echo (ping) request seq=${seq}`, size: SIZE.icmp },
    { from: to, to: from, protocol: "ICMP", info: `Echo (ping) reply seq=${seq}`, size: SIZE.icmp },
  ]);
}

export function dnsQuery(from: string, server: string, name: string, answer: string): Packet[] {
  return [
    { from, to: server, protocol: "DNS", info: `Consulta A ${name}`, size: SIZE.dnsQuery },
    {
      from: server,
      to: from,
      protocol: "DNS",
      info: `Respuesta A ${name} → ${answer}`,
      size: SIZE.dnsAnswer,
    },
  ];
}

export function httpRequest(from: string, to: string, path = "/", port = 80): Packet[] {
  const request = `GET ${path} HTTP/1.1`;
  return [
    ...tcpHandshake(from, to, port),
    { from, to, protocol: "HTTP", info: request, size: SIZE.ack + request.length + 60 },
    { from: to, to: from, protocol: "HTTP", info: "HTTP/1.1 200 OK", size: 512 },
  ];
}
