'use client';

import { ContactShadows, Environment, Lightformer } from '@react-three/drei';
import type { QualityTier } from '@/store/useExperience';

/**
 * Photo-studio lighting for a scanned product: a softbox environment rendered
 * once from Lightformers (no HDRI download), one key light for form, and a
 * contact shadow that grounds the shoe on the page.
 */
export function Lighting({ tier }: { tier: QualityTier }) {
  const envRes = tier === 'high' ? 256 : tier === 'medium' ? 128 : 64;
  return (
    <>
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 6, 5]} intensity={1.6} color="#ffffff" />
      <directionalLight position={[-5, 2.5, -3]} intensity={0.6} color="#dfe6ff" />
      <Environment resolution={envRes} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.3} position={[-7, 2, 2]} rotation-y={Math.PI / 2} scale={[12, 2, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[7, 1.5, 3]} rotation-y={-Math.PI / 2} scale={[12, 1.4, 1]} />
        <Lightformer form="rect" intensity={0.6} position={[0, 1, -8]} scale={[10, 3, 1]} />
      </Environment>
    </>
  );
}

/** Soft grounding shadow; it lives in product space so it turns with the shoe. */
export function GroundShadow({ tier }: { tier: QualityTier }) {
  if (tier === 'low') {
    return (
      <mesh position={[0, 0.002, 0]} rotation-x={-Math.PI / 2} scale={[1.9, 0.75, 1]}>
        <circleGeometry args={[1, 40]} />
        <meshBasicMaterial color="#000" transparent opacity={0.16} depthWrite={false} />
      </mesh>
    );
  }
  return (
    <ContactShadows
      position={[0, 0.002, 0]}
      opacity={0.42}
      scale={5}
      blur={2.2}
      far={1.6}
      resolution={tier === 'high' ? 1024 : 512}
      frames={Infinity}
      color="#1b2230"
    />
  );
}
