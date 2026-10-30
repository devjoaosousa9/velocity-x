'use client';

import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { getColor, MODEL } from '@/config/product';
import type { ColorId } from '@/types/product';
import { selectMotionReduced, useExperience } from '@/store/useExperience';

interface VariantsExtension {
  variants: { name: string }[];
}
interface VariantMapping {
  material: number;
  variants: number[];
}

/**
 * The scanned shoe. Colourways are the glTF's own material variants
 * (KHR_materials_variants): switching swaps real PBR material sets - base colour,
 * normal, occlusion and roughness maps - never a tint.
 */
export function RealShoe({ color }: { color: ColorId }) {
  const gltf = useGLTF(MODEL.url, false, true);
  const { invalidate } = useThree();
  const reduced = useExperience(selectMotionReduced);
  const colorChanges = useExperience((s) => s.colorChanges);
  const scene = useMemo(() => gltf.scene.clone(true), [gltf]);
  const turn = useRef<THREE.Group>(null);
  const kick = useRef(0);

  const meshes = useMemo(() => {
    const list: THREE.Mesh[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) list.push(m);
    });
    return list;
  }, [scene]);

  // Resolve every variant's materials up front so switching is instant.
  const variantMaterials = useMemo(() => {
    const ext = gltf.userData.gltfExtensions?.KHR_materials_variants as VariantsExtension | undefined;
    const names = ext?.variants.map((v) => v.name) ?? [];
    return names.map((name, index) => ({
      name,
      materials: Promise.all(
        meshes.map(async (mesh) => {
          const mappings: VariantMapping[] = mesh.userData.gltfExtensions?.KHR_materials_variants?.mappings ?? [];
          const mapping = mappings.find((m) => m.variants.includes(index));
          if (!mapping) return mesh.material as THREE.Material;
          const material = (await gltf.parser.getDependency('material', mapping.material)) as THREE.MeshStandardMaterial;
          material.envMapIntensity = 1;
          return material;
        }),
      ),
    }));
  }, [gltf, meshes]);

  useEffect(() => {
    let cancelled = false;
    const target = variantMaterials.find((v) => v.name === getColor(color).variant);
    target?.materials.then((materials) => {
      if (cancelled) return;
      meshes.forEach((mesh, i) => {
        mesh.material = materials[i]!;
      });
      invalidate();
    });
    return () => {
      cancelled = true;
    };
  }, [color, meshes, variantMaterials, invalidate]);

  // A colourway change answers with a quick half-turn so the swap reads as an event.
  useEffect(() => {
    if (colorChanges > 0 && !reduced) {
      kick.current = -Math.PI * 0.6;
      invalidate();
    }
  }, [colorChanges, reduced, invalidate]);

  useFrame((state, delta) => {
    const g = turn.current;
    if (!g) return;
    if (Math.abs(kick.current) > 1e-3) {
      kick.current = THREE.MathUtils.damp(kick.current, 0, 5, Math.min(delta, 0.1));
      g.rotation.y = kick.current;
      state.invalidate();
    } else if (g.rotation.y !== 0) {
      g.rotation.y = 0;
      kick.current = 0;
    }
  });

  return (
    <group ref={turn}>
      <primitive
        object={scene}
        scale={MODEL.scale}
        position={[MODEL.offset[0] * MODEL.scale, MODEL.offset[1] * MODEL.scale, MODEL.offset[2] * MODEL.scale]}
      />
    </group>
  );
}

useGLTF.preload(MODEL.url, false, true);
