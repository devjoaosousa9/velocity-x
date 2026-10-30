import { CAMPAIGN_NAV } from '@/config/campaign';
import { PHOTO_CREDIT, SOCIALS } from '@/config/site';
import { Logo } from '../layout/Logo';
import { CampaignHero } from './CampaignHero';
import { ScrollTour } from './ScrollTour';
import { Marquee } from './Marquee';
import { Bento } from './Bento';
import { ProductDashboard } from './ProductDashboard';
import { DropCta } from './DropCta';

/** Campaign edition of the site (EXPERIENCE = 'photo'), modelled on cinematic launch sites. */
export function CampaignPage() {
  return (
    <>
      <main id="main" className="campaign">
        <CampaignHero />
        <ScrollTour />
        <Marquee />
        <Bento />
        <ProductDashboard />
        <DropCta />
      </main>
      <footer className="cfoot" id="footer">
        <div className="wrap">
          <div className="cfoot__grid">
            <div>
              <Logo />
              <p className="cfoot__note">{PHOTO_CREDIT}</p>
            </div>
            <nav aria-label="Footer">
              <ul>
                {CAMPAIGN_NAV.map((n) => (
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
          <p className="cfoot__word" aria-hidden="true">
            VELOCITY X
          </p>
          <div className="cfoot__base">
            <p>© 2026 Velocity X concept. Portfolio project — no products are sold.</p>
            <p className="mono">Next.js · GSAP · Zustand</p>
          </div>
        </div>
      </footer>
    </>
  );
}
