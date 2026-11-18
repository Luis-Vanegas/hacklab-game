// Escena Three.js de lluvia digital (MatrixRain).
// Renderiza columnas de partículas descendentes en un solo Points buffer para mantener
// 60 FPS sin sobrecargar el hilo principal.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface MatrixRainProps {
  readonly traceLevel?: number;
  readonly dropCount?: number;
}

export interface RainBuffer {
  readonly positions: Float32Array;
  readonly speeds: Float32Array;
}

export function createRainBuffer(dropCount: number): RainBuffer {
  const safeCount = Math.max(32, Math.min(1200, dropCount));
  const positions = new Float32Array(safeCount * 3);
  const speeds = new Float32Array(safeCount);

  for (let i = 0; i < safeCount; i++) {
    // Distribución determinista por índice para evitar parpadeos y facilitar tests
    const seedA = ((i * 73) % 100) / 100;
    const seedB = ((i * 41) % 100) / 100;
    const seedC = ((i * 29) % 100) / 100;

    positions[i * 3] = (seedA - 0.5) * 18;
    positions[i * 3 + 1] = (seedB - 0.5) * 12;
    positions[i * 3 + 2] = (seedC - 0.5) * 8 - 3;
    speeds[i] = 1.4 + seedC * 2.2;
  }

  return { positions, speeds };
}

export function MatrixRain({ traceLevel = 0, dropCount = 320 }: MatrixRainProps) {
  const pointsRef = useRef<THREE.Points | null>(null);
  const rain = useMemo(() => createRainBuffer(dropCount), [dropCount]);

  const geometry = useMemo(() => {
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(rain.positions, 3));
    return geom;
  }, [rain]);

  const color = traceLevel >= 75 ? "#ff3e3e" : traceLevel >= 40 ? "#ffaa00" : "#00ff41";

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) return;

    const positionAttr = points.geometry.getAttribute("position");
    if (!(positionAttr instanceof THREE.BufferAttribute)) return;

    const array = positionAttr.array as Float32Array;
    const speedMultiplier = traceLevel >= 75 ? 1.8 : 1;

    for (let i = 0; i < rain.speeds.length; i++) {
      const yIndex = i * 3 + 1;
      const currentY = array[yIndex] ?? 0;
      const speed = (rain.speeds[i] ?? 1.5) * speedMultiplier;
      const nextY = currentY - delta * speed;
      array[yIndex] = nextY < -6 ? 6 : nextY;
    }

    positionAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial color={color} size={0.08} transparent opacity={0.45} sizeAttenuation />
    </points>
  );
}
