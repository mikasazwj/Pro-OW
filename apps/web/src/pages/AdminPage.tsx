import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface User {
  id: string;
  username: string;
  email: string;
  nickname: string | null;
  role: string;
  status: string;
  isEmailVerified: number;
  mutedUntil: string | null;
}

const S = {
  page: { maxWidth: 1200, margin: '0 auto' } as const,
  card: { background: 'var(--bg-surface)', borderRadius: 16, padding: '28px 32px', marginBottom: 16, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' } as const,
  btn: { padding: '7px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 4, border: 'none' } as const,
  input: { padding: '8px 14px', borderRadius: 8, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-body)', fontSize: 14, outline: 'none' } as const,
  badge: (color: string) => ({ fontSize: 11, padding: '3px 10px', borderRadius: 8, background: color + '15', color, fontWeight: 600, display: 'inline-block' } as const),
};

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchUsers = async () => {
    try {
      const data = await api.get<User[]>('/auth/admin/users');
      setUsers(data);
    } catch { setMessage('权限不足，仅管理员可访问'); }
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const banUser = async (userId: string) => {
    if (!window.confirm('确定封禁该用户？')) return;
    try {
      await api.post('/auth/admin/ban', { userId, status: 'banned' });
      setMessage('用户已封禁');
      fetchUsers();
    } catch (e: unknown) { setMessage(e instanceof Error ? e.message : '操作失败'); }
  };

  const unbanUser = async (userId: string) => {
    if (!window.confirm('确定解封该用户？')) return;
    try {
      await api.post('/auth/admin/ban', { userId, status: 'active' });
      setMessage('用户已解封');
      fetchUsers();
    } catch (e: unknown) { setMessage(e instanceof Error ? e.message : '操作失败'); }
  };

  const muteUser = async (userId: string, hours: number) => {
    if (!window.confirm(`确定禁言该用户 ${hours} 小时？`)) return;
    try {
      await api.post('/auth/admin/mute', { userId, hours });
      setMessage(`用户已禁言 ${hours} 小时`);
      fetchUsers();
    } catch (e: unknown) { setMessage(e instanceof Error ? e.message : '操作失败'); }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={S.page}>
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
          <h2 style={{ fontSize: 24, color: 'var(--text-strong)', marginBottom: 12 }}>权限不足</h2>
          <p>仅管理员可访问此页面</p>
          <Link to="/boards" style={{ color: 'var(--ow-orange)', fontWeight: 600 }}>返回广场</Link>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)' }}>加载中...</div>;

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-strong)', margin: 0 }}>管理面板</h1>
        <Link to="/boards" style={{ color: 'var(--text-soft)', textDecoration: 'none', fontSize: 14 }}>返回广场</Link>
      </div>

      {message && (
        <div style={{ padding: '12px 18px', borderRadius: 12, background: message.includes('失败') ? 'var(--red-ghost)' : 'rgba(34,197,94,0.1)', border: '1px solid ' + (message.includes('失败') ? 'rgba(220,38,38,0.3)' : 'rgba(34,197,94,0.3)'), color: message.includes('失败') ? 'var(--red)' : '#16a34a', fontSize: 14, fontWeight: 500, marginBottom: 20 }}>
          {message}
          <button onClick={() => setMessage('')} style={{ background: 'none', border: 'none', cursor: 'pointer', float: 'right', color: 'inherit' }}>×</button>
        </div>
      )}

      <div style={S.card}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>用户列表 ({users.length})</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>用户名</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>邮箱</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>角色</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>状态</th>
                <th style={{ textAlign: 'left', padding: '12px 8px', color: 'var(--text-muted)', fontWeight: 600 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-strong)' }}>{u.username}</span>
                    {u.nickname && <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>({u.nickname})</span>}
                  </td>
                  <td style={{ padding: '12px 8px', color: 'var(--text-soft)' }}>
                    {u.email}
                    {u.isEmailVerified ? <span style={{ ...S.badge('#16a34a'), marginLeft: 6 }}>已验证</span> : <span style={{ ...S.badge('#f59e0b'), marginLeft: 6 }}>未验证</span>}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <span style={S.badge(u.role === 'admin' ? '#7c3aed' : '#6366f1')}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    {u.status === 'banned' ? (
                      <span style={S.badge('var(--red)')}>已封禁</span>
                    ) : u.mutedUntil && new Date(u.mutedUntil) > new Date() ? (
                      <span style={S.badge('#f59e0b')}>禁言至 {new Date(u.mutedUntil).toLocaleString('zh-CN')}</span>
                    <button onClick={() => muteUser(u.id, 0)} style={{ ...S.btn, background: '#16a34a', color: '#fff' }}>解除禁言</button>
                    ) : (
                      <span style={S.badge('#16a34a')}>正常</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {u.status === 'banned' ? (
                        <button onClick={() => unbanUser(u.id)} style={{ ...S.btn, background: '#16a34a', color: '#fff' }}>解封</button>
                      ) : (
                        <button onClick={() => banUser(u.id)} style={{ ...S.btn, background: 'var(--red)', color: '#fff' }}>封禁</button>
                      )}
                      <button onClick={() => muteUser(u.id, 1)} style={{ ...S.btn, background: '#f59e0b', color: '#fff' }}>禁言1h</button>
                      <button onClick={() => muteUser(u.id, 24)} style={{ ...S.btn, background: '#f59e0b', color: '#fff' }}>禁言24h</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}