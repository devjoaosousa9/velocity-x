'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { TOUR, type TourShot } from '@/config/campaign';
import { PHOTOS } from '@/config/photos';
import { selectMotionReduced, useExperience } from '@/store/useExperience';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Transform that puts the shot's focal point at its place in the stage. Pure, unit-tested. */
export function frameShot(shot: TourShot, stageW: number, stageH: number) {
  const portrait = stageW / stageH < 1;
  const c = portrait ? shot.mobile : shot.desktop;
  const base = portrait ? stageW * 1.05 : stageH * 1.05;
  const size = base * c.z;
  return { x: c.px * stageW - c.fx * size, y: c.py * stageH - c.fy * size, size };
}

/**
 * The cinematic scroll sequence: a sticky studio stage where scrolling drives a
 * camera move across the real photograph (profile -> heel -> knit -> foam ->
 * toe), with captions changing in sync. Sticky positioning (not JS pinning)
 * keeps layout stable; GSAP only scrubs transforms.
 */
export function ScrollTour() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useExperience(selectMotionReduced);
  const photo = PHOTOS.side;

  useGSAP(
    () => {
      const stage = root.current!.querySelector<HTMLElement>('.tour__stage')!;
      const img = root.current!.querySelector<HTMLElement>('.tour__img')!;
      const at = (i: number) => frameShot(TOUR[i]!, stage.clientWidth, stage.clientHeight);
      // Base size is the un-zoomed square; zoom is applied with scale for crisp, GPU-only motion.
      const base = () => at(0).size / (stage.clientWidth / stage.clientHeight < 1 ? TOUR[0]!.mobile.z : TOUR[0]!.desktop.z);
      const vars = (i: number) => {
        const f = at(i);
        return { x: f.x, y: f.y, scale: f.size / base() };
      };
      gsap.set(img, { width: base, height: base, transformOrigin: '0 0', ...vars(0) });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: reduced ? true : 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => setActive(Math.min(TOUR.length - 1, Math.round(self.progress * (TOUR.length - 1)))),
          onRefresh: () => gsap.set(img, { width: base(), height: base() }),
        },
      });
      TOUR.forEach((_, i) => {
        if (i === 0) return;
        tl.to(img, { x: () => vars(i).x, y: () => vars(i).y, scale: () => vars(i).scale, duration: 1 });
        tl.to({}, { duration: 0.35 }); // hold so each caption can be read
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  const shot = TOUR[active]!;
  return (
    <section ref={root} id="tour" className="tour" style={{ height: `${TOUR.length * 90}svh` }} aria-labelledby="tour-title">
      <h2 id="tour-title" className="sr-only">
        A closer look, part by part
      </h2>
      <div className="tour__sticky">
        <div className="tour__stage">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img className="tour__img" src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} loading="lazy" draggable={false} />
        </div>
        <div className="tour__caption" aria-live="polite">
          <p className="mono tour__kicker" key={`k-${shot.id}`}>
            {shot.kicker}
          </p>
          <p className="tour__title" key={`t-${shot.id}`}>
            {shot.title}
          </p>
          <p className="tour__body" key={`b-${shot.id}`}>
            {shot.body}
          </p>
        </div>
        <ol className="tour__steps" aria-label="Tour progress">
          {TOUR.map((s, i) => (
            <li key={s.id} aria-current={i === active ? 'step' : undefined}>
              <span className="sr-only">{s.title}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
