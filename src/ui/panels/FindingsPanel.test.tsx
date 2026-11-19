import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { PlayerState } from "@/lib/types";
import { Desktop } from "../desktop/Desktop";
import { FindingsPanel } from "./FindingsPanel";

const NOVICE_PLAYER: PlayerState = {
  username: "luis",
  credits: 100,
  xp: 0,
  level: 1,
  reputation: "script_kiddie",
};

describe("FindingsPanel", () => {
  afterEach(cleanup);

  it("muestra texto marcado, explicación y comando origen cuando hay hallazgos", () => {
    render(
      <FindingsPanel
        showFindings
        findings={[
          {
            text: "ftp",
            note: "FTP transmite credenciales sin cifrar.",
            command: "nmap 10.20.0.10",
          },
        ]}
      />,
    );

    expect(screen.getByTestId("findings-panel")).toBeInTheDocument();
    expect(screen.getByTestId("findings-count")).toHaveTextContent("1 MARCA");
    expect(screen.getByText("ftp")).toBeInTheDocument();
    expect(screen.getByText("FTP transmite credenciales sin cifrar.")).toBeInTheDocument();
    expect(screen.getByText("$ nmap 10.20.0.10")).toBeInTheDocument();
  });

  it("no se renderiza cuando showFindings es false", () => {
    render(
      <FindingsPanel
        showFindings={false}
        findings={[{ text: "ftp", note: "Nota", command: "nmap" }]}
      />,
    );

    expect(screen.queryByTestId("findings-panel")).not.toBeInTheDocument();
  });
});

describe("Desktop — pestaña Hallazgos según showFindings", () => {
  afterEach(cleanup);

  it("muestra la pestaña Hallazgos en escritorio y móvil cuando showFindings es true", () => {
    render(
      <Desktop
        player={NOVICE_PLAYER}
        traceLevel={0}
        showFindings
        findingsCount={2}
        terminalWindow={<div>Terminal</div>}
        inboxWindow={<div>Bandeja</div>}
      />,
    );

    expect(screen.getByTestId("side-tab-findings")).toBeInTheDocument();
    expect(screen.getByTestId("mobile-tab-findings")).toBeInTheDocument();
    expect(screen.getByTestId("taskbar-findings-btn")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("side-tab-findings"));
    expect(screen.getByTestId("findings-panel")).toBeInTheDocument();
  });

  it("oculta la pestaña Hallazgos en escritorio, móvil y barra de tareas cuando showFindings es false", () => {
    render(
      <Desktop
        player={NOVICE_PLAYER}
        traceLevel={0}
        showFindings={false}
        terminalWindow={<div>Terminal</div>}
        inboxWindow={<div>Bandeja</div>}
      />,
    );

    expect(screen.queryByTestId("side-tab-findings")).not.toBeInTheDocument();
    expect(screen.queryByTestId("mobile-tab-findings")).not.toBeInTheDocument();
    expect(screen.queryByTestId("taskbar-findings-btn")).not.toBeInTheDocument();
  });
});
