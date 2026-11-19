import { describe, expect, it } from "vitest";
import { findingRanges, formatOutputLine, formatPrompt } from "@/terminal/format";

const RESET = "\x1b[0m";
const BLUE = "\x1b[1;34m";
const GREEN = "\x1b[1;32m";
const FINDING = "\x1b[4;33m";

describe("prompt de Linux (S2)", () => {
  it("usuario@host en verde, ruta en azul y $ sin color", () => {
    expect(formatPrompt("luis", "nodo-ws-07", "~")).toBe(
      `${GREEN}luis@nodo-ws-07${RESET}:${BLUE}~${RESET}$ `,
    );
  });
});

describe("salida de comandos (S2)", () => {
  it("sin outputType ni marcas la línea sale tal cual (color normal del tema)", () => {
    expect(formatOutputLine("hola", undefined, [], true)).toBe("hola");
  });

  it("un error sale en rojo", () => {
    expect(formatOutputLine("no existe", "error", [], true)).toBe(`\x1b[31mno existe${RESET}`);
  });

  it("pinta carpetas en azul y ejecutables en verde, sin tocar palabras parecidas", () => {
    const line = formatOutputLine(
      "docs/  run.sh  rundocs/",
      undefined,
      [
        { text: "docs/", kind: "dir" },
        { text: "run.sh", kind: "exec" },
      ],
      false,
    );
    expect(line).toBe(`${BLUE}docs/${RESET}  ${GREEN}run.sh${RESET}  rundocs/`);
  });
});

describe("hallazgos para principiantes (S3/S4)", () => {
  const ftp = { text: "ftp", kind: "finding", note: "FTP envía la clave sin cifrar." } as const;

  it("marca el hallazgo en amarillo subrayado mientras se muestran pistas", () => {
    expect(formatOutputLine("21/tcp open ftp", undefined, [ftp], true)).toBe(
      `21/tcp open ${FINDING}ftp${RESET}`,
    );
  });

  it("sin pistas el hallazgo no se marca, pero carpetas y ejecutables sí", () => {
    expect(formatOutputLine("21/tcp open ftp", undefined, [ftp], false)).toBe("21/tcp open ftp");
  });

  it("no marca el texto dentro de otra palabra (sftp)", () => {
    expect(formatOutputLine("22/tcp open sftp", undefined, [ftp], true)).toBe("22/tcp open sftp");
  });

  it("findingRanges ubica cada aparición en la línea (columnas desde 1)", () => {
    expect(findingRanges("ftp y ftp, no sftp", ["ftp"])).toEqual([
      { text: "ftp", start: 1, end: 3 },
      { text: "ftp", start: 7, end: 9 },
    ]);
  });
});
