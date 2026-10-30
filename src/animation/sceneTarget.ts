import { SHOTS, type Shot } from '@/config/shots';

/**
 * Mutable, non-React target pose written by the scroll director and read by the
 * CameraRig every frame. Keeping it outside React avoids re-rendering the tree
 * 60x per second while scrolling.
 */
export interface SceneTarget {
  camX: number;
  camY: number;
  camZ: number;
  tgtX: number;
  tgtY: number;
  tgtZ: number;
  yaw: number;
  spin: number;
  portraitDy: number;
}

export const shotToTarget = (s: Shot): SceneTarget => ({
  camX: s.cam[0],
  camY: s.cam[1],
  camZ: s.cam[2],
  tgtX: s.target[0],
  tgtY: s.target[1],
  tgtZ: s.target[2],
  yaw: s.yaw,
  spin: s.spin,
  portraitDy: s.portraitDy ?? 0,
});

export const targetToShot = (t: SceneTarget): Shot => ({
  cam: [t.camX, t.camY, t.camZ],
  target: [t.tgtX, t.tgtY, t.tgtZ],
  yaw: t.yaw,
  spin: t.spin,
  portraitDy: t.portraitDy,
});

export const sceneTarget: SceneTarget = shotToTarget(SHOTS.hero);

type Listener = () => void;
const listeners = new Set<Listener>();

/** The canvas subscribes so on-demand rendering wakes up when scroll moves the target. */
export const onSceneTargetChange = (fn: Listener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export const notifySceneTarget = () => listeners.forEach((fn) => fn());
