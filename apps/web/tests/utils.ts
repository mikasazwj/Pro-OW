import { Page } from '@playwright/test';

export async function loginAs(page: Page, email: string, password: string) {
  const res = await page.request.post('http://localhost:3001/api/v1/auth/login', {
    data: { email, password },
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.ok()) {
    const json = await res.json();
    if (json.code === 0) {
      await page.evaluate(
        ({ token, refreshToken }) => {
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);
        },
        { token: json.data.accessToken, refreshToken: json.data.refreshToken }
      );
    }
  }
}

export async function logout(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  });
}