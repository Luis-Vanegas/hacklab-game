// Terminal interactiva visual basada en xterm.js.
// Consume los hooks de @/store para armar el prompt dinámico, aplicar el tema según
// dificultad, pintar la salida con colores de Linux y explicar los hallazgos al pasar el mouse.

import { useEffect, useRef, useState } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { CommandResult, GameDifficulty } from "@/lib/types";
import { LOCAL_HOST } from "@/store";
import {
  useConnectedTo,
  useCurrentDir,
  useDifficulty,
  usePlayer,
  useRunCommandAsync,
  useShowFindings,
} from "@/store/hooks";
import { playSound } from "@/ui/feedback/soundEffects";
import { findingRanges, formatOutputLine, formatPrompt } from "./format";
import { getTerminalTheme } from "./themes";

export interface TerminalProps {
  readonly username?: string;
  readonly connectedTo?: string | null;
  readonly currentDir?: string;
  readonly difficulty?: GameDifficulty;
  readonly onRunCommand?: (
    input: string,
    onNotice?: (message: string) => void,
  ) => CommandResult | Promise<CommandResult>;
  readonly welcomeBanner?: readonly string[];
}

export const TERMINAL_DRAFT_EVENT = "hacklab:terminal-draft";

// Escribe un comando de ejemplo en la línea de entrada de la terminal sin ejecutarlo (botón "Probar" de la guía)
export function injectTerminalDraft(commandText: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(TERMINAL_DRAFT_EVENT, { detail: commandText }));
}

const DIFFICULTY_LABELS: Record<GameDifficulty, string> = {
  beginner: "PRINCIPIANTE",
  normal: "NORMAL",
  elite: "ÉLITE",
  anonymous: "ANÓNIMO",
};

const DEFAULT_WELCOME: readonly string[] = [
  `NODO SEGURO // ESTACIÓN ${LOCAL_HOST} // HACKLAB OS v2.6`,
  "Escribe 'help' para ver los comandos o abre la Bandeja para ver tus tickets.",
];

export function Terminal({
  username: propUsername,
  connectedTo: propConnectedTo,
  currentDir: propCurrentDir,
  difficulty: propDifficulty,
  onRunCommand: propOnRunCommand,
  welcomeBanner = DEFAULT_WELCOME,
}: TerminalProps = {}) {
  const storePlayer = usePlayer();
  const storeConnectedTo = useConnectedTo();
  const storeCurrentDir = useCurrentDir();
  const storeDifficulty = useDifficulty();
  const storeRunCommand = useRunCommandAsync();

  const username = propUsername ?? storePlayer.username;
  const host = (propConnectedTo !== undefined ? propConnectedTo : storeConnectedTo) ?? LOCAL_HOST;
  const currentDir = propCurrentDir ?? storeCurrentDir;
  const difficulty = propDifficulty ?? storeDifficulty;
  const runCommand = propOnRunCommand ?? storeRunCommand;
  const showFindings = useShowFindings();
  // Explicación del hallazgo bajo el mouse; posición relativa al panel
  const [tip, setTip] = useState<{ note: string; x: number; y: number } | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XTerm | null>(null);
  const inputBufferRef = useRef<string>("");
  const localHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);
  // Mientras corre un script de Python la terminal no acepta otra línea
  const busyRef = useRef(false);

  // Refs sincronizados en useEffect para que el listener de xterm siempre lea el estado más reciente
  const promptStateRef = useRef({
    username,
    host,
    currentDir,
    difficulty,
    runCommand,
    showFindings,
  });
  useEffect(() => {
    promptStateRef.current = { username, host, currentDir, difficulty, runCommand, showFindings };
  }, [username, host, currentDir, difficulty, runCommand, showFindings]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let term: XTerm | null = null;
    try {
      term = new XTerm({
        allowTransparency: true,
        cursorBlink: true,
        cursorStyle: "block",
        convertEol: true,
        fontFamily: '"Share Tech Mono", "Fira Code", "Consolas", monospace',
        fontSize: 14,
        lineHeight: 1.35,
        theme: {
          ...getTerminalTheme(promptStateRef.current.difficulty),
          background: "rgba(0, 0, 0, 0)",
        },
      });

      // FitAddon ajusta columnas y filas al tamaño real del panel
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container);
      term.textarea?.setAttribute("aria-label", "Entrada de comandos de la terminal");
      termRef.current = term;

      // Hallazgos ya escritos en pantalla y su explicación, para el recuadro al pasar el mouse
      const notes = new Map<string, string>();
      const linkProvider = term.registerLinkProvider({
        provideLinks(y, callback) {
          const text = term?.buffer.active.getLine(y - 1)?.translateToString(true) ?? "";
          if (!promptStateRef.current.showFindings || notes.size === 0) return callback(undefined);
          const ranges = findingRanges(text, [...notes.keys()]);
          callback(
            ranges.map((r) => ({
              range: { start: { x: r.start, y }, end: { x: r.end, y } },
              text: r.text,
              decorations: { pointerCursor: false, underline: false },
              activate: () => undefined,
              hover: (event: MouseEvent) => {
                const box = panelRef.current?.getBoundingClientRect();
                const note = notes.get(r.text);
                if (box && note)
                  setTip({ note, x: event.clientX - box.left, y: event.clientY - box.top });
              },
              leave: () => setTip(null),
            })),
          );
        },
      });

      const writeCurrentPrompt = () => {
        const { username: u, host: h, currentDir: dir } = promptStateRef.current;
        term?.write(formatPrompt(u, h, dir));
      };

      const replaceInputLine = (nextInput: string) => {
        if (!term) return;
        const prevLen = inputBufferRef.current.length;
        if (prevLen > 0) {
          term.write("\b \b".repeat(prevLen));
        }
        inputBufferRef.current = nextInput;
        if (nextInput.length > 0) {
          term.write(nextInput);
        }
      };

      // El saludo se escribe tras el primer ajuste real de tamaño: si se escribe antes,
      // el panel aún no tiene ancho y el prompt queda partido en varias líneas
      let greeted = false;
      const resizeObserver = new ResizeObserver(() => {
        fitAddon.fit();
        if (greeted || !term) return;
        greeted = true;
        for (const bannerLine of welcomeBanner) term.writeln(bannerLine);
        writeCurrentPrompt();
      });
      resizeObserver.observe(container);

      const onDraftEvent = (event: Event) => {
        const custom = event as CustomEvent<string>;
        if (typeof custom.detail === "string") {
          replaceInputLine(custom.detail);
          term?.focus();
        }
      };
      window.addEventListener(TERMINAL_DRAFT_EVENT, onDraftEvent);

      // Escribe la salida y el prompt siguiente; lo usan los comandos síncronos y los de Python
      const showResult = (t: XTerm, result: CommandResult) => {
        const marks = promptStateRef.current.showFindings;
        if (result.clearScreen) {
          t.clear();
        } else {
          for (const outLine of result.output) {
            t.writeln(formatOutputLine(outLine, result.outputType, result.highlights ?? [], marks));
          }
        }
        for (const h of result.highlights ?? []) {
          if (marks && h.kind === "finding" && h.note) notes.set(h.text, h.note);
        }

        // Si el comando cambió cwd o conexión, los hooks/refs o el resultado traen el nuevo estado
        const nextDir =
          result.error === undefined && result.cwd ? result.cwd : promptStateRef.current.currentDir;
        const nextHost =
          result.error === undefined && result.stateChanges?.connectedTo !== undefined
            ? (result.stateChanges.connectedTo ?? LOCAL_HOST)
            : promptStateRef.current.host;

        t.write(formatPrompt(promptStateRef.current.username, nextHost, nextDir));
      };

      const disposable = term.onData((data) => {
        if (!term || busyRef.current) return;

        if (data === "\r") {
          playSound("key");
          const line = inputBufferRef.current;
          inputBufferRef.current = "";
          historyIndexRef.current = -1;
          term.write("\r\n");

          if (line.trim().length > 0) {
            localHistoryRef.current.push(line);
          }

          const { runCommand: exec } = promptStateRef.current;
          const pending = exec(line, (notice) =>
            term?.writeln(formatOutputLine(notice, "info", [], false)),
          );
          if (pending instanceof Promise) {
            busyRef.current = true;
            void pending
              .then((result) => {
                if (term) showResult(term, result);
              })
              .finally(() => {
                busyRef.current = false;
              });
          } else {
            showResult(term, pending);
          }
          return;
        }

        // Ctrl+C cancela la línea actual
        if (data === "\u0003") {
          inputBufferRef.current = "";
          historyIndexRef.current = -1;
          term.write("^C\r\n");
          writeCurrentPrompt();
          return;
        }

        // Ctrl+L limpia la vista manteniendo el prompt
        if (data === "\u000c") {
          inputBufferRef.current = "";
          term.clear();
          writeCurrentPrompt();
          return;
        }

        // Backspace
        if (data === "\u007f" || data === "\b") {
          if (inputBufferRef.current.length > 0) {
            playSound("key");
            inputBufferRef.current = inputBufferRef.current.slice(0, -1);
            term.write("\b \b");
          }
          return;
        }

        // Flecha arriba: historial anterior
        if (data === "\x1b[A") {
          const history = localHistoryRef.current;
          if (history.length === 0) return;
          const nextIdx =
            historyIndexRef.current === -1
              ? history.length - 1
              : Math.max(0, historyIndexRef.current - 1);
          historyIndexRef.current = nextIdx;
          replaceInputLine(history[nextIdx] ?? "");
          return;
        }

        // Flecha abajo: historial siguiente
        if (data === "\x1b[B") {
          const history = localHistoryRef.current;
          if (historyIndexRef.current === -1) return;
          const nextIdx = historyIndexRef.current + 1;
          if (nextIdx >= history.length) {
            historyIndexRef.current = -1;
            replaceInputLine("");
          } else {
            historyIndexRef.current = nextIdx;
            replaceInputLine(history[nextIdx] ?? "");
          }
          return;
        }

        // Ignorar otras secuencias de escape no imprimibles
        if (data.startsWith("\x1b")) {
          return;
        }

        // Caracteres imprimibles (incluyendo pegado de texto en una sola línea)
        const printable = data.replace(/[\r\n]+/g, "");
        if (printable.length > 0) {
          playSound("key");
          inputBufferRef.current += printable;
          term.write(printable);
        }
      });

      return () => {
        window.removeEventListener(TERMINAL_DRAFT_EVENT, onDraftEvent);
        resizeObserver.disconnect();
        disposable.dispose();
        linkProvider.dispose();
        term?.dispose();
        termRef.current = null;
      };
    } catch {
      // En entornos sin canvas/layout completo (ej. pruebas unitarias JSDOM),
      // se degrada limpiamente manteniendo el contenedor accesible.
      termRef.current = null;
      return undefined;
    }
  }, [welcomeBanner]);

  // Actualiza el tema en caliente cuando cambia la dificultad
  useEffect(() => {
    if (termRef.current) {
      termRef.current.options.theme = {
        ...getTerminalTheme(difficulty),
        background: "rgba(0, 0, 0, 0)",
      };
    }
  }, [difficulty]);

  return (
    <section
      ref={panelRef}
      className="hl-panel hl-panel--terminal"
      aria-label="Consola de terminal"
      style={{ flex: "1 1 auto", minBlockSize: "260px", position: "relative" }}
      data-testid="terminal-panel"
      data-prompt={`${username}@${host}:${currentDir}$`}
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">
          TERMINAL // {username}@{host}:{currentDir}
        </h2>
        <span className="hl-badge hl-tabular">{DIFFICULTY_LABELS[difficulty]}</span>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: "1 1 auto",
          padding: "var(--space-sm)",
          backgroundColor: "transparent",
          minBlockSize: "200px",
          overflow: "clip",
        }}
        data-testid="xterm-container"
      />
      {tip ? (
        <div
          role="tooltip"
          className="hl-finding-tip"
          style={{ left: tip.x + 12, top: tip.y + 16 }}
          data-testid="finding-tip"
        >
          {tip.note}
        </div>
      ) : null}
    </section>
  );
}
