/**
 * Camera + product "shots". Every visual state of the experience is one of these
 * declarative poses; the scroll director interpolates between them and the
 * CameraRig is the only system that writes them into the scene.
 *
 * Scene units: the scanned shoe is ~2.98 long (toe on +X), 1.52 tall (sole on
 * y = 0) and 1.16 wide; its lateral side faces +Z.
 */
export type Vec3 = readonly [number, number, number];

export interface Shot {
  cam: Vec3;
  target: Vec3;
  /** Product yaw in radians (the product only turns like a turntable). */
  yaw: number;
  /** Idle sway amount (0-1). Disabled under reduced motion. */
  spin: number;
  /** Extra vertical shift of the look-at target on phones (moves the product up the screen). */
  portraitDy?: number;
}

export const SHOTS = {
  hero: { cam: [2.7, 1.6, 7.4], target: [0.1, 0.3, 0], yaw: 0, spin: 1, portraitDy: -0.85 },
  // Scroll tour: the camera walks around a still product.
  side: { cam: [0.1, 0.9, 7.1], target: [-1.05, 0.55, 0], yaw: 0, spin: 0 },
  heel: { cam: [-4.9, 2.2, 3.6], target: [-1.75, 0.8, 0.5], yaw: 0, spin: 0 },
  top: { cam: [-1.35, 7.4, 0.5], target: [-1.35, 0.5, 0], yaw: 0, spin: 0 },
  front: { cam: [5.6, 1.15, 3], target: [0.2, 0.62, 1.2], yaw: 0, spin: 0 },
  // Configurator: product on the left, panel on the right.
  configure: { cam: [2.2, 1.5, 6.4], target: [1.05, 0.62, 0], yaw: 0, spin: 0 },
  // Closing section: product on the right.
  reserve: { cam: [2.2, 1.5, 6], target: [-1.35, 0.72, 0], yaw: 0.35, spin: 0.6 },
} satisfies Record<string, Shot>;

export type ShotId = keyof typeof SHOTS;

/**
 * Ordered narrative. Each DOM section owns a slice of the master timeline that
 * walks through `keys`, holding on each key for `hold` units so copy can be read.
 */
export interface SectionScript {
  section: string;
  keys: ShotId[];
  /**
   * Where each key is fully reached, as a 0-1 fraction of the section's scroll
   * range (section top at viewport centre -> section bottom at viewport centre).
   * The tour has four equal steps, so their centres sit at 1/8, 3/8, 5/8, 7/8.
   */
  marks: number[];
}

export const SCRIPT: SectionScript[] = [
  { section: 'hero', keys: ['hero', 'side'], marks: [0, 1] },
  { section: 'tour', keys: ['side', 'heel', 'top', 'front'], marks: [0.125, 0.375, 0.625, 0.875] },
  { section: 'colourways', keys: ['front', 'configure'], marks: [0, 0.42] },
  { section: 'details', keys: ['configure'], marks: [0] },
  { section: 'reserve', keys: ['configure', 'reserve'], marks: [0, 0.45] },
];

/**
 * Portrait and narrow screens can't fit side-by-side compositions, so the product
 * is re-centred and the camera pulled back. Pure function, unit-tested.
 */
export function adaptShotForAspect(shot: Shot, aspect: number): Shot {
  if (aspect >= 1.7) return shot;
  const [tx, ty, tz] = shot.target;
  const [cx, cy, cz] = shot.cam;
  if (aspect >= 1.05) {
    const pull = 1 + (1.7 - aspect) * 0.45;
    return { ...shot, cam: [tx + (cx - tx) * pull, ty + (cy - ty) * pull, tz + (cz - tz) * pull] };
  }
  // Portrait: 0 at the landscape edge, 1 for phones (~0.46).
  const t = Math.min(1, (1.05 - aspect) / 0.6);
  const lerp = (a: number, b: number) => a + (b - a) * t;
  const target: Vec3 = [lerp(tx, 0), lerp(ty, ty - 0.35 + (shot.portraitDy ?? 0)), lerp(tz, 0)];
  const pull = 1 + t * 1.05;
  return {
    ...shot,
    target,
    cam: [target[0] + (cx - tx) * pull, target[1] + (cy - ty) * pull, target[2] + (cz - tz) * pull],
  };
}
