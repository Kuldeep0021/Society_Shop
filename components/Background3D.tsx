'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function RotatingStars() {
  const ref = useRef<THREE.Group>(null);
  
  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.x -= delta / 20;
      ref.current.rotation.y -= delta / 30;
    }
  });

  return (
    <group ref={ref}>
      <Stars radius={50} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 -z-20 w-full h-full opacity-70 pointer-events-none bg-[#022c22]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <color attach="background" args={['#022c22']} />
        <ambientLight intensity={0.5} />
        <RotatingStars />
      </Canvas>
    </div>
  );
}
