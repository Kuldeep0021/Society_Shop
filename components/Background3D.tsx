'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sphere, MeshDistortMaterial } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function FloatingShapes() {
  const groupRef = useRef<THREE.Group>(null);

  // Very slowly rotate the entire background group
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Large glowing emerald sphere */}
      <Float speed={0.8} rotationIntensity={0.5} floatIntensity={1.5}>
        <Sphere args={[2, 32, 32]} position={[-4, 2, -5]}>
          <MeshDistortMaterial color="#059669" distort={0.3} speed={1.5} roughness={0.2} />
        </Sphere>
      </Float>
      
      {/* Medium dark green sphere */}
      <Float speed={1} rotationIntensity={0.8} floatIntensity={2}>
        <Sphere args={[1.5, 32, 32]} position={[4, -1, -3]}>
          <MeshDistortMaterial color="#10b981" distort={0.4} speed={2} roughness={0.1} />
        </Sphere>
      </Float>

      {/* Small bright accent sphere */}
      <Float speed={1.2} rotationIntensity={1} floatIntensity={2.5}>
        <Sphere args={[0.8, 32, 32]} position={[0, -3, -1]}>
          <MeshDistortMaterial color="#34d399" distort={0.2} speed={3} roughness={0.3} />
        </Sphere>
      </Float>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 -z-20 w-full h-full pointer-events-none bg-emerald-950">
      <Canvas camera={{ position: [0, 0, 8] }}>
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#ffffff" />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
