'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';

function FloatingOrbs() {
  return (
    <>
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sparkles count={150} scale={12} size={6} speed={0.4} opacity={0.6} color="#34d399" />
      </Float>
      <Float speed={1.5} rotationIntensity={2} floatIntensity={1.5}>
        <Sparkles count={100} scale={15} size={8} speed={0.2} opacity={0.3} color="#10b981" />
      </Float>
    </>
  );
}

export default function Background3D() {
  return (
    <div className="absolute inset-0 -z-20 w-full h-full pointer-events-none bg-emerald-950">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={1} />
        <FloatingOrbs />
      </Canvas>
    </div>
  );
}
