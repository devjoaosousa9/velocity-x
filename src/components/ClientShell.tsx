'use client';

import { useEffect } from 'react';
import { ScrollDirector } from '@/animation/ScrollDirector';
import { useMotionPreference } from '@/hooks/useMotionPreference';
import { EXPERIENCE } from '@/config/site';
import { Stage } from './Stage';
import { CartDrawer } from './ui/CartDrawer';

/**
 * Campaign-edition motion that must never hide content: reveals are opt-in
 * (only once JS runs) and anything already on screen is shown immediately.
 */
function useCampaignMotion() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('js');
    // Anything that has reached (or been scrolled past, e.g. via a nav jump) the
    // lower edge of the viewport is revealed - nothing can stay stuck hidden.
    let pending = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const reveal = () => {
      const limit = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top > limit) return true;
        el.classList.add('is-in');
        return false;
      });
    };

    const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (bar) bar.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
        if (pending.length) reveal();
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
}

function CampaignRuntime() {
  useCampaignMotion();
  return null;
}

/** Client-only runtime layered under/over the server-rendered page. */
export function ClientShell() {
  useMotionPreference();
  return (
    <>
      {EXPERIENCE === '3d' ? (
        <>
          <Stage />
          <ScrollDirector />
        </>
      ) : (
        <CampaignRuntime />
      )}
      <CartDrawer />
    </>
  );
}
