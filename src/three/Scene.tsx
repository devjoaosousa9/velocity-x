'use client';

import { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useProgress } from '@react-three/drei';
import { useExperience, type QualityTier } from '@/store/useExperience';
import { stepTier, TIER_SETTINGS } from '@/lib/quality';
import { CameraRig } from './CameraRig';
import { GroundShadow, Lighting } from './Lighting';
import { RealShoe } from './RealShoe';
import { Callouts } from './Callouts';

export default function Scene({ cap }: { cap: QualityTier }) {
  const tier = useExperience((s) => s.quality);
  const color = useExperience((s) => s.config.color);
  const setRenderStatus = useExperience((s) => s.setRenderStatus);
  const settings = TIER_SETTINGS[tier];

  return (
    <Canvas
      // Render only when something changes; the rig keeps invalidating while in motion.
      frameloop="demand"
      dpr={settings.dpr}
      camera={{ fov: 30, near: 0.1, far: 80, position: [2.5, 2, 8] }}
      // Transparent: the page (and the hero wordmark) shows through behind the shoe.
      gl={{ antialias: settings.antialias, alpha: true, powerPreference: 'high-performance', stencil: false }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
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
      <ReportProgress />
      <Lighting tier={tier} />
      <Suspense fallback={null}>
        <CameraRig>
          <RealShoe color={color} />
          <GroundShadow tier={tier} />
          <Callouts />
        </CameraRig>
        <ReadySignal />
      </Suspense>
    </Canvas>
  );
}

/** Mirrors the loader's real byte progress into the store for the DOM loading state. */
function ReportProgress() {
  const { progress } = useProgress();
  const setLoadProgress = useExperience((s) => s.setLoadProgress);
  useEffect(() => setLoadProgress(progress), [progress, setLoadProgress]);
  return null;
}

/** Flags the scene as ready once the model has loaded and a frame is drawn - no artificial delay. */
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
