import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ClientShell } from '@/components/ClientShell';
import { CampaignPage } from '@/components/campaign/CampaignPage';
import { Hero } from '@/components/sections/Hero';
import { Technology } from '@/components/sections/Technology';
import { Engineering } from '@/components/sections/Engineering';
import { Anatomy } from '@/components/sections/Anatomy';
import { Customize } from '@/components/sections/Customize';
import { Story } from '@/components/sections/Story';
import { Buy } from '@/components/sections/Buy';
import { EXPERIENCE } from '@/config/site';

/**
 * Server component: the whole narrative is static, indexable HTML. Client
 * runtime (motion, cart, and the 3D stage in the '3d' edition) mounts in
 * <ClientShell />.
 */
export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Header />
      {EXPERIENCE === 'photo' ? (
        <CampaignPage />
      ) : (
        <>
          <main id="main" className="page">
            <Hero />
            <Technology />
            <Engineering />
            <Anatomy />
            <Customize />
            <Story />
            <Buy />
          </main>
          <Footer />
        </>
      )}
      <ClientShell />
    </>
  );
}
