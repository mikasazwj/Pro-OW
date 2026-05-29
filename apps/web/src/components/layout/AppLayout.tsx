import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { socialApi } from '../../lib/api';

export default function AppLayout() {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (isLoggedIn) socialApi.getNotifications().then(d => setUnread(d.unreadCount)); }, [isLoggedIn]);

  const navStyle = (path: string) => ({
    padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500,
    color: location.pathname === path ? '#e6edf3' : '#8b949e',
    background: location.pathname === path ? 'var(--bg-hover)' : 'transparent',
    transition: 'all .15s',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
        padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, maxWidth: 1280, margin: '0 auto', width: '100%' }}>
          <Link to="/boards" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 18, color: '#e6edf3', textDecoration: 'none' }}>
            <span style={{ color: 'var(--brand)', fontSize: 22 }}>◈</span> Pro-OW
          </Link>

          <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
            <Link to="/boards" style={navStyle('/boards')}>广场</Link>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isLoggedIn ? (
              <>
                <Link to="/notifications" style={{ position: 'relative', color: '#8b949e', padding: 4 }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                  {unread > 0 && <span style={{ position: 'absolute', top: -2, right: -4, background: 'var(--red)', color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread > 9 ? '9+' : unread}</span>}
                </Link>
                <Link to="/post/new" style={{ padding: '6px 16px', background: 'var(--brand)', color: '#fff', borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'opacity .15s' }} onMouseOver={e => (e.currentTarget.style.opacity = '0.85')} onMouseOut={e => (e.currentTarget.style.opacity = '1')}>
                  发帖
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--brand-muted)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{(user?.username || '?')[0].toUpperCase()}</div>
                  <span style={{ fontSize: 13, color: '#8b949e' }}>{user?.username}</span>
                </div>
                <button onClick={logout} style={{ background: 'none', border: 'none', color: '#484f58', cursor: 'pointer', fontSize: 13, padding: '4px 8px' }}>退出</button>
              </>
            ) : (
              <>
                <Link to="/login" style={{ color: '#8b949e', fontSize: 13, textDecoration: 'none' }}>登录</Link>
                <Link to="/register" style={{ padding: '6px 16px', background: 'var(--bg-hover)', color: '#e6edf3', borderRadius: 6, fontSize: 13, fontWeight: 500, textDecoration: 'none', border: '1px solid var(--border)' }}>注册</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 64px' }}>
        <Outlet />
      </main>
    </div>
  );
}
