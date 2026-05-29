import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import api from '../lib/api';

interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data: { accessToken: string } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.accessToken);
    setToken(data.accessToken);
    // 简单解码 JWT 取用户信息（不验证签名，后端已验证）
    const payload = JSON.parse(atob(data.accessToken.split('.')[1]));
    setUser({ id: payload.sub, username: payload.username, avatarUrl: null, role: payload.role });
  }, []);

  const register = useCallback(async (username: string, email: string, password: string) => {
    await api.post('/auth/register', { username, email, password });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
