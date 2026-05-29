import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { socialApi } from '../../lib/api';

const NAV_ITEMS = [
  { path: '/boards', label: '帖子广场', icon: '📋' },
  { path: '/boards?board=b2', label: '英雄攻略', icon: '⚔️' },
  { path: '/boards?board=b4', label: '组队开黑', icon: '👥' },
  { path: '/boards?board=b5', label: '创意工坊', icon: '🔧' },
];

export default function AppLayout() {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useState(() => { if (isLoggedIn) { socialApi.getNotifications().then(d => setUnreadNotifs(d.unreadCount)); } });

  return (
    <div className="min-h-screen bg-surface-root flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-surface-base border-r border-surface-border flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="p-5 border-b border-surface-border">
          <Link to="/boards" className="flex items-center gap-2.5">
            <span className="text-2xl">🦾</span>
            <div>
              <h1 className="text-lg font-bold text-brand-orange leading-tight">Pro-OW</h1>
              <p className="text-2xs text-text-muted">守望先锋社区</p>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={'sidebar-link ' + (location.pathname + location.search === item.path ? 'active' : '')}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-surface-border">
            {isLoggedIn ? (
              <>
                <Link to="/post/new" className="btn-primary w-full justify-center text-center mb-3 block" onClick={() => setSidebarOpen(false)}>
                  ✏️ 发布新帖
                </Link>
                <Link to="/notifications" className="sidebar-link" onClick={() => setSidebarOpen(false)}>
                  <span className="relative">
                    <span className="text-lg">🔔</span>
                    {unreadNotifs > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-semantic-error text-white text-2xs rounded-full flex items-center justify-center font-bold">{unreadNotifs > 9 ? '9+' : unreadNotifs}</span>
                    )}
                  </span>
                  <span>通知中心</span>
                </Link>
                <div className="px-4 py-3 mt-2 rounded-xl bg-surface-card">
                  <p className="text-xs text-text-secondary">当前用户</p>
                  <p className="text-sm font-semibold text-text-primary">{user?.username}</p>
                </div>
                <button onClick={() => { logout(); setSidebarOpen(false); }} className="sidebar-link w-full text-left mt-1">
                  <span className="text-lg">🚪</span> 退出登录
                </button>
              </>
            ) : (
              <div className="space-y-2 px-2">
                <Link to="/login" className="btn-primary w-full justify-center text-center block" onClick={() => setSidebarOpen(false)}>登录</Link>
                <Link to="/register" className="btn-secondary w-full justify-center text-center block" onClick={() => setSidebarOpen(false)}>注册账号</Link>
              </div>
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-surface-border">
          <p className="text-2xs text-text-muted text-center">Pro-OW v0.1 MVP</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost text-xl">☰</button>
          <span className="font-bold text-brand-orange">Pro-OW</span>
          <div className="w-8" />
        </div>

        <Outlet />
      </main>
    </div>
  );
}
