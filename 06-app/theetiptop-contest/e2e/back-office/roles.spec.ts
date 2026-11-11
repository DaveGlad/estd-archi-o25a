import { expect, test, type Page } from '@playwright/test';

import { ACCOUNTS } from '../fixtures';

/**
 * Requirement 6 of the brief: three distinct profiles, with distinct rights.
 *
 * The valuable half of these tests is the negative half — what each role **cannot** reach.
 * A test that only checks an administrator can open the dashboard would pass just as
 * happily if every role could.
 */

async function signIn(page: Page, account: { email: string; password: string }) {
  await page.goto('/connexion');
  await page.getByLabel(/adresse professionnelle/i).fill(account.email);
  await page.getByLabel(/mot de passe/i).fill(account.password);
  await page.getByRole('button', { name: /se connecter/i }).click();

  // Waits for the post-login landing page before returning. Without it, a `page.goto()`
  // in the caller races the sign-in navigation: the next page can be requested before the
  // session cookie exists, and the layout guard sends it straight back to /connexion.
  //
  // The URL is whichever area the role belongs to — the form always pushes `/admin` and the
  // guard forwards an EMPLOYEE on to `/employe`.
  await page.waitForURL(/\/(admin|employe)/);
}

test.describe('back-office access control', () => {
  test('an anonymous visitor is sent to the staff login screen', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/connexion/);
    await expect(page.getByText(/réservé aux administrateurs et aux employés/i)).toBeVisible();
  });

  test('the staff login screen offers no social sign-in', async ({ page }) => {
    await page.goto('/connexion');

    // Google and Facebook exist for customers. A staff account that opens every customer's
    // name, email and prize history should not hinge on an identity provider whose account
    // recovery we do not control.
    await expect(page.getByRole('button', { name: /google/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /facebook/i })).toHaveCount(0);
  });

  test('an administrator reaches every administration screen', async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);

    await expect(page.getByRole('heading', { name: /tableau de bord/i })).toBeVisible();

    for (const [path, heading] of [
      ['/admin/statistiques', /statistiques/i],
      ['/admin/participants', /participants/i],
      ['/admin/export', /export pour l'emailing/i],
      ['/admin/parametrage', /paramétrage du jeu/i],
      ['/admin/tirage', /tirage au sort/i],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
    }
  });

  test('an employee is redirected away from the administration area', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    // Sent to the area their role does have access to, rather than to a dead end.
    await expect(page).toHaveURL(/\/employe/);
    await expect(page.getByRole('heading', { name: /remise des lots/i })).toBeVisible();

    await page.goto('/admin/statistiques');
    await expect(page).toHaveURL(/\/employe/);
  });

  test('a customer account is refused and told why', async ({ page }) => {
    await page.goto('/connexion');
    await page.getByLabel(/adresse professionnelle/i).fill(ACCOUNTS.customer.email);
    await page.getByLabel(/mot de passe/i).fill(ACCOUNTS.customer.password);
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page).toHaveURL(/error=forbidden/);
    // The copy says the area is for staff, rather than "forbidden", which would leave the
    // customer wondering whether their own account is broken.
    await expect(page.getByText(/accès réservé au personnel/i)).toBeVisible();
  });

  test('the back office refuses to be indexed', async ({ request }) => {
    const robots = await request.get('/robots.txt');
    expect(await robots.text()).toMatch(/Disallow: \/$/m);

    const page = await request.get('/connexion');
    // The header is the instruction a crawler cannot ignore; robots.txt is only a request.
    expect(page.headers()['x-robots-tag']).toContain('noindex');
  });
});

test.describe('store employee: handing a prize over', () => {
  test('the employee sees their own store', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    await expect(page.getByText(/Espace boutique, Nice Vieille Ville/)).toBeVisible();
  });

  test('a search by name finds the customer and shows how many prizes are pending', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    // A surname search is what an employee actually types at the till, so it is worth
    // covering as such — it may legitimately return several people.
    await page.getByLabel(/rechercher un client/i).fill('rousseau');
    await page.getByRole('button', { name: /rechercher/i }).click();

    await expect(page.getByText(/Camille Rousseau/)).toBeVisible();
    await expect(page.getByRole('link', { name: /voir ses gains/i }).first()).toBeVisible();
  });

  test('a search too short is refused before reaching the API', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    await page.getByLabel(/rechercher un client/i).fill('a');
    await page.getByRole('button', { name: /rechercher/i }).click();

    // One character matches too much of the base to be useful, and the floor is enforced
    // on both sides.
    await expect(page.getByText(/au moins 2 caractères/i)).toBeVisible();
  });

  test('a search with no match explains what to do next', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    await page.getByLabel(/rechercher un client/i).fill('zzzzzinconnu');
    await page.getByRole('button', { name: /rechercher/i }).click();

    await expect(page.getByText(/aucun client trouvé/i)).toBeVisible();
    // Points the employee at the unambiguous route: the code on the receipt.
    await expect(page.getByText(/code figurant sur son ticket/i)).toBeVisible();
  });

  test('the customer file does not expose the profile the employee has no need for', async ({ page }) => {
    await signIn(page, ACCOUNTS.employee);

    // Searched by email, not by surname. The demonstration data set contains other
    // customers named Rousseau, so `.first()` on a surname search opens whichever file
    // pg_trgm happens to rank highest — a test that passes or fails depending on the seed.
    // The email is unique by construction.
    await page.getByLabel(/rechercher un client/i).fill(ACCOUNTS.customer.email);
    await page.getByRole('button', { name: /rechercher/i }).click();
    await page.getByRole('link', { name: /voir ses gains/i }).first().click();

    await expect(page.getByRole('heading', { name: /Camille Rousseau/ })).toBeVisible();
    // GDPR minimisation applies to an internal screen as much as to an export: the API
    // does not return the birth date or the marketing preference to an employee account.
    await expect(page.getByText(/date de naissance/i)).toHaveCount(0);
    await expect(page.getByText(/communications commerciales/i)).toHaveCount(0);
  });
});

test.describe('grand prize draw', () => {
  test('the draw is refused while the contest is still open, with the reason', async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);
    await page.goto('/admin/tirage');

    await page.getByRole('textbox', { name: /TIRER/ }).fill('TIRER');
    await page.getByRole('button', { name: /lancer le tirage/i }).click();

    // The button is deliberately not disabled before the closing date: the API owns the
    // rule and explains itself, which beats a greyed-out control that gives no reason.
    // Matched without the apostrophe: the copy uses a typographic apostrophe (U+2019)
    // and a straight one in the pattern would never match.
    await expect(page.getByText(/après la clôture du jeu/i)).toBeVisible();
  });

  test('the screen states the fairness rule the brief requires', async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);
    await page.goto('/admin/tirage');

    await expect(page.getByText(/participants distincts/i).first()).toBeVisible();
    await expect(page.getByText(/quarante codes a une chance/i)).toBeVisible();
  });
});

test.describe('mailing export', () => {
  test('the CSV downloads with a dated filename', async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);
    await page.goto('/admin/export');

    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /export csv/i }).click();

    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^base-emailing-\d{4}-\d{2}-\d{2}\.csv$/);
  });

  test('the screen lists the exported columns before anything is downloaded', async ({ page }) => {
    await signIn(page, ACCOUNTS.admin);
    await page.goto('/admin/export');

    // The administrator should know what leaves the system before they click, not after
    // they open the file.
    await expect(page.getByText('consentement_le')).toBeVisible();
    await expect(page.getByText(/pourquoi le périmètre n'est pas paramétrable/i)).toBeVisible();
  });
});
