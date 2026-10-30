import { COLORS } from '@/config/product';
import { CROPS } from '@/config/photos';
import { PhotoCrop } from '../photo/PhotoCrop';

/** Bento grid: image cards from the real photo mixed with data cards. */
export function Bento() {
  return (
    <section id="engineering" className="bento-section" aria-labelledby="bento-title">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="mono eyebrow">02 — Engineering</p>
          <h2 id="bento-title" className="section-title">
            Engineered for
            <br />
            <span className="dim">unmatched speed &amp; control.</span>
          </h2>
        </header>

        <div className="bento">
          <article className="bcard bcard--photo bcard--hero" data-reveal>
            <PhotoCrop crop={CROPS.knit} decorative className="bcard__photo" />
            <div className="bcard__overlay">
              <p className="mono bcard__tag">Upper</p>
              <h3 className="bcard__title">AeroMesh knit</h3>
              <p className="bcard__text">Zoned perforations breathe where heat builds; denser knit locks the midfoot.</p>
            </div>
          </article>

          <article className="bcard bcard--stat" data-reveal>
            <p className="mono bcard__tag">Energy return</p>
            <div className="ring" style={{ ['--p' as string]: 87 }} aria-hidden="true">
              <span className="tabular">87%</span>
            </div>
            <p className="bcard__text">Concept target for the max-cushion foam stack.</p>
          </article>

          <article className="bcard bcard--drop" data-reveal>
            <p className="mono bcard__tag">Geometry</p>
            <p className="bcard__big tabular">
              8<small>mm</small>
            </p>
            <svg viewBox="0 0 200 60" className="drop-diagram" aria-hidden="true">
              <path d="M8 18 C 60 22, 120 30, 186 40 L 192 52 L 8 52 Z" fill="currentColor" opacity="0.18" />
              <path d="M8 18 C 60 22, 120 30, 186 40" stroke="var(--volt)" strokeWidth="2.5" fill="none" />
              <text x="8" y="12" className="drop-diagram__label">38 mm</text>
              <text x="160" y="32" className="drop-diagram__label">30 mm</text>
            </svg>
            <p className="bcard__text">Heel-to-toe drop with an early rocker.</p>
          </article>

          <article className="bcard bcard--photo bcard--tall" data-reveal>
            <PhotoCrop crop={CROPS.foam} decorative className="bcard__photo" />
            <div className="bcard__overlay">
              <p className="mono bcard__tag">Midsole</p>
              <h3 className="bcard__title">Max-cushion foam</h3>
            </div>
          </article>

          <article className="bcard bcard--colors" data-reveal>
            <p className="mono bcard__tag">Colourways</p>
            <ul className="bcard__swatches" aria-label="Five colourways">
              {COLORS.map((c) => (
                <li key={c.id} style={{ background: c.swatch }} title={c.name}>
                  <span className="sr-only">{c.name}</span>
                </li>
              ))}
            </ul>
            <p className="bcard__text">Volt Yellow is the photographed original; the rest are previews in the configurator.</p>
          </article>

          <article className="bcard bcard--photo bcard--wide" data-reveal>
            <PhotoCrop crop={CROPS.heel} decorative className="bcard__photo" />
            <div className="bcard__overlay">
              <p className="mono bcard__tag">Heel lock</p>
              <h3 className="bcard__title">Sculpted counter. Padded collar.</h3>
            </div>
          </article>

          <article className="bcard bcard--weight" data-reveal>
            <p className="mono bcard__tag">Race weight</p>
            <p className="bcard__big tabular">
              212<small>g</small>
            </p>
            <div className="bcard__bar" aria-hidden="true">
              <span style={{ width: '62%' }} />
            </div>
            <p className="bcard__text">US 9. Lighter than most daily trainers in its stack class.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
