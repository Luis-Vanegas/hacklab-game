// Panel lateral de Hallazgos para principiantes (FindingsPanel.tsx).
// Muestra las pistas de seguridad detectadas por los comandos de la terminal (S3)
// junto con su explicación y el comando origen. Se oculta cuando useShowFindings() es false (S4).

import { useFindings, useShowFindings, type Finding } from "@/store";

export interface FindingsPanelProps {
  readonly findings?: readonly Finding[];
  readonly showFindings?: boolean;
}

export function FindingsPanel({
  findings: propFindings,
  showFindings: propShowFindings,
}: FindingsPanelProps = {}) {
  const storeFindings = useFindings();
  const storeShowFindings = useShowFindings();

  const findings = propFindings ?? storeFindings;
  const showFindings = propShowFindings ?? storeShowFindings;

  if (!showFindings) {
    return null;
  }

  return (
    <section
      className="hl-panel"
      aria-label="Hallazgos de seguridad"
      style={{ flex: "1 1 auto" }}
      data-testid="findings-panel"
    >
      <div className="hl-panel__header">
        <h2 className="hl-panel__title">HALLAZGOS</h2>
        <span
          className={
            findings.length > 0 ? "hl-badge hl-badge--warning hl-tabular" : "hl-badge hl-tabular"
          }
          data-testid="findings-count"
        >
          {findings.length > 0
            ? `${findings.length} ${findings.length === 1 ? "MARCA" : "MARCAS"}`
            : "SIN MARCAS"}
        </span>
      </div>

      <div className="hl-panel__body">
        {findings.length === 0 ? (
          <p style={{ margin: 0, fontSize: "0.86rem", color: "var(--color-text-secondary)" }}>
            Todavía no hay hallazgos registrados. Ejecuta comandos de análisis como{" "}
            <code style={{ fontFamily: "var(--font-mono)", color: "var(--color-accent)" }}>
              nmap
            </code>{" "}
            para ver aquí los servicios o pistas relevantes con su explicación.
          </p>
        ) : (
          <ul
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-sm)",
            }}
          >
            {findings.map((finding, index) => (
              <li key={`${finding.command}-${finding.text}-${index}`}>
                <article className="hl-finding-card" data-testid={`finding-item-${index}`}>
                  <div className="hl-finding-card__header">
                    <span className="hl-finding-keyword">{finding.text}</span>
                    <code
                      className="hl-badge hl-tabular"
                      aria-label={`Encontrado con ${finding.command}`}
                    >
                      $ {finding.command}
                    </code>
                  </div>
                  <p className="hl-finding-card__note">{finding.note}</p>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
