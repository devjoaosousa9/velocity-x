'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { formatPrice, priceFor } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { ColorSwatches, MaterialOptions, Notice, SizeSelector, VariantOptions } from '../ui/Options';
import { FallbackSlot } from '../fallback/FallbackSlot';

const STEP = Math.PI / 8;

export function Customize() {
  const rotateBy = useExperience((s) => s.rotateBy);
  const zoomBy = useExperience((s) => s.zoomBy);
  const resetView = useExperience((s) => s.resetView);
  const resetConfig = useExperience((s) => s.resetConfig);
  const variant = useExperience((s) => s.config.variant);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  // Turntable drag. touch-action: pan-y keeps vertical page scrolling native on touch
  // screens; only horizontal drags rotate the product, so the page never gets trapped.
  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    rotateBy((e.clientX - d.x) * 0.012, e.pointerType === 'mouse' ? (e.clientY - d.y) * 0.006 : 0);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const onPointerUp = () => {
    drag.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const actions: Record<string, () => void> = {
      ArrowLeft: () => rotateBy(-STEP),
      ArrowRight: () => rotateBy(STEP),
      ArrowUp: () => rotateBy(0, -STEP / 2),
      ArrowDown: () => rotateBy(0, STEP / 2),
      '+': () => zoomBy(1.12),
      '=': () => zoomBy(1.12),
      '-': () => zoomBy(1 / 1.12),
      '0': resetView,
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  };

  return (
    <section id="customize" className="customize" data-chapter="05" aria-labelledby="customize-title">
      <div id="customize-stage" className="customize__sticky">
        <div className="container customize__grid">
          <div
            className="turntable"
            role="group"
            tabIndex={0}
            aria-label="Product viewer. Drag or use arrow keys to rotate, plus and minus to zoom, 0 to reset."
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onKeyDown={onKeyDown}
          >
            <FallbackSlot className="turntable__fallback" />
            <p className="turntable__hint mono" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16"><path d="M4 12h16M4 12l4-4M4 12l4 4M20 12l-4-4M20 12l-4 4" stroke="currentColor" strokeWidth="1.4" fill="none" /></svg>
              Drag to rotate 360°
            </p>
            <div className="toolbar" role="toolbar" aria-label="View controls">
              <button type="button" className="icon-btn" onClick={() => rotateBy(-STEP)} aria-label="Rotate left">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 7H4V2M4.5 7A8 8 0 1 1 4 13" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
              </button>
              <button type="button" className="icon-btn" onClick={() => rotateBy(STEP)} aria-label="Rotate right">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 7h5V2M19.5 7A8 8 0 1 0 20 13" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
              </button>
              <span className="toolbar__sep" aria-hidden="true" />
              <button type="button" className="icon-btn" onClick={() => zoomBy(1 / 1.12)} aria-label="Zoom out">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h12" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
              <button type="button" className="icon-btn" onClick={() => zoomBy(1.12)} aria-label="Zoom in">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 12h12M12 6v12" stroke="currentColor" strokeWidth="1.5" /></svg>
              </button>
              <span className="toolbar__sep" aria-hidden="true" />
              <button type="button" className="btn btn--ghost btn--sm" onClick={resetView}>
                Reset view
              </button>
            </div>
          </div>

          <div className="glass-card config-panel">
            <div className="config-panel__head">
              <div>
                <p className="kicker mono">05 — Live configurator</p>
                <h2 id="customize-title" className="heading-lg">
                  Make it yours.
                </h2>
              </div>
              <p className="price tabular" aria-label={`Demonstration price ${formatPrice(priceFor({ variant }))}`}>
                {formatPrice(priceFor({ variant }))}
                <span className="badge">Demo</span>
              </p>
            </div>
            <ColorSwatches />
            <MaterialOptions />
            <VariantOptions />
            <SizeSelector />
            <Notice />
            <div className="config-panel__actions">
              <a href="#buy" className="btn btn--primary">
                Review & add to bag
              </a>
              <button type="button" className="btn btn--ghost" onClick={resetConfig}>
                Restore original
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
