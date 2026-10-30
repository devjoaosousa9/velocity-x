import { Header } from '@/components/layout/Header';
import { ClientShell } from '@/components/ClientShell';
import { Hero } from '@/components/sections/Hero';
import { Tour } from '@/components/sections/Tour';
import { Colourways } from '@/components/sections/Colourways';
import { Details } from '@/components/sections/Details';
import { Reserve } from '@/components/sections/Reserve';

/**
 * Server component: every word on the page is static, indexable HTML. The 3D
 * stage, scroll director and bag mount on the client inside <ClientShell />.
 */
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Tour />
        <Colourways />
        <Details />
        <Reserve />
      </main>
      <ClientShell />
    </>
  );
}
