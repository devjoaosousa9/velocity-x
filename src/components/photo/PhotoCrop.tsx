import type { CSSProperties, ReactNode } from 'react';
import { PHOTO_BACKDROP, type FramedCrop } from '@/config/photos';

interface Props {
  crop: FramedCrop;
  /** Applies a CSS filter (used for simulated colourway previews). */
  filter?: string;
  priority?: boolean;
  className?: string;
  children?: ReactNode;
  /** Decorative crops (repeating a photo already described) hide from assistive tech. */
  decorative?: boolean;
}

/**
 * Art-directed crop of a studio photo. Pure CSS: the frame's aspect ratio is a
 * custom property per breakpoint, and the image is positioned so the focal
 * point lands where the composition wants it - no JS, no layout shift.
 */
export function PhotoCrop({ crop, filter, priority, className = '', children, decorative }: Props) {
  const { photo, desktop: d, mobile: m } = crop;
  const style = {
    '--fx': d.fx,
    '--fy': d.fy,
    '--px': d.px,
    '--py': d.py,
    '--z': d.z,
    '--fx-m': m.fx,
    '--fy-m': m.fy,
    '--px-m': m.px,
    '--py-m': m.py,
    '--z-m': m.z,
    '--backdrop': PHOTO_BACKDROP,
    '--filter': filter ?? 'none',
  } as CSSProperties;

  return (
    <div className={`photo-crop ${className}`} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element -- static export: images are pre-optimised WebP */}
      <img
        src={photo.src}
        width={photo.width}
        height={photo.height}
        alt={decorative ? '' : photo.alt}
        aria-hidden={decorative || undefined}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        draggable={false}
        className="photo-crop__img"
      />
      {children}
    </div>
  );
}
