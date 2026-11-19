// Escena Three.js de red de nodos animada (NetworkGraph).
// Visualiza topología de red con el nodo del operador y los nodos objetivo,
// intensificando velocidad y color cuando hay sesión remota o aumenta el traceLevel.

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export interface NetworkGraphProps {
  readonly connectedTo?: string | null;
  readonly traceLevel?: number;
  readonly nodeCount?: number;
}

export interface GraphTopology {
  readonly nodes: readonly [number, number, number][];
  readonly edgePositions: Float32Array;
}

// Generador determinista para que la topología sea estable entre renders y testeable
export function buildGraphTopology(nodeCount: number): GraphTopology {
  const safeCount = Math.max(4, Math.min(48, nodeCount));
  const nodes: [number, number, number][] = [];

  for (let i = 0; i < safeCount; i++) {
    const angle = (i / safeCount) * Math.PI * 2;
    const ring = i % 2 === 0 ? 3.2 : 5.1;
    const x = Math.cos(angle) * ring;
    const y = Math.sin(angle * 1.5) * 1.8;
    const z = Math.sin(angle) * ring * 0.65 - 2;
    nodes.push([x, y, z]);
  }

  const segments: number[] = [];
  for (let i = 0; i < safeCount; i++) {
    const current = nodes[i];
    const next = nodes[(i + 1) % safeCount];
    const cross = nodes[(i + 3) % safeCount];
    if (current && next) {
      segments.push(...current, ...next);
    }
    if (i % 2 === 0 && current && cross) {
      segments.push(...current, ...cross);
    }
  }

  return {
    nodes,
    edgePositions: new Float32Array(segments),
  };
}

export function NetworkGraph({
  connectedTo = null,
  traceLevel = 0,
  nodeCount = 18,
}: NetworkGraphProps) {
  const groupRef = useRef<THREE.Group | null>(null);
  const topology = useMemo(() => buildGraphTopology(nodeCount), [nodeCount]);

  const edgeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(topology.edgePositions, 3));
    return geometry;
  }, [topology]);

  const primaryColor = useMemo(() => {
    if (traceLevel >= 75) return "#ff3e3e";
    if (connectedTo) return "#00bfff";
    return "#00ff41";
  }, [connectedTo, traceLevel]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const speed = connectedTo ? 0.18 : 0.08;
    groupRef.current.rotation.y += delta * speed;
    groupRef.current.rotation.x = Math.sin(groupRef.current.rotation.y * 0.5) * 0.12;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={edgeGeometry}>
        <lineBasicMaterial color={primaryColor} transparent opacity={0.22} />
      </lineSegments>

      {topology.nodes.map((position, index) => {
        const isTargetNode = index === 0 && connectedTo !== null;
        return (
          <mesh key={index} position={position}>
            <sphereGeometry args={[isTargetNode ? 0.16 : 0.09, 12, 12]} />
            <meshBasicMaterial
              color={isTargetNode ? "#ffd700" : primaryColor}
              transparent
              opacity={isTargetNode ? 0.9 : 0.65}
            />
          </mesh>
        );
      })}
    </group>
  );
}
