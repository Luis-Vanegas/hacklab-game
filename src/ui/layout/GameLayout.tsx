// Layout principal de 3 paneles (DarknetBoard + Terminal + StatusPanel).
// Es un componente puramente composicional: recibe slots renderizables para mantener
// desacoplamiento total respecto al store y al motor.

import type { ReactNode } from "react";

export interface GameLayoutProps {
  readonly hud: ReactNode;
  readonly leftPanel: ReactNode;
  readonly centerTerminal: ReactNode;
  readonly rightPanel: ReactNode;
  readonly commandHint?: ReactNode;
  readonly storyDialog?: ReactNode;
  readonly backgroundScene?: ReactNode;
  readonly modalOverlay?: ReactNode;
}

export function GameLayout({
  hud,
  leftPanel,
  centerTerminal,
  rightPanel,
  commandHint,
  storyDialog,
  backgroundScene,
  modalOverlay,
}: GameLayoutProps) {
  return (
    <div className="hl-layout" data-testid="game-layout">
      {backgroundScene ? <div className="hl-layout__scene">{backgroundScene}</div> : null}

      <div className="hl-layout__hud">{hud}</div>

      <main className="hl-layout__workspace">
        <div className="hl-layout__board">{leftPanel}</div>

        <section className="hl-layout__terminal" aria-label="Interactive Terminal Workspace">
          {storyDialog}
          <div
            style={{ flex: "1 1 auto", minBlockSize: 0, display: "flex", flexDirection: "column" }}
          >
            {centerTerminal}
          </div>
          {commandHint}
        </section>

        <div className="hl-layout__status">{rightPanel}</div>
      </main>

      {modalOverlay ? <div className="hl-layout__overlay">{modalOverlay}</div> : null}
    </div>
  );
}
