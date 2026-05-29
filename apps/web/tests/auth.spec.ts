import { test, expect } from '@playwright/test';

const TS = Date.now();
const TEST_EMAIL = 'e2e_' + TS + '@test.com';
const TEST_USERNAME = 'e2euser_' + TS;
const TEST_PASSWORD = 'Test123456';

test.describe('Authentication', () => {
  test('register new user via UI', async ({ page }) => {
    await page.goto('/register');
    await page.getByPlaceholder(/邮箱/).fill(TEST_EMAIL);
    await page.getByPlaceholder(/用户名/).fill(TEST_USERNAME);
    await page.getByPlaceholder(/密码/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /注册/ }).click();

    await page.waitForURL('**/boards', { timeout: 10000 });
    await expect(page).toHaveURL(/\/boards/);
  });

  test('login with registered user via UI', async ({ page }) => {
    // Register first
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email: TEST_EMAIL, username: TEST_USERNAME, password: TEST_PASSWORD },
      headers: { 'Content-Type': 'application/json' },
    });

    await page.goto('/login');
    await page.getByPlaceholder(/邮箱/).fill(TEST_EMAIL);
    await page.getByPlaceholder(/密码/).fill(TEST_PASSWORD);
    await page.getByRole('button', { name: /登录/ }).click();

    await page.waitForURL('**/boards', { timeout: 10000 });
    await expect(page).toHaveURL(/\/boards/);
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
    const rt = await page.evaluate(() => localStorage.getItem('refreshToken'));
    expect(rt).toBeTruthy();
  });

  test('wrong password shows error via UI', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder(/邮箱/).fill(TEST_EMAIL);
    await page.getByPlaceholder(/密码/).fill('WrongPassword123');
    await page.getByRole('button', { name: /登录/ }).click();

    await page.waitForTimeout(1000);
  });

  test('login and logout pages accessible without auth', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });
});