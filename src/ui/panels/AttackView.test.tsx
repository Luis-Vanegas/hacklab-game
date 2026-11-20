// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { dnsQuery, icmpEcho, synScan } from "@/lib/packets";
import type { Capture, NetworkNode, Packet } from "@/store";
import { AttackView } from "./AttackView";

const TOPOLOGY_WITH_TARGET: readonly NetworkNode[] = [
  { ip: "10.20.0.15", name: "nodo-ws-07", role: "local" },
  { ip: "10.20.0.1", name: "router", role: "router" },
  { ip: "10.20.0.53", name: "dns", role: "dns" },
  { ip: "192.0.2.11", name: "acme.example", role: "target" },
];

const SAMPLE_SCAN_PACKETS: readonly Packet[] = synScan("10.20.0.15", "192.0.2.11", [
  { port: 22, open: true },
  { port: 80, open: false },
]).map((packet, index) => ({
  ...packet,
  note:
    index === 0
      ? "SYN solicita abrir una conexión TCP en el puerto 22."
      : index === 1
        ? "SYN-ACK confirma que el puerto 22 está abierto."
        : "RST cierra el intento de conexión sin completar el saludo.",
  traced: index === 0 || index === 3,
}));

const SAMPLE_CAPTURE: Capture = {
  command: "nmap 192.0.2.11",
  packets: SAMPLE_SCAN_PACKETS,
};

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("AttackView (A12)", () => {
  it("muestra la topología en SVG y estado vacío cuando no hay captura", () => {
    render(<AttackView capture={null} topology={TOPOLOGY_WITH_TARGET} reducedMotion={false} />);

    expect(screen.getByTestId("attack-diagram")).toBeTruthy();
    expect(screen.getByTestId("topology-node-local")).toBeTruthy();
    expect(screen.getByTestId("topology-node-router")).toBeTruthy();
    expect(screen.getByTestId("topology-node-dns")).toBeTruthy();
    expect(screen.getByTestId("topology-node-target")).toBeTruthy();
    expect(screen.getByTestId("attack-empty-state")).toBeTruthy();
    expect(screen.queryByTestId("attack-packet-table")).toBeNull();
  });

  it("reproduce paquetes paso a paso, permite pausar, cambiar velocidad y elegir una fila", () => {
    vi.useFakeTimers();

    render(
      <AttackView capture={SAMPLE_CAPTURE} topology={TOPOLOGY_WITH_TARGET} reducedMotion={false} />,
    );

    expect(screen.getByTestId("attack-capture-command").textContent).toContain("nmap 192.0.2.11");
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 1/5");
    expect(screen.getByTestId("attack-packet-note").textContent).toContain("SYN solicita abrir");
    expect(screen.getByTestId("attack-play-btn").textContent).toBe("Pausar");
    // El botón Reproducir/Pausar no usa aria-pressed al cambiar su etiqueta
    expect(screen.getByTestId("attack-play-btn").hasAttribute("aria-pressed")).toBe(false);

    // Avanza automáticamente al paquete 2 tras 750 ms a velocidad 1×
    act(() => {
      vi.advanceTimersByTime(760);
    });
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 2/5");
    expect(screen.getByTestId("attack-packet-note").textContent).toContain("SYN-ACK confirma");

    // Cambia velocidad a 2× y avanza al paquete 3 en 375 ms
    fireEvent.click(screen.getByTestId("attack-speed-2"));
    expect(screen.getByTestId("attack-speed-2").getAttribute("aria-pressed")).toBe("true");
    act(() => {
      vi.advanceTimersByTime(380);
    });
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 3/5");

    // Pausar detiene el avance automático
    fireEvent.click(screen.getByTestId("attack-play-btn"));
    expect(screen.getByTestId("attack-play-btn").textContent).toBe("Reproducir");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 3/5");

    // Navegación manual con Anterior y Siguiente
    fireEvent.click(screen.getByTestId("attack-prev-btn"));
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 2/5");

    fireEvent.click(screen.getByTestId("attack-next-btn"));
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 3/5");

    // Elegir fila #1 desde el botón accesible de la tabla actualiza el detalle
    fireEvent.click(screen.getByTestId("packet-select-0"));
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 1/5");
    expect(screen.getByTestId("packet-row-0").getAttribute("data-selected")).toBe("true");
  });

  it("con prefers-reduced-motion muestra el resultado final sin animación (S3)", () => {
    render(
      <AttackView capture={SAMPLE_CAPTURE} topology={TOPOLOGY_WITH_TARGET} reducedMotion={true} />,
    );

    expect(screen.getByTestId("attack-reduced-motion-note")).toBeTruthy();
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 5/5");
    expect(screen.getByTestId("packet-row-4")).toBeTruthy();
    expect(screen.getByTestId("attack-packet-marker").getAttribute("data-motion")).toBe("static");
    expect((screen.getByTestId("attack-play-btn") as HTMLButtonElement).disabled).toBe(true);

    // Aunque no haya animación, el jugador puede recorrer paso a paso manualmente
    fireEvent.click(screen.getByTestId("attack-prev-btn"));
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 4/5");
  });

  it("distingue los paquetes con traced: true en el diagrama, detalle y tabla (S6)", () => {
    render(
      <AttackView capture={SAMPLE_CAPTURE} topology={TOPOLOGY_WITH_TARGET} reducedMotion={true} />,
    );

    expect(screen.getByTestId("attack-traced-count").textContent).toContain("2 RASTREO");
    expect(screen.getByTestId("packet-row-0").getAttribute("data-traced")).toBe("true");
    expect(screen.getByTestId("packet-row-1").getAttribute("data-traced")).toBe("false");

    fireEvent.click(screen.getByTestId("packet-select-0"));
    expect(screen.getByTestId("attack-active-path").getAttribute("data-traced")).toBe("true");
    expect(screen.getByTestId("attack-diagram-traced")).toBeTruthy();
    expect(screen.getByTestId("attack-detail-traced")).toBeTruthy();
  });

  it("funciona con capturas DNS e ICMP sin notas personalizadas y sin objetivo activo", () => {
    const localOnly: readonly NetworkNode[] = TOPOLOGY_WITH_TARGET.slice(0, 3);
    const dnsCapture: Capture = {
      command: "nslookup acme.example",
      packets: dnsQuery("10.20.0.15", "10.20.0.53", "acme.example", "192.0.2.11"),
    };

    const { rerender } = render(
      <AttackView capture={dnsCapture} topology={localOnly} reducedMotion={true} />,
    );

    expect(screen.queryByTestId("topology-node-target")).toBeNull();
    expect(screen.getByTestId("attack-packet-note").textContent).toBe(
      "Sin explicación adicional para este paquete.",
    );

    const pingCapture: Capture = {
      command: "ping 10.20.0.1",
      packets: icmpEcho("10.20.0.15", "10.20.0.1", 2),
    };
    rerender(<AttackView capture={pingCapture} topology={localOnly} reducedMotion={true} />);
    expect(screen.getByTestId("attack-step-counter").textContent).toBe("Paso 4/4");
  });
});
