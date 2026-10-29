'use client';

import { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import type { QualityTier } from '@/store/useExperience';
import { liveState } from './liveState';

/**
 * Studio lighting. Reflections come from an environment map rendered once from
 * Lightformers (softboxes) - a procedural "HDRI" that costs no download and
 * gives the clear-coat and metal parts crisp, art-directed highlights.
 */
export function Lighting({ tier }: { tier: QualityTier }) {
  const key = useRef<THREE.DirectionalLight>(null);
  const rim = useRef<THREE.SpotLight>(null);
  const fill = useRef<THREE.DirectionalLight>(null);

  useFrame(({ scene }) => {
    const r = liveState.reveal;
    // Progressive reveal: rim first, then key, then fill/environment.
    if (rim.current) rim.current.intensity = 40 * ease(r / 0.5);
    if (key.current) key.current.intensity = 2.6 * ease((r - 0.2) / 0.6);
    if (fill.current) fill.current.intensity = 0.55 * ease((r - 0.4) / 0.6);
    scene.environmentIntensity = 0.85 * ease((r - 0.3) / 0.7);
  });

  const envRes = tier === 'high' ? 256 : tier === 'medium' ? 128 : 64;

  return (
    <>
      <ambientLight intensity={0.08} />
      <directionalLight ref={key} position={[4, 6, 5]} color="#f4f6ff" intensity={0} />
      <directionalLight ref={fill} position={[-5, 1.5, 3]} color="#8fa8ff" intensity={0} />
      <spotLight
        ref={rim}
        position={[-3, 3.5, -5]}
        angle={0.6}
        penumbra={0.8}
        color="#5b8cff"
        intensity={0}
        distance={20}
        decay={1.6}
      />
      <Environment resolution={envRes} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-6, 1, 1]} rotation-y={Math.PI / 2} scale={[10, 1.2, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[6, 0.5, 2]} rotation-y={-Math.PI / 2} scale={[10, 0.8, 1]} />
        <Lightformer form="ring" color="#3d7bff" intensity={3} position={[0, 1, -8]} scale={4} />
      </Environment>
      {tier !== 'low' ? (
        <ContactShadows
          position={[0, -0.95, 0]}
          opacity={0.55}
          scale={9}
          blur={2.6}
          far={2.2}
          resolution={tier === 'high' ? 1024 : 512}
          frames={Infinity}
          color="#000000"
        />
      ) : (
        <BlobShadow />
      )}
    </>
  );
}

/** Cheapest possible grounding for low-tier GPUs: one transparent quad. */
function BlobShadow() {
  return (
    <mesh position={[0, -0.95, 0]} rotation-x={-Math.PI / 2}>
      <circleGeometry args={[2, 32]} />
      <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
    </mesh>
  );
}

const ease = (t: number) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};
