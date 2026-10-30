import { expect, test, type ConsoleMessage, type Page } from '@playwright/test';

// Known third-party noise that is not an application error.
const IGNORED = [/THREE\.Clock: This module has been deprecated/, /GPU stall due to ReadPixels/, /WebGLProgram/];

function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (m: ConsoleMessage) => {
    if (m.type() === 'error' && !IGNORED.some((r) => r.test(m.text()))) errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(e.message));
  return errors;
}

const ready = (page: Page) =>
  expect(page.locator('.stage')).toHaveAttribute('data-status', /ready|unsupported/, { timeout: 45_000 });

test('renders the real 3D shoe with no errors or hydration mismatch', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('knit runner');
  for (const id of ['hero', 'tour', 'colourways', 'details', 'reserve', 'footer']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  await ready(page);
  await expect(page.locator('.stage canvas')).toHaveCount(1);
  await expect(page.getByText(/Materials Variants Shoe/).first()).toBeAttached();
  expect(errors).toEqual([]);
});

test('scroll tour reports each step', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  for (const [i, title] of ['One knit, two overlays', 'Pull loops, front and back'].entries()) {
    await page.locator(`[data-tour-step="${i}"]`).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: title })).toBeInViewport();
  }
  // The measured length callout belongs to step one.
  await page.locator('[data-tour-step="0"]').scrollIntoViewIfNeeded();
  await expect(page.locator('.dim3d', { hasText: '298 mm' })).toHaveAttribute('data-visible', 'true');
});

test('navigation links move to their sections', async ({ page, isMobile }) => {
  await page.goto('./');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Colourways' }).click();
  } else {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Colourways' }).click();
  }
  await expect(page).toHaveURL(/#colourways$/);
  await expect(page.locator('#cfg-title')).toBeInViewport();
});

test('configurator: colourway, width, size and bag stay in sync', async ({ page }) => {
  await page.goto('./#colourways');
  const cfg = page.locator('#colourways');
  await cfg.getByRole('radio', { name: /Street/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-colourway', 'street');
  await cfg.getByRole('radio', { name: /Wide/ }).click();
  await cfg.getByRole('radio', { name: 'US 10', exact: true }).click();
  await expect(cfg.getByText('$175')).toBeVisible();

  await cfg.getByRole('button', { name: 'Add to bag' }).click();
  const bag = page.getByRole('dialog', { name: /Bag/ });
  await expect(bag).toBeVisible();
  await expect(bag).toContainText('Velocity X, Street');
  await expect(bag).toContainText('US 10, Wide width');
  await bag.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(bag.getByRole('heading')).toContainText('(2)');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Open bag, 2 items/ })).toBeVisible();

  await cfg.getByRole('radio', { name: /Beach/ }).click();
  await expect(cfg.getByRole('radio', { name: /Wide/ })).toHaveAttribute('aria-disabled', 'true');
  await cfg.getByRole('button', { name: 'Start over' }).click();
  await expect(cfg.getByRole('radio', { name: /Midnight/ })).toHaveAttribute('aria-checked', 'true');
});

test('hero colourway dots switch the real model', async ({ page }) => {
  await page.goto('./');
  await ready(page);
  await page.locator('#hero').getByRole('radio', { name: 'Beach' }).click();
  await expect(page.locator('.current-cw__name')).toHaveText('Beach');
  await expect(page.locator('html')).toHaveAttribute('data-colourway', 'beach');
});

test('keyboard: skip link, viewer keys and visible focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard flow is a desktop concern');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.goto('./#colourways');
  const viewer = page.getByRole('group', { name: /Shoe viewer/ });
  await viewer.focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('+');
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
});

test('falls back to still renders without WebGL', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    const patched = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
    };
    HTMLCanvasElement.prototype.getContext = patched as HTMLCanvasElement['getContext'];
  });
  await page.goto('./');
  await expect(page.getByText(/can’t show the 3D model/)).toBeVisible();
  await expect(page.locator('.stage canvas')).toHaveCount(0);
  const still = page.getByRole('img', { name: /Velocity X in Midnight/ }).first();
  await expect(still).toBeVisible();
  await expect.poll(() => still.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(errors).toEqual([]);
});

test('respects prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Resume animations' })).toBeDisabled();
  await expect(page.locator('.hero__mark')).toHaveCSS('animation-name', 'none');
  await context.close();
});

test('layout has no horizontal overflow', async ({ page }) => {
  await page.goto('./');
  for (const y of [0, 0.5, 1]) {
    await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), y);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
  await expect(page.getByRole('button', { name: /Open bag/ })).toBeInViewport();
});
