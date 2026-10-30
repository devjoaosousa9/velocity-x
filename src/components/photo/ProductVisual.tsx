'use client';

import { CROPS, type CropId } from '@/config/photos';
import { EXPERIENCE } from '@/config/site';
import { getColor } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { FallbackSlot } from '../fallback/FallbackSlot';
import { PhotoCrop } from './PhotoCrop';

/**
 * The product as shown inside a section: the photographed shoe (re-tinted for
 * the selected colourway) in photo mode, or nothing extra in 3D mode, where the
 * fixed WebGL stage draws it (with the 2D fallback when WebGL is unavailable).
 */
export function ProductVisual({ crop, className = '', tinted = true }: { crop: CropId; className?: string; tinted?: boolean }) {
  const color = useExperience((s) => getColor(s.config.color));
  if (EXPERIENCE === '3d') return <FallbackSlot className={className} />;
  const simulated = tinted && color.filter !== 'none';
  return (
    <PhotoCrop crop={CROPS[crop]} filter={tinted ? color.filter : undefined} className={`product-visual ${className}`}>
      {simulated && (
        <span className="photo-tag mono">
          {color.name} · simulated colourway
        </span>
      )}
    </PhotoCrop>
  );
}
