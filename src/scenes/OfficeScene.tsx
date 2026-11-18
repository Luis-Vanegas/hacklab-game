// Escena 3D "La oficina" (Nodo Seguro, Medellín).
// Renderiza una oficina low-poly con estilo pixelado (<Canvas dpr={0.35}> + image-rendering: pixelated),
// el personaje del jugador sentado frente a su computador, al menos 2 compañeros caminando por rutas
// fijas, iluminación día/noche (prop `night`) y transición de cámara de ~1,2 s hacia el monitor
// antes de invocar `onEnterComputer()`.

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useGLTF } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface OfficeSceneProps {
  readonly night?: boolean;
  readonly onEnterComputer: () => void;
  readonly disableWebGL?: boolean;
}

export interface WalkWaypoint {
  readonly x: number;
  readonly z: number;
}

export interface WalkerPose {
  readonly x: number;
  readonly z: number;
  readonly rotationY: number;
  readonly stridePhase: number;
}

export const ZOOM_DURATION_SECONDS = 1.2;

export const COWORKER_ROUTES: readonly (readonly WalkWaypoint[])[] = [
  [
    { x: -3.2, z: -1.6 },
    { x: 3.2, z: -1.6 },
    { x: 3.2, z: 1.8 },
    { x: -3.2, z: 1.8 },
  ],
  [
    { x: 2.8, z: 2.2 },
    { x: -2.8, z: 2.2 },
    { x: -2.8, z: -0.4 },
    { x: 2.8, z: -0.4 },
  ],
];

// Interpolación determinista a lo largo de una ruta cerrada de waypoints
export function interpolateRoute(
  route: readonly WalkWaypoint[],
  elapsedSeconds: number,
  speed = 1.35,
): WalkerPose {
  if (route.length === 0) {
    return { x: 0, z: 0, rotationY: 0, stridePhase: 0 };
  }
  const first = route[0] ?? { x: 0, z: 0 };
  if (route.length === 1) {
    return { x: first.x, z: first.z, rotationY: 0, stridePhase: 0 };
  }

  const segmentLengths: number[] = [];
  let totalLength = 0;

  for (let i = 0; i < route.length; i++) {
    const a = route[i] ?? first;
    const b = route[(i + 1) % route.length] ?? first;
    const len = Math.hypot(b.x - a.x, b.z - a.z);
    segmentLengths.push(len);
    totalLength += len;
  }

  if (totalLength <= 0.0001) {
    return { x: first.x, z: first.z, rotationY: 0, stridePhase: 0 };
  }

  const distance = (((elapsedSeconds * speed) % totalLength) + totalLength) % totalLength;
  let accumulated = 0;

  for (let i = 0; i < route.length; i++) {
    const segLen = segmentLengths[i] ?? 1;
    if (accumulated + segLen >= distance || i === route.length - 1) {
      const a = route[i] ?? first;
      const b = route[(i + 1) % route.length] ?? first;
      const t = segLen > 0 ? (distance - accumulated) / segLen : 0;
      const x = a.x + (b.x - a.x) * t;
      const z = a.z + (b.z - a.z) * t;
      const rotationY = Math.atan2(b.x - a.x, b.z - a.z);
      const stridePhase = elapsedSeconds * speed * 4.5;
      return { x, z, rotationY, stridePhase };
    }
    accumulated += segLen;
  }

  return { x: first.x, z: first.z, rotationY: 0, stridePhase: 0 };
}

function canUseWebGL(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (typeof navigator !== "undefined" && /jsdom/i.test(navigator.userAgent)) {
    return false;
  }
  return true;
}

class ModelErrorBoundary extends Component<
  { readonly fallback: ReactNode; readonly children: ReactNode },
  { readonly hasError: boolean }
> {
  constructor(props: { readonly fallback: ReactNode; readonly children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { readonly hasError: boolean } {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function LoadedGltfAsset({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: {
  readonly url: string;
  readonly scale?: number;
  readonly position?: readonly [number, number, number];
  readonly rotation?: readonly [number, number, number];
}) {
  const gltf = useGLTF(url);
  const cloned = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  return (
    <primitive
      object={cloned}
      scale={scale}
      position={[position[0], position[1], position[2]]}
      rotation={[rotation[0], rotation[1], rotation[2]]}
    />
  );
}

function LowPolyAvatar({
  shirtColor,
  seated = false,
  stridePhase = 0,
}: {
  readonly shirtColor: string;
  readonly seated?: boolean;
  readonly stridePhase?: number;
}) {
  const leftLegAngle = seated ? -Math.PI / 2.3 : Math.sin(stridePhase) * 0.45;
  const rightLegAngle = seated ? -Math.PI / 2.3 : -Math.sin(stridePhase) * 0.45;
  const leftArmAngle = seated ? -0.55 : -Math.sin(stridePhase) * 0.35;
  const rightArmAngle = seated ? -0.55 : Math.sin(stridePhase) * 0.35;
  const bodyY = seated ? 0.52 : 0.72;

  return (
    <group position={[0, bodyY, 0]}>
      {/* Torso */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <boxGeometry args={[0.38, 0.46, 0.22]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>

      {/* Cabeza */}
      <mesh position={[0, 0.64, 0]} castShadow>
        <boxGeometry args={[0.26, 0.26, 0.26]} />
        <meshStandardMaterial color="#e0b187" roughness={0.7} />
      </mesh>

      {/* Cabello */}
      <mesh position={[0, 0.76, -0.02]}>
        <boxGeometry args={[0.28, 0.1, 0.28]} />
        <meshStandardMaterial color="#1d2230" roughness={0.9} />
      </mesh>

      {/* Brazo izquierdo */}
      <mesh position={[-0.26, 0.22, 0]} rotation={[leftArmAngle, 0, 0]}>
        <boxGeometry args={[0.12, 0.38, 0.12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>

      {/* Brazo derecho */}
      <mesh position={[0.26, 0.22, 0]} rotation={[rightArmAngle, 0, 0]}>
        <boxGeometry args={[0.12, 0.38, 0.12]} />
        <meshStandardMaterial color={shirtColor} roughness={0.8} />
      </mesh>

      {/* Pierna izquierda */}
      <mesh position={[-0.1, -0.14, seated ? 0.12 : 0]} rotation={[leftLegAngle, 0, 0]}>
        <boxGeometry args={[0.14, 0.42, 0.14]} />
        <meshStandardMaterial color="#1f293d" roughness={0.85} />
      </mesh>

      {/* Pierna derecha */}
      <mesh position={[0.1, -0.14, seated ? 0.12 : 0]} rotation={[rightLegAngle, 0, 0]}>
        <boxGeometry args={[0.14, 0.42, 0.14]} />
        <meshStandardMaterial color="#1f293d" roughness={0.85} />
      </mesh>
    </group>
  );
}

function WorkstationDesk({
  position,
  rotationY = 0,
  isPlayerDesk = false,
  night = false,
  onSelectMonitor,
}: {
  readonly position: readonly [number, number, number];
  readonly rotationY?: number;
  readonly isPlayerDesk?: boolean;
  readonly night?: boolean;
  readonly onSelectMonitor?: () => void;
}) {
  const screenColor = isPlayerDesk ? "#00ff41" : "#00bfff";
  const emissiveIntensity = night ? (isPlayerDesk ? 2.4 : 1.1) : isPlayerDesk ? 1.1 : 0.55;

  return (
    <group position={[position[0], position[1], position[2]]} rotation={[0, rotationY, 0]}>
      {/* Superficie del escritorio */}
      <mesh position={[0, 0.74, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.65, 0.08, 0.85]} />
        <meshStandardMaterial color="#2a2f3d" roughness={0.75} />
      </mesh>

      {/* Patas */}
      <mesh position={[-0.74, 0.36, -0.35]}>
        <boxGeometry args={[0.08, 0.72, 0.08]} />
        <meshStandardMaterial color="#161922" />
      </mesh>
      <mesh position={[0.74, 0.36, -0.35]}>
        <boxGeometry args={[0.08, 0.72, 0.08]} />
        <meshStandardMaterial color="#161922" />
      </mesh>
      <mesh position={[-0.74, 0.36, 0.35]}>
        <boxGeometry args={[0.08, 0.72, 0.08]} />
        <meshStandardMaterial color="#161922" />
      </mesh>
      <mesh position={[0.74, 0.36, 0.35]}>
        <boxGeometry args={[0.08, 0.72, 0.08]} />
        <meshStandardMaterial color="#161922" />
      </mesh>

      {/* Silla */}
      <group position={[0, 0, 0.62]}>
        <ModelErrorBoundary
          fallback={
            <mesh position={[0, 0.42, 0]}>
              <boxGeometry args={[0.48, 0.48, 0.48]} />
              <meshStandardMaterial color="#1f2433" />
            </mesh>
          }
        >
          <Suspense fallback={null}>
            <LoadedGltfAsset url="/models/chair.glb" scale={0.45} rotation={[0, Math.PI, 0]} />
          </Suspense>
        </ModelErrorBoundary>
      </group>

      {/* Computador CC0 + pantalla emisiva interactiva */}
      <group
        position={[0, 0.78, -0.12]}
        onClick={(e) => {
          if (isPlayerDesk && onSelectMonitor) {
            e.stopPropagation();
            onSelectMonitor();
          }
        }}
      >
        <ModelErrorBoundary fallback={null}>
          <Suspense fallback={null}>
            <LoadedGltfAsset url="/models/computer.glb" scale={0.35} />
          </Suspense>
        </ModelErrorBoundary>

        {/* Marco del monitor */}
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[0.72, 0.46, 0.06]} />
          <meshStandardMaterial color="#10131a" roughness={0.6} />
        </mesh>

        {/* Pantalla luminosa */}
        <mesh position={[0, 0.34, 0.035]}>
          <planeGeometry args={[0.64, 0.38]} />
          <meshStandardMaterial
            color={screenColor}
            emissive={screenColor}
            emissiveIntensity={emissiveIntensity}
          />
        </mesh>

        {/* Teclado */}
        <mesh position={[0, 0.02, 0.24]}>
          <boxGeometry args={[0.46, 0.03, 0.16]} />
          <meshStandardMaterial color="#181c26" />
        </mesh>
      </group>

      {/* Lámpara de escritorio CC0 */}
      <ModelErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <LoadedGltfAsset url="/models/desk_lamp.glb" scale={0.35} position={[0.58, 0.78, -0.2]} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

function WalkingCoworker({
  route,
  shirtColor,
  timeOffset = 0,
}: {
  readonly route: readonly WalkWaypoint[];
  readonly shirtColor: string;
  readonly timeOffset?: number;
}) {
  const groupRef = useRef<THREE.Group | null>(null);
  const [stridePhase, setStridePhase] = useState(0);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;
    const pose = interpolateRoute(route, clock.getElapsedTime() + timeOffset, 1.25);
    group.position.set(pose.x, 0, pose.z);
    group.rotation.y = pose.rotationY;
    setStridePhase(pose.stridePhase);
  });

  return (
    <group ref={groupRef}>
      <LowPolyAvatar shirtColor={shirtColor} stridePhase={stridePhase} />
      <ModelErrorBoundary fallback={null}>
        <Suspense fallback={null}>
          <LoadedGltfAsset url="/models/character.glb" scale={0.28} position={[0, 0, 0]} />
        </Suspense>
      </ModelErrorBoundary>
    </group>
  );
}

function CameraController({
  zooming,
  onZoomFinished,
}: {
  readonly zooming: boolean;
  readonly onZoomFinished: () => void;
}) {
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const startPos = useMemo(() => new THREE.Vector3(0, 4.6, 5.8), []);
  const targetMonitorPos = useMemo(() => new THREE.Vector3(0, 1.22, 0.42), []);
  const startLookAt = useMemo(() => new THREE.Vector3(0, 0.9, 0), []);
  const monitorLookAt = useMemo(() => new THREE.Vector3(0, 1.12, -0.12), []);

  useFrame(({ camera }, delta) => {
    if (!zooming) {
      camera.position.copy(startPos);
      camera.lookAt(startLookAt);
      return;
    }

    progressRef.current = Math.min(1, progressRef.current + delta / ZOOM_DURATION_SECONDS);
    // Suavizado exponencial
    const t = 1 - Math.pow(1 - progressRef.current, 3);

    camera.position.lerpVectors(startPos, targetMonitorPos, t);
    const currentLook = new THREE.Vector3().lerpVectors(startLookAt, monitorLookAt, t);
    camera.lookAt(currentLook);

    if (progressRef.current >= 1 && !completedRef.current) {
      completedRef.current = true;
      onZoomFinished();
    }
  });

  return null;
}

function OfficeWorld({
  night,
  zooming,
  onStartZoom,
  onZoomFinished,
}: {
  readonly night: boolean;
  readonly zooming: boolean;
  readonly onStartZoom: () => void;
  readonly onZoomFinished: () => void;
}) {
  const firstRoute = COWORKER_ROUTES[0] ?? [];
  const secondRoute = COWORKER_ROUTES[1] ?? [];

  return (
    <>
      <CameraController zooming={zooming} onZoomFinished={onZoomFinished} />

      {/* Iluminación diferenciada día vs noche */}
      <ambientLight intensity={night ? 0.14 : 0.78} color={night ? "#1a2442" : "#e8f0ff"} />
      <directionalLight
        position={[5, 8, 4]}
        intensity={night ? 0.18 : 1.15}
        color={night ? "#3b5284" : "#fff7e8"}
      />

      {/* En modo noche la pantalla del monitor del jugador es la fuente de luz principal */}
      <pointLight
        position={[0, 1.18, 0.18]}
        intensity={night ? 2.6 : 0.55}
        distance={night ? 5.5 : 2.5}
        color="#00ff41"
      />

      {/* Piso de la oficina */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[12, 9]} />
        <meshStandardMaterial color={night ? "#0d1018" : "#1b202e"} roughness={0.9} />
      </mesh>

      {/* Paredes traseras y laterales */}
      <mesh position={[0, 2, -4.5]}>
        <boxGeometry args={[12, 4, 0.2]} />
        <meshStandardMaterial color={night ? "#111521" : "#232a3b"} />
      </mesh>
      <mesh position={[-6, 2, 0]}>
        <boxGeometry args={[0.2, 4, 9]} />
        <meshStandardMaterial color={night ? "#0f131e" : "#1f2534"} />
      </mesh>

      {/* Escritorio central del jugador + jugador sentado */}
      <WorkstationDesk
        position={[0, 0, 0]}
        isPlayerDesk
        night={night}
        onSelectMonitor={onStartZoom}
      />
      <group position={[0, 0, 0.56]} rotation={[0, Math.PI, 0]}>
        <LowPolyAvatar shirtColor="#00bfff" seated />
      </group>

      {/* Escritorios de compañeros en Nodo Seguro */}
      <WorkstationDesk position={[-2.6, 0, -1.1]} night={night} />
      <WorkstationDesk position={[2.6, 0, -1.1]} night={night} />

      {/* Compañeros caminando por rutas fijas */}
      <WalkingCoworker route={firstRoute} shirtColor="#00ff88" timeOffset={0} />
      <WalkingCoworker route={secondRoute} shirtColor="#ffaa00" timeOffset={2.4} />
    </>
  );
}

export function OfficeScene({
  night = false,
  onEnterComputer,
  disableWebGL = false,
}: OfficeSceneProps) {
  const [zooming, setZooming] = useState(false);
  const enteredRef = useRef(false);
  const zoomTimerRef = useRef<number | null>(null);

  const webglReady = !disableWebGL && canUseWebGL();

  const finishEnter = useCallback(() => {
    if (enteredRef.current) return;
    enteredRef.current = true;
    if (zoomTimerRef.current !== null) {
      window.clearTimeout(zoomTimerRef.current);
      zoomTimerRef.current = null;
    }
    onEnterComputer();
  }, [onEnterComputer]);

  const startEnterComputer = useCallback(() => {
    if (enteredRef.current || zooming) return;
    setZooming(true);

    // Respaldo temporizado de ~1,2 s por si el navegador pausa requestAnimationFrame o corre en JSDOM
    zoomTimerRef.current = window.setTimeout(() => {
      finishEnter();
    }, ZOOM_DURATION_SECONDS * 1000);
  }, [zooming, finishEnter]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        event.preventDefault();
        startEnterComputer();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [startEnterComputer]);

  useEffect(() => {
    return () => {
      if (zoomTimerRef.current !== null) {
        window.clearTimeout(zoomTimerRef.current);
      }
    };
  }, []);

  return (
    <section
      className="hl-pixel-canvas"
      aria-label={night ? "Oficina Nodo Seguro de noche" : "Oficina Nodo Seguro de día"}
      style={{
        position: "relative",
        minBlockSize: "100dvh",
        inlineSize: "100%",
        backgroundColor: night ? "#06080d" : "#111622",
        overflow: "clip",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      data-testid="office-scene"
      data-mode={night ? "night" : "day"}
      data-zooming={zooming ? "true" : "false"}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        {webglReady ? (
          <Canvas
            dpr={0.35}
            camera={{ position: [0, 4.6, 5.8], fov: 50 }}
            gl={{ antialias: false }}
            style={{ imageRendering: "pixelated" }}
          >
            <OfficeWorld
              night={night}
              zooming={zooming}
              onStartZoom={startEnterComputer}
              onZoomFinished={finishEnter}
            />
          </Canvas>
        ) : null}
      </div>

      <header
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-sm)",
          padding: "var(--space-md)",
          background: "linear-gradient(to bottom, rgba(10, 10, 15, 0.85), transparent)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
          <span className={night ? "hl-badge hl-badge--warning" : "hl-badge hl-badge--primary"}>
            {night ? "TURNO NOCHE // DARKNET" : "TURNO DÍA // NODO SEGURO"}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.85rem",
              color: "var(--color-text)",
            }}
          >
            Medellín — Piso de Operaciones SOC
          </span>
        </div>
      </header>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "var(--space-md)",
          padding: "var(--space-md)",
          backgroundColor: "rgba(18, 18, 26, 0.92)",
          borderBlockStart: "1px solid var(--color-border)",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.86rem" }}>
          {zooming
            ? "Conectando con tu estación de trabajo..."
            : "Haz clic en tu computador o presiona Enter para sentarte frente al monitor."}
        </span>

        <button
          type="button"
          className="hl-btn hl-btn--primary"
          disabled={zooming}
          onClick={startEnterComputer}
          data-testid="enter-computer-btn"
        >
          {zooming ? "Acercando al monitor..." : "Usar mi computador"}
        </button>
      </footer>
    </section>
  );
}
