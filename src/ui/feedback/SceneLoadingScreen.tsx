// Pantalla de carga ligera para la escena 3D mientras se descarga o inicializa Three.js.
// No importa Three.js ni R3F para mantener el paquete inicial liviano (< 300 kB gzip).

export interface SceneLoadingScreenProps {
  readonly label?: string;
  readonly variant?: "fullscreen" | "embedded";
}

export function SceneLoadingScreen({
  label = "Cargando escena 3D de Nodo Seguro...",
  variant = "fullscreen",
}: SceneLoadingScreenProps = {}) {
  const isEmbedded = variant === "embedded";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      style={{
        position: isEmbedded ? "absolute" : "relative",
        inset: isEmbedded ? 0 : undefined,
        minBlockSize: isEmbedded ? undefined : "100dvh",
        inlineSize: "100%",
        zIndex: isEmbedded ? 3 : undefined,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-lg)",
        backgroundColor: "rgba(10, 10, 15, 0.94)",
      }}
      data-testid="scene-loading-screen"
    >
      <div
        className="hl-panel"
        style={{
          maxInlineSize: "420px",
          inlineSize: "100%",
          padding: "var(--space-md) var(--space-lg)",
          gap: "var(--space-sm)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-sm)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.86rem",
              color: "var(--color-primary)",
            }}
          >
            RENDER 3D // INICIALIZANDO
          </span>
          <span className="hl-badge hl-badge--accent">WEBGL</span>
        </div>

        <progress className="hl-progress" aria-label={label} />

        <p
          style={{
            margin: 0,
            fontFamily: "var(--font-mono)",
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
