// Escritorio de HackLab OS (Desktop.tsx).
// Organiza las ventanas del computador del jugador (Terminal, Bandeja con canales Trabajo y Darknet,
// Guía de comandos, Mapa de red y Tienda) con una barra de tareas que muestra hora del juego,
// nivel de rastreo y créditos. En móvil (<= 720px, incluido 375px), las ventanas pasan a pestañas.

import { useState, type ReactNode } from "react";
import type { Contract, PlayerState } from "@/lib/types";
import {
  useCapture,
  useCloseEditor,
  useEditorFile,
  useFindings,
  usePythonStatus,
  useSaveFile,
  useShowFindings,
  type PythonStatus,
} from "@/store";
import { handleTabListKeyDown } from "../a11y/keyboardTabs";
import { useSoundMute } from "../feedback/soundEffects";
import { ReputationBadge } from "../hud/ReputationBadge";
import { TraceBar } from "../hud/TraceBar";
import { AttackView } from "../panels/AttackView";
import { FindingsPanel } from "../panels/FindingsPanel";
import { CodeEditor, type EditorFile } from "./CodeEditor";

export type DesktopWindowId =
  "terminal" | "inbox" | "editor" | "findings" | "guide" | "map" | "shop";

export type SidePanelTab = "status" | "findings" | "editor" | "guide" | "map";

type MobileTabWindow = "terminal" | "inbox" | "editor" | "findings" | "guide" | "map";

const MOBILE_TABS_WITH_FINDINGS: readonly MobileTabWindow[] = [
  "terminal",
  "inbox",
  "editor",
  "findings",
  "guide",
  "map",
];
const MOBILE_TABS_BASE: readonly MobileTabWindow[] = [
  "terminal",
  "inbox",
  "editor",
  "guide",
  "map",
];

const SIDE_TABS_WITH_FINDINGS: readonly SidePanelTab[] = [
  "status",
  "findings",
  "editor",
  "guide",
  "map",
];
const SIDE_TABS_BASE: readonly SidePanelTab[] = ["status", "editor", "guide", "map"];

export interface DesktopProps {
  readonly player: PlayerState;
  readonly traceLevel: number;
  readonly connectedTo?: string | null;
  readonly gameClock?: string;
  readonly activeContract?: Contract | null;
  readonly contracts?: readonly Contract[];
  readonly unreadInboxCount?: number;
  readonly soundMuted?: boolean;
  readonly onToggleSound?: () => void;
  readonly pythonStatus?: PythonStatus;
  readonly showFindings?: boolean;
  readonly findingsCount?: number;
  readonly terminalWindow: ReactNode;
  readonly inboxWindow: ReactNode;
  readonly editorWindow?: ReactNode;
  readonly findingsWindow?: ReactNode;
  readonly statusWindow?: ReactNode;
  readonly commandGuideWindow?: ReactNode;
  readonly networkMapWindow?: ReactNode;
  readonly storyOverlay?: ReactNode;
  readonly commandHintOverlay?: ReactNode;
  readonly backgroundScene?: ReactNode;
  readonly onOpenShop?: () => void;
  readonly shopModal?: ReactNode;
}

export function Desktop({
  player,
  traceLevel,
  gameClock = "08:00 // TURNO ACTIVO",
  unreadInboxCount = 0,
  soundMuted,
  onToggleSound,
  pythonStatus,
  showFindings: propShowFindings,
  findingsCount: propFindingsCount,
  terminalWindow,
  inboxWindow,
  editorWindow,
  findingsWindow,
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
  const { muted: storedMuted, toggleMute: toggleStoredMute } = useSoundMute();
  const isMuted = soundMuted ?? storedMuted;
  const handleToggleSound = onToggleSound ?? toggleStoredMute;

  const storeEditorFile = useEditorFile();
  const storeSaveFile = useSaveFile();
  const storeCloseEditor = useCloseEditor();
  const storePythonStatus = usePythonStatus();
  const storeFindings = useFindings();
  const storeShowFindings = useShowFindings();
  const storeCapture = useCapture();

  const effectivePythonStatus = pythonStatus ?? storePythonStatus;
  const effectiveShowFindings = propShowFindings ?? storeShowFindings;
  const effectiveFindingsCount = propFindingsCount ?? storeFindings.length;
  const capturedPacketsCount = storeCapture?.packets.length ?? 0;

  const mobileTabs = effectiveShowFindings ? MOBILE_TABS_WITH_FINDINGS : MOBILE_TABS_BASE;
  const sideTabs = effectiveShowFindings ? SIDE_TABS_WITH_FINDINGS : SIDE_TABS_BASE;

  const [prevEditorFile, setPrevEditorFile] = useState<EditorFile | null>(storeEditorFile);
  if (storeEditorFile !== prevEditorFile) {
    setPrevEditorFile(storeEditorFile);
    if (storeEditorFile !== null) {
      setSideTab("editor");
      setMobileWindow("editor");
    } else {
      if (sideTab === "editor") {
        setSideTab("status");
      }
      if (mobileWindow === "editor") {
        setMobileWindow("terminal");
      }
    }
  }

  const resolvedSideTab: SidePanelTab =
    !effectiveShowFindings && sideTab === "findings" ? "status" : sideTab;
  const resolvedMobileWindow: DesktopWindowId =
    !effectiveShowFindings && mobileWindow === "findings" ? "terminal" : mobileWindow;

  const selectMobileTab = (target: MobileTabWindow) => {
    setMobileWindow(target);
    if (target === "editor") {
      setSideTab("editor");
    } else if (target === "findings" && effectiveShowFindings) {
      setSideTab("findings");
    } else if (target === "guide") {
      setSideTab("guide");
    } else if (target === "map") {
      setSideTab("map");
    }
  };

  const openWindow = (target: DesktopWindowId) => {
    if (target === "shop") {
      onOpenShop?.();
      return;
    }
    if (target === "findings" && !effectiveShowFindings) {
      return;
    }
    selectMobileTab(target);
    if (target === "terminal" && typeof document !== "undefined") {
      window.requestAnimationFrame(() => {
        const input = document.querySelector<HTMLElement>(
          "#hacklab-terminal-main .xterm-helper-textarea",
        );
        if (input) {
          input.focus();
        } else {
          document.getElementById("hacklab-terminal-main")?.focus();
        }
      });
    } else if (target === "editor" && typeof document !== "undefined") {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[data-testid="editor-textarea"]')?.focus();
      });
    }
  };

  const renderSideContent = () => {
    if (resolvedSideTab === "findings" && effectiveShowFindings) {
      return findingsWindow ?? <FindingsPanel showFindings={effectiveShowFindings} />;
    }
    if (resolvedSideTab === "editor") {
      return (
        editorWindow ?? (
          <CodeEditor file={storeEditorFile} onSave={storeSaveFile} onClose={storeCloseEditor} />
        )
      );
    }
    if (resolvedSideTab === "guide" && commandGuideWindow) {
      return commandGuideWindow;
    }
    if (resolvedSideTab === "map") {
      return networkMapWindow ?? <AttackView />;
    }
    return statusWindow ?? <AttackView />;
  };

  const isMobileSideActive =
    resolvedMobileWindow === "editor" ||
    resolvedMobileWindow === "findings" ||
    resolvedMobileWindow === "guide" ||
    resolvedMobileWindow === "map";
  const activeMobileTab: MobileTabWindow =
    resolvedMobileWindow === "shop" ? "terminal" : resolvedMobileWindow;
  const hasOpenEditorFile = storeEditorFile !== null;

  return (
    <div className="hl-desktop" data-testid="hacklab-desktop">
      <a href="#hacklab-terminal-main" className="hl-skip-link visually-hidden">
        Ir a la terminal
      </a>
      {backgroundScene ? <div className="hl-layout__scene">{backgroundScene}</div> : null}

      {/* Pestañas visibles en móvil (<= 720px) */}
      <nav
        className="hl-desktop__mobile-tabs"
        aria-label="Navegación de ventanas de HackLab OS"
        data-testid="desktop-mobile-tabs"
      >
        <div
          role="tablist"
          aria-label="Pestañas de HackLab OS"
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}
        >
          <button
            type="button"
            role="tab"
            tabIndex={resolvedMobileWindow === "terminal" ? 0 : -1}
            aria-selected={resolvedMobileWindow === "terminal"}
            className={resolvedMobileWindow === "terminal" ? "hl-btn hl-btn--primary" : "hl-btn"}
            onClick={() => selectMobileTab("terminal")}
            onKeyDown={(e) => handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)}
          >
            Terminal
          </button>
          <button
            type="button"
            role="tab"
            tabIndex={resolvedMobileWindow === "inbox" ? 0 : -1}
            aria-selected={resolvedMobileWindow === "inbox"}
            className={resolvedMobileWindow === "inbox" ? "hl-btn hl-btn--primary" : "hl-btn"}
            onClick={() => selectMobileTab("inbox")}
            onKeyDown={(e) => handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)}
          >
            <span>Bandeja</span>
            {unreadInboxCount > 0 ? (
              <>
                <span
                  className="hl-unread-badge hl-tabular"
                  aria-hidden="true"
                  data-testid="mobile-inbox-badge"
                >
                  {unreadInboxCount}
                </span>
                <span className="visually-hidden"> ({unreadInboxCount} correos sin leer)</span>
              </>
            ) : null}
          </button>
          <button
            type="button"
            role="tab"
            tabIndex={resolvedMobileWindow === "editor" ? 0 : -1}
            aria-selected={resolvedMobileWindow === "editor"}
            className={resolvedMobileWindow === "editor" ? "hl-btn hl-btn--primary" : "hl-btn"}
            onClick={() => selectMobileTab("editor")}
            onKeyDown={(e) => handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)}
            data-testid="mobile-tab-editor"
          >
            <span>Editor</span>
            {hasOpenEditorFile ? (
              <>
                <span className="hl-editor-dot" aria-hidden="true" />
                <span className="visually-hidden"> (archivo abierto)</span>
              </>
            ) : null}
          </button>
          {effectiveShowFindings ? (
            <button
              type="button"
              role="tab"
              tabIndex={resolvedMobileWindow === "findings" ? 0 : -1}
              aria-selected={resolvedMobileWindow === "findings"}
              className={resolvedMobileWindow === "findings" ? "hl-btn hl-btn--primary" : "hl-btn"}
              onClick={() => selectMobileTab("findings")}
              onKeyDown={(e) =>
                handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)
              }
              data-testid="mobile-tab-findings"
            >
              <span>Hallazgos</span>
              {effectiveFindingsCount > 0 ? (
                <>
                  <span
                    className="hl-unread-badge hl-unread-badge--warning hl-tabular"
                    aria-hidden="true"
                    data-testid="mobile-findings-badge"
                  >
                    {effectiveFindingsCount}
                  </span>
                  <span className="visually-hidden">
                    {" "}
                    ({effectiveFindingsCount}{" "}
                    {effectiveFindingsCount === 1 ? "hallazgo" : "hallazgos"})
                  </span>
                </>
              ) : null}
            </button>
          ) : null}
          <button
            type="button"
            role="tab"
            tabIndex={resolvedMobileWindow === "guide" ? 0 : -1}
            aria-selected={resolvedMobileWindow === "guide"}
            className={resolvedMobileWindow === "guide" ? "hl-btn hl-btn--primary" : "hl-btn"}
            onClick={() => selectMobileTab("guide")}
            onKeyDown={(e) => handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)}
          >
            Guía de comandos
          </button>
          <button
            type="button"
            role="tab"
            tabIndex={resolvedMobileWindow === "map" ? 0 : -1}
            aria-selected={resolvedMobileWindow === "map"}
            className={resolvedMobileWindow === "map" ? "hl-btn hl-btn--primary" : "hl-btn"}
            onClick={() => selectMobileTab("map")}
            onKeyDown={(e) => handleTabListKeyDown(e, mobileTabs, activeMobileTab, selectMobileTab)}
            data-testid="mobile-tab-map"
          >
            <span>Mapa de red</span>
            {capturedPacketsCount > 0 ? (
              <>
                <span
                  className="hl-unread-badge hl-tabular"
                  aria-hidden="true"
                  data-testid="mobile-map-badge"
                >
                  {capturedPacketsCount}
                </span>
                <span className="visually-hidden">
                  {" "}
                  ({capturedPacketsCount} {capturedPacketsCount === 1 ? "paquete" : "paquetes"})
                </span>
              </>
            ) : null}
          </button>
        </div>
        {onOpenShop ? (
          <button type="button" className="hl-btn" onClick={() => openWindow("shop")}>
            Tienda
          </button>
        ) : null}
      </nav>

      {/* Área de ventanas de escritorio */}
      <main className="hl-desktop__workspace" aria-label="Escritorio HackLab OS">
        <h1 className="visually-hidden">Escritorio de HackLab OS</h1>
        <div
          className="hl-desktop__window hl-desktop__window--inbox"
          data-mobile-active={resolvedMobileWindow === "inbox" ? "true" : "false"}
        >
          {inboxWindow}
        </div>

        <section
          id="hacklab-terminal-main"
          tabIndex={-1}
          className="hl-desktop__window hl-desktop__window--terminal"
          aria-label="Ventana de terminal"
          data-mobile-active={resolvedMobileWindow === "terminal" ? "true" : "false"}
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
              tabIndex={resolvedSideTab === "status" ? 0 : -1}
              aria-selected={resolvedSideTab === "status"}
              className={resolvedSideTab === "status" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("status")}
              onKeyDown={(e) => handleTabListKeyDown(e, sideTabs, resolvedSideTab, setSideTab)}
              data-testid="side-tab-status"
            >
              Misión
            </button>
            {effectiveShowFindings ? (
              <button
                type="button"
                role="tab"
                tabIndex={resolvedSideTab === "findings" ? 0 : -1}
                aria-selected={resolvedSideTab === "findings"}
                className={resolvedSideTab === "findings" ? "hl-btn hl-btn--primary" : "hl-btn"}
                style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
                onClick={() => setSideTab("findings")}
                onKeyDown={(e) => handleTabListKeyDown(e, sideTabs, resolvedSideTab, setSideTab)}
                data-testid="side-tab-findings"
              >
                <span>Hallazgos</span>
                {effectiveFindingsCount > 0 ? (
                  <>
                    <span
                      className="hl-unread-badge hl-unread-badge--warning hl-tabular"
                      aria-hidden="true"
                      data-testid="side-findings-badge"
                    >
                      {effectiveFindingsCount}
                    </span>
                    <span className="visually-hidden">
                      {" "}
                      ({effectiveFindingsCount}{" "}
                      {effectiveFindingsCount === 1 ? "hallazgo" : "hallazgos"})
                    </span>
                  </>
                ) : null}
              </button>
            ) : null}
            <button
              type="button"
              role="tab"
              tabIndex={resolvedSideTab === "editor" ? 0 : -1}
              aria-selected={resolvedSideTab === "editor"}
              className={resolvedSideTab === "editor" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("editor")}
              onKeyDown={(e) => handleTabListKeyDown(e, sideTabs, resolvedSideTab, setSideTab)}
              data-testid="side-tab-editor"
            >
              <span>Editor</span>
              {hasOpenEditorFile ? (
                <>
                  <span className="hl-editor-dot" aria-hidden="true" />
                  <span className="visually-hidden"> (archivo abierto)</span>
                </>
              ) : null}
            </button>
            <button
              type="button"
              role="tab"
              tabIndex={resolvedSideTab === "guide" ? 0 : -1}
              aria-selected={resolvedSideTab === "guide"}
              className={resolvedSideTab === "guide" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("guide")}
              onKeyDown={(e) => handleTabListKeyDown(e, sideTabs, resolvedSideTab, setSideTab)}
              data-testid="side-tab-guide"
            >
              Guía de comandos
            </button>
            <button
              type="button"
              role="tab"
              tabIndex={resolvedSideTab === "map" ? 0 : -1}
              aria-selected={resolvedSideTab === "map"}
              className={resolvedSideTab === "map" ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ flex: "1 1 auto", fontSize: "0.76rem", padding: "4px 8px" }}
              onClick={() => setSideTab("map")}
              onKeyDown={(e) => handleTabListKeyDown(e, sideTabs, resolvedSideTab, setSideTab)}
              data-testid="side-tab-map"
            >
              <span>Mapa de red</span>
              {capturedPacketsCount > 0 ? (
                <>
                  <span
                    className="hl-unread-badge hl-tabular"
                    aria-hidden="true"
                    data-testid="side-map-badge"
                  >
                    {capturedPacketsCount}
                  </span>
                  <span className="visually-hidden">
                    {" "}
                    ({capturedPacketsCount} {capturedPacketsCount === 1 ? "paquete" : "paquetes"})
                  </span>
                </>
              ) : null}
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

          <div className="hl-taskbar__nav">
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
              data-testid="taskbar-inbox-btn"
            >
              <span>Bandeja</span>
              {unreadInboxCount > 0 ? (
                <>
                  <span
                    className="hl-unread-badge hl-tabular"
                    aria-hidden="true"
                    data-testid="taskbar-inbox-badge"
                  >
                    {unreadInboxCount}
                  </span>
                  <span className="visually-hidden"> ({unreadInboxCount} correos sin leer)</span>
                </>
              ) : null}
            </button>
            {effectiveShowFindings ? (
              <button
                type="button"
                className="hl-btn"
                style={{ fontSize: "0.78rem", padding: "4px 10px" }}
                onClick={() => openWindow("findings")}
                data-testid="taskbar-findings-btn"
              >
                <span>Hallazgos</span>
                {effectiveFindingsCount > 0 ? (
                  <>
                    <span
                      className="hl-unread-badge hl-unread-badge--warning hl-tabular"
                      aria-hidden="true"
                      data-testid="taskbar-findings-badge"
                    >
                      {effectiveFindingsCount}
                    </span>
                    <span className="visually-hidden">
                      {" "}
                      ({effectiveFindingsCount}{" "}
                      {effectiveFindingsCount === 1 ? "hallazgo" : "hallazgos"})
                    </span>
                  </>
                ) : null}
              </button>
            ) : null}
            <button
              type="button"
              className={hasOpenEditorFile ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
              onClick={() => openWindow("editor")}
              data-testid="taskbar-editor-btn"
            >
              <span>Editor</span>
              {hasOpenEditorFile ? (
                <>
                  <span className="hl-editor-dot" aria-hidden="true" />
                  <span className="visually-hidden"> (archivo abierto)</span>
                </>
              ) : null}
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
              data-testid="taskbar-map-btn"
            >
              <span>Mapa de red</span>
              {capturedPacketsCount > 0 ? (
                <>
                  <span
                    className="hl-unread-badge hl-tabular"
                    aria-hidden="true"
                    data-testid="taskbar-map-badge"
                  >
                    {capturedPacketsCount}
                  </span>
                  <span className="visually-hidden">
                    {" "}
                    ({capturedPacketsCount} {capturedPacketsCount === 1 ? "paquete" : "paquetes"})
                  </span>
                </>
              ) : null}
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
          {effectivePythonStatus === "loading" || effectivePythonStatus === "running" ? (
            <div
              className="hl-badge hl-badge--accent hl-python-status"
              role="status"
              aria-live="polite"
              data-testid="taskbar-python-status"
              data-python-status={effectivePythonStatus}
            >
              <progress
                className="hl-python-spinner"
                aria-label={
                  effectivePythonStatus === "loading"
                    ? "Cargando el intérprete de Python…"
                    : "Ejecutando script de Python…"
                }
              />
              <span>
                {effectivePythonStatus === "loading"
                  ? "Cargando el intérprete de Python…"
                  : "Ejecutando Python…"}
              </span>
            </div>
          ) : null}
          <span
            className="hl-badge hl-tabular"
            style={{ color: "var(--color-credits)", borderColor: "rgba(0, 255, 136, 0.35)" }}
            data-testid="taskbar-credits"
          >
            {player.credits} CR
          </span>
          <TraceBar traceLevel={traceLevel} />
          <button
            type="button"
            className="hl-btn"
            style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            aria-pressed={isMuted}
            aria-label={
              isMuted
                ? "Silencio: activar efectos de sonido"
                : "Sonido: silenciar efectos de sonido"
            }
            onClick={handleToggleSound}
            data-testid="taskbar-mute-btn"
          >
            {isMuted ? "Silencio" : "Sonido"}
          </button>
          <span className="hl-badge hl-tabular" data-testid="taskbar-clock">
            {gameClock}
          </span>
        </div>
      </footer>

      {shopModal ? <div className="hl-layout__overlay">{shopModal}</div> : null}
    </div>
  );
}
