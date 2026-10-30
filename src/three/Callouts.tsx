'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';
import { MODEL } from '@/config/product';
import { TOUR, type Dimension } from '@/config/tour';
import { useExperience } from '@/store/useExperience';

// Half extents of the scan in scene units (from the bounding box).
const L = (MODEL.lengthMm / 1000) * MODEL.scale * 0.5;
const H = (MODEL.heightMm / 1000) * MODEL.scale;
const W = (MODEL.widthMm / 1000) * MODEL.scale * 0.5;
const TICK = 0.08;

type Pts = [number, number, number][];

/** Dimension lines like a tech pack: measured extents with end ticks and a label. */
const DIMENSIONS: Record<Dimension, { line: Pts; ticks: Pts[]; label: [number, number, number]; text: string }> = {
  length: {
    line: [
      [-L, 0.02, W + 0.32],
      [L, 0.02, W + 0.32],
    ],
    ticks: [
      [
        [-L, 0.02 - TICK, W + 0.32],
        [-L, 0.02 + TICK, W + 0.32],
      ],
      [
        [L, 0.02 - TICK, W + 0.32],
        [L, 0.02 + TICK, W + 0.32],
      ],
    ],
    label: [0, 0.02, W + 0.32],
    text: `${MODEL.lengthMm} mm`,
  },
  height: {
    line: [
      [L + 0.12, 0, 0],
      [L + 0.12, H, 0],
    ],
    ticks: [
      [
        [L + 0.12 - TICK, 0, 0],
        [L + 0.12 + TICK, 0, 0],
      ],
      [
        [L + 0.12 - TICK, H, 0],
        [L + 0.12 + TICK, H, 0],
      ],
    ],
    label: [L + 0.12, H / 2, 0],
    text: `${MODEL.heightMm} mm`,
  },
  width: {
    line: [
      [L * 0.42, 1.05, -W],
      [L * 0.42, 1.05, W],
    ],
    ticks: [
      [
        [L * 0.42 - TICK, 1.05, -W],
        [L * 0.42 + TICK, 1.05, -W],
      ],
      [
        [L * 0.42 - TICK, 1.05, W],
        [L * 0.42 + TICK, 1.05, W],
      ],
    ],
    label: [L * 0.42, 1.05, W + 0.16],
    text: `${MODEL.widthMm} mm`,
  },
};

/**
 * Callouts pinned to points on the scan and measured dimension lines, shown for
 * the active tour step. They live in product space, so they follow every camera
 * move. Decorative for assistive tech: the same facts are in the DOM copy.
 */
export function Callouts() {
  const step = useExperience((s) => s.tourStep);
  const active = TOUR[step];

  return (
    <group>
      {TOUR.map((t, i) => (
        <Html key={t.id} position={t.callout.at} center zIndexRange={[1, 0]} style={{ pointerEvents: 'none' }}>
          <div className="pin3d" data-active={i === step} aria-hidden="true">
            <span className="pin3d__dot" />
            <span className="pin3d__label">{t.callout.label}</span>
          </div>
        </Html>
      ))}
      {(Object.keys(DIMENSIONS) as Dimension[]).map((d) => (
        <DimensionLine key={d} id={d} visible={active?.dimension === d} />
      ))}
    </group>
  );
}

function DimensionLine({ id, visible }: { id: Dimension; visible: boolean }) {
  const spec = DIMENSIONS[id];
  const group = useRef<THREE.Group>(null);
  const opacity = useRef(0);
  const color = useMemo(() => new THREE.Color('#15171c'), []);

  useFrame((state, delta) => {
    const goal = visible ? 1 : 0;
    if (Math.abs(opacity.current - goal) < 0.01) {
      opacity.current = goal;
    } else {
      opacity.current = THREE.MathUtils.damp(opacity.current, goal, 8, Math.min(delta, 0.1));
      state.invalidate();
    }
    group.current?.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.Material | undefined;
      if (m && 'opacity' in m) {
        // Annotations read on top of the model, like a drawing overlay.
        m.depthTest = false;
        m.transparent = true;
        m.opacity = opacity.current;
      }
    });
    if (group.current) group.current.visible = opacity.current > 0.01;
  });

  return (
    <group ref={group} renderOrder={10}>
      <Line points={spec.line} color={color} lineWidth={1.5} />
      {spec.ticks.map((t, i) => (
        <Line key={i} points={t} color={color} lineWidth={1.5} />
      ))}
      <Html position={spec.label} center zIndexRange={[1, 0]} style={{ pointerEvents: 'none' }}>
        <span className="dim3d" data-visible={visible} aria-hidden="true">
          {spec.text}
        </span>
      </Html>
    </group>
  );
}
