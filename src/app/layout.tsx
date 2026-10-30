import type { Metadata, Viewport } from 'next';
import { Archivo, JetBrains_Mono } from 'next/font/google';
import { SITE } from '@/config/site';
import './globals.css';
import './campaign.css';

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url.endsWith('/') ? SITE.url : `${SITE.url}/`),
  title: SITE.name,
  description: SITE.description,
  applicationName: 'Velocity X',
  keywords: ['WebGL', 'React Three Fiber', 'Three.js', 'GSAP', 'creative development', '3D product configurator'],
  openGraph: {
    type: 'website',
    title: SITE.name,
    description: SITE.description,
    url: SITE.url,
    siteName: 'Velocity X',
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: 'Velocity X — Beyond Motion' }],
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description },
  icons: { icon: `${basePath}/favicon.svg` },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#07080a',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`} data-motion="full">
      <body>{children}</body>
    </html>
  );
}
