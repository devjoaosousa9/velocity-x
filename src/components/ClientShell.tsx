'use client';

import { ScrollDirector } from '@/animation/ScrollDirector';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { Stage } from './Stage';
import { CartDrawer } from './ui/CartDrawer';

/** Client-only runtime layered under/over the server-rendered page. */
export function ClientShell() {
  useMotionPreference();
  return (
    <>
      <Stage />
      <ScrollDirector />
      <CartDrawer />
    </>
  );
}
