'use client';

import { PARTS } from '@/config/parts';
import { useExperience } from '@/store/useExperience';

export function Anatomy() {
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
