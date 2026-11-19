import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { loadPyodide } from "pyodide";
import { CONTRACTS, useGameStore } from "@/store";
import { setPythonRunner } from "@/store/gameStore";
import { runScript } from "@/store/python/runScript";

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

  it("registra los 18 contratos y tres pistas distintas por objetivo", () => {
    expect(CONTRACTS.map((contract) => contract.id).sort()).toEqual(
      [...Object.keys(walkthrough), ...pythonLessons.map(({ id }) => id)].sort(),
    );
    expect(CONTRACTS).toHaveLength(18);

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

const pythonLessons = [
  {
    id: "20-py-variables",
    line: "print(mensaje)",
    output: ["Estación virtual preparada."],
  },
  {
    id: "21-py-listas",
    line: '    print(f"Control: {control}")',
    output: ["Control: Inventario", "Control: Registros", "Control: Copia"],
  },
  {
    id: "22-py-archivos",
    line: 'print(ruta.read_text(encoding="utf-8").strip())',
    output: ["Turno cerrado. Copia de respaldo revisada."],
  },
  {
    id: "23-py-fallos",
    line: "        fallos += 1",
    output: ["Total de fallos: 4."],
  },
  {
    id: "24-py-direcciones",
    line: "ips = re.findall(patron, texto)",
    output: ["Direcciones observadas: 10.20.0.1, 203.0.113.45."],
  },
  {
    id: "25-py-integridad",
    line: "huella = hashlib.sha256(contenido).hexdigest()",
    output: ["Integridad: coincide."],
  },
];

describe("Curso de Python de Marta", () => {
  beforeAll(async () => {
    const python = await loadPyodide();
    setPythonRunner({
      run(request, onStatus) {
        onStatus("running");
        return Promise.resolve({ kind: "done", response: runScript(python, request) });
      },
    });
  }, 120_000);

  beforeEach(() => {
    localStorage.clear();
    store().newGame();
  });

  afterAll(() => setPythonRunner(null));

  it.each(pythonLessons)(
    "completa $id con la salida del script editado",
    async ({ id, line, output }) => {
      const path = "~/scripts/" + id + ".py";
      const command = "python " + path;
      const contract = CONTRACTS.find((entry) => entry.id === id);
      expect(contract?.channel).toBe("work");
      expect(contract?.story.intro[0]?.character).toBe("MARTA");
      expect(contract?.objectives[0]?.hints?.[2]).toContain("`" + line + "`");
      expect(store().acceptContract(id)).toBe(true);

      const starter = await store().runCommandAsync(command);
      expect(starter.error).toBeUndefined();
      expect(starter.output.join("\n")).not.toContain(output.join("\n"));
      expect(store().game.activeContract?.objectives[0]?.completed).toBe(false);

      expect(store().runCommand("edit " + path).error).toBeUndefined();
      const editor = store().editorFile;
      if (!editor) throw new Error("No se abrió la plantilla de " + id);
      expect(editor.content.match(/^[ \t]*# TODO.*$/gmu)).toHaveLength(1);
      const solved = editor.content.replace(/^[ \t]*# TODO.*$/mu, line);
      expect(store().saveFile(editor.path, solved).error).toBeUndefined();
      store().closeEditor();

      const result = await store().runCommandAsync(command);
      expect(result.error).toBeUndefined();
      expect(result.output).toEqual(output);
      expect(store().game.activeContract?.objectives[0]?.completed).toBe(true);
      store().submitContract();
      expect(store().game.activeContract).toBeNull();
      expect(store().game.completedContracts).toContain(id);
      expect(store().game.player.xp).toBe(contract?.reward.xp);
    },
  );
});
