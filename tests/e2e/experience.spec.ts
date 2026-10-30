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

test('renders the campaign with the real photo, no errors and no WebGL', async ({ page }) => {
  const errors = collectErrors(page);
  await page.goto('./');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Engineered');
  for (const id of ['hero', 'tour', 'engineering', 'configure', 'drop', 'footer']) {
    await expect(page.locator(`#${id}`)).toHaveCount(1);
  }
  const hero = page.locator('.chero__shoe img');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator('canvas')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('scroll tour advances its steps as you scroll', async ({ page }) => {
  await page.goto('./');
  const tour = page.locator('#tour');
  const steps = tour.locator('.tour__steps li');
  await expect(steps.first()).toHaveAttribute('aria-current', 'step');
  const box = await tour.boundingBox();
  await page.evaluate((y) => window.scrollTo(0, y), (box!.y + box!.height) * 0.8);
  await expect(steps.last()).toHaveAttribute('aria-current', 'step');
  await expect(tour.locator('.tour__title')).toHaveText('Rolls you forward.');
});

test('navigation links move to their sections', async ({ page, isMobile }) => {
  await page.goto('./');
  if (isMobile) {
    await page.getByRole('button', { name: 'Open menu' }).click();
    await page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: /Configure/ }).click();
  } else {
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Configure' }).click();
  }
  await expect(page).toHaveURL(/#configure$/);
  await expect(page.locator('#configure-title')).toBeInViewport();
  // Content jumped over by the nav link is never left hidden.
  await expect(page.locator('#configure .dash')).toHaveCSS('opacity', '1');
});

test('configurator: colour, variant, size and bag stay in sync', async ({ page }) => {
  await page.goto('./#configure');
  const dash = page.locator('#configure');
  await dash.getByRole('radio', { name: 'Electric Blue' }).click();
  await expect(dash.getByText('Electric Blue · simulated colourway')).toBeVisible();
  await dash.getByRole('radio', { name: /Carbon Shell/ }).click();
  await dash.getByRole('radio', { name: 'US 10', exact: true }).click();
  const summary = dash.getByLabel('Your configuration');
  await expect(summary).toContainText('Electric Blue');
  await expect(summary).toContainText('Carbon Shell');
  await expect(summary).toContainText('US M 10');

  await dash.getByRole('button', { name: 'Add to Bag' }).click();
  const bag = page.getByRole('dialog', { name: /Bag/ });
  await expect(bag).toBeVisible();
  await expect(bag).toContainText('Electric Blue · Carbon Shell · US 10');
  await bag.getByRole('button', { name: 'Increase quantity' }).click();
  await expect(bag.getByRole('heading')).toContainText('(2)');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: /Open bag, 2 items/ })).toBeVisible();

  await dash.getByRole('button', { name: 'Restore original' }).click();
  await expect(dash.getByRole('radio', { name: 'Volt Yellow' })).toHaveAttribute('aria-checked', 'true');
});

test('drop list form validates and confirms (demo, nothing sent)', async ({ page }) => {
  await page.goto('./#drop');
  const drop = page.locator('#drop');
  await drop.getByRole('button', { name: 'Join the drop' }).click();
  await expect(drop.getByRole('alert')).toContainText('valid email');
  await drop.getByLabel('Email address').fill('runner@example.com');
  await drop.getByRole('button', { name: 'Join the drop' }).click();
  await expect(drop.getByRole('status')).toContainText('on the list');
});

test('keyboard: skip link and visible focus', async ({ page, isMobile }) => {
  test.skip(isMobile, 'keyboard flow is a desktop concern');
  await page.goto('./');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.goto('./#configure');
  const radio = page.locator('#configure').getByRole('radio', { name: 'Volt Yellow' });
  await radio.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#configure').getByRole('radio', { name: 'Electric Blue' })).toBeFocused();
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle);
  expect(outline).not.toBe('none');
});

test('works without WebGL', async ({ page }) => {
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
  await expect(page.locator('.chero__shoe img')).toBeVisible();
  expect(errors).toEqual([]);
});

test('respects prefers-reduced-motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('./');
  await expect(page.locator('html')).toHaveAttribute('data-motion', 'reduced');
  await expect(page.getByRole('button', { name: 'Resume animations' })).toBeDisabled();
  await expect(page.locator('.marquee__track').first()).toHaveCSS('animation-name', 'none');
  await page.locator('#engineering').scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'AeroMesh knit' })).toBeVisible();
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
