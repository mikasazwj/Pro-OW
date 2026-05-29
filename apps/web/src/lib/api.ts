const API_BASE = 'http://localhost:3001/api/v1';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  
  const res = await fetch(API_BASE + endpoint, { ...options, headers });
  const json = await res.json();
  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || '请求失败');
  }
  return json.data;
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
};

export default api;
