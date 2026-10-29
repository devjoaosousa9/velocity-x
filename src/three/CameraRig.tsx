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
 *  - Scroll director   -> writes `sceneTarget` (desired pose) only.
 *  - Configurator UI   -> writes `turntable` (yaw/pitch/zoom) in the store only.
 *  - CameraRig         -> the ONLY code that writes camera.position, the look-at
 *                         target and the shoe group's transform, damping toward
 *                         the composed goal every frame.
 */
export function CameraRig({ children }: { children: ReactNode }) {
  const { camera, scene, size, invalidate } = useThree();
  const shoe = useRef<THREE.Group>(null);
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
      posGoal: new THREE.Vector3(),
      quatGoal: new THREE.Quaternion(),
      turn: new THREE.Quaternion(),
      spin: new THREE.Quaternion(),
      euler: new THREE.Euler(),
      bg: new THREE.Color(),
      up: new THREE.Vector3(0, 1, 0),
      first: true,
      spinAngle: 0,
    }),
    [],
  );

  // Wake the on-demand render loop whenever something upstream changes.
  useEffect(() => onSceneTargetChange(() => invalidate()), [invalidate]);
  useEffect(() => useExperience.subscribe(() => invalidate()), [invalidate]);

  useEffect(() => {
    if (!(scene.background instanceof THREE.Color)) scene.background = new THREE.Color('#07080a');
  }, [scene]);

  useFrame((state, rawDelta) => {
    const delta = Math.min(rawDelta, 0.1);
    const s = useExperience.getState();
    const isReduced = reducedRef.current;
    const shot = adaptShotForAspect(targetToShot(sceneTarget), size.width / Math.max(1, size.height));
    const configuring = s.mode === 'configure';

    // Intro: camera glides in and lights reveal; skipped under reduced motion.
    if (isReduced) liveState.reveal = 1;
    else liveState.reveal = Math.min(1, liveState.reveal + delta / 2.4);
    const intro = 1 - easeOutCubic(liveState.reveal);

    // ---- product
    tmp.posGoal.set(shot.pos[0], shot.pos[1] - intro * 0.5, shot.pos[2]);
    tmp.quatGoal.setFromEuler(tmp.euler.set(shot.rot[0], shot.rot[1] - intro * 1.2, shot.rot[2]));
    if (!isReduced && shot.spin > 0) tmp.spinAngle += delta * 0.22 * shot.spin;
    else tmp.spinAngle = THREE.MathUtils.damp(tmp.spinAngle, Math.round(tmp.spinAngle / (Math.PI * 2)) * Math.PI * 2, 2, delta);
    tmp.spin.setFromAxisAngle(tmp.up, Math.sin(tmp.spinAngle) * 0.45);
    tmp.quatGoal.premultiply(tmp.spin);
    if (configuring) {
      tmp.turn.setFromEuler(tmp.euler.set(s.turntable.pitch, s.turntable.yaw, 0, 'YXZ'));
      tmp.quatGoal.premultiply(tmp.turn);
    }

    // ---- camera
    tmp.lookGoal.set(...shot.target);
    tmp.camGoal.set(shot.cam[0], shot.cam[1] + intro * 0.6, shot.cam[2] + intro * 3.2);
    if (configuring) tmp.camGoal.sub(tmp.lookGoal).multiplyScalar(1 / s.turntable.zoom).add(tmp.lookGoal);

    const explodeGoal = s.explodeOverride ?? shot.explode;
    const k = isReduced || tmp.first ? 1 : 1 - Math.exp(-delta * 3.6);
    const g = shoe.current;

    // On the very first frame snap to the goal so there is no fly-in from origin.
    camera.position.lerp(tmp.camGoal, tmp.first && !isReduced ? 1 : k);
    tmp.look.lerp(tmp.lookGoal, tmp.first ? 1 : k);
    camera.lookAt(tmp.look);
    if (g) {
      g.position.lerp(tmp.posGoal, k);
      g.quaternion.slerp(tmp.quatGoal, k);
      g.scale.setScalar(THREE.MathUtils.lerp(g.scale.x, shot.scale, k));
    }
    liveState.explode = THREE.MathUtils.lerp(liveState.explode, explodeGoal, isReduced ? 1 : 1 - Math.exp(-delta * 4));

    const bg = scene.background as THREE.Color;
    tmp.bg.setRGB(shot.bg[0] / 255, shot.bg[1] / 255, shot.bg[2] / 255, THREE.SRGBColorSpace);
    bg.lerp(tmp.bg, k);
    tmp.first = false;

    // Keep rendering only while something is still moving (on-demand frameloop).
    const settled =
      camera.position.distanceToSquared(tmp.camGoal) < 1e-6 &&
      tmp.look.distanceToSquared(tmp.lookGoal) < 1e-6 &&
      (!g || (g.position.distanceToSquared(tmp.posGoal) < 1e-6 && g.quaternion.angleTo(tmp.quatGoal) < 1e-3)) &&
      Math.abs(liveState.explode - explodeGoal) < 1e-3 &&
      liveState.reveal >= 1 &&
      (isReduced || shot.spin === 0) &&
      Math.abs(Math.sin(tmp.spinAngle)) < 1e-3;
    if (!settled) state.invalidate();
  });

  return (
    <group ref={shoe} name="product-rig">
      {children}
    </group>
  );
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
