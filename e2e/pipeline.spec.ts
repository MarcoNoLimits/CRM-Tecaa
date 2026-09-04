import { test, expect } from '@playwright/test';

test.describe('Pipeline Navigation & Protection', () => {
  test('redirects unauthenticated access to /pipeline to /login', async ({ page }) => {
    await page.goto('/pipeline');
    await expect(page).toHaveURL(/.*login/);
  });
});
