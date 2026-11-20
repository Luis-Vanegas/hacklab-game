// Vista de ataques (AttackView.tsx — A12, S1–S6).
// Muestra el diagrama de red 2D en SVG (useTopology), la tabla de paquetes al estilo de Wireshark
// (useCapture) con controles de reproducción, paso a paso y velocidad, y la explicación del paquete elegido.

import { useEffect, useId, useMemo, useState } from "react";
import { useCapture, useTopology, type Capture, type NetworkNode, type Packet } from "@/store";
import { PacketDiagram } from "./PacketDiagram";

export type PlaybackSpeed = 0.5 | 1 | 2;

const SPEEDS: readonly PlaybackSpeed[] = [0.5, 1, 2];
const BASE_STEP_MS = 750;

export interface AttackViewProps {
  readonly capture?: Capture | null;
  readonly topology?: readonly NetworkNode[];
  readonly reducedMotion?: boolean;
}

function usePrefersReducedMotion(override?: boolean): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (override !== undefined) return override;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return false;
    }
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (override !== undefined) return undefined;
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined;
    }
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    }
    return undefined;
  }, [override]);

  return override ?? prefersReduced;
}

// Tiempos relativos deterministas (segundos) para que la misma captura siempre marque igual
function computeTimestamps(packets: readonly Packet[]): readonly string[] {
  let elapsedMs = 0;
  return packets.map((packet, index) => {
    if (index > 0) {
      const isQuickControl =
        packet.protocol === "TCP" &&
        packet.flags !== undefined &&
        (packet.flags.includes("RST") || (packet.flags.length === 1 && packet.flags[0] === "ACK"));
      elapsedMs += isQuickControl ? 4 : packet.protocol === "HTTP" ? 18 : 12;
    }
    return `${(elapsedMs / 1000).toFixed(3)} s`;
  });
}

function protocolBadgeClass(protocol: Packet["protocol"]): string {
  return `hl-proto-badge hl-proto-badge--${protocol.toLowerCase()}`;
}

export function AttackView({
  capture: propCapture,
  topology: propTopology,
  reducedMotion: propReducedMotion,
}: AttackViewProps = {}) {
  const storeCapture = useCapture();
  const storeTopology = useTopology();
  const reducedMotion = usePrefersReducedMotion(propReducedMotion);

  const capture = propCapture !== undefined ? propCapture : storeCapture;
  const topology = propTopology ?? storeTopology;
  const packets = capture?.packets ?? [];

  const captionId = useId();
  const detailHeadingId = useId();

  const [prevCapture, setPrevCapture] = useState<Capture | null>(capture);
  const [prevReduced, setPrevReduced] = useState<boolean>(reducedMotion);
  const [selectedIndex, setSelectedIndex] = useState<number>(() => {
    if (packets.length === 0) return -1;
    return reducedMotion ? packets.length - 1 : 0;
  });
  const [visibleCount, setVisibleCount] = useState<number>(() => {
    if (packets.length === 0) return 0;
    return reducedMotion ? packets.length : 1;
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !reducedMotion && packets.length > 1);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const [flightId, setFlightId] = useState<number>(0);

  // Reinicio sincronizado cuando cambia la captura o el modo de movimiento reducido
  if (capture !== prevCapture) {
    setPrevCapture(capture);
    if (!capture || capture.packets.length === 0) {
      setSelectedIndex(-1);
      setVisibleCount(0);
      setIsPlaying(false);
    } else if (reducedMotion) {
      setSelectedIndex(capture.packets.length - 1);
      setVisibleCount(capture.packets.length);
      setIsPlaying(false);
    } else {
      setSelectedIndex(0);
      setVisibleCount(1);
      setIsPlaying(capture.packets.length > 1);
      setFlightId((n) => n + 1);
    }
  } else if (reducedMotion !== prevReduced) {
    setPrevReduced(reducedMotion);
    if (reducedMotion && packets.length > 0) {
      setIsPlaying(false);
      setVisibleCount(packets.length);
      setSelectedIndex((idx) => (idx < 0 ? packets.length - 1 : idx));
    }
  }

  useEffect(() => {
    if (!isPlaying || reducedMotion || packets.length === 0) {
      return undefined;
    }
    if (selectedIndex >= packets.length - 1) {
      return undefined;
    }
    const delayMs = Math.round(BASE_STEP_MS / speed);
    const timer = window.setTimeout(() => {
      const next = Math.min(packets.length - 1, selectedIndex + 1);
      setSelectedIndex(next);
      setVisibleCount((prev) => Math.max(prev, next + 1));
      setFlightId((n) => n + 1);
      if (next >= packets.length - 1) {
        setIsPlaying(false);
      }
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [isPlaying, reducedMotion, packets.length, selectedIndex, speed]);

  const timestamps = useMemo(() => computeTimestamps(packets), [packets]);

  const safeIndex =
    packets.length > 0 ? Math.min(Math.max(selectedIndex, 0), packets.length - 1) : -1;
  const activePacket = safeIndex >= 0 ? (packets[safeIndex] ?? null) : null;
  const visiblePackets = packets.slice(0, Math.max(visibleCount, safeIndex + 1));
  const tracedCount = packets.filter((p) => p.traced).length;

  const handleTogglePlay = () => {
    if (reducedMotion || packets.length === 0) return;
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }
    if (safeIndex >= packets.length - 1) {
      setSelectedIndex(0);
      setVisibleCount(1);
      setFlightId((n) => n + 1);
      setIsPlaying(packets.length > 1);
      return;
    }
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (safeIndex <= 0) return;
    setIsPlaying(false);
    setSelectedIndex(safeIndex - 1);
    setFlightId((n) => n + 1);
  };

  const handleNext = () => {
    if (safeIndex < 0 || safeIndex >= packets.length - 1) return;
    const next = safeIndex + 1;
    setIsPlaying(false);
    setSelectedIndex(next);
    setVisibleCount((prev) => Math.max(prev, next + 1));
    setFlightId((n) => n + 1);
  };

  const handleReset = () => {
    if (packets.length === 0) return;
    setIsPlaying(false);
    setSelectedIndex(0);
    setVisibleCount(reducedMotion ? packets.length : 1);
    setFlightId((n) => n + 1);
  };

  const handleSelectRow = (index: number) => {
    setIsPlaying(false);
    setSelectedIndex(index);
    setVisibleCount((prev) => Math.max(prev, index + 1));
    setFlightId((n) => n + 1);
  };

  return (
    <section
      className="hl-panel"
      aria-label="Vista de ataques y mapa de red"
      style={{ flex: "1 1 auto" }}
      data-testid="attack-view"
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">MAPA DE RED // PAQUETES</h2>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-xs)",
            flexWrap: "wrap",
          }}
        >
          {capture ? (
            <code
              className="hl-badge hl-badge--accent hl-tabular"
              data-testid="attack-capture-command"
            >
              $ {capture.command}
            </code>
          ) : (
            <span className="hl-badge hl-tabular" data-testid="attack-capture-idle">
              SIN CAPTURA
            </span>
          )}
          {tracedCount > 0 ? (
            <span
              className="hl-badge hl-badge--danger hl-tabular"
              data-testid="attack-traced-count"
            >
              {tracedCount} RASTREO
            </span>
          ) : null}
        </div>
      </div>

      <div className="hl-panel__body hl-attack-body">
        <PacketDiagram
          nodes={topology}
          activePacket={activePacket}
          activeIndex={safeIndex}
          totalPackets={packets.length}
          reducedMotion={reducedMotion}
          animationKey={`${capture?.command ?? "none"}-${safeIndex}-${flightId}`}
        />

        {packets.length === 0 ? (
          <div className="hl-attack-empty" data-testid="attack-empty-state">
            <p style={{ margin: 0 }}>
              Todavía no hay paquetes capturados. Ejecuta un comando de red en la terminal como{" "}
              <code className="hl-attack-inline-code">ping</code>,{" "}
              <code className="hl-attack-inline-code">nslookup</code>,{" "}
              <code className="hl-attack-inline-code">nmap</code>,{" "}
              <code className="hl-attack-inline-code">ssh</code>,{" "}
              <code className="hl-attack-inline-code">curl</code> o{" "}
              <code className="hl-attack-inline-code">traceroute</code> para ver el recorrido paso a
              paso.
            </p>
          </div>
        ) : (
          <>
            {/* Controles de reproducción y paso a paso (S3) */}
            <div className="hl-attack-controls" data-testid="attack-controls">
              <div className="hl-attack-controls__transport">
                <button
                  type="button"
                  className={isPlaying ? "hl-btn" : "hl-btn hl-btn--primary"}
                  onClick={handleTogglePlay}
                  disabled={reducedMotion}
                  data-testid="attack-play-btn"
                >
                  {isPlaying ? "Pausar" : "Reproducir"}
                </button>
                <button
                  type="button"
                  className="hl-btn"
                  onClick={handlePrev}
                  disabled={safeIndex <= 0}
                  aria-label="Paquete anterior"
                  data-testid="attack-prev-btn"
                >
                  Anterior
                </button>
                <button
                  type="button"
                  className="hl-btn"
                  onClick={handleNext}
                  disabled={safeIndex >= packets.length - 1}
                  aria-label="Siguiente paquete"
                  data-testid="attack-next-btn"
                >
                  Siguiente
                </button>
                <button
                  type="button"
                  className="hl-btn"
                  onClick={handleReset}
                  aria-label="Reiniciar captura al primer paquete"
                  data-testid="attack-reset-btn"
                >
                  Reiniciar
                </button>
              </div>

              <div className="hl-attack-controls__meta">
                <div
                  className="hl-attack-speed"
                  role="group"
                  aria-label="Velocidad de reproducción"
                >
                  {SPEEDS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={
                        speed === option
                          ? "hl-btn hl-btn--primary hl-attack-speed__btn"
                          : "hl-btn hl-attack-speed__btn"
                      }
                      aria-pressed={speed === option}
                      onClick={() => setSpeed(option)}
                      disabled={reducedMotion}
                      data-testid={`attack-speed-${option}`}
                    >
                      {option}×
                    </button>
                  ))}
                </div>
                <span className="hl-badge hl-tabular" data-testid="attack-step-counter">
                  Paso {safeIndex + 1}/{packets.length}
                </span>
              </div>

              {reducedMotion ? (
                <p className="hl-attack-reduced-note" data-testid="attack-reduced-motion-note">
                  Movimiento reducido activo: se muestra la captura completa sin animación.
                </p>
              ) : null}
            </div>

            {/* Explicación del paquete elegido (S4) */}
            {activePacket ? (
              <section
                className={
                  activePacket.traced
                    ? "hl-attack-detail hl-attack-detail--traced"
                    : "hl-attack-detail"
                }
                aria-labelledby={detailHeadingId}
                data-testid="attack-packet-detail"
              >
                <div className="hl-attack-detail__header">
                  <h3 id={detailHeadingId} className="hl-attack-detail__title hl-tabular">
                    Paquete #{safeIndex + 1} · {activePacket.protocol}
                  </h3>
                  <span className="hl-badge hl-tabular">{activePacket.size} B</span>
                </div>

                <div className="hl-attack-detail__route hl-tabular">
                  <span>{activePacket.from}</span>
                  <span aria-hidden="true">→</span>
                  <span>{activePacket.to}</span>
                </div>

                <div className="hl-attack-detail__info">{activePacket.info}</div>

                {activePacket.flags && activePacket.flags.length > 0 ? (
                  <div className="hl-attack-detail__flags" aria-label="Banderas TCP">
                    {activePacket.flags.map((flag) => (
                      <span key={flag} className="hl-badge hl-tabular">
                        {flag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {activePacket.traced ? (
                  <p className="hl-attack-detail__trace-warning" data-testid="attack-detail-traced">
                    Este paquete genera ruido detectable y sube tu nivel de rastreo.
                  </p>
                ) : null}

                <p className="hl-attack-detail__note" data-testid="attack-packet-note">
                  {activePacket.note ?? "Sin explicación adicional para este paquete."}
                </p>
              </section>
            ) : null}

            {/* Tabla de paquetes estilo Wireshark (S3, S6) */}
            <div
              tabIndex={0}
              role="region"
              aria-labelledby={captionId}
              className="hl-packet-table-wrap"
              data-testid="attack-table-region"
            >
              <table className="hl-packet-table" data-testid="attack-packet-table">
                <caption id={captionId} className="visually-hidden">
                  Tabla de paquetes capturados para {capture?.command ?? "el último comando"}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Tiempo</th>
                    <th scope="col">Origen</th>
                    <th scope="col">Destino</th>
                    <th scope="col">Protocolo</th>
                    <th scope="col">Información</th>
                    <th scope="col">Tamaño</th>
                  </tr>
                </thead>
                <tbody>
                  {visiblePackets.map((packet, index) => {
                    const isSelected = index === safeIndex;
                    return (
                      <tr
                        key={`${index}-${packet.from}-${packet.to}-${packet.info}`}
                        className={[
                          "hl-packet-row",
                          isSelected ? "hl-packet-row--selected" : "",
                          packet.traced ? "hl-packet-row--traced" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => handleSelectRow(index)}
                        data-testid={`packet-row-${index}`}
                        data-selected={isSelected ? "true" : "false"}
                        data-traced={packet.traced ? "true" : "false"}
                      >
                        <th scope="row" className="hl-tabular">
                          <button
                            type="button"
                            className="hl-packet-row__btn"
                            aria-current={isSelected ? "true" : undefined}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectRow(index);
                            }}
                            data-testid={`packet-select-${index}`}
                          >
                            <span>#{index + 1}</span>
                            <span className="visually-hidden">
                              {`: ${packet.protocol} de ${packet.from} a ${packet.to}, ${packet.info}`}
                            </span>
                          </button>
                        </th>
                        <td className="hl-tabular">{timestamps[index]}</td>
                        <td className="hl-tabular">{packet.from}</td>
                        <td className="hl-tabular">{packet.to}</td>
                        <td>
                          <span className={protocolBadgeClass(packet.protocol)}>
                            {packet.protocol}
                          </span>
                        </td>
                        <td className="hl-packet-row__info">
                          <span>{packet.info}</span>
                          {packet.traced ? (
                            <span className="hl-badge hl-badge--danger hl-packet-row__trace-tag">
                              RASTREO
                            </span>
                          ) : null}
                        </td>
                        <td className="hl-tabular">{packet.size} B</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
