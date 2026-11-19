import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "@/App";
import { useGameStore } from "@/store";

// jsdom no tiene WebGL: la escena real deja procesos abiertos y cuelga la suite
vi.mock("@/scenes/OfficeScene", () => ({ OfficeScene: () => <div data-testid="office-scene" /> }));
vi.mock("@/scenes/SceneManager", () => ({ SceneManager: () => null }));

// La oficina 3D y el escritorio se prueban en sus propios componentes:
// aquí se valida que el recorrido arranque y avance (S2).
describe("App", () => {
  afterEach(cleanup);

  beforeEach(() => {
    localStorage.clear();
    useGameStore.getState().newGame();
  });

  it("arranca en el título, sin opción de continuar en una partida nueva", () => {
    render(<App />);
    expect(screen.getByTestId("title-screen")).toBeInTheDocument();
    expect(screen.queryByTestId("title-continue-btn")).not.toBeInTheDocument();
  });

  it("nueva partida muestra la intro y al saltarla pasa a la oficina", async () => {
    render(<App />);
    fireEvent.click(screen.getByTestId("title-new-game-btn"));
    expect(screen.getByTestId("intro-sequence")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("intro-skip-btn"));
    expect(screen.queryByTestId("intro-sequence")).not.toBeInTheDocument();
    expect(useGameStore.getState().game.storyFlags.introSeen).toBe(true);
    expect(await screen.findByTestId("office-scene")).toBeInTheDocument();
  });

  it("con la intro ya vista el título ofrece continuar", () => {
    useGameStore.getState().markIntroSeen();
    render(<App />);
    expect(screen.getByTestId("title-continue-btn")).toBeInTheDocument();
  });
});
