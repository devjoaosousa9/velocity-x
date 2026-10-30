'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import { formatPrice, priceFor } from '@/config/product';
import { useExperience } from '@/store/useExperience';
import { StillRender } from '../Stage';
import { ColourwayPicker, Notice, SizeSelector, WidthPicker } from '../ui/Options';

const STEP = Math.PI / 8;

/**
 * Configurator. The viewer is a transparent window onto the fixed 3D stage: a
 * horizontal drag turns the shoe (touch-action: pan-y keeps page scrolling
 * native on phones), arrow keys turn and tilt it, +/- zoom within limits.
 */
export function Colourways() {
  const rotateBy = useExperience((s) => s.rotateBy);
  const zoomBy = useExperience((s) => s.zoomBy);
  const resetView = useExperience((s) => s.resetView);
  const resetConfig = useExperience((s) => s.resetConfig);
  const addToBag = useExperience((s) => s.addToBag);
  const width = useExperience((s) => s.config.width);
  const drag = useRef<{ x: number; y: number; id: number } | null>(null);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    // Presses on the toolbar are button clicks, not drags.
    if ((e.target as HTMLElement).closest('button')) return;
    drag.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    rotateBy((e.clientX - d.x) * 0.012, e.pointerType === 'mouse' ? (e.clientY - d.y) * 0.005 : 0);
    d.x = e.clientX;
    d.y = e.clientY;
  };
  const endDrag = () => {
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
    <section id="colourways" className="cfg" aria-labelledby="cfg-title">
      <div className="wrap cfg__grid">
        <div
          className="cfg__viewer"
          role="group"
          tabIndex={0}
          aria-label="Shoe viewer. Drag or use the arrow keys to turn the shoe, plus and minus to zoom, 0 to reset."
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKeyDown}
        >
          <StillRender className="cfg__still" />
          <div className="cfg__tools" role="toolbar" aria-label="View controls">
            <button type="button" className="icon-btn" onClick={() => rotateBy(-STEP)} aria-label="Turn left">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M9 7H4V2M4.5 7A8 8 0 1 1 4 13" stroke="currentColor" strokeWidth="1.6" fill="none" />
              </svg>
            </button>
            <button type="button" className="icon-btn" onClick={() => rotateBy(STEP)} aria-label="Turn right">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M15 7h5V2M19.5 7A8 8 0 1 0 20 13" stroke="currentColor" strokeWidth="1.6" fill="none" />
              </svg>
            </button>
            <button type="button" className="icon-btn" onClick={() => zoomBy(1 / 1.12)} aria-label="Zoom out">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 12h12" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <button type="button" className="icon-btn" onClick={() => zoomBy(1.12)} aria-label="Zoom in">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 12h12M12 6v12" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            </button>
            <button type="button" className="btn btn--quiet btn--small" onClick={resetView}>
              Reset view
            </button>
          </div>
          <p className="cfg__hint" aria-hidden="true">
            Drag to turn the shoe
          </p>
        </div>

        <div className="cfg__panel">
          <h2 id="cfg-title" className="h2">
            Pick your pair
          </h2>
          <ColourwayPicker />
          <WidthPicker />
          <SizeSelector />
          <Notice />
          <div className="cfg__buy">
            <p className="cfg__price">
              <span className="tabular">{formatPrice(priceFor({ width }))}</span>
              <span className="cfg__price-note">Demo price, nothing is charged</span>
            </p>
            <button type="button" className="btn btn--primary" onClick={() => addToBag()}>
              Add to bag
            </button>
          </div>
          <button type="button" className="link-btn" onClick={resetConfig}>
            Start over
          </button>
        </div>
      </div>
    </section>
  );
}
