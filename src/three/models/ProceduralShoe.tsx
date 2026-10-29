'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getVariant } from '@/config/product';
import { PARTS, partProgress } from '@/config/parts';
import type { ProductConfig } from '@/types/product';
import type { QualityTier } from '@/store/useExperience';
import { buildShoeGeometries, DETAIL, disposeShoeGeometries } from '../geometry/buildShoe';
import { useShoeMaterials } from '../materials/useShoeMaterials';
import { liveState } from '../liveState';

interface Props {
  config: ProductConfig;
  tier: QualityTier;
  instantMaterials: boolean;
}

/**
 * Demonstration racing shoe built from real, separate meshes (outsole pads,
 * midsole + plate, sockliner, upper, heel counter, tongue, laces). Because the
 * parts are genuinely separate, the exploded view moves real geometry. See the
 * README "Replacing the 3D asset" for swapping in a GLB with the same part names.
 */
export function ProceduralShoe({ config, tier, instantMaterials }: Props) {
  const variant = getVariant(config.variant);
  const geo = useMemo(
    () => buildShoeGeometries(DETAIL[tier], { stack: variant.stack, lugScale: variant.lugScale }),
    [tier, variant.stack, variant.lugScale],
  );
  useEffect(() => () => disposeShoeGeometries(geo), [geo]);

  const mat = useShoeMaterials(config, instantMaterials);

  const root = useRef<THREE.Group>(null);
  const lugsRef = useRef<THREE.InstancedMesh>(null);
  const eyeletsRef = useRef<THREE.InstancedMesh>(null);
  const parts = useRef<{ group: THREE.Object3D; offset: [number, number, number]; order: number }[]>([]);

  useLayoutEffect(() => {
    const apply = (mesh: THREE.InstancedMesh | null, matrices: THREE.Matrix4[]) => {
      if (!mesh) return;
      matrices.forEach((m, i) => mesh.setMatrixAt(i, m));
      mesh.count = matrices.length;
      mesh.instanceMatrix.needsUpdate = true;
      mesh.computeBoundingSphere();
    };
    apply(lugsRef.current, geo.lugs.matrices);
    apply(eyeletsRef.current, geo.eyelets.matrices);
  }, [geo]);

  useLayoutEffect(() => {
    parts.current = PARTS.flatMap((p) => {
      const group = root.current?.getObjectByName(p.id);
      return group ? [{ group, offset: p.offset, order: p.order }] : [];
    });
  }, []);

  useFrame(() => {
    const e = liveState.explode;
    for (const p of parts.current) {
      const k = partProgress(e, p.order);
      p.group.position.set(p.offset[0] * k, p.offset[1] * k, p.offset[2] * k);
    }
  });

  const shadows = tier !== 'low';

  return (
    <group ref={root} name="velocity-x">
      <group name="outsole">
        <mesh geometry={geo.outsole} material={mat.outsole} castShadow={shadows} />
        <instancedMesh ref={lugsRef} args={[geo.lug, mat.outsole, geo.lugs.matrices.length]} frustumCulled={false} />
      </group>
      <group name="midsole">
        <mesh geometry={geo.midsole} material={mat.midsole} castShadow={shadows} />
        <mesh geometry={geo.plate} material={mat.plate} />
        <mesh geometry={geo.energyLine} material={mat.energy} />
        <mesh geometry={geo.pods} material={mat.pods} />
      </group>
      <group name="insole">
        <mesh geometry={geo.insole} material={mat.insole} />
      </group>
      <group name="upper">
        <mesh geometry={geo.upper} material={mat.upper} castShadow={shadows} />
        <mesh geometry={geo.upper} material={mat.lining} />
        <mesh geometry={geo.collar} material={mat.upper} />
        <mesh geometry={geo.overlays} material={mat.overlay} />
        <mesh geometry={geo.heelTab} material={mat.laces} />
      </group>
      <group name="heelCounter">
        <mesh geometry={geo.heelCounter} material={mat.metal} />
      </group>
      <group name="tongue">
        <mesh geometry={geo.tongue} material={mat.upper} />
      </group>
      <group name="laces">
        <mesh geometry={geo.laces} material={mat.laces} />
        <instancedMesh
          ref={eyeletsRef}
          args={[geo.eyelet, mat.metal, geo.eyelets.matrices.length]}
          frustumCulled={false}
        />
      </group>
    </group>
  );
}
