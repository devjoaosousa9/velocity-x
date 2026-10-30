import { ENGINEERING } from '@/config/content';
import type { CSSProperties } from 'react';
import { CROPS, ENGINEERING_CROPS } from '@/config/photos';
import { EXPERIENCE } from '@/config/site';
import { ProductVisual } from '../photo/ProductVisual';

export function Engineering() {
  const photo = EXPERIENCE === 'photo';
  return (
    <section id="engineering" className="engineering" data-chapter="03" aria-labelledby="eng-title">
      <div className="container section-intro">
        <p className="kicker mono">03 — Engineering</p>
        <h2 id="eng-title" className="heading-2xl" data-reveal>
          Three systems.
          <br />
          <span className="muted">One stride.</span>
        </h2>
      </div>
      {ENGINEERING.map((f) => (
        <article key={f.id} className="feature" data-hotspot={f.id} aria-labelledby={`feat-${f.id}`}>
          <div className="container feature__grid">
            <div className="glass-card feature__card" data-reveal>
              <p className="kicker mono">
                <span className="kicker__index">{f.index}</span>
                {photo ? 'Detail' : 'Highlighted on the model'}
              </p>
              <h3 id={`feat-${f.id}`} className="heading-xl">
                {f.title}
              </h3>
              <p className="body-lg muted">{f.body}</p>
              <div className="stat">
                <span className="stat__value tabular">{f.stat.value}</span>
                <span className="stat__label">{f.stat.label}</span>
              </div>
            </div>
            {photo && (
              <div className="feature__photo">
                <ProductVisual crop={ENGINEERING_CROPS[f.id]} />
                <span
                  className="photo-hotspot"
                  aria-hidden="true"
                  style={
                    {
                      '--hx': CROPS[ENGINEERING_CROPS[f.id]].desktop.px,
                      '--hy': CROPS[ENGINEERING_CROPS[f.id]].desktop.py,
                      '--hx-m': CROPS[ENGINEERING_CROPS[f.id]].mobile.px,
                      '--hy-m': CROPS[ENGINEERING_CROPS[f.id]].mobile.py,
                    } as CSSProperties
                  }
                >
                  <span className="hotspot__ring" />
                  <span className="hotspot__dot" />
                  <span className="hotspot__label">{f.short}</span>
                </span>
              </div>
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
