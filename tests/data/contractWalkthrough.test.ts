import { beforeEach, describe, expect, it } from "vitest";
import { CONTRACTS, useGameStore } from "@/store";

const store = () => useGameStore.getState();

// Estas entradas explícitas representan lo que escribe el jugador.
// Los servidores y archivos pertenecen al escenario virtual del juego.
const walkthrough = {
  "00-tutorial": ["ls", "cat notes", "cd /etc", "cat passwd", "whoami"],
  "01-first-hack": [
    "buy nmap",
    "buy ssh",
    "nmap acme.example",
    "ssh acme.example",
    "download /entrega/turno.txt",
  ],
  "02-data-heist": [
    "buy hydra",
    "crack ficha",
    "ssh archivo.example FICHA-39",
    "download /archivo/bitacora.txt",
    "cat bitacora.txt",
  ],
  "03-espejo-clinico": [
    "nmap hospital-simulacion.example",
    "ssh hospital-simulacion.example",
    "download /export/resumen-publico.txt",
  ],
  "04-archivo-de-turno": [
    "nmap refugio-simulacion.example",
    "ssh refugio-simulacion.example",
    "download /export/incidente-analizado.txt",
  ],
  "10-dia-1-bienvenida": [
    "cat bienvenida.txt",
    "ipconfig",
    "ping 10.20.0.1",
    "nslookup intranet.nodoseguro.test",
  ],
  "11-dia-2-logs": [
    "tail /var/log/auth.log",
    "grep -c Failed /var/log/auth.log",
    "grep 203.0.113.45 /var/log/auth.log",
  ],
  "12-dia-3-proceso-raro": ["netstat", "ps", "kill 4444"],
  "13-dia-4-phishing": [
    "cat ~/correo/factura.eml",
    "grep From: ~/correo/factura.eml",
    "grep https:// ~/correo/factura.eml",
    "grep nodoseguro-pagos.example ~/correo/factura.eml",
  ],
  "14-dia-5-logs-web": [
    "grep sql_injection /var/log/nginx/access.log",
    "grep -c sql_injection /var/log/nginx/access.log",
  ],
  "15-dia-6-contrasenas": [
    "file ~/auditoria/hashes.txt",
    "sha256sum ~/auditoria/hashes.txt",
    "grep MD5 ~/auditoria/hashes.txt",
    "grep MD5 ~/auditoria/criterios.txt",
  ],
  "16-dia-7-informe": [
    "python ~/scripts/contar_fallidos.py",
    "grep -c Failed /var/log/auth.log",
    'echo "Dominio sospechoso: nodoseguro-pagos.example; intentos web: 3; MD5 debe retirarse." > ~/informe.txt',
    "cat ~/informe.txt",
  ],
};

describe("Catálogo completo de contratos", () => {
  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  it("registra los 12 contratos y tres pistas distintas por objetivo", () => {
    expect(CONTRACTS.map((contract) => contract.id).sort()).toEqual(
      Object.keys(walkthrough).sort(),
    );
    expect(CONTRACTS).toHaveLength(12);

    for (const contract of CONTRACTS) {
      expect(contract.objectives.length, contract.id).toBeGreaterThan(0);
      for (const objective of contract.objectives) {
        const key = contract.id + "/" + objective.id;
        const hints = objective.hints ?? [];
        expect(hints, key).toHaveLength(3);
        expect(
          hints.every((hint) => hint.trim().length > 0),
          key,
        ).toBe(true);
        expect(new Set(hints.map((hint) => hint.trim())).size, key).toBe(3);
      }
    }
  });

  it("acepta, completa y entrega los 12 contratos desde una partida real", () => {
    expect(store().game.player.xp).toBe(0);
    for (const [id, inputs] of Object.entries(walkthrough)) {
      expect(store().runCommand("cd ~").error, id).toBeUndefined();
      expect(store().acceptContract(id), id).toBe(true);
      const xpBefore = store().game.player.xp;

      for (const input of inputs) {
        expect(store().runCommand(input).error, id + " · " + input).toBeUndefined();
      }

      const active = store().game.activeContract;
      expect(active?.id, id).toBe(id);
      expect(
        active?.objectives
          .filter((objective) => !objective.completed)
          .map((objective) => objective.id),
        id,
      ).toEqual([]);
      expect(active?.reward.xp, id).toBeGreaterThan(0);
      store().submitContract();
      expect(store().game.activeContract, id).toBeNull();
      expect(store().game.completedContracts, id).toContain(id);
      expect(store().game.player.xp, id).toBe(xpBefore + (active?.reward.xp ?? 0));
    }

    expect(store().game.completedContracts).toEqual(Object.keys(walkthrough));
    expect(store().game.player).toMatchObject({ reputation: "elite_hacker", xp: 3260 });
  });
});
