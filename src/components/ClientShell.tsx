'use client';

import { useEffect } from 'react';
import { ScrollDirector } from '@/animation/ScrollDirector';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { getColor } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { Stage } from './Stage';
import { CartDrawer } from './ui/CartDrawer';

/** The page accent follows the selected colourway. */
function useColourwayAccent() {
  const color = useExperience((s) => getColor(s.config.color));
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent', color.accent);
    root.style.setProperty('--on-accent', color.onAccent);
    root.dataset.colourway = color.id;
  }, [color]);
}

/** Client-only runtime layered under/over the server-rendered page. */
export function ClientShell() {
  useMotionPreference();
  useColourwayAccent();
  return (
    <>
      <Stage />
      <ScrollDirector />
      <CartDrawer />
    </>
  );
}
