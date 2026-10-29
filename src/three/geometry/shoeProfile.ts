/**
 * Analytic description of the demo shoe: an elite road-racing "super shoe"
 * silhouette (high-stack rockered midsole with an embedded plate, low-volume
 * mesh upper, partial rubber outsole pads). Every part is generated from these
 * profile curves, so the parts fit together exactly and can be pulled apart for
 * the exploded view. Pure math, no three.js - unit-tested in tests/unit.
 *
 * Parameter t runs heel (0) -> toe (1). The shoe is 3 units long (~1 unit =
 * 95 mm, i.e. a US 9), toe on +X, ground at y ~ -0.42.
 */
export const SHOE_LENGTH = 3;
export const xAt = (t: number) => -SHOE_LENGTH / 2 + SHOE_LENGTH * t;
export const tAt = (x: number) => (x + SHOE_LENGTH / 2) / SHOE_LENGTH;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};
/** Sign-preserving power, used for superellipse cross-sections. */
export const sgnpow = (a: number, e: number) => Math.sign(a) * Math.pow(Math.abs(a), e);

type Knots = readonly (readonly [number, number])[];

/** Cubic Hermite interpolation with finite-difference tangents (smooth, no plateaus). */
export function hermite(points: Knots, t: number): number {
  const n = points.length;
  const first = points[0]!;
  const last = points[n - 1]!;
  if (t <= first[0]) return first[1];
  if (t >= last[0]) return last[1];
  let i = 0;
  while (t > points[i + 1]![0]) i++;
  const tangent = (k: number) => {
    const a = points[Math.max(0, k - 1)]!;
    const b = points[Math.min(n - 1, k + 1)]!;
    return (b[1] - a[1]) / (b[0] - a[0]);
  };
  const [t0, v0] = points[i]!;
  const [t1, v1] = points[i + 1]!;
  const h = t1 - t0;
  const s = (t - t0) / h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * v0 +
    (s3 - 2 * s2 + s) * h * tangent(i) +
    (-2 * s3 + 3 * s2) * v1 +
    (s3 - s2) * h * tangent(i + 1)
  );
}

/** Racing last: narrow heel, pinched arch, slim forefoot, tapered toe. */
const HALF_WIDTH: Knots = [
  [0, 0.3],
  [0.08, 0.355],
  [0.22, 0.35],
  [0.42, 0.315],
  [0.6, 0.425],
  [0.74, 0.455],
  [0.88, 0.395],
  [1, 0.25],
];

/** Upper height above the midsole: low collar, low-volume toe box. */
const UPPER_HEIGHT: Knots = [
  [0, 0.56],
  [0.07, 0.64],
  [0.2, 0.6],
  [0.36, 0.55],
  [0.5, 0.47],
  [0.64, 0.37],
  [0.8, 0.28],
  [0.92, 0.22],
  [1, 0.15],
];

const HEEL_R = 0.1;
const TOE_R = 0.15;
/** Quarter-ellipse caps round the footprint at heel and toe. */
export const capHeel = (t: number) => (t < HEEL_R ? Math.sqrt(Math.max(0, 1 - ((HEEL_R - t) / HEEL_R) ** 2)) : 1);
export const capToe = (t: number) =>
  t > 1 - TOE_R ? Math.sqrt(Math.max(0, 1 - ((t - (1 - TOE_R)) / TOE_R) ** 2)) : 1;

/** Footprint half-width at t (at the midsole/upper seam). */
export const halfWidth = (t: number) => hermite(HALF_WIDTH, t) * capHeel(t) * capToe(t);

/** Ground line: aggressive forefoot rocker and a bevelled heel. */
export const yBottom = (t: number) =>
  -0.42 + 0.3 * Math.pow(smooth(0.62, 1, t), 1.6) + 0.1 * Math.pow(1 - smooth(0, 0.16, t), 2);

/** Rubber pads are thin; the midfoot shows exposed foam. */
export const OUTSOLE_THICKNESS = 0.035;
export const outsoleTop = (t: number) => yBottom(t) + OUTSOLE_THICKNESS;
export const midsoleBottom = (t: number) => yBottom(t) + 0.03;

/** Max-cushion stack: ~44 mm heel, ~36 mm forefoot (8 mm drop), thinning at the toe. */
export const stackHeight = (t: number, stack = 1) =>
  stack * (0.46 - 0.085 * smooth(0.2, 0.78, t) - 0.07 * smooth(0.86, 1, t));
export const midsoleTop = (t: number, stack = 1) => midsoleBottom(t) + stackHeight(t, stack);

/**
 * Midsole half-width at height fraction s (0 = ground, 1 = top): flared base,
 * sculpted concave groove along the sidewall, extra heel flare for stability.
 */
export const midsoleWidth = (t: number, s: number) => {
  const flare = 1.13 - 0.13 * s + 0.07 * (1 - smooth(0, 0.18, t)) * (1 - s);
  const groove = 1 - 0.035 * Math.exp(-(((s - 0.56) / 0.12) ** 2));
  return halfWidth(t) * flare * groove;
};

export const upperHeight = (t: number) =>
  hermite(UPPER_HEIGHT, t) * (t > 1 - TOE_R ? Math.pow(capToe(t), 0.6) : 1);
export const upperBase = (t: number, stack = 1) => midsoleTop(t, stack) - 0.03;
export const upperTop = (t: number, stack = 1) => upperBase(t, stack) + upperHeight(t);

/** Exponents of the superellipse cross-sections. */
export const UPPER_SIDE_EXP = 0.6;
export const UPPER_TOP_EXP = 0.85;
export const UPPER_WIDTH = 0.96;
export const SOLE_EXP = 0.42;

/** Rolls the top of the heel forward so the counter reads as a curve, not a wall. */
export const heelLean = (t: number, f: number) => 0.14 * f * f * (1 - smooth(0, 0.16, t));

/**
 * Height fraction f (0-1) of the upper surface at lateral offset z, so callers
 * can place things exactly on the knit (collar, eyelets, overlays).
 */
export const upperFractionAt = (t: number, z: number) => {
  const w = halfWidth(t) * UPPER_WIDTH;
  if (w <= 1e-6) return 1;
  const c = Math.pow(clamp01(Math.abs(z) / w), 1 / UPPER_SIDE_EXP);
  return Math.pow(Math.sqrt(Math.max(0, 1 - c * c)), UPPER_TOP_EXP);
};
export const upperSurfaceY = (t: number, z: number, stack = 1) =>
  upperBase(t, stack) + upperHeight(t) * upperFractionAt(t, z);

/** Ankle opening in top view (an ellipse), cut out of the upper. */
export const COLLAR = { tBack: 0.03, tFront: 0.4, rz: 0.245 } as const;
export const collarEllipse = () => {
  const xBack = xAt(COLLAR.tBack);
  const xFront = xAt(COLLAR.tFront);
  return { cx: (xBack + xFront) / 2, rx: (xFront - xBack) / 2, rz: COLLAR.rz };
};

/** Cosine spacing samples densely near heel/toe where curvature is highest. */
export const cosineSample = (u: number) => (1 - Math.cos(Math.PI * u)) / 2;
