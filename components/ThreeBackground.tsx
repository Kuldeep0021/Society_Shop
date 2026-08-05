'use client';

import { useEffect, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshWobbleMaterial } from '@react-three/drei';
import { useRef } from 'react';
import type { Mesh, Group } from 'three';

function GroceryShapes() {
  const groupRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Abstract floating grocery shapes */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        {/* Apple-like sphere */}
        <mesh position={[-2.2, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.6, 32, 32]} />
          <MeshWobbleMaterial color="#ef4444" factor={0.3} speed={1} />
        </mesh>
      </Float>

      <Float speed={1.5} rotationIntensity={1.2} floatIntensity={2}>
        {/* Box (carton) */}
        <mesh position={[2, -0.5, -1]} castShadow>
          <boxGeometry args={[0.9, 0.9, 0.9]} />
          <MeshWobbleMaterial color="#f59e0b" factor={0.2} speed={1.5} />
        </mesh>
      </Float>

      <Float speed={1.8} rotationIntensity={1} floatIntensity={2}>
        {/* Cylinder (can/bottle) */}
        <mesh position={[0, 1.5, -1.5]} castShadow>
          <cylinderGeometry args={[0.35, 0.35, 0.9, 32]} />
          <MeshWobbleMaterial color="#10b981" factor={0.3} speed={1.2} />
        </mesh>
      </Float>

      <Float speed={2.2} rotationIntensity={1.5} floatIntensity={2}>
        {/* Orange sphere */}
        <mesh position={[1.5, 1, 0.5]} castShadow>
          <sphereGeometry args={[0.45, 32, 32]} />
          <MeshWobbleMaterial color="#fb923c" factor={0.3} speed={1.8} />
        </mesh>
      </Float>

      <Float speed={1.6} rotationIntensity={1} floatIntensity={2}>
        {/* Torus (ring/basket handle feel) */}
        <mesh position={[-1.5, -1.2, 0.5]} castShadow>
          <torusGeometry args={[0.5, 0.18, 16, 32]} />
          <MeshWobbleMaterial color="#8b5cf6" factor={0.2} speed={1} />
        </mesh>
      </Float>

      <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
        {/* Small accent sphere */}
        <mesh position={[0.5, -1.8, 1]} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <MeshWobbleMaterial color="#06b6d4" factor={0.4} speed={2} />
        </mesh>
      </Float>
    </group>
  );
}

function isWebGLAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

export default function ThreeBackground() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(isWebGLAvailable());
  }, []);

  if (supported === null) {
    // SSR / first paint: show gradient fallback to avoid layout shift.
    return <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-emerald-50/50 to-transparent" />;
  }

  if (!supported) {
    // Static gradient fallback when WebGL is not available.
    return (
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-transparent" />
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 via-emerald-50/30 to-transparent" />
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, -5, -5]} intensity={0.5} color="#10b981" />
        <Suspense fallback={null}>
          <GroceryShapes />
        </Suspense>
      </Canvas>
    </div>
  );
}
