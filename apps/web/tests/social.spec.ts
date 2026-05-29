import { test } from '@playwright/test';

async function setupAuth(page: any) {
  const ts = Date.now();
  const email = 'soc_' + ts + '@test.com';
  const username = 'socuser_' + ts;
  await page.request.post('http://localhost:3001/api/v1/auth/register', {
    data: { email, username, password: 'Test123456' },
    headers: { 'Content-Type': 'application/json' },
  });
  const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
    data: { email, password: 'Test123456' },
    headers: { 'Content-Type': 'application/json' },
  });
  const { accessToken } = (await loginRes.json()).data;
  // Navigate first, then set tokens
  await page.goto('/boards');
  await page.evaluate((t: string) => localStorage.setItem('token', t), accessToken);
}

test.describe('Social', () => {
  test('favorites page loads when logged in', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/favorites');
  });

  test('search page loads', async ({ page }) => {
    await page.goto('/search');
    const searchInput = page.getByPlaceholder(/搜索/);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await searchInput.press('Enter');
    }
  });

  test('notifications page loads when logged in', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/notifications');
  });
});