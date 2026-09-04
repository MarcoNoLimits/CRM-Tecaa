import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('redirects unauthenticated users to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/.*login/);
  });

  test('renders login card with email and password inputs', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'CRM Tecaa' })).toBeVisible();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
    await expect(page.getByPlaceholder('••••••••')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('can switch between login and signup mode', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /create account/i }).click();
    await expect(page.getByPlaceholder('Jane Doe')).toBeVisible();

    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page.getByPlaceholder('you@company.com')).toBeVisible();
  });
});
