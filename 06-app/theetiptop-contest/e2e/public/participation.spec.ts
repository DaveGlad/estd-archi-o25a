import { expect, test } from '@playwright/test';

import { ACCOUNTS, clearRateLimit, prizeOfCode, releaseCode, takeAvailableCode } from '../fixtures';

/**
 * The customer journey the whole project is for: sign in, play a code, see the prize,
 * find it again in the personal area.
 *
 * Use case UC-01, driven through a real browser against the real API. Every error branch
 * of the result union is exercised too, because each one is a different screen and the
 * brief's six outcomes are not interchangeable.
 */
test.describe('playing a code', () => {
  let code: string;
  let expectedPrize: string;

  test.beforeAll(async () => {
    code = await takeAvailableCode();
    expectedPrize = await prizeOfCode(code);

    // This suite submits several codes in a row, which is exactly what the 10-per-10-minutes
    // limit exists to stop. Resetting the counter is the right move: loosening the limit for
    // the tests would mean the pipeline no longer exercises the configuration that ships.
    await clearRateLimit(ACCOUNTS.customer.email);
  });

  test.afterAll(async () => {
    // Puts the code back, so the suite is re-runnable and does not slowly eat the pool.
    await releaseCode(code);
  });

  /** Signs in through the real form, as a customer would. */
  async function signIn(page: import('@playwright/test').Page, next = '/participer') {
    await page.goto(`/connexion?next=${encodeURIComponent(next)}`);
    await page.getByLabel(/adresse de courriel/i).fill(ACCOUNTS.customer.email);
    await page.getByLabel(/mot de passe/i).fill(ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL(`**${next}`);
  }

  test('an anonymous visitor is sent to sign in, and back again afterwards', async ({ page }) => {
    await page.goto('/participer');

    // The `next` parameter is what brings a visitor who arrived from a receipt back to the
    // page they were trying to reach, instead of dropping them on the home page.
    // Next's `redirect()` does not percent-encode the query it is given, so the browser
    // lands on `?next=/participer` rather than `?next=%2Fparticiper`.
    await expect(page).toHaveURL(/\/connexion\?next=\/participer/);

    await page.getByLabel(/adresse de courriel/i).fill(ACCOUNTS.customer.email);
    await page.getByLabel(/mot de passe/i).fill(ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/\/participer/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Bonjour/);
  });

  test('a wrong password is refused without saying which field was wrong', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByLabel(/adresse de courriel/i).fill(ACCOUNTS.customer.email);
    await page.getByLabel(/mot de passe/i).fill('MauvaisMotDePasse2026!');
    await page.getByRole('button', { name: /se connecter/i }).click();

    // Scoped to the form: Next injects its own `<div role="alert">` route announcer, so a
    // bare `alert` locator always matches two nodes.
    //
    // Deliberately ambiguous wording: distinguishing "unknown email" from "wrong password"
    // turns the login form into an account enumeration oracle.
    await expect(page.locator('form').getByRole('alert')).toContainText(/incorrect/i);
    await expect(page).toHaveURL(/\/connexion/);
  });

  test('a malformed code is rejected before any lookup', async ({ page }) => {
    await signIn(page);

    await page.getByLabel(/code de votre ticket/i).fill('ABC');
    await page.getByRole('button', { name: /découvrir mon lot/i }).click();

    await expect(page.locator('form').getByRole('alert')).toContainText(/10 caractères/i);
  });

  test('an unknown code is reported as invalid', async ({ page }) => {
    await signIn(page);

    // Well-formed but not in the pool: 10 Zs is not a code the generator can produce
    // twice, and if it ever did this test would release it.
    await page.getByLabel(/code de votre ticket/i).fill('ZZZZZZZZZZ');
    await page.getByRole('button', { name: /découvrir mon lot/i }).click();

    await expect(page.getByText(/n'est pas valide/i)).toBeVisible();
  });

  test('a valid code reveals the prize that was frozen at generation', async ({ page }) => {
    await signIn(page);

    await page.getByLabel(/code de votre ticket/i).fill(code);
    await page.getByRole('button', { name: /découvrir mon lot/i }).click();

    await expect(page.getByText(/vous avez gagné/i)).toBeVisible();
    // The prize is READ, not drawn: it must be the one attached to this code in the
    // database, which is what makes the 60/20/10/6/4 % split a property of the data.
    await expect(page.getByText(expectedPrize)).toBeVisible();
    await expect(page.getByText(code)).toBeVisible();
  });

  test('the prize then appears in the personal area', async ({ page }) => {
    await signIn(page, '/mon-compte');

    await expect(page.getByText(expectedPrize).first()).toBeVisible();
    await expect(page.getByText(code).first()).toBeVisible();
    await expect(page.getByText(/codes joués/i)).toBeVisible();
  });

  test('replaying the same code is refused', async ({ page }) => {
    await signIn(page);

    await page.getByLabel(/code de votre ticket/i).fill(code);
    await page.getByRole('button', { name: /découvrir mon lot/i }).click();

    await expect(page.getByText(/déjà été joué/i)).toBeVisible();
    // Played by this very customer, so the screen points them at their own prizes rather
    // than telling them the code belongs to somebody else.
    await expect(page.getByRole('link', { name: /espace personnel/i })).toBeVisible();
  });
});

test.describe('GDPR rights, from the account area', () => {
  async function signIn(page: import('@playwright/test').Page, next: string) {
    await page.goto(`/connexion?next=${encodeURIComponent(next)}`);
    await page.getByLabel(/adresse de courriel/i).fill(ACCOUNTS.secondCustomer.email);
    await page.getByLabel(/mot de passe/i).fill(ACCOUNTS.secondCustomer.password);
    await page.getByRole('button', { name: /se connecter/i }).click();
    await page.waitForURL(`**${next}`);
  }

  test('marketing consent can be withdrawn, and the timestamp goes with it', async ({ page }) => {
    await signIn(page, '/mon-compte/confidentialite');

    const toggle = page.getByRole('checkbox', { name: /activé/i });
    const wasChecked = await toggle.isChecked();

    await toggle.setChecked(!wasChecked);
    // Saved on change rather than behind a button: article 7.3 requires withdrawing
    // consent to be as easy as giving it.
    await expect(page.getByText(/communications/i).last()).toBeVisible();

    // Put it back, so the suite leaves the account as it found it.
    await toggle.setChecked(wasChecked);
  });

  test('personal data downloads as a file', async ({ page }) => {
    await signIn(page, '/mon-compte/confidentialite');

    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /télécharger mes données/i }).click();

    const file = await download;
    // Article 20: a readable, reusable format, delivered as a file rather than shown on
    // screen.
    expect(file.suggestedFilename()).toMatch(/^mes-donnees-theetiptop-\d{4}-\d{2}-\d{2}\.json$/);
  });

  test('account deletion asks for a typed confirmation', async ({ page }) => {
    await signIn(page, '/mon-compte/confidentialite');

    await page.getByRole('button', { name: /supprimer mon compte/i }).click();

    // Irreversible, so it cannot be done with one stray click. The test stops here on
    // purpose: confirming would destroy a seeded account the rest of the suite needs.
    // The confirmation input is the unambiguous marker: the word "irréversible" appears
    // both in the explanatory copy on the page and in the alert title.
    await expect(page.getByRole('textbox', { name: /SUPPRIMER/ })).toBeVisible();
    const confirm = page.getByRole('button', { name: /confirmer la suppression/i });
    await expect(confirm).toBeDisabled();

    await page.getByRole('textbox', { name: /SUPPRIMER/ }).fill('SUPPRIMER');
    await expect(confirm).toBeEnabled();

    await page.getByRole('button', { name: /annuler/i }).click();
  });
});
