/**
 * Camera + product "shots". Every visual state of the cinematic experience is
 * one of these declarative poses; the director interpolates between them and
 * the CameraRig is the only system that writes them into the scene.
 *
 * Units: the shoe is ~3 units long (toe on +X), sole at y ~ -0.35.
 */
export type Vec3 = readonly [number, number, number];

export interface Shot {
  cam: Vec3;
  target: Vec3;
  /** Shoe world position. */
  pos: Vec3;
  /** Shoe orientation as XYZ euler (radians), converted to a quaternion by the rig. */
  rot: Vec3;
  scale: number;
  /** 0 = assembled, 1 = fully exploded. */
  explode: number;
  /** Idle turntable spin amount (0 - 1). Disabled under reduced motion. */
  spin: number;
  /** Scene background (sRGB 0-255). */
  bg: Vec3;
}

const BG_DEEP: Vec3 = [7, 8, 10];
const BG_GRAPHITE: Vec3 = [13, 15, 20];
const BG_NAVY: Vec3 = [8, 15, 38];

const base = (s: Partial<Shot>): Shot => ({
  cam: [0, 0.6, 6.4],
  target: [0, 0.2, 0],
  pos: [0, 0, 0],
  rot: [0, 0, 0],
  scale: 1,
  explode: 0,
  spin: 0,
  bg: BG_DEEP,
  ...s,
});

export const SHOTS = {
  hero: base({ cam: [0, 0.5, 9.2], target: [0, -0.45, 0], pos: [0, 0.35, 0], rot: [0.14, -0.55, 0.06], spin: 1 }),
  // 02 - scroll story
  rotate: base({ cam: [0.2, 0.7, 6], target: [0.5, 0.2, 0], pos: [1, 0.1, 0], rot: [0.1, 0.9, 0.02] }),
  orient: base({ cam: [0, 1.1, 5.8], target: [-0.6, 0.2, 0], pos: [-1, 0.1, 0], rot: [0.7, 2.3, -0.25], bg: BG_GRAPHITE }),
  approach: base({ cam: [0.3, 0.5, 3.6], target: [0.55, 0.25, 0], pos: [0.2, 0.05, 0], rot: [0.18, -1.05, 0.04], bg: BG_GRAPHITE }),
  lateral: base({ cam: [0, 0.35, 4.6], target: [0.6, 0.3, 0], pos: [0.7, 0.05, 0], rot: [0.02, 0, 0] }),
  sole: base({ cam: [0, 0.3, 5.2], target: [-0.6, 0.25, 0], pos: [-0.8, 0.25, 0], rot: [-1.32, 0.25, 0.18] }),
  balanced: base({ cam: [0, 0.6, 6.2], target: [0, 0.25, 0], pos: [0, 0.15, 0], rot: [0.16, -0.7, 0.05] }),
  // 03 - engineering
  cushioning: base({ cam: [-1.5, 0.35, 3.8], target: [-0.6, 0, 0], pos: [0.5, 0.05, 0], rot: [0.04, 0.4, 0], bg: BG_GRAPHITE }),
  aeromesh: base({ cam: [0.4, 1.5, 4], target: [0.2, 0.45, 0], pos: [0.3, 0.05, 0], rot: [0.32, -0.35, 0], bg: BG_GRAPHITE }),
  grip: base({ cam: [0, 0.1, 4.8], target: [0.4, 0.2, 0], pos: [0.5, 0.25, 0], rot: [-1.38, -0.35, 0.1], bg: BG_GRAPHITE }),
  // 04 - exploded view
  exploded: base({ cam: [0, 0.9, 8.6], target: [0.4, 0.35, 0], pos: [0.9, 0.1, 0], rot: [0.22, -0.55, 0.05], explode: 1 }),
  // 05 - configurator
  configure: base({ cam: [0, 0.6, 6.4], target: [0.9, 0.2, 0], pos: [0, 0.15, 0], rot: [0.12, -0.6, 0.04] }),
  // 06 - editorial
  editorial: base({ cam: [0, 0.2, 5.4], target: [0.3, 0.25, 0], pos: [1.3, 0.25, 0], rot: [0.35, -2.4, 0.38], bg: BG_NAVY }),
  // 07 - purchase
  purchase: base({ cam: [0, 0.6, 6.6], target: [-0.6, 0.2, 0], pos: [-1.1, 0.15, 0], rot: [0.12, -0.55, 0.05], spin: 0.35 }),
} satisfies Record<string, Shot>;

export type ShotId = keyof typeof SHOTS;

/**
 * Ordered narrative. Each DOM section owns a slice of the master timeline that
 * walks through `keys`, holding on each key for `hold` units so copy can be read.
 */
export interface SectionScript {
  section: string;
  keys: ShotId[];
  hold: number;
}

export const SCRIPT: SectionScript[] = [
  { section: 'hero', keys: ['hero', 'rotate'], hold: 0 },
  { section: 'technology', keys: ['rotate', 'orient', 'approach', 'lateral', 'sole', 'balanced'], hold: 0.6 },
  { section: 'engineering', keys: ['balanced', 'cushioning', 'aeromesh', 'grip'], hold: 0.8 },
  { section: 'anatomy', keys: ['grip', 'exploded'], hold: 1.6 },
  { section: 'customize', keys: ['exploded', 'configure'], hold: 2 },
  { section: 'story', keys: ['configure', 'editorial'], hold: 1.2 },
  { section: 'buy', keys: ['editorial', 'purchase'], hold: 1 },
];

/**
 * Portrait screens can't fit side-by-side compositions, so the rig re-centres the
 * product and pulls the camera back. Pure function, unit-tested.
 */
export function adaptShotForAspect(shot: Shot, aspect: number): Shot {
  if (aspect >= 1.7) return shot;
  if (aspect >= 1.05) {
    // Narrow landscape (small laptops, tablets): keep the composition, back the camera off.
    const pull = 1 + (1.7 - aspect) * 0.4;
    const [tx, ty, tz] = shot.target;
    const c = shot.cam;
    return { ...shot, cam: [tx + (c[0] - tx) * pull, ty + (c[1] - ty) * pull, tz + (c[2] - tz) * pull] };
  }
  const t = Math.min(1, (1.05 - aspect) / 0.6); // 0 at landscape, 1 at ~0.45 (phones)
  const pull = 1 + t * 0.85;
  const lerp = (a: number, b: number) => a + (b - a) * t;
  return {
    ...shot,
    cam: [shot.cam[0] * (1 - t), shot.cam[1] * pull, shot.cam[2] * pull],
    target: [lerp(shot.target[0], 0), lerp(shot.target[1], shot.target[1] - 0.15), shot.target[2]],
    pos: [lerp(shot.pos[0], 0), lerp(shot.pos[1], shot.pos[1] + 0.35), shot.pos[2]],
  };
}
