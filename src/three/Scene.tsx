'use client';

import { lazy, Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { selectMotionReduced, useExperience, type QualityTier } from '@/store/useExperience';
import { stepTier, TIER_SETTINGS } from '@/lib/quality';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { ProceduralShoe } from './models/ProceduralShoe';
import { Annotations } from './Annotations';

// Post-processing is only downloaded when a high-tier device actually needs it.
const Effects = lazy(() => import('./Effects'));

export default function Scene({ cap }: { cap: QualityTier }) {
  const tier = useExperience((s) => s.quality);
  const config = useExperience((s) => s.config);
  const reduced = useExperience(selectMotionReduced);
  const setRenderStatus = useExperience((s) => s.setRenderStatus);
  const settings = TIER_SETTINGS[tier];

  return (
    <Canvas
      // Render only when something changes; the rig keeps invalidating while in motion.
      frameloop="demand"
      dpr={settings.dpr}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 0.6, 9] }}
      gl={{ antialias: settings.antialias, powerPreference: 'high-performance', alpha: false, stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.domElement.addEventListener('webglcontextlost', (e) => {
          e.preventDefault();
          setRenderStatus('error', 'The graphics context was lost.');
        });
      }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <AdaptiveQuality cap={cap} />
      <Lighting tier={tier} />
      <CameraRig>
        <ProceduralShoe config={config} tier={tier} instantMaterials={reduced} />
        <Annotations />
      </CameraRig>
      {settings.bloom && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
      <ReadySignal />
    </Canvas>
  );
}

/** Flags the scene as ready after the first frame is actually drawn - no artificial delay. */
function ReadySignal() {
  const done = useRef(false);
  const setRenderStatus = useExperience((s) => s.setRenderStatus);
  useFrame(() => {
    if (done.current) return;
    done.current = true;
    requestAnimationFrame(() => setRenderStatus('ready'));
  });
  return null;
}

/**
 * Measures frame time only across contiguous rendered frames (the loop is
 * on-demand, so idle gaps must not count as "slow frames") and steps the
 * quality tier down/up with hysteresis. Never exceeds the device cap.
 */
function AdaptiveQuality({ cap }: { cap: QualityTier }) {
  const setQuality = useExperience((s) => s.setQuality);
  const { invalidate } = useThree();
  const sample = useRef({ sum: 0, n: 0, swaps: 0, cooldown: 0 });

  useFrame((_, delta) => {
    const s = sample.current;
    if (delta > 0.25) return; // idle gap or tab switch, not a slow frame
    if (s.cooldown > 0) {
      s.cooldown -= 1;
      return;
    }
    s.sum += delta;
    s.n += 1;
    if (s.n < 90) return;
    const avg = s.sum / s.n;
    s.sum = 0;
    s.n = 0;
    if (s.swaps > 4) return; // stop flip-flopping
    const current = useExperience.getState().quality;
    if (avg > 1 / 32) {
      const next = stepTier(current, -1, cap);
      if (next !== current) {
        setQuality(next);
        s.swaps += 1;
        s.cooldown = 120;
      }
    } else if (avg < 1 / 58 && current !== cap) {
      setQuality(stepTier(current, 1, cap));
      s.swaps += 1;
      s.cooldown = 240;
    }
  });

  useEffect(() => invalidate(), [invalidate]);
  return null;
}
