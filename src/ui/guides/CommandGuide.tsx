// Guía interactiva de comandos (CommandGuide.tsx).
// Consume COMMAND_GUIDE desde @/store, agrupa tarjetas por categoría ("red", "archivos",
// "sistema", "seguridad", "juego"), incluye buscador por nombre, alias o descripción,
// muestra el estado bloqueado ("Se desbloquea en rango X") y ofrece el botón "Probar"
// que escribe el ejemplo en la terminal sin ejecutarlo.

import { useState } from "react";
import type { ReputationTier } from "@/lib/types";
import { COMMAND_GUIDE, usePlayer, type CommandManual } from "@/store";
import { injectTerminalDraft } from "@/terminal/Terminal";

export type CommandGuideCategory = CommandManual["category"];
export type CommandGuideItem = CommandManual;

export interface CommandGuideProps {
  readonly commands?: readonly CommandManual[];
  readonly playerReputation?: ReputationTier;
  readonly onTryCommand?: (example: string) => void;
}

const TIER_RANK: Record<ReputationTier, number> = {
  script_kiddie: 0,
  hacker: 1,
  elite_hacker: 2,
  l33t: 3,
  anonymous: 4,
};

const TIER_LABELS: Record<ReputationTier, string> = {
  script_kiddie: "Novato",
  hacker: "Hacker",
  elite_hacker: "Hacker Élite",
  l33t: "L33T",
  anonymous: "Anónimo",
};

const CATEGORY_ORDER: readonly CommandGuideCategory[] = [
  "archivos",
  "red",
  "sistema",
  "seguridad",
  "juego",
];

const CATEGORY_LABELS: Record<CommandGuideCategory, string> = {
  archivos: "ARCHIVOS Y TEXTO",
  red: "RED Y CONECTIVIDAD",
  sistema: "SISTEMA Y PROCESOS",
  seguridad: "SEGURIDAD Y AUDITORÍA",
  juego: "TERMINAL Y JUEGO",
};

export function CommandGuide({
  commands = COMMAND_GUIDE,
  playerReputation: propReputation,
  onTryCommand,
}: CommandGuideProps = {}) {
  const storePlayer = usePlayer();
  const playerReputation = propReputation ?? storePlayer.reputation;
  const playerRank = TIER_RANK[playerReputation];

  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | CommandGuideCategory>("all");

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = commands.filter((cmd) => {
    const matchesCategory = activeCategory === "all" || cmd.category === activeCategory;
    if (!matchesCategory) return false;
    if (normalizedQuery.length === 0) return true;
    return (
      cmd.name.toLowerCase().includes(normalizedQuery) ||
      cmd.description.toLowerCase().includes(normalizedQuery) ||
      cmd.learn.toLowerCase().includes(normalizedQuery) ||
      cmd.realWorld.toLowerCase().includes(normalizedQuery) ||
      (cmd.aliases?.some((alias) => alias.toLowerCase().includes(normalizedQuery)) ?? false)
    );
  });

  const handleTry = (example: string) => {
    if (onTryCommand) {
      onTryCommand(example);
    } else {
      injectTerminalDraft(example);
    }
  };

  return (
    <section
      className="hl-panel"
      aria-label="Guía de comandos"
      style={{ flex: "1 1 auto" }}
      data-testid="command-guide"
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">GUÍA DE COMANDOS</h2>
        <span className="hl-badge hl-tabular">{filtered.length} COMANDOS</span>
      </div>

      <div
        style={{
          padding: "var(--space-sm) var(--space-md)",
          borderBlockEnd: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-sm)",
          backgroundColor: "rgba(10, 10, 15, 0.45)",
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o descripción..."
          aria-label="Buscar comando por nombre o descripción"
          style={{
            inlineSize: "100%",
            padding: "8px 12px",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--color-border-strong)",
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text)",
            fontFamily: "var(--font-mono)",
            fontSize: "0.84rem",
          }}
          data-testid="command-guide-search"
        />

        <div
          role="tablist"
          aria-label="Categorías de comandos"
          style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-xs)" }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeCategory === "all"}
            className={activeCategory === "all" ? "hl-btn hl-btn--primary" : "hl-btn"}
            style={{ fontSize: "0.74rem", padding: "3px 8px" }}
            onClick={() => setActiveCategory("all")}
          >
            Todas
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat}
              className={activeCategory === cat ? "hl-btn hl-btn--primary" : "hl-btn"}
              style={{ fontSize: "0.74rem", padding: "3px 8px" }}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="hl-panel__body">
        {filtered.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.88rem", margin: 0 }}>
            No se encontraron comandos que coincidan con tu búsqueda.
          </p>
        ) : (
          CATEGORY_ORDER.map((category) => {
            const categoryCommands = filtered.filter((cmd) => cmd.category === category);
            if (categoryCommands.length === 0) {
              return null;
            }

            return (
              <section
                key={category}
                aria-label={CATEGORY_LABELS[category]}
                style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}
                data-testid={`guide-category-${category}`}
              >
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.82rem",
                    color: "var(--color-accent)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {CATEGORY_LABELS[category]}
                </h3>

                {categoryCommands.map((cmd) => {
                  const isLocked = TIER_RANK[cmd.unlockRank] > playerRank;

                  return (
                    <article
                      key={cmd.name}
                      style={{
                        border: `1px solid ${
                          isLocked ? "var(--color-border)" : "var(--color-border-strong)"
                        }`,
                        borderRadius: "var(--radius-sm)",
                        padding: "var(--space-sm) var(--space-md)",
                        backgroundColor: "var(--color-surface-elevated)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--space-xs)",
                        opacity: isLocked ? 0.68 : 1,
                      }}
                      data-testid={`guide-card-${cmd.name}`}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "var(--space-xs)",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: "var(--space-xs)",
                          }}
                        >
                          <code
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontWeight: 700,
                              fontSize: "0.95rem",
                              color: isLocked
                                ? "var(--color-text-secondary)"
                                : "var(--color-primary)",
                            }}
                          >
                            {cmd.name}
                          </code>
                          {cmd.aliases && cmd.aliases.length > 0 ? (
                            <span
                              style={{
                                fontFamily: "var(--font-mono)",
                                fontSize: "0.74rem",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              (alias: {cmd.aliases.join(", ")})
                            </span>
                          ) : null}
                        </div>

                        {isLocked ? (
                          <span
                            className="hl-badge hl-badge--warning"
                            data-testid={`guide-locked-${cmd.name}`}
                          >
                            Se desbloquea en rango {TIER_LABELS[cmd.unlockRank]}
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="hl-btn hl-btn--primary"
                            style={{ fontSize: "0.76rem", padding: "3px 10px" }}
                            onClick={() => handleTry(cmd.example)}
                            data-testid={`guide-try-${cmd.name}`}
                          >
                            Probar
                          </button>
                        )}
                      </div>

                      <p style={{ margin: 0, fontSize: "0.84rem", color: "var(--color-text)" }}>
                        {cmd.description}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                          fontSize: "0.78rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        <div>
                          <strong style={{ color: "var(--color-text)" }}>Qué aprendes: </strong>
                          <span>{cmd.learn}</span>
                        </div>
                        <div>
                          <strong style={{ color: "var(--color-text)" }}>Cómo se usa: </strong>
                          <code style={{ fontFamily: "var(--font-mono)" }}>{cmd.usage}</code>
                        </div>
                        <div>
                          <strong style={{ color: "var(--color-text)" }}>Ejemplo: </strong>
                          <code
                            style={{
                              fontFamily: "var(--font-mono)",
                              color: "var(--color-accent)",
                            }}
                          >
                            {cmd.example}
                          </code>
                        </div>
                        <div>
                          <strong style={{ color: "var(--color-text)" }}>En la vida real: </strong>
                          <span>{cmd.realWorld}</span>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            );
          })
        )}
      </div>
    </section>
  );
}
