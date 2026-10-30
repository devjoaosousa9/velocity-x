'use client';

import { useCallback, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { CAMPAIGN_SLIDES, CROPS } from '@/config/photos';
import { selectMotionReduced, useExperience } from '@/store/useExperience';
import { PhotoCrop } from './PhotoCrop';

const SLIDE_MS = 6000;

/**
 * Campaign carousel built from real product photography. Auto-advances like a
 * launch campaign, but pauses on hover/focus, honours reduced motion and the
 * global pause button (WCAG 2.2.2), and supports swipe, arrows and dots.
 */
export function ProductCarousel({ overlay }: { overlay?: ReactNode }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const reduced = useExperience(selectMotionReduced);
  const swipe = useRef<{ x: number; id: number } | null>(null);
  const count = CAMPAIGN_SLIDES.length;
  const playing = !reduced && !hovered;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);

  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowRight') go(index + 1);
    else if (e.key === 'ArrowLeft') go(index - 1);
    else return;
    e.preventDefault();
  };
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    swipe.current = { x: e.clientX, id: e.pointerId };
  };
  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (!s || s.id !== e.pointerId) return;
    const dx = e.clientX - s.x;
    if (Math.abs(dx) > 48) go(index + (dx < 0 ? 1 : -1));
  };

  const slide = CAMPAIGN_SLIDES[index]!;

  return (
    <section
      className="carousel"
      aria-roledescription="carousel"
      aria-label="Velocity X campaign"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setHovered(false);
      }}
    >
      <div
        className="carousel__stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipe.current = null)}
      >
        {CAMPAIGN_SLIDES.map((s, i) => (
          <div
            key={s.id}
            className="carousel__slide"
            data-active={i === index}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}: ${s.title}`}
            aria-hidden={i !== index}
            inert={i !== index}
          >
            <PhotoCrop crop={CROPS[s.crop]} priority={i === 0} decorative={i !== 0} className="carousel__photo" />
          </div>
        ))}
        {overlay && <div className="carousel__overlay">{overlay}</div>}
        <div className="carousel__caption" aria-live={playing ? 'off' : 'polite'}>
          <p className="carousel__kicker mono">
            <span className="tabular">{String(index + 1).padStart(2, '0')}</span> / {String(count).padStart(2, '0')} ·{' '}
            {slide.kicker}
          </p>
          <p className="carousel__title" key={slide.id}>
            {slide.title}
          </p>
          <p className="carousel__body">{slide.body}</p>
        </div>
      </div>

      <div className="carousel__controls">
        <div className="carousel__dots" role="group" aria-label="Choose slide">
          {CAMPAIGN_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className="carousel__dot"
              aria-label={`Show slide ${i + 1}: ${s.kicker}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => go(i)}
            >
              <span
                className="carousel__dot-fill"
                // Restarting the key restarts the CSS progress animation for the new slide.
                key={i === index ? `active-${index}` : 'idle'}
                data-playing={playing}
                style={{ animationDuration: `${SLIDE_MS}ms` }}
                onAnimationEnd={() => i === index && go(index + 1)}
              />
            </button>
          ))}
        </div>
        <div className="carousel__arrows">
          <button type="button" className="icon-btn" onClick={() => go(index - 1)} aria-label="Previous slide">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
          <button type="button" className="icon-btn" onClick={() => go(index + 1)} aria-label="Next slide">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
