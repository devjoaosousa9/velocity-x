'use client';

import { useRef, type CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { HERO_STATS } from '@/config/campaign';
import { PHOTOS } from '@/config/photos';
import { selectMotionReduced, useExperience } from '@/store/useExperience';

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Cinematic hero: an inset studio "card" in the photo's own backdrop colour, the
 * real product floating in it, a giant wordmark cropped by the card edge and
 * glass spec chips. Scrolling out pushes the camera in on the shoe.
 */
export function CampaignHero() {
  const root = useRef<HTMLElement>(null);
  const reduced = useExperience(selectMotionReduced);
  const photo = PHOTOS.side;

  useGSAP(
    () => {
      if (reduced) return;
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: 0.5 },
      });
      tl.to('.chero__shoe', { scale: 1.18, yPercent: -6, rotate: -4 }, 0)
        .to('.chero__word', { yPercent: 18, letterSpacing: '0.04em' }, 0)
        .to('.chero__chip', { yPercent: (i) => -40 - i * 25, opacity: 0 }, 0)
        .to('.chero__card', { borderRadius: 48, scale: 0.96 }, 0);
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  return (
    <section ref={root} id="hero" className="chero" aria-labelledby="hero-title">
      <div className="chero__card">
        <div className="chero__top">
          <div>
            <p className="chero__eyebrow mono">VX-01 · Race-day collection</p>
            <h1 id="hero-title" className="chero__title">
              Engineered
              <br />
              for the impossible.
            </h1>
          </div>
          <a href="#configure" className="pill pill--dark">
            Configure yours
            <span className="pill__dot" aria-hidden="true" />
          </a>
        </div>

        <div className="chero__shoe">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export; pre-optimised WebP */}
          <img src={photo.src} width={photo.width} height={photo.height} alt={photo.alt} fetchPriority="high" draggable={false} />
        </div>

        <ul className="chero__chips" aria-label="Key specifications">
          {HERO_STATS.map((s) => (
            <li key={s.label} className="chero__chip" style={{ '--x': s.x, '--y': s.y } as CSSProperties}>
              <span className="chero__chip-value tabular">
                {s.value}
                <small>{s.unit}</small>
              </span>
              <span className="chero__chip-label">{s.label}</span>
            </li>
          ))}
        </ul>

        <p className="chero__word" aria-hidden="true">
          VELOCITY
        </p>
        <a href="#tour" className="chero__scroll mono">
          Scroll to explore
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
