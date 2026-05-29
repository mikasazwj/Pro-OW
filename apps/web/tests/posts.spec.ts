import { test, expect } from '@playwright/test';

async function setupAuth(page: any) {
  const ts = Date.now();
  const email = 'pst_' + ts + '@test.com';
  const username = 'pstuser_' + ts;
  await page.request.post('http://localhost:3001/api/v1/auth/register', {
    data: { email, username, password: 'Test123456' },
    headers: { 'Content-Type': 'application/json' },
  });
  const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
    data: { email, password: 'Test123456' },
    headers: { 'Content-Type': 'application/json' },
  });
  const { accessToken, refreshToken } = (await loginRes.json()).data;
  await page.goto('/boards');
  await page.evaluate(({ t, rt }: { t: string; rt: string }) => {
    localStorage.setItem('token', t);
    localStorage.setItem('refreshToken', rt);
  }, { t: accessToken, rt: refreshToken });
}

test.describe('Posts', () => {
  test('browse post list page', async ({ page }) => {
    await page.goto('/boards');
    expect(page.url()).toContain('/boards');
  });

  test('switch board filter', async ({ page }) => {
    await page.goto('/boards');
    const heroBtn = page.getByRole('button', { name: /英雄攻略/ });
    await heroBtn.click();
  });

  test('create new post via UI', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/post/new');
    
    const title = 'E2E Test ' + Date.now();
    await page.getByPlaceholder(/标题/).fill(title);
    await page.locator('textarea').first().fill('E2E test content for post creation, with enough chars here.');
    
    await page.getByRole('button', { name: /发布/ }).click();
    await page.waitForURL('**/post/**', { timeout: 10000 });
    await expect(page.locator('h1').first()).toContainText(title);
  });

  test('like a post via UI', async ({ page }) => {
    await setupAuth(page);
    await page.goto('/boards');
    
    const firstPost = page.locator('a[href^="/post/"]').first();
    if (await firstPost.isVisible({ timeout: 3000 })) {
      await firstPost.click();
      await page.waitForURL('**/post/**');
      const likeBtn = page.getByRole('button').filter({ hasText: /赞/ }).first();
      if (await likeBtn.isVisible({ timeout: 2000 })) {
        await likeBtn.click();
      }
    }
  });
});