import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGameStore } from "@/store";
import { TitleScreen } from "./TitleScreen";

describe("TitleScreen — nombre de usuario al iniciar nueva partida", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().newGame();
  });

  it("muestra el campo de nombre con la regla visible y aria-invalid=false por defecto", () => {
    render(<TitleScreen onNewGame={vi.fn()} />);

    const input = screen.getByTestId("title-username-input");
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByTestId("title-username-rule")).toHaveTextContent(/minúsculas/i);
    expect(screen.queryByTestId("title-username-error")).not.toBeInTheDocument();
  });

  it("muestra el error de validación y bloquea el avance si el nombre es inválido", () => {
    const onNewGame = vi.fn();
    render(<TitleScreen onNewGame={onNewGame} />);

    const input = screen.getByTestId("title-username-input");
    fireEvent.change(input, { target: { value: "123-MAL!" } });
    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).not.toHaveBeenCalled();
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByTestId("title-username-error")).toBeInTheDocument();
    expect(document.activeElement).toBe(input);
  });

  it("inicia nueva partida con el nombre válido ingresado", () => {
    const onNewGame = vi.fn();
    render(<TitleScreen onNewGame={onNewGame} />);

    fireEvent.change(screen.getByTestId("title-username-input"), { target: { value: "luis_07" } });
    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().game.player.username).toBe("luis_07");
    expect(screen.queryByTestId("title-username-error")).not.toBeInTheDocument();
  });

  it("usa anonymous si el campo se deja vacío", () => {
    const onNewGame = vi.fn();
    render(<TitleScreen onNewGame={onNewGame} />);

    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).toHaveBeenCalledTimes(1);
    expect(useGameStore.getState().game.player.username).toBe("anonymous");
  });

  it("delega el nombre y muestra el error si onNewGame recibe argumentos", () => {
    const onNewGame = vi.fn((name?: string) => (name === "bad" ? "Nombre rechazado" : null));
    render(<TitleScreen onNewGame={onNewGame} />);

    fireEvent.change(screen.getByTestId("title-username-input"), { target: { value: "bad" } });
    fireEvent.click(screen.getByTestId("title-new-game-btn"));

    expect(onNewGame).toHaveBeenCalledWith("bad");
    expect(screen.getByTestId("title-username-error")).toHaveTextContent("Nombre rechazado");
  });
});
