import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import App from "@/App";
import { useGameStore } from "@/store";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().newGame();
  });

  it("monta el juego con el tablero de contratos y la terminal", () => {
    render(<App />);
    expect(screen.getByTestId("game-layout")).toBeInTheDocument();
    expect(screen.getByText("Iniciación en la Red")).toBeInTheDocument();
    expect(screen.getByTestId("xterm-container")).toBeInTheDocument();
  });
});
