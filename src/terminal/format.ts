// Formato ANSI de la terminal: prompt, color por tipo de salida y marcas (S2/S3).
// Funciones puras para probarlas sin xterm; Terminal.tsx solo las escribe.

import type { CommandResult, Highlight } from "@/lib/types";

const RESET = "\x1b[0m";
const BOLD_GREEN = "\x1b[1;32m";
const BOLD_BLUE = "\x1b[1;34m";

const OUTPUT_COLOR: Record<NonNullable<CommandResult["outputType"]>, string> = {
  info: "\x1b[36m",
  success: "\x1b[32m",
  warning: "\x1b[33m",
  error: "\x1b[31m",
  hint: "\x1b[90m",
};

// Como `ls --color` de Linux: carpetas azules y ejecutables verdes. El hallazgo usa
// amarillo subrayado, un estilo que la terminal no usa para nada más.
const HIGHLIGHT_STYLE: Record<Highlight["kind"], string> = {
  dir: BOLD_BLUE,
  exec: BOLD_GREEN,
  finding: "\x1b[4;33m",
};

export function formatPrompt(username: string, host: string, currentDir: string): string {
  return `${BOLD_GREEN}${username}@${host}${RESET}:${BOLD_BLUE}${currentDir}${RESET}$ `;
}

const escapeRegExp = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Solo apariciones completas: "ftp" no se marca dentro de "sftp" ni de "ftp-data"
function wholeWords(texts: readonly string[]): RegExp {
  const alternatives = [...texts].sort((a, b) => b.length - a.length).map(escapeRegExp);
  return new RegExp(`(?<![\\w.-])(?:${alternatives.join("|")})(?![\\w-])`, "g");
}

export function formatOutputLine(
  line: string,
  outputType: CommandResult["outputType"],
  highlights: readonly Highlight[],
  showFindings: boolean,
): string {
  if (outputType) return `${OUTPUT_COLOR[outputType]}${line}${RESET}`;

  const kinds = new Map<string, Highlight["kind"]>();
  for (const h of highlights) {
    if (h.text && (h.kind !== "finding" || showFindings)) kinds.set(h.text, h.kind);
  }
  if (kinds.size === 0) return line;
  return line.replace(wholeWords([...kinds.keys()]), (match) => {
    const kind = kinds.get(match);
    return kind ? `${HIGHLIGHT_STYLE[kind]}${match}${RESET}` : match;
  });
}

// Dónde está cada hallazgo en una línea del buffer, para el recuadro al pasar el mouse
export function findingRanges(
  line: string,
  texts: readonly string[],
): { text: string; start: number; end: number }[] {
  if (texts.length === 0) return [];
  return [...line.matchAll(wholeWords(texts))].map((m) => ({
    text: m[0],
    start: m.index + 1,
    end: m.index + m[0].length,
  }));
}
