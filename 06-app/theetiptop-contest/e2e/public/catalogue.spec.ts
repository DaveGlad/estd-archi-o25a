import { expect, test } from '@playwright/test';

/**
 * The public pages a visitor and a crawler both see.
 *
 * These are server-rendered on purpose — SEO is an explicit requirement of the brief — so
 * every assertion below is also an assertion that the server-side data fetch worked. A
 * client-rendered page would pass a "the heading exists" test while serving a crawler an
 * empty document.
 */
test.describe('public catalogue', () => {
  test('the home page states the offer and links to the entry form', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    // The claim the whole operation rests on.
    await expect(page.getByText(/100 ?% des tickets/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /saisir mon code/i }).first()).toBeVisible();
  });

  test('the prizes page shows the five prizes, their shares and the grand prize', async ({ page }) => {
    await page.goto('/jeu-concours/lots');

    for (const label of [
      'Un infuseur à thé',
      'thé détox',
      'thé signature',
      'coffret découverte à 39',
      'coffret découverte à 69',
    ]) {
      await expect(page.getByText(new RegExp(label, 'i')).first()).toBeVisible();
    }

    // The split filed with the bailiff, rendered from the database rather than hard-coded.
    await expect(page.getByText('60 % des tickets')).toBeVisible();
    await expect(page.getByText(/Une année de thé/)).toBeVisible();
  });

  test('the rules page names the bailiff', async ({ page }) => {
    await page.goto('/jeu-concours/reglement');

    // `.first()`: the rules name the bailiff in several articles, and a bare locator
    // matching four nodes is a strict-mode violation rather than a stronger assertion.
    await expect(page.getByText(/Maître Arnaud Rick/).first()).toBeVisible();
  });

  test('the stores page lists ten stores and highlights Nice', async ({ page }) => {
    await page.goto('/boutiques');

    // Scoped to `main`: the header and footer navigations are lists too, so an unscoped
    // `listitem` locator counts 28 items and tests nothing about the stores.
    await expect(page.getByRole('main').getByRole('listitem')).toHaveCount(10);
    await expect(page.getByText('Nice Vieille Ville')).toBeVisible();
    // The opening that motivates the whole contest.
    await expect(page.getByText('Nouvelle boutique')).toBeVisible();
  });

  test('robots.txt invites indexing and keeps the private areas out', async ({ request }) => {
    const response = await request.get('/robots.txt');

    expect(response.ok()).toBe(true);
    const body = await response.text();

    expect(body).toContain('Sitemap');
    // Signed-in areas have nothing to offer a crawler and waste its crawl budget.
    expect(body).toMatch(/Disallow: \/mon-compte/);
  });

  test('sitemap.xml lists the indexable pages', async ({ request }) => {
    const response = await request.get('/sitemap.xml');

    expect(response.ok()).toBe(true);
    const body = await response.text();

    expect(body).toContain('/jeu-concours');
    expect(body).toContain('/boutiques');
  });
});

test.describe('accessibility basics', () => {
  test('every page offers a skip link to the main content', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.getByRole('link', { name: /aller au contenu principal/i });
    // Present in the DOM but visually hidden until focused: that is the pattern, and a
    // keyboard user is the one who needs it.
    await expect(skipLink).toBeAttached();

    await page.keyboard.press('Tab');
    await expect(skipLink).toBeFocused();
  });

  test('the home page has exactly one level-1 heading', async ({ page }) => {
    await page.goto('/');

    // Required by WCAG 1.3.1 and by any screen reader's heading navigation; also what a
    // crawler reads as the page's subject.
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  });

  test('the main landmark is reachable and labelled', async ({ page }) => {
    await page.goto('/jeu-concours');

    await expect(page.getByRole('main')).toBeVisible();
    await expect(page.getByRole('navigation', { name: /navigation principale/i })).toBeAttached();
  });
});
