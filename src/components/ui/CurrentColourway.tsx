'use client';

import { getColor } from '@/config/product';
import { useExperience } from '@/store/useExperience';

export function CurrentColourway() {
  const color = useExperience((s) => getColor(s.config.color));
  return (
    <p className="current-cw" aria-live="polite">
      <span className="current-cw__name">{color.name}</span>
      <span className="current-cw__desc">{color.description}</span>
    </p>
  );
}
