import type { Metadata, Viewport } from 'next';
import { Big_Shoulders, Instrument_Sans } from 'next/font/google';
import { SITE } from '@/config/site';
import './globals.css';

// Condensed, industrial display face: reads like the label on a shoebox.
const display = Big_Shoulders({
  subsets: ['latin'],
  axes: ['opsz'],
  variable: '--font-display',
  display: 'swap',
});

const text = Instrument_Sans({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-text',
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
    images: [{ url: `${basePath}/og.png`, width: 1200, height: 630, alt: 'The Velocity X knit runner in front of its wordmark' }],
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.description },
  icons: { icon: `${basePath}/favicon.svg` },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#e9eaec',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${text.variable}`} data-motion="full" data-colourway="midnight">
      <body>{children}</body>
    </html>
  );
}
