import "./styles/tokens.css";

// Placeholder temporal.
// Cuando Antigravity implemente GameLayout y Claude Code integre
// la terminal con xterm.js, este archivo ensamblará todo.

export default function App() {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg)",
        color: "var(--color-text)",
        fontFamily: "var(--font-mono)",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "var(--space-md)",
      }}
    >
      <h1 style={{ color: "var(--color-primary)", fontSize: "1.2rem" }}>HackLab Game</h1>
      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
        Módulos en construcción — la terminal usará xterm.js, no HTML estático.
      </p>
    </div>
  );
}
