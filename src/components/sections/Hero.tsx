import { FallbackSlot } from '../fallback/FallbackSlot';

export function Hero() {
  return (
    <section id="hero" className="hero" data-chapter="01" aria-labelledby="hero-title">
      <div className="container hero__inner">
        <div className="hero__meta mono">
          <span>VX-01 · 2026 Launch</span>
          <span className="hero__meta-right">Real-time 3D · Drag-free</span>
        </div>

        <FallbackSlot className="hero__fallback" />

        <div className="hero__bottom">
          <h1 id="hero-title" className="display hero__title">
            <span className="line-mask"><span className="hero__line">BEYOND</span></span>
            <span className="line-mask"><span className="hero__line hero__line--2">MOTION</span></span>
          </h1>
          <div className="hero__row">
            <p className="hero__subtitle">Engineered for the impossible.</p>
            <div className="hero__ctas">
              <a href="#technology" className="btn btn--primary">
                Explore the Technology
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M8 2v11M3 8l5 5 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
              </a>
              <a href="#customize" className="btn btn--ghost">Customize Yours</a>
            </div>
            <a href="#technology" className="scroll-cue mono" aria-label="Scroll to explore the technology">
              <span>Scroll</span>
              <span className="scroll-cue__track" aria-hidden="true"><span className="scroll-cue__dot" /></span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
