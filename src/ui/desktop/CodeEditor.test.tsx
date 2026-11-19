import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlayerState } from "@/lib/types";
import { CodeEditor } from "./CodeEditor";
import { Desktop } from "./Desktop";

const TEST_PLAYER: PlayerState = {
  username: "operador",
  credits: 250,
  xp: 120,
  level: 2,
  reputation: "script_kiddie",
};

describe("CodeEditor", () => {
  afterEach(cleanup);

  it("muestra estado vacío cuando no hay archivo abierto", () => {
    render(<CodeEditor file={null} />);
    expect(screen.getByTestId("code-editor")).toBeInTheDocument();
    expect(screen.getByText(/No hay ningún archivo abierto/i)).toBeInTheDocument();
  });

  it("muestra números de línea sincronizados, inserta 4 espacios con Tab y desindenta con Shift+Tab", () => {
    render(
      <CodeEditor
        file={{ path: "/home/user/scripts/hola.py", content: "print('hola')\nprint('mundo')" }}
        onSave={() => ({ output: ["Guardado"], outputType: "success" })}
        onClose={vi.fn()}
      />,
    );

    const lineNumbers = screen.getByTestId("editor-line-numbers");
    expect(lineNumbers.querySelectorAll(".hl-editor__line-number")).toHaveLength(2);

    const textarea = screen.getByTestId("editor-textarea") as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 0);
    fireEvent.keyDown(textarea, { key: "Tab" });

    expect(textarea.value).toBe("    print('hola')\nprint('mundo')");
    expect(screen.getByTestId("editor-dirty-badge")).toHaveTextContent("SIN GUARDAR");

    textarea.setSelectionRange(0, 0);
    fireEvent.keyDown(textarea, { key: "Tab", shiftKey: true });

    expect(textarea.value).toBe("print('hola')\nprint('mundo')");
  });

  it("guarda con Ctrl+S usando onSave y muestra el resultado", () => {
    const onSave = vi.fn(() => ({
      output: ["Guardado: /home/user/scripts/test.py"],
      outputType: "success" as const,
    }));

    render(
      <CodeEditor
        file={{ path: "/home/user/scripts/test.py", content: "x = 1" }}
        onSave={onSave}
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByTestId("editor-textarea") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "x = 2" } });
    fireEvent.keyDown(textarea, { key: "s", ctrlKey: true });

    expect(onSave).toHaveBeenCalledWith("/home/user/scripts/test.py", "x = 2");
    expect(screen.getByTestId("editor-status-msg")).toHaveTextContent(
      "Guardado: /home/user/scripts/test.py",
    );
  });

  it("permite salir del textarea con Escape hacia el botón Guardar para evitar trampas de foco", () => {
    render(
      <CodeEditor
        file={{ path: "/home/user/scripts/test.py", content: "x = 1" }}
        onSave={() => ({ output: ["Guardado"], outputType: "success" })}
        onClose={vi.fn()}
      />,
    );

    const textarea = screen.getByTestId("editor-textarea");
    textarea.focus();
    fireEvent.keyDown(textarea, { key: "Escape" });

    expect(document.activeElement).toBe(screen.getByTestId("editor-save-btn"));
  });
});

describe("Desktop — indicador de Python y ventana Editor", () => {
  afterEach(cleanup);

  it("muestra el indicador de carga de Python en la barra de tareas cuando pythonStatus es loading", () => {
    render(
      <Desktop
        player={TEST_PLAYER}
        traceLevel={0}
        pythonStatus="loading"
        terminalWindow={<div>Terminal</div>}
        inboxWindow={<div>Bandeja</div>}
      />,
    );

    const status = screen.getByTestId("taskbar-python-status");
    expect(status).toHaveTextContent("Cargando el intérprete de Python…");
  });

  it("oculta el indicador de Python cuando pythonStatus es idle", () => {
    render(
      <Desktop
        player={TEST_PLAYER}
        traceLevel={0}
        pythonStatus="idle"
        terminalWindow={<div>Terminal</div>}
        inboxWindow={<div>Bandeja</div>}
      />,
    );

    expect(screen.queryByTestId("taskbar-python-status")).not.toBeInTheDocument();
  });
});
