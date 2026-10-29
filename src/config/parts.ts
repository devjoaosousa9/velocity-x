import type { PartId } from '@/types/product';

export interface PartSpec {
  id: PartId;
  name: string;
  detail: string;
  /** Exploded-view offset in shoe-local units. */
  offset: [number, number, number];
  /** Stagger order: lower moves first. */
  order: number;
}

export const PARTS: PartSpec[] = [
  { id: 'outsole', name: 'Outsole', detail: 'Hex-lug rubber, 2 mm', offset: [0, -0.85, 0], order: 0 },
  { id: 'midsole', name: 'Midsole', detail: 'Adaptive foam + energy line', offset: [0, -0.4, 0], order: 1 },
  { id: 'insole', name: 'Sockliner', detail: 'Contoured EVA insert', offset: [0, 0.32, 0], order: 2 },
  { id: 'upper', name: 'Upper', detail: 'AeroMesh engineered knit', offset: [0, 0.78, 0], order: 3 },
  { id: 'heelCounter', name: 'Heel Counter', detail: 'Titanium-tone TPU clip', offset: [-0.75, 0.8, 0], order: 4 },
  { id: 'tongue', name: 'Tongue', detail: 'Gusseted, 4 mm foam', offset: [0.2, 1.32, 0], order: 5 },
  { id: 'laces', name: 'Laces', detail: 'Flat-knit, low-stretch', offset: [0.15, 1.78, 0], order: 6 },
];

/** Staggered per-part progress from a global explode amount (0-1). Pure, unit-tested. */
export function partProgress(explode: number, order: number, count = PARTS.length) {
  const spread = 0.45;
  const start = (order / Math.max(1, count - 1)) * spread;
  const t = Math.min(1, Math.max(0, (explode - start) / (1 - spread)));
  // easeInOutCubic
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
