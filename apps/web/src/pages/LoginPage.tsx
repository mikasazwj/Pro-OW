import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/boards');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-root flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-scale-in">
        <div className="text-center mb-8">
          <Link to="/boards" className="inline-flex items-center gap-2">
            <span className="text-3xl">🦾</span>
            <h1 className="text-2xl font-bold text-brand-orange">Pro-OW</h1>
          </Link>
          <p className="text-text-muted text-sm mt-2">守望先锋玩家社区</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold text-text-primary mb-6 text-center">欢迎回来</h2>

          {error && <div className="mb-4 p-3 bg-semantic-error/10 border border-semantic-error/30 rounded-xl text-sm text-semantic-error text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">邮箱</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1.5">密码</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="输入密码" className="input-field" required />
            </div>
            <button type="submit" disabled={loading}
              className="btn-primary w-full py-3 mt-2">{loading ? '登录中...' : '登录'}</button>
          </form>

          <p className="text-center mt-6 text-sm text-text-muted">
            还没有账号？<Link to="/register" className="text-brand-blue hover:underline font-medium">立即注册</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
