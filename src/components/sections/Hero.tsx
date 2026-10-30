import { LoadState, StillRender } from '../Stage';
import { ColourwayPicker } from '../ui/Options';
import { CurrentColourway } from '../ui/CurrentColourway';

/**
 * The wordmark sits on the page layer *behind* the transparent WebGL canvas, so
 * the real shoe turns in front of it - the one bold move on the page.
 */
export function Hero() {
  return (
    <section id="hero" className="hero" aria-labelledby="hero-title">
      <p className="hero__mark" aria-hidden="true">
        Velocity&nbsp;X
      </p>
      <StillRender className="hero__still" />
      <div className="wrap hero__content">
        <div className="hero__copy">
          <h1 id="hero-title" className="hero__title">
            A knit runner you can turn over in your hands.
          </h1>
          <p className="hero__lede">
            This is a real scan of the shoe, rendered live in your browser. Drag it, look underneath, then pick your
            colourway and size.
          </p>
          <div className="hero__ctas">
            <a href="#colourways" className="btn btn--primary">
              Choose your colourway
            </a>
            <a href="#tour" className="btn btn--quiet">
              Look up close
            </a>
          </div>
        </div>
        <div className="hero__aside">
          <ColourwayPicker dots label="Colourway" />
          <CurrentColourway />
        </div>
      </div>
      <LoadState />
    </section>
  );
}
