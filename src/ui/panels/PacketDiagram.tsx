// Diagrama de red 2D en SVG para la vista de ataques (S2, S6).
// Dibuja los equipos de useTopology() (estación local, router, DNS y objetivo activo),
// resalta la ruta del paquete seleccionado y anima el recorrido respetando prefers-reduced-motion.

import { useId, type CSSProperties } from "react";
import type { NetworkNode, Packet } from "@/store";

export interface PacketDiagramProps {
  readonly nodes: readonly NetworkNode[];
  readonly activePacket: Packet | null;
  readonly activeIndex: number;
  readonly totalPackets: number;
  readonly reducedMotion: boolean;
  readonly animationKey?: string;
}

interface Point {
  readonly x: number;
  readonly y: number;
}

interface PositionedNode {
  readonly node: NetworkNode;
  readonly pos: Point;
}

const ROLE_LABELS: Record<NetworkNode["role"], string> = {
  local: "Tu estación",
  router: "Router",
  dns: "DNS",
  target: "Objetivo",
};

const PROTOCOL_COLORS: Record<Packet["protocol"], string> = {
  TCP: "#58c4ff",
  UDP: "#c09dff",
  ICMP: "#6be89c",
  DNS: "#f0c451",
  HTTP: "#ff9e66",
  SSH: "#00ff88",
};

function shortName(name: string, maxLen = 15): string {
  return name.length > maxLen ? `${name.slice(0, maxLen - 1)}…` : name;
}

function layoutNodes(nodes: readonly NetworkNode[]): readonly PositionedNode[] {
  const hasTarget = nodes.some((n) => n.role === "target");
  return nodes.map((node) => {
    if (node.role === "local") {
      return { node, pos: { x: 56, y: 78 } };
    }
    if (node.role === "router") {
      return { node, pos: { x: 174, y: 78 } };
    }
    if (node.role === "dns") {
      return { node, pos: { x: 294, y: hasTarget ? 34 : 78 } };
    }
    return { node, pos: { x: 294, y: 118 } };
  });
}

function resolveEndpoint(
  ip: string,
  positioned: readonly PositionedNode[],
  otherIp: string,
): PositionedNode | null {
  const exact = positioned.find((p) => p.node.ip === ip);
  if (exact) return exact;

  // Si la IP corresponde a un salto intermedio (ej. traceroute), se representa en el router o en el objetivo
  const target = positioned.find((p) => p.node.role === "target");
  const router = positioned.find((p) => p.node.role === "router");
  const local = positioned.find((p) => p.node.role === "local");

  if (local && otherIp === local.node.ip) {
    return router ?? target ?? positioned[0] ?? null;
  }
  return target ?? router ?? positioned[0] ?? null;
}

function packetTag(packet: Packet): string {
  if (packet.flags && packet.flags.length > 0) {
    return packet.flags.slice(0, 2).join("-");
  }
  return packet.protocol;
}

function trimEndpoint(from: Point, to: Point, margin = 22): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy);
  if (dist <= margin) return to;
  const ratio = (dist - margin) / dist;
  return {
    x: Math.round((from.x + dx * ratio) * 10) / 10,
    y: Math.round((from.y + dy * ratio) * 10) / 10,
  };
}

function pointNearEnd(from: Point, to: Point, ratio = 0.68): Point {
  return {
    x: from.x + (to.x - from.x) * ratio,
    y: from.y + (to.y - from.y) * ratio,
  };
}

function NodeGlyph({
  role,
  x,
  y,
  color,
}: {
  role: NetworkNode["role"];
  x: number;
  y: number;
  color: string;
}) {
  if (role === "local") {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" aria-hidden="true">
        <rect x={x - 10} y={y - 8} width="20" height="13" rx="2" />
        <line x1={x - 5} y1={y + 8} x2={x + 5} y2={y + 8} />
        <line x1={x} y1={y + 5} x2={x} y2={y + 8} />
      </g>
    );
  }
  if (role === "router") {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" aria-hidden="true">
        <rect x={x - 11} y={y - 5} width="22" height="10" rx="2" />
        <circle cx={x - 6} cy={y} r="1.2" fill={color} />
        <circle cx={x - 1} cy={y} r="1.2" fill={color} />
        <line x1={x + 5} y1={y - 5} x2={x + 5} y2={y - 10} />
      </g>
    );
  }
  if (role === "dns") {
    return (
      <g stroke={color} strokeWidth="1.5" fill="none" aria-hidden="true">
        <circle cx={x} cy={y} r="8" />
        <ellipse cx={x} cy={y} rx="3.5" ry="8" />
        <line x1={x - 8} y1={y} x2={x + 8} y2={y} />
      </g>
    );
  }
  return (
    <g stroke={color} strokeWidth="1.5" fill="none" aria-hidden="true">
      <rect x={x - 9} y={y - 9} width="18" height="6" rx="1.5" />
      <rect x={x - 9} y={y - 1} width="18" height="6" rx="1.5" />
      <circle cx={x - 5} cy={y - 6} r="1" fill={color} />
      <circle cx={x - 5} cy={y + 2} r="1" fill={color} />
    </g>
  );
}

export function PacketDiagram({
  nodes,
  activePacket,
  activeIndex,
  totalPackets,
  reducedMotion,
  animationKey = "static",
}: PacketDiagramProps) {
  const titleId = useId();
  const descId = useId();
  const arrowId = useId();

  const positioned = layoutNodes(nodes);
  const localNode = positioned.find((p) => p.node.role === "local");
  const routerNode = positioned.find((p) => p.node.role === "router");
  const dnsNode = positioned.find((p) => p.node.role === "dns");
  const targetNode = positioned.find((p) => p.node.role === "target");

  const baseLinks: Array<{ readonly id: string; readonly a: Point; readonly b: Point }> = [];
  if (localNode && routerNode) {
    baseLinks.push({ id: "local-router", a: localNode.pos, b: routerNode.pos });
  }
  if (routerNode && dnsNode) {
    baseLinks.push({ id: "router-dns", a: routerNode.pos, b: dnsNode.pos });
  }
  if (routerNode && targetNode) {
    baseLinks.push({ id: "router-target", a: routerNode.pos, b: targetNode.pos });
  }

  let routePoints: readonly Point[] = [];
  let activeColor = "#58c4ff";

  if (activePacket) {
    const fromNode = resolveEndpoint(activePacket.from, positioned, activePacket.to);
    const toNode = resolveEndpoint(activePacket.to, positioned, activePacket.from);
    activeColor = activePacket.traced
      ? "#ff5c5c"
      : (PROTOCOL_COLORS[activePacket.protocol] ?? "#58c4ff");

    if (fromNode && toNode) {
      const needsRouterHop =
        routerNode &&
        fromNode.node.role !== "router" &&
        toNode.node.role !== "router" &&
        fromNode.node.ip !== toNode.node.ip;

      routePoints = needsRouterHop
        ? [fromNode.pos, routerNode.pos, toNode.pos]
        : [fromNode.pos, toNode.pos];
    }
  }

  const prevPt = routePoints[routePoints.length - 2];
  const endPt = routePoints[routePoints.length - 1];
  const trimmedEnd = prevPt && endPt ? trimEndpoint(prevPt, endPt) : null;
  const visualRoute: readonly Point[] =
    trimmedEnd && routePoints.length >= 2 ? [...routePoints.slice(0, -1), trimmedEnd] : routePoints;

  const pathD =
    visualRoute.length >= 2
      ? visualRoute.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ")
      : "";

  const staticMarkerPos = prevPt && trimmedEnd ? pointNearEnd(prevPt, trimmedEnd) : null;

  const summaryDescription = activePacket
    ? `Paquete ${activeIndex + 1} de ${totalPackets}: ${activePacket.protocol} de ${activePacket.from} hacia ${activePacket.to}, ${activePacket.info}, ${activePacket.size} bytes.${activePacket.traced ? " Este paquete sube el rastreo." : ""}`
    : `Topología con ${nodes.length} equipos: ${nodes.map((n) => `${n.name} (${n.ip})`).join(", ")}. Sin paquetes capturados todavía.`;

  const markerStyle = {
    "--hl-packet-path": `path("${pathD}")`,
    "--hl-packet-end-x": staticMarkerPos ? `${staticMarkerPos.x}px` : "0px",
    "--hl-packet-end-y": staticMarkerPos ? `${staticMarkerPos.y}px` : "0px",
  } as CSSProperties;

  return (
    <div className="hl-attack-diagram" data-testid="attack-diagram">
      <svg
        viewBox="0 0 360 166"
        className="hl-attack-diagram__svg"
        role="img"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <title id={titleId}>Diagrama de red de la captura de paquetes</title>
        <desc id={descId}>{summaryDescription}</desc>

        <defs>
          <marker
            id={arrowId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5.5"
            markerHeight="5.5"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={activeColor} />
          </marker>
        </defs>

        {/* Enlaces base de la topología */}
        {baseLinks.map((link) => (
          <line
            key={link.id}
            x1={link.a.x}
            y1={link.a.y}
            x2={link.b.x}
            y2={link.b.y}
            className="hl-attack-diagram__link"
          />
        ))}

        {/* Ruta del paquete seleccionado */}
        {pathD ? (
          <path
            d={pathD}
            fill="none"
            stroke={activeColor}
            strokeWidth={activePacket?.traced ? 2.6 : 2}
            strokeDasharray={activePacket?.traced ? "6 3" : undefined}
            markerEnd={`url(#${arrowId})`}
            data-testid="attack-active-path"
            data-traced={activePacket?.traced ? "true" : "false"}
          />
        ) : null}

        {/* Nodos de red */}
        {positioned.map(({ node, pos }) => {
          const isSource = activePacket?.from === node.ip;
          const isDestination = activePacket?.to === node.ip;
          const isActive = isSource || isDestination;
          const strokeColor =
            isActive && activePacket?.traced
              ? "#ff5c5c"
              : node.role === "local"
                ? "#00ff41"
                : node.role === "target"
                  ? "#00bfff"
                  : node.role === "dns"
                    ? "#f0c451"
                    : "#939db5";

          return (
            <g
              key={`${node.role}-${node.ip}`}
              className="hl-attack-diagram__node"
              data-testid={`topology-node-${node.role}`}
              data-active={isActive ? "true" : "false"}
            >
              <rect
                x={pos.x - 19}
                y={pos.y - 16}
                width="38"
                height="32"
                rx="6"
                fill={isActive ? "rgba(23, 28, 44, 0.96)" : "rgba(15, 16, 24, 0.92)"}
                stroke={strokeColor}
                strokeWidth={isActive ? 2 : 1.2}
              />
              <NodeGlyph role={node.role} x={pos.x} y={pos.y} color={strokeColor} />
              <text
                x={pos.x}
                y={pos.y + 27}
                textAnchor="middle"
                className="hl-attack-diagram__label"
              >
                {shortName(node.name)}
              </text>
              <text x={pos.x} y={pos.y + 38} textAnchor="middle" className="hl-attack-diagram__ip">
                {node.ip || ROLE_LABELS[node.role]}
              </text>
            </g>
          );
        })}

        {/* Marcador del paquete en vuelo o en su estado final si hay movimiento reducido */}
        {activePacket && pathD && staticMarkerPos ? (
          reducedMotion ? (
            <g
              transform={`translate(${staticMarkerPos.x}, ${staticMarkerPos.y})`}
              data-testid="attack-packet-marker"
              data-motion="static"
            >
              <rect
                x="-26"
                y="-11"
                width="52"
                height="20"
                rx="4"
                fill="#0b0d14"
                stroke={activeColor}
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="2.5"
                textAnchor="middle"
                fill={activeColor}
                className="hl-attack-diagram__packet-text"
              >
                {packetTag(activePacket)}
              </text>
            </g>
          ) : (
            <g
              key={animationKey}
              className="hl-attack-packet-flight"
              style={markerStyle}
              data-testid="attack-packet-marker"
              data-motion="animated"
            >
              <rect
                x="-26"
                y="-11"
                width="52"
                height="20"
                rx="4"
                fill="#0b0d14"
                stroke={activeColor}
                strokeWidth="1.4"
              />
              <text
                x="0"
                y="2.5"
                textAnchor="middle"
                fill={activeColor}
                className="hl-attack-diagram__packet-text"
              >
                {packetTag(activePacket)}
              </text>
            </g>
          )
        ) : null}
      </svg>

      {activePacket?.traced ? (
        <div className="hl-attack-diagram__trace-flag" data-testid="attack-diagram-traced">
          <span className="hl-badge hl-badge--danger">RASTREO</span>
          <span>Paquete ruidoso: aumenta tu exposición</span>
        </div>
      ) : null}
    </div>
  );
}
