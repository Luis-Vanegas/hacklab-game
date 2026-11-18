// Terminal interactiva visual basada en xterm.js.
// Consume los hooks de @/store para armar el prompt dinámico, aplicar el tema según
// dificultad y ejecutar cada línea de comando respetando clearScreen y outputType.

import { useEffect, useRef } from "react";
import { FitAddon } from "@xterm/addon-fit";
import { Terminal as XTerm } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";
import type { CommandResult, GameDifficulty } from "@/lib/types";
import {
  useConnectedTo,
  useCurrentDir,
  useDifficulty,
  usePlayer,
  useRunCommand,
} from "@/store/hooks";
import { getTerminalTheme } from "./themes";

export interface TerminalProps {
  readonly username?: string;
  readonly connectedTo?: string | null;
  readonly currentDir?: string;
  readonly difficulty?: GameDifficulty;
  readonly onRunCommand?: (input: string) => CommandResult;
  readonly welcomeBanner?: readonly string[];
}

const ANSI_RESET = "\x1b[0m";
const ANSI_BOLD_CYAN = "\x1b[1;36m";
const ANSI_BOLD_GREEN = "\x1b[1;32m";

const OUTPUT_COLOR: Record<NonNullable<CommandResult["outputType"]>, string> = {
  info: "\x1b[36m",
  success: "\x1b[32m",
  warning: "\x1b[33m",
  error: "\x1b[31m",
  hint: "\x1b[90m",
};

const DEFAULT_WELCOME: readonly string[] = [
  "HACKLAB OS v2.6 // ENTORNO TÁCTICO DE TERMINAL",
  "Escribe 'help' para ver los comandos o elige un contrato en el Darknet Board.",
];

export function formatPrompt(username: string, host: string, currentDir: string): string {
  return `${ANSI_BOLD_GREEN}${username}@${host}${ANSI_RESET}:${ANSI_BOLD_CYAN}${currentDir}${ANSI_RESET}$ `;
}

export function formatOutputLine(
  line: string,
  outputType: CommandResult["outputType"],
  difficulty: GameDifficulty,
): string {
  if (!outputType || difficulty === "elite" || difficulty === "anonymous") {
    return line;
  }
  const color = OUTPUT_COLOR[outputType];
  return `${color}${line}${ANSI_RESET}`;
}

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
  const storeRunCommand = useRunCommand();

  const username = propUsername ?? storePlayer.username;
  const host = (propConnectedTo !== undefined ? propConnectedTo : storeConnectedTo) ?? "darknet";
  const currentDir = propCurrentDir ?? storeCurrentDir;
  const difficulty = propDifficulty ?? storeDifficulty;
  const runCommand = propOnRunCommand ?? storeRunCommand;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const termRef = useRef<XTerm | null>(null);
  const inputBufferRef = useRef<string>("");
  const localHistoryRef = useRef<string[]>([]);
  const historyIndexRef = useRef<number>(-1);

  // Refs sincronizados en useEffect para que el listener de xterm siempre lea el estado más reciente
  const promptStateRef = useRef({ username, host, currentDir, difficulty, runCommand });
  useEffect(() => {
    promptStateRef.current = { username, host, currentDir, difficulty, runCommand };
  }, [username, host, currentDir, difficulty, runCommand]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    let term: XTerm | null = null;
    try {
      term = new XTerm({
        cursorBlink: true,
        cursorStyle: "block",
        convertEol: true,
        fontFamily: '"Share Tech Mono", "Fira Code", "Consolas", monospace',
        fontSize: 14,
        lineHeight: 1.35,
        theme: getTerminalTheme(promptStateRef.current.difficulty),
      });

      // FitAddon ajusta columnas y filas al tamaño real del panel
      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);
      term.open(container);
      termRef.current = term;

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

      const disposable = term.onData((data) => {
        if (!term) return;

        if (data === "\r") {
          const line = inputBufferRef.current;
          inputBufferRef.current = "";
          historyIndexRef.current = -1;
          term.write("\r\n");

          if (line.trim().length > 0) {
            localHistoryRef.current.push(line);
          }

          const { runCommand: exec, difficulty: diff } = promptStateRef.current;
          const result = exec(line);

          if (result.clearScreen) {
            term.clear();
          } else {
            for (const outLine of result.output) {
              term.writeln(formatOutputLine(outLine, result.outputType, diff));
            }
          }

          // Si el comando cambió cwd o conexión, los hooks/refs o el resultado traen el nuevo estado
          const nextDir =
            result.error === undefined && result.cwd
              ? result.cwd
              : promptStateRef.current.currentDir;
          const nextHost =
            result.error === undefined && result.stateChanges?.connectedTo !== undefined
              ? (result.stateChanges.connectedTo ?? "darknet")
              : promptStateRef.current.host;

          term.write(formatPrompt(promptStateRef.current.username, nextHost, nextDir));
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
          inputBufferRef.current += printable;
          term.write(printable);
        }
      });

      return () => {
        resizeObserver.disconnect();
        disposable.dispose();
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
      termRef.current.options.theme = getTerminalTheme(difficulty);
    }
  }, [difficulty]);

  return (
    <section
      className="hl-panel"
      aria-label="Terminal Console"
      style={{ flex: "1 1 auto", minBlockSize: "340px" }}
      data-testid="terminal-panel"
      data-prompt={`${username}@${host}:${currentDir}$`}
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">
          TERMINAL // {username}@{host}:{currentDir}
        </h2>
        <span className="hl-badge hl-tabular">{difficulty.toUpperCase()}</span>
      </div>
      <div
        ref={containerRef}
        style={{
          flex: "1 1 auto",
          padding: "var(--space-sm)",
          backgroundColor: "var(--color-terminal-bg)",
          minBlockSize: "280px",
          overflow: "clip",
        }}
        data-testid="xterm-container"
      />
    </section>
  );
}
