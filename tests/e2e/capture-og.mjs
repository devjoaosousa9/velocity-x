// Captures public/og.png (1200x630) from the running static build.
// Usage: node tests/e2e/capture-og.mjs [url]
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const url = process.argv[2] ?? 'http://localhost:4173/velocity-x/';
const out = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'public', 'og.png');

const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(`${url}?quality=medium`);
await page.waitForSelector('.stage[data-status="ready"]', { timeout: 60_000 });
await page.waitForTimeout(4000); // let the intro choreography settle
await page.screenshot({ path: out });
await browser.close();
console.log(`Saved ${out}`);
