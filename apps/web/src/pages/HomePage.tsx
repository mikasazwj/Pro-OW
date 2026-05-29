import { useAuth } from '../contexts/AuthContext';

export default function HomePage() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <h1 className="text-5xl font-bold text-ow-orange">Pro-OW</h1>
      <p className="text-xl text-gray-400">守望先锋社区论坛</p>

      {isLoggedIn && user ? (
        <div className="flex flex-col items-center gap-4">
          <div className="px-6 py-4 bg-ow-darker rounded-xl text-center">
            <p className="text-lg text-white font-bold">{user.username}</p>
            <p className="text-sm text-gray-500">已登录 · {user.id.slice(0, 8)}...</p>
          </div>
          <button
            onClick={logout}
            className="px-6 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
          >
            退出登录
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          <a
            href="/login"
            className="px-6 py-2 bg-ow-blue rounded-lg hover:bg-blue-600 transition-colors"
          >
            登录
          </a>
          <a
            href="/register"
            className="px-6 py-2 border border-gray-500 rounded-lg hover:border-ow-orange transition-colors"
          >
            注册
          </a>
        </div>
      )}

      <p className="text-gray-600 text-sm mt-8">MVP v0.1 — 前后端已联通</p>
    </div>
  );
}
