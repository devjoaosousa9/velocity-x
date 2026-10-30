import { EXPERIENCE, NAV, PHOTO_CREDIT, SOCIALS } from '@/config/site';
import { PRODUCT } from '@/config/product';
import { Logo } from './Logo';

export function Footer() {
  const year = 2026;
  return (
    <footer className="site-footer" id="footer" data-chapter="08">
      <div className="container">
        <div className="footer-hero">
          <p className="display display--footer" aria-hidden="true">
            BEYOND<br />MOTION
          </p>
        </div>
        <div className="footer-grid">
          <div className="footer-col footer-col--brand">
            <Logo />
            <p className="muted">
              {PRODUCT.name} is a fictional concept product created for a creative-development portfolio. No real products
              are sold on this site.
            </p>
            {EXPERIENCE === 'photo' && <p className="muted fine-print">{PHOTO_CREDIT}</p>}
          </div>
          <nav className="footer-col" aria-label="Experience">
            <h2 className="footer-col__title mono">Experience</h2>
            <ul>
              {NAV.map((n) => (
                <li key={n.id}>
                  <a href={`#${n.id}`}>{n.label}</a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="footer-col">
            <h2 className="footer-col__title mono">Product</h2>
            <ul className="spec-list">
              <li><span>Model</span><span className="tabular">{PRODUCT.sku}</span></li>
              <li><span>Weight</span><span className="tabular">212 g</span></li>
              <li><span>Drop</span><span className="tabular">10 mm</span></li>
              <li><span>Stack</span><span className="tabular">38 / 28 mm</span></li>
            </ul>
          </div>
          <nav className="footer-col" aria-label="Company (demonstration links)">
            <h2 className="footer-col__title mono">Company</h2>
            <ul>
              <li><a href="#footer" aria-disabled="true">About (demo)</a></li>
              <li><a href="#footer" aria-disabled="true">Sustainability (demo)</a></li>
              <li><a href="#footer" aria-disabled="true">Privacy (demo)</a></li>
              <li><a href="#footer" aria-disabled="true">Terms (demo)</a></li>
            </ul>
          </nav>
          <nav className="footer-col" aria-label="Social">
            <h2 className="footer-col__title mono">Follow</h2>
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
        <div className="footer-base">
          <p>© {year} Velocity X concept. All rights reserved.</p>
          <p className="mono">Real-time 3D · Next.js · React Three Fiber · GSAP</p>
        </div>
      </div>
    </footer>
  );
}
