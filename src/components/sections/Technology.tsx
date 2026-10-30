import { STORY_STEPS } from '@/config/content';
import { STORY_CROPS } from '@/config/photos';
import { EXPERIENCE } from '@/config/site';
import { ProductVisual } from '../photo/ProductVisual';

export function Technology() {
  const photo = EXPERIENCE === 'photo';
  return (
    <section id="technology" className={`tech ${photo ? 'tech--photo' : ''}`} data-chapter="02" aria-labelledby="tech-title">
      <h2 id="tech-title" className="sr-only">
        The technology, step by step
      </h2>
      {STORY_STEPS.map((step, i) => (
        <article key={step.kicker} className={`story-step story-step--${step.align}`} aria-label={step.title}>
          <div className="container story-step__grid">
            <div className="glass-card story-step__card" data-reveal>
              <p className="kicker mono">
                <span className="kicker__index">{String(i + 1).padStart(2, '0')}</span>
                {step.kicker.split('— ')[1]}
              </p>
              <h3 className="heading-xl">{step.title}</h3>
              <p className="body-lg muted">{step.body}</p>
            </div>
            {photo && <ProductVisual crop={STORY_CROPS[i] ?? 'full'} className="story-step__photo" />}
          </div>
        </article>
      ))}
    </section>
  );
}
