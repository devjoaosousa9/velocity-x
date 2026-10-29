'use client';

import { useId, type KeyboardEvent } from 'react';
import { COLORS, isCombinationAvailable, MATERIALS, SIZES, VARIANTS } from '@/config/product';
import { useExperience } from '@/store/useExperience';

/** Arrow-key navigation for radio groups (WAI-ARIA radiogroup pattern). */
function onRadioKeys(e: KeyboardEvent<HTMLDivElement>) {
  const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
  if (!keys.includes(e.key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]:not([aria-disabled="true"])'));
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

export function ColorSwatches({ compact = false }: { compact?: boolean }) {
  const color = useExperience((s) => s.config.color);
  const variant = useExperience((s) => s.config.variant);
  const setColor = useExperience((s) => s.setColor);
  const label = useId();
  const current = COLORS.find((c) => c.id === color)!;

  return (
    <fieldset className="option">
      <legend id={label} className="option__legend">
        Colour <span className="option__value">{current.name}</span>
      </legend>
      <div role="radiogroup" aria-labelledby={label} className="swatches" onKeyDown={onRadioKeys}>
        {COLORS.map((c) => {
          const selected = c.id === color;
          const limited = !isCombinationAvailable(variant, c.id);
          return (
            <button
              key={c.id}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected ? 0 : -1}
              aria-label={`${c.name}${limited ? ' (switches variant)' : ''}`}
              title={c.name}
              className={`swatch ${compact ? 'swatch--sm' : ''}`}
              data-selected={selected}
              style={{ ['--swatch' as string]: c.swatch }}
              onClick={() => setColor(c.id)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}

export function MaterialOptions() {
  const material = useExperience((s) => s.config.material);
  const setMaterial = useExperience((s) => s.setMaterial);
  const label = useId();
  return (
    <fieldset className="option">
      <legend id={label} className="option__legend">Material</legend>
      <div role="radiogroup" aria-labelledby={label} className="chips" onKeyDown={onRadioKeys}>
        {MATERIALS.map((m) => (
          <button
            key={m.id}
            type="button"
            role="radio"
            aria-checked={m.id === material}
            tabIndex={m.id === material ? 0 : -1}
            className="chip"
            onClick={() => setMaterial(m.id)}
          >
            <span className="chip__title">{m.name}</span>
            <span className="chip__sub">{m.description}</span>
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export function VariantOptions() {
  const variant = useExperience((s) => s.config.variant);
  const color = useExperience((s) => s.config.color);
  const setVariant = useExperience((s) => s.setVariant);
  const label = useId();
  return (
    <fieldset className="option">
      <legend id={label} className="option__legend">Variant</legend>
      <div role="radiogroup" aria-labelledby={label} className="chips chips--row" onKeyDown={onRadioKeys}>
        {VARIANTS.map((v) => {
          const available = isCombinationAvailable(v.id, color);
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={v.id === variant}
              aria-disabled={!available}
              tabIndex={v.id === variant ? 0 : -1}
              className="chip"
              onClick={() => setVariant(v.id)}
              title={available ? v.description : 'Not produced in this colour'}
            >
              <span className="chip__title">{v.name}</span>
              <span className="chip__sub">{available ? v.description : 'Unavailable in this colour'}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function SizeSelector() {
  const size = useExperience((s) => s.config.size);
  const setSize = useExperience((s) => s.setSize);
  const label = useId();
  return (
    <fieldset className="option">
      <legend id={label} className="option__legend">
        Size <span className="option__value">{size ? `US M ${size}` : 'Select'}</span>
      </legend>
      <div role="radiogroup" aria-labelledby={label} className="sizes" onKeyDown={onRadioKeys}>
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
    </fieldset>
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
