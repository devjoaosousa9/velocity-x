'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { getVariant } from '@/config/product';
import { PARTS, partProgress } from '@/config/parts';
import { ENGINEERING } from '@/config/content';
import { useExperience } from '@/store/useExperience';
import { shoeAnchors } from './geometry/buildShoe';
import { liveState } from './liveState';

/**
 * Hotspots and exploded-view callouts. They are children of the product rig and
 * positioned at anchor points computed from the same profile curves as the
 * geometry, so they stay glued to the model through every camera move.
 * Purely decorative for assistive tech: the same copy exists in the DOM sections.
 */
export function Annotations() {
  const variant = useExperience((s) => getVariant(s.config.variant));
  const active = useExperience((s) => s.activeHotspot);
  const anchors = useMemo(() => shoeAnchors(variant.stack), [variant.stack]);

  return (
    <>
      {ENGINEERING.map((f) => (
        <Html key={f.id} position={anchors[f.id]} center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
          <div className="hotspot" data-active={active === f.id} aria-hidden="true">
            <span className="hotspot__ring" />
            <span className="hotspot__dot" />
            <span className="hotspot__label">{f.short}</span>
          </div>
        </Html>
      ))}
      {PARTS.map((p) => (
        <PartLabel key={p.id} id={p.id} anchor={anchors[p.id]} offset={p.offset} order={p.order} name={p.name} detail={p.detail} />
      ))}
    </>
  );
}

function PartLabel(props: {
  id: string;
  anchor: [number, number, number];
  offset: [number, number, number];
  order: number;
  name: string;
  detail: string;
}) {
  const group = useRef<THREE.Group>(null);
  const el = useRef<HTMLDivElement>(null);
  useFrame(() => {
    const p = partProgress(liveState.explode, props.order);
    group.current?.position.set(
      props.anchor[0] + props.offset[0] * p,
      props.anchor[1] + props.offset[1] * p,
      props.anchor[2] + props.offset[2] * p,
    );
    if (el.current) {
      const o = Math.min(1, Math.max(0, (p - 0.7) / 0.3));
      el.current.style.opacity = String(o);
      el.current.style.transform = `translateX(${(1 - o) * -12}px)`;
    }
  });
  return (
    <group ref={group}>
      <Html zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={el} className="callout" style={{ opacity: 0 }} aria-hidden="true">
          <span className="callout__line" />
          <span className="callout__text">
            <span className="callout__name">{props.name}</span>
            <span className="callout__detail">{props.detail}</span>
          </span>
        </div>
      </Html>
    </group>
  );
}
