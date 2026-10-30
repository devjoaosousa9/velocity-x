'use client';

import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { adaptShotForAspect } from '@/config/shots';
import { onSceneTargetChange, sceneTarget, targetToShot } from '@/animation/sceneTarget';
import { selectMotionReduced, useExperience } from '@/store/useExperience';
import { liveState } from './liveState';

/**
 * The single owner of camera and product transforms.
 *
 * Ownership rules (prevents scroll / controls / animation fighting):
 *  - Scroll director  -> writes `sceneTarget` (desired pose) only.
 *  - Configurator UI  -> writes `turntable` (yaw/pitch/zoom) in the store only.
 *  - CameraRig        -> the ONLY code that writes camera.position, the look-at
 *                        target and the product's yaw, damping toward the composed
 *                        goal every frame (frame-rate independent).
 */
export function CameraRig({ children }: { children: ReactNode }) {
  const { camera, size, invalidate } = useThree();
  const product = useRef<THREE.Group>(null);
  const reduced = useExperience(selectMotionReduced);
  const reducedRef = useRef(reduced);
  useEffect(() => {
    reducedRef.current = reduced;
  }, [reduced]);

  const tmp = useMemo(
    () => ({
      camGoal: new THREE.Vector3(),
      lookGoal: new THREE.Vector3(),
      look: new THREE.Vector3(),
      quatGoal: new THREE.Quaternion(),
      euler: new THREE.Euler(0, 0, 0, 'YXZ'),
      first: true,
      sway: 0,
    }),
    [],
  );

  // Wake the on-demand render loop whenever something upstream changes.
  useEffect(() => onSceneTargetChange(() => invalidate()), [invalidate]);
  useEffect(() => useExperience.subscribe(() => invalidate()), [invalidate]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = useExperience.getState();
    const isReduced = reducedRef.current;
    const shot = adaptShotForAspect(targetToShot(sceneTarget), size.width / Math.max(1, size.height));
    const configuring = s.mode === 'configure';

    // Intro: the product turns into place on its turntable while the camera settles.
    liveState.reveal = isReduced ? 1 : Math.min(1, liveState.reveal + delta / 2.2);
    const intro = 1 - easeOutCubic(liveState.reveal);

    // Idle sway (a slow turntable oscillation), returns to rest when not wanted.
    if (!isReduced && shot.spin > 0 && !configuring) tmp.sway += delta * 0.32 * shot.spin;
    else tmp.sway = THREE.MathUtils.damp(tmp.sway, Math.round(tmp.sway / Math.PI) * Math.PI, 3, delta);

    const yaw = shot.yaw + Math.sin(tmp.sway) * 0.55 - intro * Math.PI * 0.9 + (configuring ? s.turntable.yaw : 0);
    const pitch = configuring ? s.turntable.pitch : 0;
    tmp.quatGoal.setFromEuler(tmp.euler.set(pitch, yaw, 0));

    tmp.lookGoal.set(shot.target[0], shot.target[1], shot.target[2]);
    tmp.camGoal.set(shot.cam[0], shot.cam[1] + intro * 0.5, shot.cam[2] + intro * 2.4);
    if (configuring) tmp.camGoal.sub(tmp.lookGoal).multiplyScalar(1 / s.turntable.zoom).add(tmp.lookGoal);

    const k = isReduced || tmp.first ? 1 : 1 - Math.exp(-delta * 3.4);
    camera.position.lerp(tmp.camGoal, k);
    tmp.look.lerp(tmp.lookGoal, k);
    camera.lookAt(tmp.look);
    const g = product.current;
    if (g) g.quaternion.slerp(tmp.quatGoal, isReduced ? 1 : 1 - Math.exp(-delta * 5));
    tmp.first = false;

    // Keep rendering only while something is still moving (on-demand frameloop).
    const settled =
      camera.position.distanceToSquared(tmp.camGoal) < 1e-6 &&
      tmp.look.distanceToSquared(tmp.lookGoal) < 1e-6 &&
      (!g || g.quaternion.angleTo(tmp.quatGoal) < 1e-3) &&
      liveState.reveal >= 1 &&
      (isReduced || shot.spin === 0 || configuring) &&
      Math.abs(Math.sin(tmp.sway)) < 1e-3;
    if (!settled) state.invalidate();
  });

  return (
    <group ref={product} name="product">
      {children}
    </group>
  );
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
