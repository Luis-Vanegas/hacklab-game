# Vista de ataques: ver los paquetes de cada comando

Objetivo: que el jugador vea en un diagrama qué paquetes envía cada comando, entre qué equipos y qué significa cada uno.
Rama base: `develop`. Entrega: una rama por tarea, PR a `develop`. Pruebas: Vitest (`npm run check`). Empieza cuando C11 y A11 estén en `develop`.

## Specs

- **S1 — Ver el ataque.** "que tan posible es tambien mostrarles de forma grafica como va todo que pasa en un atanque y todo eso". Referencia de Luis: https://protocol-explorer-alpha.vercel.app/ (se toma la idea, no el diseño: la vista usa el estilo propio de HackLab).
- **S2 — Diagrama de red.** Los equipos que participan (tu estación, el router y el objetivo del contrato) y los paquetes moviéndose entre ellos al ejecutar un comando. _Supuesto:_ en 2D con SVG, no en 3D: se lee mejor, funciona en el celular y es accesible con lector de pantalla.
- **S3 — Tabla de paquetes.** Al estilo de Wireshark: número, tiempo, origen, destino, protocolo, información y tamaño. Controles: reproducir, paso a paso y velocidad. Con `prefers-reduced-motion` no hay animación: se muestra el resultado final.
- **S4 — Explicación por paso.** Al elegir un paquete, una explicación corta de qué significa (por ejemplo, SYN = "pide abrir una conexión"). Las explicaciones siguen la regla S6 de la terminal legible: cada una con su fuente.
- **S5 — Comandos que generan paquetes.** `ping` (ICMP), `nslookup` (DNS), `nmap` (SYN a cada puerto: SYN-ACK si está abierto, RST si está cerrado), `ssh` (saludo TCP y autenticación), `curl` (TCP y HTTP), `traceroute` (TTL creciente). Simulados, con las IPs del contrato; nada contra sistemas reales.
- **S6 — El rastreo se ve.** Los paquetes que suben el rastreo se distinguen, para que el jugador entienda por qué un escaneo ruidoso lo delata.

## Contrato entre capas (K6)

| Pieza                    | Forma                                                                                                                                                             | La usan |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `CommandResult.packets?` | `readonly Packet[]` con `{ from, to, protocol, info, size, flags?, note?, traced? }`. `from` y `to` son IPs                                                       | C12     |
| `src/lib/packets.ts`     | Constructores puros: `tcpHandshake(from, to, port)`, `synScan(from, to, ports)`, `icmpEcho`, `dnsQuery`, `httpRequest`. Los comandos los usan sin tocar el engine | C12     |
| `useCapture()`           | Los paquetes del último comando que envió alguno: `{ command, packets }` o `null`                                                                                 | A12     |
| `useTopology()`          | Equipos del diagrama: estación local, router y hosts del contrato activo, con IP, nombre y rol                                                                    | A12     |

## Tasks

| ID  | Specs                                 | Quién       | Rama                    | Estado                           |
| --- | ------------------------------------- | ----------- | ----------------------- | -------------------------------- |
| K6  | S2–S6 (contrato)                      | Claude      | `feat/engine-packets`   | pendiente (después de C11 y A11) |
| C12 | S5, S4 (explicaciones con fuente), S6 | Codex       | `feat/terminal-packets` | pendiente (espera K6)            |
| A12 | S2, S3, S4                            | Antigravity | `feat/ui-attack-view`   | pendiente (espera K6)            |

## Log

- **L1** (2026-11-19, Luis): "Pregunta, que tan posible es tambien mostrarles de forma grafica como va todo que pasa en un atanque y todo eso te dare un ekmeplo: https://protocol-explorer-alpha.vercel.app/"
- **L2** (2026-11-19, Luis): "planea y miremos para terminer c11 y a11"
- **L3** (2026-11-19): mapa. El «Mapa de red» (`DefaultNetworkMap` en `src/ui/desktop/Desktop.tsx`) es una lista de equipos; `NetworkGraph` y `MatrixRain` son fondos 3D decorativos. El contrato `highlights` de K5 es el modelo a seguir: el comando devuelve datos puros y la UI los dibuja. La referencia muestra diagrama de red, tabla de paquetes, reproducción paso a paso y una ficha del protocolo.
- **Siguiente paso:** terminar C11 y A11; luego K6.
