'use client';

import { useMemo } from 'react';
import { getColor, getMaterial, getVariant } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { midsoleTop, outsoleTop, upperTop, xAt, yBottom, stackHeight } from '@/three/geometry/shoeProfile';

const W = 640;
const H = 300;
const sx = (x: number) => ((x + 1.6) / 3.2) * W;
const sy = (y: number) => H - ((y + 0.5) / 1.6) * H;

function line(fn: (t: number) => number, from = 0, to = 1, steps = 60) {
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = from + ((to - from) * i) / steps;
    pts.push(`${sx(xAt(t)).toFixed(1)},${sy(fn(t)).toFixed(1)}`);
  }
  return pts;
}

/** Closed band between two profile curves, as an SVG path. */
function band(bottom: (t: number) => number, top: (t: number) => number) {
  const lower = line(bottom);
  const upper = line(top).reverse();
  return `M${lower.join(' L')} L${upper.join(' L')} Z`;
}

/**
 * 2D fallback generated from the SAME profile curves as the 3D geometry, so it
 * stays faithful to the model and still reflects the live configuration.
 */
export function ShoeFallback({ className = '' }: { className?: string }) {
  const config = useExperience((s) => s.config);
  const color = getColor(config.color);
  const variant = getVariant(config.variant);
  const finish = getMaterial(config.material);

  const paths = useMemo(() => {
    const stack = variant.stack;
    return {
      outsole: band(yBottom, outsoleTop),
      midsole: band(outsoleTop, (t) => midsoleTop(t, stack)),
      upper: band((t) => midsoleTop(t, stack) - 0.03, (t) => upperTop(t, stack)),
      energy: `M${line((t) => outsoleTop(t) + stackHeight(t, stack) * 0.42, 0.05, 0.93).join(' L')}`,
      lugs: Array.from({ length: 24 }, (_, i) => 0.05 + i * 0.038).filter((t) => t < 0.44 || t > 0.54),
      laces: Array.from({ length: 5 }, (_, i) => 0.42 + i * 0.042),
      stack,
    };
  }, [variant.stack]);

  return (
    <figure className={className}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Side view of Velocity X ${variant.name} in ${color.name}, ${finish.name}.`}>
        <defs>
          <linearGradient id="vx-upper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color.upper} stopOpacity="1" />
            <stop offset="1" stopColor={color.upper} stopOpacity="0.78" />
          </linearGradient>
          <pattern id="vx-knit" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="1" fill="#000" opacity={finish.pattern === 'none' ? 0 : 0.22} />
          </pattern>
        </defs>
        <ellipse cx={W / 2} cy={H - 18} rx={W * 0.42} ry={10} fill="#000" opacity="0.45" />
        <path d={paths.upper} fill="url(#vx-upper)" />
        <path d={paths.upper} fill="url(#vx-knit)" />
        <path d={paths.midsole} fill={color.midsole} />
        <path d={paths.outsole} fill={variant.outsoleColor} />
        {paths.lugs.map((t) => (
          <rect key={t} x={sx(xAt(t)) - 5} y={sy(yBottom(t))} width="10" height={4 * variant.lugScale} fill={variant.outsoleColor} />
        ))}
        <path d={paths.energy} stroke={color.accent} strokeWidth="2.5" fill="none" />
        {paths.laces.map((t) => (
          <line
            key={t}
            x1={sx(xAt(t))}
            y1={sy(upperTop(t, paths.stack)) + 2}
            x2={sx(xAt(t + 0.03))}
            y2={sy(upperTop(t + 0.03, paths.stack)) - 4}
            stroke={color.accent}
            strokeWidth="5"
            strokeLinecap="round"
          />
        ))}
      </svg>
    </figure>
  );
}
