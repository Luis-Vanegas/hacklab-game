import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TitleScreen } from "./TitleScreen";

describe("TitleScreen — nombre de usuario al iniciar nueva partida", () => {
  afterEach(cleanup);

  it("muestra el campo de nombre con la regla visible y aria-invalid=false por defecto", () => {
    render(<TitleScreen onNewGame={vi.fn(() => null)} />);

    const input = screen.getByTestId("title-username-input");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByTestId("title-username-rule")).toHaveTextContent(/minúsculas/i);
    expect(screen.queryByTestId("title-username-error")).not.toBeInTheDocument();
  });

  it("pide la partida una sola vez con el nombre sin espacios", () => {
    const onNewGame = vi.fn(() => null);
    render(<TitleScreen onNewGame={onNewGame} />);

    fireEvent.change(screen.getByTestId("title-username-input"), {
      target: { value: " luis_07 " },
    });
    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(onNewGame).toHaveBeenCalledWith("luis_07");
    expect(screen.queryByTestId("title-username-error")).not.toBeInTheDocument();
  });

  it("con el campo vacío envía un nombre vacío (el store usa anonymous)", () => {
    const onNewGame = vi.fn(() => null);
    render(<TitleScreen onNewGame={onNewGame} />);

    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).toHaveBeenCalledWith("");
  });

  it("muestra el error que devuelve el contenedor y enfoca el campo", () => {
    const onNewGame = vi.fn(() => "Usa de 1 a 16 caracteres");
    render(<TitleScreen onNewGame={onNewGame} />);

    const input = screen.getByTestId("title-username-input");
    fireEvent.change(input, { target: { value: "Luis Vanegas" } });
    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("title-username-error")).toHaveTextContent(
      "Usa de 1 a 16 caracteres",
    );
    expect(document.activeElement).toBe(input);
  });
});
