'use client';

import { useId, type CSSProperties, type KeyboardEvent } from 'react';
import { COLORS, isCombinationAvailable, SIZES, WIDTHS } from '@/config/product';
import { useExperience } from '@/store/useExperience';

/** Arrow-key navigation for radio groups (WAI-ARIA radiogroup pattern). */
function onRadioKeys(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const radios = Array.from(
    e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([aria-disabled="true"])'),
  );
  const i = radios.indexOf(document.activeElement as HTMLButtonElement);
  if (i < 0 || radios.length === 0) return;
  e.preventDefault();
  let next = i;
  if (e.key === 'Home') next = 0;
  else if (e.key === 'End') next = radios.length - 1;
  else next = (i + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1) + radios.length) % radios.length;
  radios[next]!.focus();
  radios[next]!.click();
}

/** Three real colourways. `dots` is the compact hero version. */
export function ColourwayPicker({ dots = false, label = 'Colourway' }: { dots?: boolean; label?: string }) {
  const color = useExperience((s) => s.config.color);
  const setColor = useExperience((s) => s.setColor);
  const id = useId();

  return (
    <div className={dots ? 'cw-dots' : 'option'}>
      <p id={id} className={dots ? 'sr-only' : 'option__label'}>
        {label}
      </p>
      <div
        role="radiogroup"
        aria-labelledby={id}
        className={dots ? 'cw-dots__list' : 'cw-list'}
        onKeyDown={onRadioKeys}
      >
        {COLORS.map((c) => {
          const selected = c.id === color;
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              aria-label={dots ? c.name : undefined}
              className={dots ? 'cw-dot' : 'cw-row'}
              style={{ '--swatch': c.swatch, '--cw-accent': c.accent } as CSSProperties}
              onClick={() => setColor(c.id)}
            >
              <span className="cw-swatch" aria-hidden="true" />
              {!dots && (
                <span className="cw-row__text">
                  <span className="cw-row__name">{c.name}</span>
                  <span className="cw-row__desc">{c.description}</span>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function WidthPicker() {
  const width = useExperience((s) => s.config.width);
  const color = useExperience((s) => s.config.color);
  const setWidth = useExperience((s) => s.setWidth);
  const id = useId();
  return (
    <div className="option">
      <p id={id} className="option__label">
        Width
      </p>
      <div role="radiogroup" aria-labelledby={id} className="seg" onKeyDown={onRadioKeys}>
        {WIDTHS.map((w) => {
          const available = isCombinationAvailable(w.id, color);
          return (
            <button
              key={w.id}
              type="button"
              role="radio"
              aria-checked={w.id === width}
              aria-disabled={!available}
              tabIndex={w.id === width ? 0 : -1}
              className="seg__item"
              title={available ? w.description : 'Not made in this colourway'}
              onClick={() => setWidth(w.id)}
            >
              <span className="seg__name">{w.name}</span>
              <span className="seg__desc">{available ? w.description : 'Not in this colourway'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SizeSelector() {
  const size = useExperience((s) => s.config.size);
  const setSize = useExperience((s) => s.setSize);
  const id = useId();
  return (
    <div className="option">
      <p id={id} className="option__label">
        Size <span className="option__value">{size ? `US ${size}` : 'Choose one'}</span>
      </p>
      <div role="radiogroup" aria-labelledby={id} className="sizes" onKeyDown={onRadioKeys}>
        {SIZES.map((s, i) => {
          const selected = s.value === size;
          const focusable = selected || (!size && i === SIZES.findIndex((x) => x.inStock));
          return (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-disabled={!s.inStock}
              aria-label={`US ${s.value}${s.inStock ? '' : ', sold out'}`}
              tabIndex={focusable ? 0 : -1}
              className="size"
              onClick={() => setSize(s.value)}
            >
              {s.value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Notice() {
  const notice = useExperience((s) => s.notice);
  return (
    <p className="notice" role="status" aria-live="polite" data-visible={!!notice}>
      {notice ?? ''}
    </p>
  );
}
