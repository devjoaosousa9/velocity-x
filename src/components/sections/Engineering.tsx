import { ENGINEERING } from '@/config/content';

export function Engineering() {
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
          <div className="container">
            <div className="glass-card feature__card" data-reveal>
              <p className="kicker mono">
                <span className="kicker__index">{f.index}</span>
                Highlighted on the model
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
          </div>
        </article>
      ))}
    </section>
  );
}
