# Fase 2 — Experiencia de juego

Objetivo: que HackLab se sienta como un videojuego que cuenta una historia y enseña, no como una terminal suelta.
Rama de integración: `develop` · Entrega: un PR por agente y por bloque · Pruebas: Vitest (`npm run check`).

## Visión en una página

**Historia: doble vida.** Combina lo que ya existe con un trabajo real.

- **De día** eres practicante en **Nodo Seguro**, una empresa de ciberseguridad en Medellín. Recibes tickets de tu jefa y de clientes, todo autorizado y con alcance definido. Así aprendes el oficio de verdad.
- **De noche**, **CIPHER**, un contacto anónimo de la darknet, te ofrece contratos mejor pagados y más riesgosos. Son los contratos `00`, `01` y `02` que ya existen.
- **La tensión del juego:** el trabajo da _confianza_ y rangos. La darknet da créditos rápidos, pero sube el _trace_. Si te rastrean, pierdes. El jugador aprende la diferencia entre un pentest autorizado y un delito porque vive las consecuencias.

**Recorrido del jugador:**

```
Pantalla de título ─► Intro narrativa (texto tipo máquina de escribir, 5 viñetas)
   ─► La oficina (escena pixelada: compañeros caminando, tu escritorio)
   ─► Clic en tu computador: la cámara entra al monitor
   ─► HackLab OS (escritorio): Terminal · Bandeja · Guía de comandos · Mapa de red · Tienda
   ─► De noche, la luz baja y CIPHER escribe en la Bandeja
```

**Estilo visual: 3D low-poly que se ve pixelado.** Modelos 3D gratis con licencia CC0, renderizados a baja resolución y escalados con `image-rendering: pixelated`. Logra el "cuadrito pixelado con muñequitos" sin dibujar sprites ni instalar librerías.

**Referencias de diseño (solo mecánicas, sin copiar ningún juego):**

| Referencia                                    | Qué tomamos                                                                                                    |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Hacker Simulator                              | Contratos de clientes, reputación y mejoras de equipo. Evitamos lo repetitivo con historia y misiones variadas |
| OverTheWire Bandit                            | Niveles cortos donde encontrar la respuesta prueba que entendiste. Las pistas disminuyen con el rango          |
| Simuladores de SOC (MEEPS, TryHackMe SOC Sim) | Bandeja de tickets, turno con meta y clasificar alertas como reales o falsas                                   |
| Terminus y bashcrawl                          | Aprender comandos explorando un mundo                                                                          |

## Specs

**S1 — Historia combinada.** Pedido: "sería mejor que lo combinemos, miremos cómo utilizar eso que ya hicimos". Dos canales de contratos: `work` (Nodo Seguro, tickets autorizados) y `darknet` (CIPHER). Los contratos `00` a `02` se conservan como canal `darknet`.

**S2 — Inicio con historia.** Pedido: "comenzar con la historia al principio, con un texto o algo y pum, ya sale la terminal con el computador". Pantalla de título, luego intro con texto tipo máquina de escribir, luego escena, luego terminal. La intro se puede saltar y no se repite tras verla.

**S3 — Escena con personajes.** Pedido: "un cuadrito pixelado o algo de un cuadrito donde están los muñequitos andando por ahí". Oficina 3D low-poly con estilo pixelado. Al menos 2 compañeros caminando por rutas fijas y el personaje del jugador sentado frente a su computador.

**S4 — Explicar mejor.** Pedido: "cuadritos de instrucciones explicando cuando necesitan ayuda, qué hace, cómo puede hacerlo, con algún ejemplo". Guía de comandos con una tarjeta por comando: qué hace, cómo se usa, ejemplo, "en la vida real" y botón **Probar**.

**S5 — Más comandos de principiante.** Pedido: "el ipconfi para ver el IP, cosas así, principiantes, faltan más comandos". Mínimo 20 comandos nuevos en 4 categorías (red, archivos, sistema, juego). Ver tareas de Codex.

**S6 — Todo en español.** Pedido: "Estas palabras que deberían ir como en español para que la gente entienda". Cero textos de interfaz en inglés.

**S7 — Liviano y rápido.** Pedido: "una página donde esté todo eso liviano y rápido en un navegador". JS inicial sin escena 3D menor a 300 kB gzip. Escena cargada en diferido. Modelos menores a 2 MB en total. Funciona en 375 px de ancho.

**S8 — Sensación de juego.** Pedido: "algo como que se note que es un videojuego". Avisos de "Objetivo completado +XP", subida de rango animada, alarma visual cuando el trace pasa de 75 % y mensajes de personajes con retrato.

## Contratos entre capas (los publica Claude antes de que se usen)

| Contrato                                                                                                 | Dónde              | Para quién                           |
| -------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------ |
| `Contract.channel: "work" \| "darknet"`                                                                  | `src/lib/types.ts` | Codex (JSON), Antigravity (tableros) |
| `useGameEvents()`: cola de eventos `objective_completed`, `contract_completed`, `rank_up`, `trace_alarm` | `src/store/`       | Antigravity (avisos)                 |
| `useIntroSeen()` / `markIntroSeen()`                                                                     | `src/store/`       | Antigravity (intro)                  |
| `COMMAND_GUIDE` (lista de comandos con sus campos de guía)                                               | `@/store`          | Antigravity (tarjetas)               |
| Filesystem inicial leído de `src/data/filesystem/workstation.json`                                       | `src/engine/`      | Codex escribe el JSON                |
| Textos de intro y diálogos                                                                               | `src/story/`       | Antigravity los muestra              |

## Tasks

| ID  | Specs          | Agente      | Ruta                       | Estado    |
| --- | -------------- | ----------- | -------------------------- | --------- |
| K1  | S1, S2, S4, S8 | Claude      | `feat/engine-game-events`  | pendiente |
| K2  | S1, S2         | Claude      | `feat/engine-story-intro`  | pendiente |
| K3  | todas          | Claude      | integración y revisión     | pendiente |
| C1  | S5             | Codex       | `feat/terminal-network`    | pendiente |
| C2  | S5             | Codex       | `feat/terminal-files`      | pendiente |
| C3  | S5             | Codex       | `feat/terminal-system`     | pendiente |
| C4  | S4             | Codex       | `feat/terminal-guide-data` | pendiente |
| C5  | S1, S5         | Codex       | `feat/data-day-one`        | pendiente |
| A1  | S2, S6         | Antigravity | `feat/ui-title-intro`      | pendiente |
| A2  | S3, S7         | Antigravity | `feat/scenes-office`       | pendiente |
| A3  | S2, S7         | Antigravity | `feat/ui-desktop-os`       | pendiente |
| A4  | S4             | Antigravity | `feat/ui-command-guide`    | pendiente |
| A5  | S8             | Antigravity | `feat/ui-game-feedback`    | pendiente |

El detalle de cada tarea, con criterios de aceptación, está en `TASKS.md`.

**Orden y dependencias:**

1. En paralelo desde ya: K1, C1, C2, C3, A1, A2. Ninguno depende de otro.
2. Cuando K1 esté en `develop`: C4, C5, A3, A4, A5.
3. K3 al final de cada bloque: Claude revisa cada PR, integra en `App.tsx` y prueba en el navegador.

## Log

- **L1** (2026-11-18, Luis): "Siento que la terminal debería tener algo como que se note que es un videojuego. Estas palabras que deberían ir como en español para que la gente entienda. Y ¿qué más? Algo que cuadritos de instrucciones explicando cuando necesitan ayuda, qué hace, cómo puede hacerlo, con algún ejemplo. Siento que falta eso. También como algo tipo pincelar o 2D, como que mostrando el juego, pues contando la historia, no solamente como mostrando la terminal del juego y ya. No, la cosa que se muestra como si fuera tipo videojuego y un muñequito, alguna cosa, como si estuviera en un computador, dar la investigación en internet para utilizar alguna cosa 3D o algo, como hacen las creaciones, que se puede utilizar, como algún computadorcito uno entrando y entrar a la terminal y hacer las cosas. Ingéniatelas, piénsalas, tienes a codes y a antigravity con argón 4 para animación 3D y todo esto, y mirar qué podemos hacer para darle una buena mejora en la visualización de diseño y rápido, y que todo funcione para explicar bien todos estos temas."
- **L2** (2026-11-18): Luis aprueba 3D low-poly sobre 2D pixel art.
- **L3** (2026-11-18, Luis): "La cosa es como mirar, usar las opciones que tienen algunos juegos como Hacker Simulator, pero más a la vida real, más a lo que se vivía ahora. También mirar Light Hack y cosas así como para Python, para hacer seguridad, ser alguien que está comenzando a trabajar y es nuevo y le toca esto y comienza a evolucionar, a mejorar, conseguir una pista, no sé, mirando cómo podemos mejorar todo eso."
- **L4** (2026-11-18, Luis): "No sé, sería mejor que lo combinemos, miremos cómo utilizar eso que ya hicimos. Lo otro sería que se vea un poquito bien, no sé, comenzar con la historia al principio, con un texto o algo y pum, ya sale la terminal con el computador. La cosa es como que pensemos cómo sería el inicio, cómo se vería todo, no sé, como un cuadrito pixelado o algo de un cuadrito donde están los muñequitos andando por ahí, mirando qué hacer. Eh, Mostrar también cosas que nos pueden ayudar y explicarle mejor a la persona, eh, todo ese tema, cómo se mueve todo eso. Lo otro es, pues puedes investigar otros tipos de juegos, solamente además de Hacker Simulator, otros juegos que podemos usar, que se puede ayudar. La cosa es crear como una página donde esté todo eso liviano y rápido en un navegador. Y explicar, también necesito que hagan más comandos, el ipconfi para ver el IP, cosas así, principiantes, faltan más comandos, muy básico lo que me pusiste. Porfa, piensa, ponlo a trabajar, déjale tareas largas a los dos agentes para que creen las cosas, reaten las cosas, o que pongan a sus agentes a trabajar también ellos. Puedes que les deje las tareas planeadas de una vez para hacer la construcción, después tú ya combinas, revisas y metes todo. Cosas que mires bien la construcción de esto, piensa más, investiga, revisa."
- **L5** (2026-11-18): Decisión de Claude: "Light Hack" no apareció en la búsqueda, así que el diseño se basa en Hacker Simulator, OverTheWire Bandit, simuladores de SOC, Terminus y bashcrawl. La escena pixelada se logra con 3D a baja resolución, sin librerías nuevas (ver ADR-005). Python con sandbox queda para la Fase 3.
- **Siguiente paso:** K1 (eventos, canal de contratos, `COMMAND_GUIDE`, flag de intro).
