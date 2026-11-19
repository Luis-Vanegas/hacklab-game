// Escritorio de HackLab OS (Desktop.tsx).
// Organiza las ventanas del computador del jugador (Terminal, Bandeja con canales Trabajo y Darknet,
// Guía de comandos, Mapa de red y Tienda) con una barra de tareas que muestra hora del juego,
// nivel de rastreo y créditos. En móvil (<= 720px, incluido 375px), las ventanas pasan a pestañas.

import { useState, type ReactNode } from "react";
import type { Contract, PlayerState } from "@/lib/types";
import { ReputationBadge } from "../hud/ReputationBadge";
import { TraceBar } from "../hud/TraceBar";

export type DesktopWindowId = "terminal" | "inbox" | "guide" | "map" | "shop";

export type SidePanelTab = "status" | "guide" | "map";

export interface DesktopProps {
  readonly player: PlayerState;
  readonly traceLevel: number;
  readonly connectedTo?: string | null;
  readonly gameClock?: string;
  readonly activeContract?: Contract | null;
  readonly contracts?: readonly Contract[];
  readonly terminalWindow: ReactNode;
  readonly inboxWindow: ReactNode;
  readonly statusWindow?: ReactNode;
  readonly commandGuideWindow?: ReactNode;
  readonly networkMapWindow?: ReactNode;
  readonly storyOverlay?: ReactNode;
  readonly commandHintOverlay?: ReactNode;
  readonly backgroundScene?: ReactNode;
  readonly onOpenShop?: () => void;
  readonly shopModal?: ReactNode;
}

function DefaultNetworkMap({
  connectedTo,
  activeContract,
  contracts = [],
}: {
  readonly connectedTo: string | null;
  readonly activeContract: Contract | null;
  readonly contracts: readonly Contract[];
}) {
  return (
    <section
      className="hl-panel"
      aria-label="Mapa de red"
      style={{ flex: "1 1 auto" }}
      data-testid="desktop-network-map"
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">MAPA DE RED // TOPOLOGÍA</h2>
        <span className="hl-badge hl-tabular">
          {connectedTo ? `ENLACE: ${connectedTo}` : "LOCAL"}
        </span>
      </div>

      <div className="hl-panel__body">
        <div
          style={{
            padding: "var(--space-sm) var(--space-md)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-strong)",
            backgroundColor: "var(--color-surface-elevated)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <strong style={{ fontFamily: "var(--font-mono)", color: "var(--color-primary)" }}>
              nodo-ws-07 (Tu estación)
            </strong>
            <div
              className="hl-tabular"
              style={{ fontSize: "0.78rem", color: "var(--color-text-secondary)" }}
            >
              IP: 10.20.0.15/24 · GW: 10.20.0.1
            </div>
          </div>
          <span className="hl-badge hl-badge--primary">ACTIVO</span>
        </div>

        {activeContract ? (
          <div
            style={{
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--color-accent)",
              backgroundColor: "rgba(0, 191, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-xs)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
                OBJETIVO // {activeContract.target.hostname}
              </strong>
              <span className="hl-badge hl-badge--accent">
                {connectedTo === activeContract.target.ip ||
                connectedTo === activeContract.target.hostname
                  ? "CONECTADO"
                  : "DETECTADO"}
              </span>
            </div>
            <span
              className="hl-tabular"
              style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}
            >
              IP: {activeContract.target.ip} · Puertos conocidos:{" "}
              {activeContract.target.ports.length}
            </span>
          </div>
        ) : null}

        {contracts.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xs)" }}>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-mono)",
                fontSize: "0.82rem",
                color: "var(--color-text-secondary)",
              }}
            >
              NODOS REGISTRADOS
            </h3>
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className="hl-tabular"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 10px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--color-surface-elevated)",
                  border: "1px solid var(--color-border)",
                  fontSize: "0.78rem",
                }}
              >
                <span>{contract.target.hostname}</span>
                <span style={{ color: "var(--color-text-muted)" }}>{contract.target.ip}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function Desktop({
  player,
  traceLevel,
  connectedTo = null,
  gameClock = "08:00 // TURNO ACTIVO",
  activeContract = null,
  contracts = [],
  terminalWindow,
  inboxWindow,
  statusWindow,
  commandGuideWindow,
  networkMapWindow,
  storyOverlay,
  commandHintOverlay,
  backgroundScene,
  onOpenShop,
  shopModal,
}: DesktopProps) {
  const [sideTab, setSideTab] = useState<SidePanelTab>("status");
  const [mobileWindow, setMobileWindow] = useState<DesktopWindowId>("terminal");

  const openWindow = (target: DesktopWindowId) => {
    if (target === "shop") {
      onOpenShop?.();
      return;
    }
    setMobileWindow(target);
    if (target === "guide") {
      setSideTab("guide");
    } else if (target === "map") {
      setSideTab("map");
    }
  };

  const renderSideContent = () => {
    if (sideTab === "guide" && commandGuideWindow) {
      return commandGuideWindow;
    }
    if (sideTab === "map") {
      return (
        networkMapWindow ?? (
          <DefaultNetworkMap
            connectedTo={connectedTo}
            activeContract={activeContract}
            contracts={contracts}
          />
        )
      );
    }
    return (
      statusWindow ?? (
        <DefaultNetworkMap
          connectedTo={connectedTo}
          activeContract={activeContract}
          contracts={contracts}
        />
      )
    );
  };

  const isMobileSideActive = mobileWindow === "guide" || mobileWindow === "map";

  return (
    <div className="hl-desktop" data-testid="hacklab-desktop">
      {backgroundScene ? <div className="hl-layout__scene">{backgroundScene}</div> : null}

      {/* Pestañas visibles en móvil (<= 720px) */}
      <nav
        className="hl-desktop__mobile-tabs"
        role="tablist"
        aria-label="Pestañas de HackLab OS"
        data-testid="desktop-mobile-tabs"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mobileWindow === "terminal"}
          className={mobileWindow === "terminal" ? "hl-btn hl-btn--primary" : "hl-btn"}
          onClick={() => openWindow("terminal")}
        >
          Terminal
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileWindow === "inbox"}
          className={mobileWindow === "inbox" ? "hl-btn hl-btn--primary" : "hl-btn"}
          onClick={() => openWindow("inbox")}
        >
          Bandeja
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileWindow === "guide"}
          className={mobileWindow === "guide" ? "hl-btn hl-btn--primary" : "hl-btn"}
          onClick={() => openWindow("guide")}
        >
          Guía de comandos
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileWindow === "map"}
          className={mobileWindow === "map" ? "hl-btn hl-btn--primary" : "hl-btn"}
          onClick={() => openWindow("map")}
        >
          Mapa de red
        </button>
        {onOpenShop ? (
          <button type="button" className="hl-btn" onClick={() => openWindow("shop")}>
            Tienda
          </button>
        ) : null}
      </nav>

      {/* Área de ventanas de escritorio */}
      <main className="hl-desktop__workspace" aria-label="Escritorio HackLab OS">
        <div
          className="hl-desktop__window hl-desktop__window--inbox"
          data-mobile-active={mobileWindow === "inbox" ? "true" : "false"}
        >
          {inboxWindow}
        </div>

        <section
          className="hl-desktop__window hl-desktop__window--terminal"
          aria-label="Ventana de terminal"
          data-mobile-active={mobileWindow === "terminal" ? "true" : "false"}
          style={{ gap: "var(--space-sm)" }}
        >
          {storyOverlay}
          <div
            style={{ flex: "1 1 auto", minBlockSize: 0, display: "flex", flexDirection: "column" }}
          >
            {terminalWindow}
          </div>
          {commandHintOverlay}
        </section>

        <div
          className="hl-desktop__window hl-desktop__window--side"
          data-mobile-active={isMobileSideActive ? "true" : "false"}
          style={{ gap: "var(--space-xs)" }}
        >
          <div
            role="tablist"
            aria-label="Herramientas auxiliares"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "var(--space-xs)",
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === "status"}
              className={sideTab === "status" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("status")}
              data-testid="side-tab-status"
            >
              Misión
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === "guide"}
              className={sideTab === "guide" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("guide")}
              data-testid="side-tab-guide"
            >
              Guía de comandos
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sideTab === "map"}
              className={sideTab === "map" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("map")}
              data-testid="side-tab-map"
            >
              Mapa de red
            </button>
          </div>

          <div
            style={{ flex: "1 1 auto", minBlockSize: 0, display: "flex", flexDirection: "column" }}
          >
            {renderSideContent()}
          </div>
        </div>
      </main>

      {/* Barra de tareas inferior de HackLab OS */}
      <footer
        className="hl-taskbar"
        aria-label="Barra de tareas de HackLab OS"
        data-testid="desktop-taskbar"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-sm)",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "var(--color-primary)",
              fontSize: "0.86rem",
            }}
          >
            HACKLAB OS // {player.username}
          </span>
          <ReputationBadge tier={player.reputation} level={player.level} xp={player.xp} />

          <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
            <button
              type="button"
              className="hl-btn"
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => openWindow("terminal")}
            >
              Terminal
            </button>
            <button
              type="button"
              className="hl-btn"
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => openWindow("inbox")}
            >
              Bandeja
            </button>
            <button
              type="button"
              className="hl-btn"
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => openWindow("guide")}
            >
              Guía de comandos
            </button>
            <button
              type="button"
              className="hl-btn"
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => openWindow("map")}
            >
              Mapa de red
            </button>
            {onOpenShop ? (
              <button
                type="button"
                className="hl-btn hl-btn--primary"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                onClick={() => openWindow("shop")}
                data-testid="taskbar-shop-btn"
              >
                Tienda
              </button>
            ) : null}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-md)",
            flexWrap: "wrap",
          }}
        >
          <span
            className="hl-badge hl-tabular"
            style={{ color: "var(--color-credits)", borderColor: "rgba(0, 255, 136, 0.35)" }}
            data-testid="taskbar-credits"
          >
            {player.credits} CR
          </span>
          <TraceBar traceLevel={traceLevel} />
          <span className="hl-badge hl-tabular" data-testid="taskbar-clock">
            {gameClock}
          </span>
        </div>
      </footer>

      {shopModal ? <div className="hl-layout__overlay">{shopModal}</div> : null}
    </div>
  );
}
