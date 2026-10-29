import * as THREE from 'three';
import { ParametricGeometry } from 'three/addons/geometries/ParametricGeometry.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  collarEllipse,
  cosineSample,
  halfWidth,
  heelLean,
  midsoleBottom,
  midsoleTop,
  midsoleWidth,
  outsoleTop,
  sgnpow,
  smooth,
  SOLE_EXP,
  stackHeight,
  tAt,
  UPPER_SIDE_EXP,
  UPPER_TOP_EXP,
  UPPER_WIDTH,
  upperBase,
  upperFractionAt,
  upperHeight,
  upperSurfaceY,
  upperTop,
  xAt,
  yBottom,
} from './shoeProfile';

export interface ShoeDetail {
  /** Segments along the length. */
  u: number;
  /** Segments around the cross-section. */
  v: number;
  /** Lug grid spacing multiplier (larger = fewer instances). */
  lugSpacing: number;
}

export const DETAIL: Record<'high' | 'medium' | 'low', ShoeDetail> = {
  high: { u: 180, v: 56, lugSpacing: 1 },
  medium: { u: 120, v: 40, lugSpacing: 1.2 },
  low: { u: 72, v: 26, lugSpacing: 1.6 },
};

export interface InstanceLayout {
  matrices: THREE.Matrix4[];
}

export interface ShoeGeometries {
  outsole: THREE.BufferGeometry;
  lug: THREE.BufferGeometry;
  lugs: InstanceLayout;
  midsole: THREE.BufferGeometry;
  plate: THREE.BufferGeometry;
  energyLine: THREE.BufferGeometry;
  pods: THREE.BufferGeometry;
  insole: THREE.BufferGeometry;
  upper: THREE.BufferGeometry;
  collar: THREE.BufferGeometry;
  heelTab: THREE.BufferGeometry;
  overlays: THREE.BufferGeometry;
  tongue: THREE.BufferGeometry;
  laces: THREE.BufferGeometry;
  eyelet: THREE.BufferGeometry;
  eyelets: InstanceLayout;
  heelCounter: THREE.BufferGeometry;
}

const TAU = Math.PI * 2;

/** Rounds a sub-range [a, b] of the length into closed, pill-shaped ends. */
const localCap = (t: number, a: number, b: number, r = 0.035) => {
  const front = t < a + r ? Math.sqrt(Math.max(0, 1 - ((a + r - t) / r) ** 2)) : 1;
  const back = t > b - r ? Math.sqrt(Math.max(0, 1 - ((t - (b - r)) / r) ** 2)) : 1;
  return front * back;
};

/** Closed superellipse "slab" between two height curves - sole layers, sockliner, tongue. */
function slab(
  bottom: (t: number) => number,
  top: (t: number) => number,
  width: (t: number, s: number) => number,
  range: [number, number],
  d: Pick<ShoeDetail, 'u' | 'v'>,
  exp = SOLE_EXP,
) {
  return new ParametricGeometry(
    (u, v, target) => {
      const t = range[0] + (range[1] - range[0]) * cosineSample(u);
      const th = v * TAU;
      const yb = bottom(t);
      const yt = top(t);
      const ys = sgnpow(Math.sin(th), exp);
      const s = (ys + 1) / 2;
      target.set(xAt(t), yb + (yt - yb) * s, width(t, s) * sgnpow(Math.cos(th), exp));
    },
    d.u,
    d.v,
  );
}

/** Ribbon lying on (slightly proud of) a surface, defined by a centre-line and a normal-ish width direction. */
function ribbon(
  centre: (s: number) => THREE.Vector3,
  halfWidthAt: (s: number) => number,
  across: (s: number) => THREE.Vector3,
  segments: number,
) {
  return new ParametricGeometry(
    (u, v, target) => {
      const c = centre(u);
      target.copy(c).addScaledVector(across(u), (v * 2 - 1) * halfWidthAt(u));
    },
    segments,
    2,
  );
}

const PAD_HEEL: [number, number] = [0.012, 0.29];
const PAD_FORE: [number, number] = [0.55, 0.995];

function buildOutsole(d: ShoeDetail) {
  const pads = [PAD_HEEL, PAD_FORE].map((range) =>
    slab(
      yBottom,
      (t) => outsoleTop(t) + 0.004,
      (t) => midsoleWidth(t, 0) * 0.985 * localCap(t, range[0], range[1]),
      range,
      { u: Math.round(d.u * 0.45), v: Math.round(d.v * 0.6) },
    ),
  );
  const g = mergeGeometries(pads)!;
  pads.forEach((p) => p.dispose());
  return g;
}

function buildLugs(lugScale: number, spacing: number): InstanceLayout {
  const matrices: THREE.Matrix4[] = [];
  const lugH = 0.018 * lugScale;
  const dt = 0.03 * spacing;
  const dz = 0.095 * spacing;
  const q = new THREE.Quaternion();
  const zAxis = new THREE.Vector3(0, 0, 1);
  for (const [a, b] of [PAD_HEEL, PAD_FORE]) {
    let row = 0;
    for (let t = a + 0.03; t < b - 0.02; t += dt, row++) {
      const w = midsoleWidth(t, 0) * localCap(t, a, b) * 0.8 - 0.03;
      const slope = Math.atan2(yBottom(t + 0.001) - yBottom(t - 0.001), xAt(0.002) - xAt(0));
      q.setFromAxisAngle(zAxis, slope);
      const offset = row % 2 ? dz / 2 : 0;
      for (let z = -w + offset; z <= w; z += dz) {
        matrices.push(
          new THREE.Matrix4().compose(
            new THREE.Vector3(xAt(t), yBottom(t) - lugH / 2 + 0.003, z),
            q,
            new THREE.Vector3(1, lugH, 1),
          ),
        );
      }
    }
  }
  return { matrices };
}

function buildMidsole(stack: number, d: ShoeDetail) {
  return slab(midsoleBottom, (t) => midsoleTop(t, stack), midsoleWidth, [0, 1], d);
}

/** Point on the midsole sidewall at height fraction s, pushed out by `out`. */
const midsoleSide = (t: number, s: number, side: 1 | -1, stack: number, out = 0) =>
  new THREE.Vector3(
    xAt(t),
    midsoleBottom(t) + stackHeight(t, stack) * s,
    side * (midsoleWidth(t, s) + out),
  );

/** Full-length plate, visible as a thin carbon band sandwiched in the sidewall. */
function buildPlate(stack: number) {
  const parts: THREE.BufferGeometry[] = [];
  const range: [number, number] = [0.07, 0.94];
  const s = 0.42;
  for (const side of [1, -1] as const) {
    const t = (u: number) => range[0] + (range[1] - range[0]) * u;
    parts.push(
      ribbon(
        (u) => midsoleSide(t(u), s, side, stack, 0.004),
        (u) => 0.008 * Math.min(1, u * 15, (1 - u) * 15),
        () => new THREE.Vector3(0, 1, 0),
        140,
      ),
    );
  }
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
}

function buildEnergyLine(stack: number) {
  const parts: THREE.BufferGeometry[] = [];
  for (const side of [1, -1] as const) {
    const pts: THREE.Vector3[] = [];
    for (let t = 0.1; t <= 0.9; t += 0.02) pts.push(midsoleSide(t, 0.7, side, stack, 0.002));
    parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.006, 6, false));
  }
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
}

/** Adaptive Cushioning: twin pods set into the heel sidewall (visible windows). */
function buildPods(stack: number) {
  const parts: THREE.BufferGeometry[] = [];
  const t = 0.15;
  for (const side of [1, -1] as const) {
    const pod = new THREE.CapsuleGeometry(0.05, 0.36, 6, 18);
    pod.rotateZ(Math.PI / 2);
    pod.scale(1, 1, 0.5);
    const p = midsoleSide(t, 0.24, side, stack, -0.018);
    pod.translate(p.x, p.y, p.z);
    parts.push(pod);
  }
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
}

function upperPoint(t: number, th: number, stack: number, target: THREE.Vector3) {
  const w = halfWidth(t) * UPPER_WIDTH;
  const f = sgnpow(Math.sin(th), UPPER_TOP_EXP);
  return target.set(
    xAt(t) + heelLean(t, f),
    upperBase(t, stack) + upperHeight(t) * f,
    w * sgnpow(Math.cos(th), UPPER_SIDE_EXP),
  );
}

/** Knit upper with a real ankle opening cut out of it. */
function buildUpper(stack: number, d: ShoeDetail) {
  const g = new ParametricGeometry(
    (u, v, target) => upperPoint(cosineSample(u), v * Math.PI, stack, target),
    d.u,
    Math.round(d.v * 0.8),
  );
  const { cx, rx, rz } = collarEllipse();
  const pos = g.getAttribute('position');
  const index = g.getIndex()!;
  const kept: number[] = [];
  const c = new THREE.Vector3();
  for (let i = 0; i < index.count; i += 3) {
    c.set(0, 0, 0);
    for (let k = 0; k < 3; k++) {
      const vi = index.getX(i + k);
      c.x += pos.getX(vi) / 3;
      c.y += pos.getY(vi) / 3;
      c.z += pos.getZ(vi) / 3;
    }
    const inside = ((c.x - cx) / rx) ** 2 + (c.z / rz) ** 2 < 1;
    if (!inside) kept.push(index.getX(i), index.getX(i + 1), index.getX(i + 2));
  }
  g.setIndex(kept);
  return g;
}

/** Point on the rim of the ankle opening at angle a, sitting exactly on the knit surface. */
function collarPoint(a: number, stack: number) {
  const { cx, rx, rz } = collarEllipse();
  const x = cx + Math.cos(a) * rx;
  const z = Math.sin(a) * rz;
  const t = tAt(x);
  return new THREE.Vector3(x + heelLean(t, upperFractionAt(t, z)), upperSurfaceY(t, z, stack), z);
}

function buildCollar(stack: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < 96; i++) pts.push(collarPoint((i / 96) * TAU, stack));
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, 'centripetal'), 160, 0.042, 12, true);
}

function buildHeelTab(stack: number) {
  const back = collarPoint(Math.PI, stack);
  const tab = new RoundedBoxGeometry(0.035, 0.17, 0.13, 3, 0.015);
  tab.translate(0, 0.07, 0);
  tab.rotateZ(0.32);
  tab.translate(back.x - 0.012, back.y, 0);
  return tab;
}

/** Point on the upper's surface at length t, side (+1 lateral / -1 medial) and height fraction f. */
function upperSidePoint(t: number, side: 1 | -1, f: number, stack: number, inflate = 0) {
  const th = Math.asin(Math.min(1, Math.pow(f, 1 / UPPER_TOP_EXP)));
  const w = halfWidth(t) * UPPER_WIDTH;
  return new THREE.Vector3(
    xAt(t) + heelLean(t, f),
    upperBase(t, stack) + upperHeight(t) * f + inflate * 0.6 * f,
    side * (w * Math.pow(Math.cos(th), UPPER_SIDE_EXP) * (1 + inflate) + inflate * 0.25),
  );
}

/**
 * Midfoot cage: two welded TPU straps per side crossing into an "X" (the
 * product mark) and anchoring into the eyelet row - how racing uppers get
 * lockdown without bulk.
 */
function buildOverlays(stack: number) {
  const parts: THREE.BufferGeometry[] = [];
  const straps: [number, number, number, number, number][] = [
    // tStart, fStart, tEnd, fEnd, inflate
    [0.3, 0.04, 0.6, 0.93, 0.012],
    [0.66, 0.04, 0.42, 0.93, 0.02],
  ];
  for (const side of [1, -1] as const) {
    for (const [t0, f0, t1, f1, inflate] of straps) {
      const centre = (s: number) => upperSidePoint(t0 + (t1 - t0) * s, side, f0 + (f1 - f0) * s, stack, inflate);
      parts.push(
        ribbon(
          centre,
          (s) => 0.034 * (1 - 0.35 * s),
          () => new THREE.Vector3(1, 0, 0),
          60,
        ),
      );
    }
  }
  const g = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return g;
}

function buildHeelCounter(stack: number, d: ShoeDetail) {
  const reach = 0.2;
  const height = (t: number) => 0.38 * (1 - smooth(0.06, reach, t)) + 0.08;
  return new ParametricGeometry(
    (u, v, target) => {
      const side: 1 | -1 = u < 0.5 ? 1 : -1;
      const t = reach * Math.abs(1 - 2 * u);
      const p = upperSidePoint(t, side, v * height(t), stack, 0.03);
      p.x -= 0.012 * (1 - smooth(0, 0.08, t));
      target.copy(p);
    },
    Math.round(d.u * 0.5),
    8,
  );
}

const LACE_ROWS = 6;
const LACE_T0 = 0.445;
const LACE_DT = 0.043;
const LACE_Z = 0.155;

function buildLaces(stack: number) {
  const parts: THREE.BufferGeometry[] = [];
  const eyelets: THREE.Matrix4[] = [];
  const q = new THREE.Quaternion();
  const tongueTop = (t: number) => upperTop(t, stack) + 0.04;
  for (let k = 0; k < LACE_ROWS; k++) {
    const t = LACE_T0 + k * LACE_DT;
    for (const side of [1, -1] as const) {
      const ey = new THREE.Vector3(xAt(t), upperSurfaceY(t, LACE_Z, stack) + 0.004, side * LACE_Z);
      q.setFromEuler(new THREE.Euler(Math.PI / 2 - side * 0.5, 0, 0));
      eyelets.push(new THREE.Matrix4().compose(ey, q, new THREE.Vector3(1, 1, 1)));
    }
    if (k === LACE_ROWS - 1) break;
    const tn = t + LACE_DT;
    // Criss-cross: one lace runs lateral -> medial, the other medial -> lateral.
    for (const dir of [1, -1] as const) {
      const a = new THREE.Vector3(xAt(t), upperSurfaceY(t, LACE_Z, stack) + 0.01, -dir * LACE_Z);
      const b = new THREE.Vector3(xAt(tn), upperSurfaceY(tn, LACE_Z, stack) + 0.01, dir * LACE_Z);
      const tm = (t + tn) / 2;
      const peak = tongueTop(tm) + (dir > 0 ? 0.012 : 0);
      const curve = new THREE.CatmullRomCurve3([
        a,
        new THREE.Vector3(xAt(t + LACE_DT * 0.25), peak - 0.012, -dir * LACE_Z * 0.55),
        new THREE.Vector3(xAt(tm), peak, 0),
        new THREE.Vector3(xAt(t + LACE_DT * 0.75), peak - 0.012, dir * LACE_Z * 0.55),
        b,
      ]);
      const tube = new THREE.TubeGeometry(curve, 24, 0.013, 6, false);
      // Flat-knit lace: squash the tube vertically.
      tube.translate(0, -peak, 0);
      tube.scale(1, 0.55, 1);
      tube.translate(0, peak, 0);
      parts.push(tube);
    }
  }
  // Bow on the top row.
  const tTop = LACE_T0 + 0.01;
  const yTop = tongueTop(tTop) + 0.012;
  for (const side of [1, -1] as const) {
    const pts = [
      new THREE.Vector3(xAt(tTop), yTop, 0),
      new THREE.Vector3(xAt(tTop) - 0.1, yTop + 0.06, side * 0.08),
      new THREE.Vector3(xAt(tTop) - 0.16, yTop + 0.01, side * 0.2),
      new THREE.Vector3(xAt(tTop) - 0.05, yTop - 0.01, side * 0.09),
    ];
    parts.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, 0.011, 6, true));
    const tail = new THREE.CatmullRomCurve3([
      new THREE.Vector3(xAt(tTop), yTop, 0),
      new THREE.Vector3(xAt(tTop) + 0.02, yTop - 0.04, side * 0.12),
      new THREE.Vector3(xAt(tTop) - 0.02, yTop - 0.12, side * 0.22),
    ]);
    parts.push(new THREE.TubeGeometry(tail, 24, 0.011, 6, false));
  }
  const laces = mergeGeometries(parts)!;
  parts.forEach((p) => p.dispose());
  return { laces, eyelets: { matrices: eyelets } };
}

function buildTongue(stack: number, d: ShoeDetail) {
  const range: [number, number] = [0.33, 0.7];
  const lift = (t: number) => 0.065 * (1 - smooth(0.33, 0.47, t));
  return slab(
    (t) => upperTop(t, stack) - 0.01 + lift(t),
    (t) => upperTop(t, stack) + 0.028 + lift(t),
    (t) => 0.165 * localCap(t, range[0], range[1], 0.05),
    range,
    { u: Math.round(d.u * 0.4), v: 20 },
    0.3,
  );
}

export function buildShoeGeometries(detail: ShoeDetail, opts: { stack: number; lugScale: number }): ShoeGeometries {
  const { stack, lugScale } = opts;
  const insoleRange: [number, number] = [0.02, 0.98];
  const { laces, eyelets } = buildLaces(stack);
  return {
    outsole: buildOutsole(detail),
    lug: new THREE.CylinderGeometry(0.036, 0.04, 1, 6),
    lugs: buildLugs(lugScale, detail.lugSpacing),
    midsole: buildMidsole(stack, detail),
    plate: buildPlate(stack),
    energyLine: buildEnergyLine(stack),
    pods: buildPods(stack),
    insole: slab(
      (t) => midsoleTop(t, stack) - 0.04,
      (t) => midsoleTop(t, stack) + 0.01,
      (t) => halfWidth(t) * 0.86 * localCap(t, insoleRange[0], insoleRange[1], 0.06),
      insoleRange,
      { u: Math.round(detail.u * 0.5), v: 16 },
      0.3,
    ),
    upper: buildUpper(stack, detail),
    collar: buildCollar(stack),
    heelTab: buildHeelTab(stack),
    overlays: buildOverlays(stack),
    tongue: buildTongue(stack, detail),
    laces,
    eyelet: new THREE.TorusGeometry(0.02, 0.006, 8, 18),
    eyelets,
    heelCounter: buildHeelCounter(stack, detail),
  };
}

export function disposeShoeGeometries(g: ShoeGeometries) {
  Object.values(g).forEach((value) => {
    if (value instanceof THREE.BufferGeometry) value.dispose();
  });
}

type V3 = [number, number, number];

/** Anchor points (shoe-local, assembled) used by hotspots and exploded-view labels. */
export function shoeAnchors(stack = 1) {
  const arr = (v: THREE.Vector3) => v.toArray() as V3;
  return {
    cushioning: arr(midsoleSide(0.15, 0.24, 1, stack, 0.02)),
    aeromesh: arr(upperSidePoint(0.72, 1, 0.55, stack, 0.02)),
    grip: [xAt(0.74), yBottom(0.74) - 0.04, 0] as V3,
    outsole: [xAt(0.82), yBottom(0.82), midsoleWidth(0.82, 0)] as V3,
    midsole: arr(midsoleSide(0.32, 0.5, 1, stack)),
    insole: [xAt(0.75), midsoleTop(0.75, stack), 0.2] as V3,
    upper: arr(upperSidePoint(0.8, 1, 0.5, stack)),
    tongue: [xAt(0.36), upperTop(0.36, stack) + 0.16, 0.1] as V3,
    laces: [xAt(0.55), upperTop(0.55, stack) + 0.05, 0.12] as V3,
    heelCounter: arr(upperSidePoint(0.04, 1, 0.3, stack, 0.04)),
  };
}
