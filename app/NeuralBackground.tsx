"use client";

import { useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Keep visuals, reduce GPU load for laptop/LinkedIn browsers.
const NODE_COUNT = 280;
const CONNECTIONS_PER_NODE = 4;
const CONNECTION_MAX_DIST = 4.0;

function getNodePositions(): Float32Array {
  const arr = new Float32Array(NODE_COUNT * 3);
  for (let i = 0; i < NODE_COUNT; i++) {
    arr[i * 3] = (Math.random() - 0.5) * 20;
    arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
    arr[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }
  return arr;
}

function buildConnectionSegments(positions: Float32Array): Float32Array {
  const segments: number[] = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const ix = i * 3;
    const x0 = positions[ix];
    const y0 = positions[ix + 1];
    const z0 = positions[ix + 2];
    const neighbors: { j: number; d: number }[] = [];
    for (let j = 0; j < NODE_COUNT; j++) {
      if (i === j) continue;
      const jx = j * 3;
      const dx = positions[jx] - x0;
      const dy = positions[jx + 1] - y0;
      const dz = positions[jx + 2] - z0;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d < CONNECTION_MAX_DIST) neighbors.push({ j, d });
    }
    neighbors.sort((a, b) => a.d - b.d);
    for (let k = 0; k < Math.min(CONNECTIONS_PER_NODE, neighbors.length); k++) {
      const j = neighbors[k].j;
      if (i < j) {
        segments.push(x0, y0, z0);
        segments.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]);
      }
    }
  }
  return new Float32Array(segments);
}

function NeuralNetworkScene() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, segmentArray } = useMemo(() => {
    const pos = getNodePositions();
    const seg = buildConnectionSegments(pos);
    return { positions: pos, segmentArray: seg };
  }, []);

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(segmentArray, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [segmentArray]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.03;
    const tilt = Math.sin(state.clock.elapsedTime * 0.06) * 0.05;
    if (lineRef.current) {
      lineRef.current.rotation.y = t;
      lineRef.current.rotation.x = tilt;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t;
      pointsRef.current.rotation.x = tilt;
    }
  });

  return (
    <group>
      <lineSegments ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial
          color="#f59e0b"
          transparent
          opacity={0.3}
          depthWrite={false}
        />
      </lineSegments>
      <Points ref={pointsRef} positions={positions} stride={3}>
        <PointMaterial
          transparent
          color="#fbbf24"
          size={0.12}
          sizeAttenuation
          depthWrite={false}
          opacity={0.55}
        />
      </Points>
    </group>
  );
}

export default function NeuralBackground() {
  const lostOnceRef = useRef(false);

  useEffect(() => {
    // Reset between mounts.
    lostOnceRef.current = false;
  }, []);

  return (
    <Canvas
      camera={{ position: [0, 0, 12], fov: 55 }}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: true,
      }}
      dpr={[1, 1.25]}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        const onLost = (e: Event) => {
          e.preventDefault?.();
          if (lostOnceRef.current) return;
          lostOnceRef.current = true;
          window.dispatchEvent(new Event("neuralbg:webglcontextlost"));
        };
        canvas.addEventListener("webglcontextlost", onLost as any, { passive: false } as any);
      }}
    >
      <NeuralNetworkScene />
    </Canvas>
  );
}
