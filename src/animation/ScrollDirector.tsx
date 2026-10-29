'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { selectMotionReduced, useExperience, type HotspotId } from '@/store/useExperience';
import { buildMasterTimeline } from './buildMasterTimeline';
import { notifySceneTarget } from './sceneTarget';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Wires DOM sections to the central timeline. Each section seeks only its own
 * slice; the CameraRig damps toward whatever the timeline produced. Also owns
 * section-scoped state (configurator mode, active hotspot) and the scroll-based
 * reveal / progress UI, so all scroll logic lives in one place.
 */
export function ScrollDirector() {
  const reduced = useExperience(selectMotionReduced);
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const { tl, ranges } = buildMasterTimeline();
      const store = useExperience.getState;

      const triggers = ranges.map((r) => {
        const el = document.getElementById(r.section);
        if (!el) return null;
        const seek = (p: number) => tl.time(r.start + (r.end - r.start) * p);
        return ScrollTrigger.create({
          trigger: el,
          start: r.section === 'hero' ? 'top top' : 'top center',
          end: 'bottom center',
          onUpdate: (self) => seek(self.progress),
          onRefresh: (self) => {
            if (self.progress > 0 && self.progress < 1) seek(self.progress);
          },
        });
      });

      // Sync on load / deep link (e.g. /#customize): the last section we're past wins.
      const syncFromScroll = () => {
        triggers.forEach((t, i) => {
          const r = ranges[i]!;
          if (t && t.progress > 0) tl.time(r.start + (r.end - r.start) * t.progress);
        });
        notifySceneTarget();
      };
      syncFromScroll();
      ScrollTrigger.addEventListener('refresh', syncFromScroll);

      const customize = document.getElementById('customize-stage');
      if (customize) {
        ScrollTrigger.create({
          trigger: customize,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (self) => store().setMode(self.isActive ? 'configure' : 'cinematic'),
        });
      }

      gsap.utils.toArray<HTMLElement>('[data-hotspot]').forEach((el) => {
        const id = el.dataset.hotspot as HotspotId;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 60%',
          end: 'bottom 40%',
          onToggle: (self) => {
            if (self.isActive) store().setActiveHotspot(id);
            else if (store().activeHotspot === id) store().setActiveHotspot(null);
          },
        });
      });

      // Leaving the anatomy section hands the explode amount back to scroll.
      const anatomy = document.getElementById('anatomy');
      if (anatomy) {
        ScrollTrigger.create({
          trigger: anatomy,
          start: 'top bottom',
          end: 'bottom top',
          onToggle: (self) => {
            if (!self.isActive) store().setExplodeOverride(null);
          },
        });
      }

      // Experience progress bar + section counter.
      const bar = document.querySelector<HTMLElement>('[data-progress-bar]');
      const counter = document.querySelector<HTMLElement>('[data-progress-index]');
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          if (bar) bar.style.transform = `scaleX(${self.progress})`;
        },
      });
      gsap.utils.toArray<HTMLElement>('[data-chapter]').forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: 'top center',
          end: 'bottom center',
          onToggle: (self) => {
            if (self.isActive && counter) counter.textContent = el.dataset.chapter ?? '';
          },
        });
      });

      // Content reveals: purely decorative, skipped entirely when motion is reduced.
      if (!reduced) {
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: el, start: 'top 88%', once: true },
            },
          );
        });
        gsap.utils.toArray<HTMLElement>('[data-reveal-lines]').forEach((el) => {
          const lines = el.querySelectorAll<HTMLElement>('[data-line]');
          gsap.fromTo(
            lines,
            { yPercent: 105 },
            {
              yPercent: 0,
              duration: 1.1,
              ease: 'expo.out',
              stagger: 0.08,
              scrollTrigger: { trigger: el, start: 'top 85%', once: true },
            },
          );
        });
      }

      return () => {
        ScrollTrigger.removeEventListener('refresh', syncFromScroll);
        tl.kill();
      };
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  return <div ref={scope} hidden />;
}
