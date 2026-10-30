import { NAV, SOCIALS } from '@/config/site';
import { MODEL } from '@/config/product';
import { Logo } from '../layout/Logo';

/** Closing section (the shoe returns on the right) and the footer. */
export function Reserve() {
  return (
    <>
      <section id="reserve" className="reserve" aria-labelledby="reserve-title">
        <div className="wrap">
          <h2 id="reserve-title" className="reserve__title">
            Your size is
            <br />
            waiting.
          </h2>
          <p className="reserve__text">Most sizes from US 7 to 12 are in stock, in all three colourways.</p>
          <a href="#colourways" className="btn btn--primary">
            Choose your size
          </a>
        </div>
      </section>
      <footer id="footer" className="site-footer">
        <div className="wrap site-footer__grid">
          <div>
            <Logo />
            <p className="site-footer__note">
              Velocity X is a concept product made for a creative-development portfolio. Nothing on this site is for
              sale.
            </p>
          </div>
          <nav aria-label="Footer">
            <ul>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Social">
            <ul>
              {SOCIALS.filter((s) => s.href).map((s) => (
                <li key={s.label}>
                  <a href={s.href!} target="_blank" rel="noopener noreferrer">
                    {s.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="wrap site-footer__base">
          <p>
            3D model “{MODEL.credit.title}” by {MODEL.credit.author}, {MODEL.credit.license}.
          </p>
          <p>© 2026 Velocity X concept</p>
        </div>
      </footer>
    </>
  );
}
