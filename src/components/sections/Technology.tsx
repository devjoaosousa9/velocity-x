import { STORY_STEPS } from '@/config/content';

export function Technology() {
  return (
    <section id="technology" className="tech" data-chapter="02" aria-labelledby="tech-title">
      <h2 id="tech-title" className="sr-only">
        The technology, step by step
      </h2>
      {STORY_STEPS.map((step, i) => (
        <article key={step.kicker} className={`story-step story-step--${step.align}`} aria-label={step.title}>
          <div className="container">
            <div className="glass-card story-step__card" data-reveal>
              <p className="kicker mono">
                <span className="kicker__index">{String(i + 1).padStart(2, '0')}</span>
                {step.kicker.split('— ')[1]}
              </p>
              <h3 className="heading-xl">{step.title}</h3>
              <p className="body-lg muted">{step.body}</p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
