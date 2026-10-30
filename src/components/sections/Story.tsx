import { EXPERIENCE } from '@/config/site';
import { ProductVisual } from '../photo/ProductVisual';

const STATS = [
  { value: '212', unit: 'g', label: 'Weight, US 9' },
  { value: '38', unit: 'mm', label: 'Heel stack' },
  { value: '10', unit: 'mm', label: 'Heel-to-toe drop' },
  { value: '7', unit: '', label: 'Separate components' },
];

export function Story() {
  return (
    <section id="story" className="story" data-chapter="06" aria-labelledby="story-title">
      <div className="container story__grid">
        <div className="story__lead">
          <p className="kicker mono">06 — The idea</p>
          <h2 id="story-title" className="display display--story" data-reveal-lines>
            <span className="line-mask"><span data-line>Built for</span></span>
            <span className="line-mask"><span data-line>the space</span></span>
            <span className="line-mask"><span data-line className="accent-text">between</span></span>
            <span className="line-mask"><span data-line>strides.</span></span>
          </h2>
        </div>

        {EXPERIENCE === 'photo' && <ProductVisual crop="rocker" className="story__photo" />}

        <div className="story__columns">
          <p className="body-lg" data-reveal>
            Most shoes are designed for the moment your foot hits the ground. Velocity X was designed for the moment it
            leaves. Every gram, every millimetre of foam, every lug exists to shorten the time between one stride and
            the next.
          </p>
          <p className="body-lg muted" data-reveal>
            The result is a shoe that behaves less like equipment and more like an extension of motion: a rockered
            geometry that rolls you forward, a heel that absorbs and returns, an upper that disappears.
          </p>
        </div>

        <blockquote className="story__quote" data-reveal>
          <p>“We stopped asking how to make it faster. We asked what was slowing it down — and removed it.”</p>
          <footer className="mono">— Velocity Lab, design notes (fictional)</footer>
        </blockquote>

        <dl className="stats" data-reveal>
          {STATS.map((s) => (
            <div key={s.label} className="stats__item">
              <dt className="stats__label">{s.label}</dt>
              <dd className="stats__value tabular">
                {s.value}
                <span className="stats__unit">{s.unit}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
