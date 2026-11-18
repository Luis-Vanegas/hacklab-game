// Gestor de escenas 3D de fondo (SceneManager).
// Alterna entre NetworkGraph (exploración y contratos activos) y MatrixRain (arranque,
// menú, alerta crítica de rastreo o game_over) usando los hooks de @/store.

import { Canvas } from "@react-three/fiber";
import type { GamePhase } from "@/lib/types";
import { useConnectedTo, useGamePhase, useTraceLevel } from "@/store/hooks";
import { MatrixRain } from "./MatrixRain";
import { NetworkGraph } from "./NetworkGraph";

export type ActiveSceneKind = "network" | "matrix";

export interface SceneManagerProps {
  readonly phase?: GamePhase;
  readonly traceLevel?: number;
  readonly connectedTo?: string | null;
  readonly disableWebGL?: boolean;
}

export function selectSceneKind(phase: GamePhase, traceLevel: number): ActiveSceneKind {
  if (phase === "boot" || phase === "game_over" || traceLevel >= 80) {
    return "matrix";
  }
  return "network";
}

function canUseWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  // JSDOM no implementa WebGLContext; evitamos errores ruidosos en tests
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }
  return true;
}

export function SceneManager({
  phase: propPhase,
  traceLevel: propTraceLevel,
  connectedTo: propConnectedTo,
  disableWebGL = false,
}: SceneManagerProps = {}) {
  const storePhase = useGamePhase();
  const storeTrace = useTraceLevel();
  const storeConnectedTo = useConnectedTo();

  const phase = propPhase ?? storePhase;
  const traceLevel = propTraceLevel ?? storeTrace;
  const connectedTo = propConnectedTo !== undefined ? propConnectedTo : storeConnectedTo;

  const activeScene = selectSceneKind(phase, traceLevel);
  const webglReady = !disableWebGL && canUseWebGL();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity: 0.55,
      }}
      data-testid="scene-manager"
      data-active-scene={activeScene}
    >
      {webglReady ? (
        <Canvas camera={{ position: [0, 0, 8], fov: 55 }} dpr={[1, 1.5]}>
          {activeScene === "matrix" ? (
            <MatrixRain traceLevel={traceLevel} />
          ) : (
            <NetworkGraph connectedTo={connectedTo} traceLevel={traceLevel} />
          )}
        </Canvas>
      ) : null}
    </div>
  );
}
