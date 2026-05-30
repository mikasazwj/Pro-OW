const USER_API = 'http://localhost:3001/api/v1';
const CONTENT_API = 'http://localhost:3002/api/v1';

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const rt = localStorage.getItem('refreshToken');
  if (!rt) return null;
  try {
    const res = await fetch(USER_API + '/auth/refresh', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken: rt }) });
    const json = await res.json();
    if (!res.ok || json.code !== 0) return null;
    localStorage.setItem('token', json.data.accessToken);
    localStorage.setItem('refreshToken', json.data.refreshToken);
    return json.data.accessToken;
  } catch { return null; }
}

async function request<T>(baseUrl: string, endpoint: string, options?: RequestInit, retry = true): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(baseUrl + endpoint, { ...options, headers });
  const json = await res.json();
  
  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken();
    }
    const newToken = await refreshPromise;
    isRefreshing = false;
    refreshPromise = null;
    if (newToken) return request<T>(baseUrl, endpoint, options, false);
  }
  
  if (!res.ok || json.code !== 0) throw new Error(json.message || '璇锋眰澶辫触');
  return json.data;
}

function requestWithMethod<T>(baseUrl: string, endpoint: string, method: string, body?: unknown): Promise<T> {
  return request<T>(baseUrl, endpoint, { method, body: body ? JSON.stringify(body) : undefined });
}

export const api = {
  get: <T>(endpoint: string) => request<T>(USER_API, endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(USER_API, endpoint, { method: 'POST', body: JSON.stringify(body) }),
};

export const userApi = {
  getProfile: () => request<{ id: string; username: string; nickname: string | null; bio: string | null; avatarUrl: string | null; role: string; createdAt: string }>(USER_API, '/profile'),
  updateProfile: (data: { nickname?: string; bio?: string; avatarUrl?: string }) => requestWithMethod<{ id: string; username: string; nickname: string | null; bio: string | null }>(USER_API, '/profile', 'PUT', data),
};

export const contentApi = {
  get: <T>(endpoint: string) => request<T>(CONTENT_API, endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>(CONTENT_API, endpoint, { method: 'POST', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(CONTENT_API, endpoint, { method: 'DELETE' }),
};

export const socialApi = {
  getNotifications: () => request<{ items: unknown[]; unreadCount: number }>(CONTENT_API, '/notifications'),
  readAll: () => request<null>(CONTENT_API, '/notifications/read-all', { method: 'PATCH' }),
  likePost: (id: string) => request<{ liked: boolean; likeCount: number }>(CONTENT_API, '/posts/' + id + '/like', { method: 'POST' }),
  favoritePost: (id: string) => request<{ favorited: boolean }>(CONTENT_API, '/favorites/post/' + id, { method: 'POST' }),
  unfavoritePost: (id: string) => request<{ favorited: boolean }>(CONTENT_API, '/favorites/post/' + id, { method: 'DELETE' }),
  checkFavorite: (id: string) => request<{ favorited: boolean }>(CONTENT_API, '/favorites/check/post/' + id),
  getFavorites: (page = 1) => request<{ items: unknown[]; total: number }>(CONTENT_API, '/favorites?page=' + page),
  followUser: (userId: string) => request<{ following: boolean }>(CONTENT_API, '/follows/' + userId, { method: 'POST' }),
  unfollowUser: (userId: string) => request<{ following: boolean }>(CONTENT_API, '/follows/' + userId, { method: 'DELETE' }),
  checkFollow: (userId: string) => request<{ following: boolean }>(CONTENT_API, '/follows/check/' + userId),
  getFollowers: (userId: string) => request<{ items: { id: string; username: string }[] }>(CONTENT_API, '/follows/followers/' + userId),
  getFollowing: () => request<{ items: { id: string; username: string }[] }>(CONTENT_API, '/follows/following'),
  search: (q: string) => request<{ items: unknown[]; total: number }>(CONTENT_API, '/search?q=' + encodeURIComponent(q)),
 getUserStats: (id: string) => request<{ id: string; username: string; nickname: string | null; exp: number; level: string; postCount: number; commentCount: number; likeReceived: number }>(CONTENT_API, '/users/' + id + '/stats'),
 getLeaderboard: () => request<Array<{ id: string; username: string; nickname: string | null; exp: number; level: string; postCount: number; commentCount: number }>>(CONTENT_API, '/leaderboard'),
  deletePost: (id: string) => request<null>(CONTENT_API, '/posts/' + id, { method: 'DELETE' }),
  deleteComment: (postId: string, commentId: string) => request<null>(CONTENT_API, '/posts/' + postId + '/comments/' + commentId, { method: 'DELETE' }),
};

export default api;
