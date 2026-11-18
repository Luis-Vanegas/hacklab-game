import "./styles/tokens.css";

// Punto de entrada del juego.
// Claude Code ensambla aquí los módulos cuando estén listos.

export default function App() {
  return (
    <div style={{
      backgroundColor: "var(--color-bg)",
      color: "var(--color-text)",
      fontFamily: "var(--font-mono)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <pre style={{ color: "var(--color-terminal-text)" }}>
{`
  ██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗      █████╗ ██████╗
  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║     ██╔══██╗██╔══██╗
  ███████║███████║██║     █████╔╝ ██║     ███████║██████╔╝
  ██╔══██║██╔══██║██║     ██╔═██╗ ██║     ██╔══██║██╔══██╗
  ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║██████╔╝
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝

  [ SYSTEM BOOT ... ]
  [ Inicializando módulos ... ]

  > Engine: OK
  > Terminal: pendiente (Codex)
  > UI: pendiente (Antigravity)
  > Escenas 3D: pendiente (Antigravity)

  Escribe 'help' para empezar.
`}
      </pre>
    </div>
  );
}
