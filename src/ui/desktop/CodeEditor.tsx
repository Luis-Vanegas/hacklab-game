// Editor de código integrado en el escritorio de HackLab OS (CodeEditor.tsx).
// Sin librerías externas: utiliza un <textarea> con estilo de terminal, números de línea
// sincronizados, tabulación de 4 espacios, guardado con Ctrl+S y salida de teclado con Esc.

import { useEffect, useId, useRef, useState, type KeyboardEvent, type UIEvent } from "react";
import type { CommandResult } from "@/lib/types";
import { useCloseEditor, useEditorFile, useSaveFile } from "@/store";

export interface EditorFile {
  readonly path: string;
  readonly content: string;
}

export interface CodeEditorProps {
  readonly file?: EditorFile | null;
  readonly onSave?: (path: string, content: string) => CommandResult;
  readonly onClose?: () => void;
}

interface EditorStatusMessage {
  readonly kind: "success" | "error";
  readonly text: string;
}

const INDENT = "    ";

function computeCursorPosition(
  text: string,
  selectionStart: number,
): { line: number; col: number } {
  const before = text.slice(0, Math.max(0, selectionStart));
  const lines = before.split("\n");
  const line = lines.length;
  const col = (lines[lines.length - 1]?.length ?? 0) + 1;
  return { line, col };
}

function getFileName(filePath: string): string {
  const slashIndex = filePath.lastIndexOf("/");
  return slashIndex >= 0 ? filePath.slice(slashIndex + 1) : filePath;
}

export function CodeEditor({
  file: propFile,
  onSave: propOnSave,
  onClose: propOnClose,
}: CodeEditorProps = {}) {
  const storeFile = useEditorFile();
  const storeSaveFile = useSaveFile();
  const storeCloseEditor = useCloseEditor();

  const file = propFile !== undefined ? propFile : storeFile;
  const saveFile = propOnSave ?? storeSaveFile;
  const closeEditor = propOnClose ?? storeCloseEditor;

  const [prevFile, setPrevFile] = useState<EditorFile | null>(file);
  const [draft, setDraft] = useState<string>(file?.content ?? "");
  const [statusMessage, setStatusMessage] = useState<EditorStatusMessage | null>(null);
  const [cursor, setCursor] = useState<{ line: number; col: number }>({ line: 1, col: 1 });

  // Ajusta el borrador cuando cambia el archivo abierto desde el store o props
  if (file !== prevFile) {
    setPrevFile(file);
    if (file === null) {
      setDraft("");
      setStatusMessage(null);
      setCursor({ line: 1, col: 1 });
    } else if (prevFile?.path !== file.path) {
      setDraft(file.content);
      setStatusMessage(null);
      setCursor({ line: 1, col: 1 });
    } else if (prevFile.content !== file.content) {
      setDraft(file.content);
    }
  }

  const textareaId = useId();
  const hintId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const gutterRef = useRef<HTMLDivElement | null>(null);
  const saveBtnRef = useRef<HTMLButtonElement | null>(null);

  const openPath = file?.path ?? null;

  useEffect(() => {
    if (openPath !== null) {
      textareaRef.current?.focus();
    }
  }, [openPath]);

  const handleSave = () => {
    if (!file) {
      return;
    }
    const result = saveFile(file.path, draft);
    if (result.error) {
      setStatusMessage({ kind: "error", text: result.error });
    } else {
      const message = result.output[0] ?? `Guardado: ${file.path}`;
      setStatusMessage({ kind: "success", text: message });
    }
  };

  const syncCursor = (target: HTMLTextAreaElement) => {
    setCursor(computeCursorPosition(target.value, target.selectionStart));
  };

  const handleScroll = (event: UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = event.currentTarget.scrollTop;
    }
  };

  const applySelectionAfterUpdate = (nextStart: number, nextEnd: number, nextValue: string) => {
    setDraft(nextValue);
    setCursor(computeCursorPosition(nextValue, nextStart));
    window.requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.setSelectionRange(nextStart, nextEnd);
    });
  };

  const handleTextareaKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleSave();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      saveBtnRef.current?.focus();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    const textarea = event.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (event.shiftKey) {
      const effectiveLineStart = start === 0 ? 0 : draft.lastIndexOf("\n", start - 1) + 1;
      const rawLineEnd = draft.indexOf("\n", end);
      const effectiveLineEnd = rawLineEnd === -1 ? draft.length : rawLineEnd;
      const selectedBlock = draft.slice(effectiveLineStart, effectiveLineEnd);
      const lines = selectedBlock.split("\n");

      let firstRemoved = 0;
      let totalRemoved = 0;
      const unindented = lines.map((line, index) => {
        const match = /^(?: {1,4}|\t)/.exec(line);
        const removed = match ? match[0].length : 0;
        if (index === 0) {
          firstRemoved = removed;
        }
        totalRemoved += removed;
        return removed > 0 ? line.slice(removed) : line;
      });

      if (totalRemoved === 0) {
        return;
      }

      const nextValue =
        draft.slice(0, effectiveLineStart) + unindented.join("\n") + draft.slice(effectiveLineEnd);
      const nextStart = Math.max(effectiveLineStart, start - firstRemoved);
      const nextEnd = Math.max(nextStart, end - totalRemoved);
      applySelectionAfterUpdate(nextStart, nextEnd, nextValue);
      return;
    }

    const selection = draft.slice(start, end);
    if (start !== end && selection.includes("\n")) {
      const lineStart = start === 0 ? 0 : draft.lastIndexOf("\n", start - 1) + 1;
      const block = draft.slice(lineStart, end);
      const blockLines = block.split("\n");
      const indented = blockLines.map((line) => `${INDENT}${line}`).join("\n");
      const nextValue = draft.slice(0, lineStart) + indented + draft.slice(end);
      const nextStart = start + INDENT.length;
      const nextEnd = end + blockLines.length * INDENT.length;
      applySelectionAfterUpdate(nextStart, nextEnd, nextValue);
      return;
    }

    const nextValue = draft.slice(0, start) + INDENT + draft.slice(end);
    const nextPos = start + INDENT.length;
    applySelectionAfterUpdate(nextPos, nextPos, nextValue);
  };

  const handleSectionKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.nativeEvent.isComposing) {
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      handleSave();
    }
  };

  if (!file) {
    return (
      <section
        className="hl-panel"
        aria-label="Editor de código"
        style={{ flex: "1 1 auto" }}
        data-testid="code-editor"
      >
        <div className="hl-panel__header">
          <h2 className="hl-panel__title">EDITOR DE CÓDIGO</h2>
          <span className="hl-badge">SIN ARCHIVO</span>
        </div>

        <div className="hl-panel__body">
          <p style={{ margin: 0, fontSize: "0.88rem", color: "var(--color-text-secondary)" }}>
            No hay ningún archivo abierto en el editor.
          </p>
          <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--color-text-muted)" }}>
            Usa el comando{" "}
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
              edit ~/scripts/escaner_puertos.py
            </code>{" "}
            en la terminal para abrir o crear un archivo dentro de tu carpeta personal.
          </p>
        </div>
      </section>
    );
  }

  const isDirty = draft !== file.content;
  const lineCount = Math.max(1, draft.split("\n").length);
  const fileName = getFileName(file.path);

  return (
    <section
      className="hl-panel hl-editor"
      aria-label={`Editor de código: ${fileName}`}
      onKeyDown={handleSectionKeyDown}
      data-testid="code-editor"
      data-file-path={file.path}
    >
      <div className="hl-panel__header hl-editor__header">
        <div className="hl-editor__title-group">
          <h2 className="hl-panel__title" title={file.path}>
            EDITOR // {fileName}
          </h2>
          <span
            className={isDirty ? "hl-badge hl-badge--warning" : "hl-badge hl-badge--primary"}
            data-testid="editor-dirty-badge"
          >
            {isDirty ? "SIN GUARDAR" : "GUARDADO"}
          </span>
        </div>

        <div className="hl-editor__actions">
          <button
            ref={saveBtnRef}
            type="button"
            className="hl-btn hl-btn--primary"
            style={{ fontSize: "0.76rem", padding: "4px 10px" }}
            aria-label={`Guardar archivo ${fileName} (Ctrl+S)`}
            onClick={handleSave}
            data-testid="editor-save-btn"
          >
            Guardar
          </button>
          <button
            type="button"
            className="hl-btn"
            style={{ fontSize: "0.76rem", padding: "4px 10px" }}
            aria-label={`Cerrar editor de ${fileName}`}
            onClick={closeEditor}
            data-testid="editor-close-btn"
          >
            Cerrar
          </button>
        </div>
      </div>

      <div className="hl-editor__path-bar hl-tabular" data-testid="editor-file-path">
        <span>{file.path}</span>
        <span>
          Ln {cursor.line}, Col {cursor.col}
        </span>
      </div>

      <div className="hl-editor__surface">
        <div
          ref={gutterRef}
          className="hl-editor__gutter hl-tabular"
          aria-hidden="true"
          data-testid="editor-line-numbers"
        >
          {Array.from({ length: lineCount }, (_, index) => (
            <div key={index + 1} className="hl-editor__line-number">
              {index + 1}
            </div>
          ))}
        </div>

        <label htmlFor={textareaId} className="visually-hidden">
          Contenido del archivo {file.path}
        </label>
        <textarea
          ref={textareaRef}
          id={textareaId}
          className="hl-editor__textarea"
          value={draft}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          aria-describedby={hintId}
          onChange={(event) => {
            setDraft(event.target.value);
            syncCursor(event.target);
            if (statusMessage) {
              setStatusMessage(null);
            }
          }}
          onKeyDown={handleTextareaKeyDown}
          onScroll={handleScroll}
          onClick={(event) => syncCursor(event.currentTarget)}
          onKeyUp={(event) => syncCursor(event.currentTarget)}
          data-testid="editor-textarea"
        />
      </div>

      <div className="hl-editor__footer">
        <span id={hintId} className="hl-editor__hint">
          Tab: 4 espacios · Ctrl+S: guardar · Esc: salir del campo
        </span>

        {statusMessage ? (
          <span
            role={statusMessage.kind === "error" ? "alert" : "status"}
            aria-live={statusMessage.kind === "error" ? "assertive" : "polite"}
            className={
              statusMessage.kind === "error"
                ? "hl-badge hl-badge--danger"
                : "hl-badge hl-badge--primary"
            }
            data-testid="editor-status-msg"
          >
            {statusMessage.text}
          </span>
        ) : null}
      </div>
    </section>
  );
}
