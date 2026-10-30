'use client';

import type { CSSProperties } from 'react';
import { PARTS } from '@/config/parts';
import { ANATOMY_CALLOUTS, PHOTO_BACKDROP, PHOTOS } from '@/config/photos';
import { EXPERIENCE } from '@/config/site';
import { getColor } from '@/config/product';
import { useExperience } from '@/store/useExperience';

/** Photo edition: annotated studio shot. Callouts are pinned to photo coordinates. */
function AnatomyPhoto() {
  const color = useExperience((s) => getColor(s.config.color));
  const photo = PHOTOS.side;
  return (
    <section id="anatomy" className="anatomy anatomy--photo" data-chapter="04" aria-labelledby="anatomy-title">
      <div className="container">
        <div className="anatomy__head">
          <p className="kicker mono">04 — Anatomy</p>
          <h2 id="anatomy-title" className="heading-2xl" data-reveal>
            Every part
            <br />
            <span className="muted">has a job.</span>
          </h2>
        </div>
        <figure className="anatomy-figure" style={{ '--backdrop': PHOTO_BACKDROP } as CSSProperties}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img
            src={photo.src}
            width={photo.width}
            height={photo.height}
            alt={photo.alt}
            loading="lazy"
            decoding="async"
            className="anatomy-figure__img"
            style={{ filter: color.filter }}
          />
          <ol className="anatomy-figure__pins" aria-label="Annotated components">
            {ANATOMY_CALLOUTS.map((c, i) => (
              <li
                key={c.id}
                className="pin"
                data-side={c.side}
                style={{ '--x': c.x, '--y': 2 * c.y - 0.8 } as CSSProperties}
              >
                <span className="pin__dot mono" aria-hidden="true">
                  {i + 1}
                </span>
                <span className="pin__label">
                  <span className="pin__name">{c.name}</span>
                  <span className="pin__detail">{c.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </figure>
        {/* Visual legend for small screens, where pin labels are hidden; the pins above carry the text. */}
        <ol className="anatomy-legend" aria-hidden="true">
          {ANATOMY_CALLOUTS.map((c, i) => (
            <li key={c.id}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              {c.name}
              <small>{c.detail}</small>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function Anatomy() {
  if (EXPERIENCE === 'photo') return <AnatomyPhoto />;
  return <Anatomy3D />;
}

function Anatomy3D() {
  const override = useExperience((s) => s.explodeOverride);
  const setExplodeOverride = useExperience((s) => s.setExplodeOverride);
  const status = useExperience((s) => s.renderStatus);
  const exploded = override === null ? true : override > 0.5;
  const threeD = status !== 'unsupported' && status !== 'error';

  return (
    <section id="anatomy" className="anatomy" data-chapter="04" aria-labelledby="anatomy-title">
      <div className="anatomy__sticky">
        <div className="container">
          <div className="glass-card anatomy__panel">
            <p className="kicker mono">04 — Exploded view</p>
            <h2 id="anatomy-title" className="heading-xl">
              Seven parts.
              <br />
              <span className="muted">Zero excess.</span>
            </h2>
            <ol className="parts-list">
              {PARTS.map((p, i) => (
                <li key={p.id}>
                  <span className="mono parts-list__i">{String(i + 1).padStart(2, '0')}</span>
                  <span className="parts-list__name">{p.name}</span>
                  <span className="parts-list__detail">{p.detail}</span>
                </li>
              ))}
            </ol>
            {threeD ? (
              <button
                type="button"
                className="btn btn--ghost"
                aria-pressed={!exploded}
                onClick={() => setExplodeOverride(exploded ? 0 : 1)}
              >
                {exploded ? 'Reassemble' : 'Explode view'}
              </button>
            ) : (
              <p className="fine-print">The exploded view requires WebGL. The component list above describes each layer.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
