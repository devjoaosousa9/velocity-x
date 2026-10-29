'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { getColor, getMaterial, getVariant } from '@/config/product';
import type { ProductConfig } from '@/types/product';
import { createKnitTexture, createWeaveTexture } from './textures';

export interface ShoeMaterials {
  upper: THREE.MeshPhysicalMaterial;
  lining: THREE.MeshStandardMaterial;
  overlay: THREE.MeshPhysicalMaterial;
  plate: THREE.MeshPhysicalMaterial;
  midsole: THREE.MeshPhysicalMaterial;
  outsole: THREE.MeshStandardMaterial;
  insole: THREE.MeshStandardMaterial;
  laces: THREE.MeshStandardMaterial;
  metal: THREE.MeshPhysicalMaterial;
  energy: THREE.MeshBasicMaterial;
  pods: THREE.MeshPhysicalMaterial;
}

type Tweened = { material: THREE.Material & { color: THREE.Color }; target: THREE.Color };

/**
 * Creates every shoe material exactly once and mutates them when the
 * configuration changes, so switching colours never recompiles shaders.
 * Colours cross-fade in linear space for a smooth material transition.
 */
export function useShoeMaterials(config: ProductConfig, instant: boolean) {
  const textures = useMemo(() => ({ knit: createKnitTexture(), weave: createWeaveTexture() }), []);

  const materials = useMemo<ShoeMaterials>(
    () => ({
      upper: new THREE.MeshPhysicalMaterial({ sheenRoughness: 0.45 }),
      // Inside of the shoe, seen through the ankle opening (back faces of the upper).
      lining: new THREE.MeshStandardMaterial({ color: '#15171c', roughness: 1, side: THREE.BackSide }),
      overlay: new THREE.MeshPhysicalMaterial({
        roughness: 0.32,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
      plate: new THREE.MeshPhysicalMaterial({
        color: '#3a3e46',
        roughness: 0.28,
        metalness: 0.3,
        clearcoat: 1,
        side: THREE.DoubleSide,
      }),
      midsole: new THREE.MeshPhysicalMaterial({ roughness: 0.52, clearcoat: 0.35, clearcoatRoughness: 0.4 }),
      outsole: new THREE.MeshStandardMaterial({ roughness: 0.9 }),
      insole: new THREE.MeshStandardMaterial({ color: '#2a2d34', roughness: 0.95 }),
      laces: new THREE.MeshStandardMaterial({ roughness: 0.72 }),
      metal: new THREE.MeshPhysicalMaterial({
        color: '#c3c9d3',
        metalness: 1,
        roughness: 0.26,
        clearcoat: 0.6,
        side: THREE.DoubleSide,
      }),
      energy: new THREE.MeshBasicMaterial({ toneMapped: false }),
      pods: new THREE.MeshPhysicalMaterial({
        roughness: 0.15,
        clearcoat: 1,
        transparent: true,
        opacity: 0.92,
        emissiveIntensity: 0.6,
      }),
    }),
    [],
  );

  const tweens = useRef<Tweened[]>([]);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    const color = getColor(config.color);
    const finish = getMaterial(config.material);
    const variant = getVariant(config.variant);
    const { upper, midsole, outsole, laces, energy, pods, overlay } = materials;

    upper.roughness = finish.roughness;
    upper.metalness = finish.metalness;
    upper.clearcoat = finish.clearcoat;
    upper.clearcoatRoughness = 0.18;
    upper.sheen = finish.sheen;
    upper.sheenColor.set(color.upper).lerp(new THREE.Color('#ffffff'), 0.35);
    const relief = finish.pattern === 'knit' ? textures.knit : finish.pattern === 'weave' ? textures.weave : null;
    if (relief) relief.repeat.set(finish.pattern === 'knit' ? 34 : 46, finish.pattern === 'knit' ? 9 : 12);
    upper.bumpMap = relief;
    upper.bumpScale = finish.relief * 1.6;
    upper.needsUpdate = true;

    pods.emissive.set(color.accent);

    const targets: [Tweened['material'], string][] = [
      [upper, color.upper],
      [midsole, color.midsole],
      [overlay, color.overlay],
      [outsole, variant.outsoleColor],
      [laces, color.accent],
      [pods, color.accent],
    ];
    tweens.current = targets.map(([material, hex]) => ({ material, target: new THREE.Color(hex) }));
    // Energy line brightness encodes the variant (Elite glows hardest).
    const glow = new THREE.Color(color.accent).multiplyScalar(variant.glow);
    tweens.current.push({ material: energy, target: glow });

    if (instant) tweens.current.forEach((t) => t.material.color.copy(t.target));
    // The store change may already have rendered a frame before this effect ran.
    invalidate();
  }, [config.color, config.material, config.variant, materials, textures, instant, invalidate]);

  useFrame((state, delta) => {
    let moving = false;
    const k = 1 - Math.exp(-delta * 7);
    for (const t of tweens.current) {
      const c = t.material.color;
      if (Math.abs(c.r - t.target.r) + Math.abs(c.g - t.target.g) + Math.abs(c.b - t.target.b) > 0.002) {
        c.lerp(t.target, k);
        moving = true;
      } else {
        c.copy(t.target);
      }
    }
    if (moving) state.invalidate();
  });

  useEffect(
    () => () => {
      Object.values(materials).forEach((m: THREE.Material) => m.dispose());
      textures.knit?.dispose();
      textures.weave?.dispose();
    },
    [materials, textures],
  );

  return materials;
}
