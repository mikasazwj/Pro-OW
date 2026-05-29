import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('密码至少6位');
      return;
    }
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login?registered=1');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-ow-darker rounded-xl">
        <h2 className="text-2xl font-bold mb-2 text-center">注册 Pro-OW</h2>
        <p className="text-gray-500 text-sm text-center mb-6">加入守望先锋玩家社区</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
            required
          />
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 mb-4 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
            required
          />
          <input
            type="password"
            placeholder="密码（至少6位）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 mb-6 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-ow-orange rounded-lg font-bold hover:bg-orange-500 transition-colors disabled:opacity-50"
          >
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p className="text-center mt-4 text-gray-500 text-sm">
          已有账号？<a href="/login" className="text-ow-blue hover:underline">登录</a>
        </p>
      </div>
    </div>
  );
}
