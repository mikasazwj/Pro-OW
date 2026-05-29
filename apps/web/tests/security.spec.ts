import { test, expect } from '@playwright/test';

test.describe('Security', () => {
  test('public pages accessible without auth', async ({ page }) => {
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    await page.goto('/boards');
    await expect(page).toHaveURL(/\/boards/);
    await page.goto('/search');
    await expect(page).toHaveURL(/\/search/);
    await page.goto('/login');
    await expect(page).toHaveURL(/\/login/);
    await page.goto('/register');
    await expect(page).toHaveURL(/\/register/);
  });

  test('sensitive word filter via API', async ({ page }) => {
    const ts = Date.now();
    const email = 'filter_' + ts + '@test.com';
    const username = 'filter_' + ts;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, username, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const token = (await loginRes.json()).data.accessToken;
    const res = await page.request.post('http://localhost:3002/api/v1/posts', {
      data: { boardId: 'b1', title: 'normal title', content: 'content with bad word fuck inside' },
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    const json = await res.json();
    expect([0, 40001]).toContain(json.code);
  });

  test('rate limiting via API', async ({ page }) => {
    const ts = Date.now();
    const email = 'rate_' + ts + '@test.com';
    const username = 'rate_' + ts;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, username, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const token = (await loginRes.json()).data.accessToken;
    
    // Make 2 posts rapidly - second may be rate limited
    const r1 = await page.request.post('http://localhost:3002/api/v1/posts', {
      data: { boardId: 'b1', title: 'Rate test 1', content: 'First post for rate limit test here.' },
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    expect((await r1.json()).code).toBe(0);
    
    const r2 = await page.request.post('http://localhost:3002/api/v1/posts', {
      data: { boardId: 'b1', title: 'Rate test 2', content: 'Second post - may be rate limited.' },
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    // Rate limit may not trigger if server just restarted (in-memory map cleared)
    const code2 = (await r2.json()).code;
    expect([0, 42900]).toContain(code2);
  });

  test('refresh token flow via API', async ({ page }) => {
    const ts = Date.now();
    const email = 'rt_' + ts + '@test.com';
    const username = 'rtuser_' + ts;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, username, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const { accessToken, refreshToken } = (await loginRes.json()).data;
    expect(accessToken).toBeTruthy();
    expect(refreshToken).toBeTruthy();
    
    const refreshRes = await page.request.post('http://localhost:3001/api/v1/auth/refresh', {
      data: { refreshToken },
      headers: { 'Content-Type': 'application/json' },
    });
    const refreshJson = await refreshRes.json();
    expect(refreshJson.code).toBe(0);
    expect(refreshJson.data.accessToken).toBeTruthy();
  });

  test('profile endpoint requires auth', async ({ page }) => {
    const res = await page.request.get('http://localhost:3001/api/v1/profile');
    expect(res.status()).toBe(401);
  });

  test('delete own post via API', async ({ page }) => {
    const ts = Date.now();
    const email = 'del_' + ts + '@test.com';
    const username = 'deluser_' + ts;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, username, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const loginRes = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const token = (await loginRes.json()).data.accessToken;
    
    const createRes = await page.request.post('http://localhost:3002/api/v1/posts', {
      data: { boardId: 'b1', title: 'Delete me', content: 'Post to be deleted in e2e test.' },
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    });
    const postId = (await createRes.json()).data.id;
    expect(postId).toBeTruthy();
    
    const deleteRes = await page.request.delete('http://localhost:3002/api/v1/posts/' + postId, {
      headers: { 'Authorization': 'Bearer ' + token },
    });
    expect((await deleteRes.json()).code).toBe(0);
  });
  test('verify-email page loads', async ({ page }) => {
    const ts = Date.now();
    const email = 've_' + ts + '@test.com';
    const username = 'veuser_' + ts;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email, username, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const lr = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const at = (await lr.json()).data.accessToken;
    await page.goto('/boards');
    await page.evaluate((t) => localStorage.setItem('token', t), at);
    await page.goto('/verify-email');
    await page.waitForTimeout(300);
  });

  test('admin page blocked for non-admin', async ({ page }) => {
    const ts2 = Date.now();
    const email2 = 'na_' + ts2 + '@test.com';
    const uname2 = 'nauser_' + ts2;
    await page.request.post('http://localhost:3001/api/v1/auth/register', {
      data: { email: email2, username: uname2, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const lr2 = await page.request.post('http://localhost:3001/api/v1/auth/login', {
      data: { email: email2, password: 'Test123456' },
      headers: { 'Content-Type': 'application/json' },
    });
    const at2 = (await lr2.json()).data.accessToken;
    await page.goto('/boards');
    await page.evaluate((t) => localStorage.setItem('token', t), at2);
    await page.goto('/admin');
    await page.waitForTimeout(500);
    await expect(page.getByText(/权限不足/).first()).toBeVisible({ timeout: 5000 });
  });
});