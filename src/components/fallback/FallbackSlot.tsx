'use client';

import { useExperience } from '@/store/useExperience';
import { ShoeFallback } from './ShoeFallback';

/** Renders the 2D edition in-flow only when the 3D stage is unavailable. */
export function FallbackSlot({ className = '' }: { className?: string }) {
  const status = useExperience((s) => s.renderStatus);
  if (status !== 'unsupported' && status !== 'error') return null;
  return <ShoeFallback className={`fallback ${className}`} />;
}
