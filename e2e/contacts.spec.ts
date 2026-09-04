import { test, expect } from '@playwright/test';

test.describe('Contacts Navigation & Protection', () => {
  test('redirects unauthenticated access to /contacts to /login', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page).toHaveURL(/.*login/);
  });

  test('login page has link or form for authentication', async ({ page }) => {
    await page.goto('/login');
    const emailField = page.getByPlaceholder('you@company.com');
    await expect(emailField).toBeEnabled();
  });
});
