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

test('renders every section with no console errors or hydration mismatch', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BEYOND');
  await expect(page.getByText('Engineered for the impossible.')).toBeVisible();
  for (const id of ['hero', 'technology', 'engineering', 'anatomy', 'customize', 'story', 'buy', 'footer']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  // Photo edition: the campaign carousel shows the real product photo, and no WebGL canvas is mounted.
  const carousel = page.getByRole('region', { name: 'Velocity X campaign' });
  await expect(carousel).toBeVisible();
  const hero = carousel.locator('.carousel__slide[data-active="true"] img');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors.filter((e) => /hydrat/i.test(e))).toEqual([]);
  expect(errors).toEqual([]);
});

test('campaign carousel: arrows, dots and keyboard', async ({ page }) => {
  await page.goto('./');
  const carousel = page.getByRole('region', { name: 'Velocity X campaign' });
  await carousel.getByRole('button', { name: 'Next slide' }).click();
  await expect(carousel.getByRole('button', { name: /Show slide 2/ })).toHaveAttribute('aria-current', 'true');
  await carousel.getByRole('button', { name: /Show slide 5/ }).click();
  await expect(carousel.locator('.carousel__slide[data-active="true"]')).toHaveAttribute('aria-label', /^5 of/);
  await carousel.getByRole('button', { name: 'Previous slide' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(carousel.getByRole('button', { name: /Show slide 6/ })).toHaveAttribute('aria-current', 'true');
});

test('navigation links move to their sections', async ({ page, isMobile }) => {
  await page.goto('./');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: /Customize/ }).click();
  } else {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Customize' }).click();
  }
  await expect(page).toHaveURL(/#customize$/);
  await expect(page.locator('#customize-title')).toBeInViewport();
});

test('configurator: colour, size and bag stay in sync', async ({ page }) => {
  await page.goto('./#customize');
  const panel = page.locator('#customize');
  await panel.getByRole('radio', { name: 'Electric Blue' }).click();
  await expect(panel.getByRole('radio', { name: 'Electric Blue' })).toHaveAttribute('aria-checked', 'true');
  await panel.getByRole('radio', { name: /Carbon Shell/ }).click();
  await panel.getByRole('radio', { name: 'US 10', exact: true }).click();

  const buy = page.locator('#buy');
  await buy.scrollIntoViewIfNeeded();
  const summary = buy.getByLabel('Your configuration');
  await expect(summary).toContainText('Electric Blue');
  await expect(summary).toContainText('Carbon Shell');
  await expect(summary).toContainText('US M 10');

  await buy.getByRole('button', { name: 'Add to Bag' }).click();
  const bag = page.getByRole('dialog', { name: /Bag/ });
  await expect(bag).toBeVisible();
  await expect(bag).toContainText('Electric Blue · Carbon Shell · US 10');
  await bag.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(bag.getByRole('heading')).toContainText('(2)');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Open bag, 2 items/ })).toBeVisible();

  await page.locator('#customize').scrollIntoViewIfNeeded();
  await panel.getByRole('button', { name: 'Restore original' }).click();
  await expect(panel.getByRole('radio', { name: 'Volt Yellow' })).toHaveAttribute('aria-checked', 'true');
});

test('keyboard: skip link, visible focus and gallery views', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard flow is a desktop concern');
  await page.goto('./');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await page.goto('./#customize');
  const heel = page.getByRole('button', { name: 'Heel view' });
  await heel.focus();
  const outline = await heel.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(outline).not.toBe('none');
  await page.keyboard.press('Enter');
  await expect(heel).toHaveAttribute('aria-pressed', 'true');
});

test('works without WebGL: the photo edition needs no GPU', async ({ page }) => {
  const errors = collectErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    // Deliberately disable WebGL, keep 2D canvas working.
    const patched = function (this: HTMLCanvasElement, type: string, ...rest: unknown[]) {
      if (type.startsWith('webgl')) return null;
      return (original as (...a: unknown[]) => unknown).call(this, type, ...rest);
    };
    HTMLCanvasElement.prototype.getContext = patched as HTMLCanvasElement['getContext'];
  });
  await page.goto('./');
  await expect(page.getByRole('region', { name: 'Velocity X campaign' })).toBeVisible();
  await expect(page.getByText(/Interactive 3D is unavailable/)).toHaveCount(0);
  // The configurator re-tints the real photo and labels the preview as simulated.
  await page.goto('./#customize');
  await page.locator('#customize').getByRole('radio', { name: 'Crimson Red' }).click();
  await expect(page.locator('#customize').getByText('Crimson Red · simulated colourway')).toBeVisible();
  expect(errors).toEqual([]);
});

test('respects prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Resume animations' })).toBeDisabled();
  // Content is never hidden waiting for reveal animations.
  await page.locator('#engineering').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'Adaptive Cushioning' })).toBeVisible();
  await context.close();
});

test('layout has no horizontal overflow', async ({ page }) => {
  await page.goto('./');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await expect(page.getByRole('button', { name: /Open bag/ })).toBeInViewport();
});
