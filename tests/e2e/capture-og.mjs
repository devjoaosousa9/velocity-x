// Captures public/og.png (1200x630) from the running static build.
// Usage: node tests/e2e/capture-og.mjs [url]
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:4173/velocity-x/';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'og.png');

const browser = await chromium.launch();
// Reduced motion keeps the carousel on its first (hero) slide.
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
await page.goto(url);
await page.waitForFunction(() => {
  const img = document.querySelector('.chero__shoe img');
  return img instanceof HTMLImageElement && img.complete && img.naturalWidth > 0;
});
await page.waitForTimeout(800);
await page.screenshot({ path: out });
await browser.close();
console.log(`Saved ${out}`);
