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
  posX: number;
  posY: number;
  posZ: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  scale: number;
  explode: number;
  spin: number;
  bgR: number;
  bgG: number;
  bgB: number;
}

export const shotToTarget = (s: Shot): SceneTarget => ({
  camX: s.cam[0],
  camY: s.cam[1],
  camZ: s.cam[2],
  tgtX: s.target[0],
  tgtY: s.target[1],
  tgtZ: s.target[2],
  posX: s.pos[0],
  posY: s.pos[1],
  posZ: s.pos[2],
  rotX: s.rot[0],
  rotY: s.rot[1],
  rotZ: s.rot[2],
  scale: s.scale,
  explode: s.explode,
  spin: s.spin,
  bgR: s.bg[0],
  bgG: s.bg[1],
  bgB: s.bg[2],
});

export const targetToShot = (t: SceneTarget): Shot => ({
  cam: [t.camX, t.camY, t.camZ],
  target: [t.tgtX, t.tgtY, t.tgtZ],
  pos: [t.posX, t.posY, t.posZ],
  rot: [t.rotX, t.rotY, t.rotZ],
  scale: t.scale,
  explode: t.explode,
  spin: t.spin,
  bg: [t.bgR, t.bgG, t.bgB],
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
