import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' },
  card: { width: 380, padding: 32, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, outline: 'none', marginBottom: 14 },
  btn: { width: '100%', padding: '10px', borderRadius: 6, border: 'none', background: 'var(--blue)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' },
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (password.length < 6) return setError('密码至少6位');
    setLoading(true);
    try { await register(username, email, password); navigate('/login?registered=1'); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : '注册失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.card}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--brand)', marginBottom: 4 }}>Pro-OW</h1>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>加入守望先锋玩家社区</p>
        </div>

        {error && <div style={{ padding: '8px 12px', borderRadius: 6, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)', fontSize: 12, marginBottom: 14, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={submit}>
          <input style={s.input} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="用户名" required />
          <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" required />
          <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码（至少6位）" required />
          <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.5 : 1 }}>{loading ? '注册中...' : '注册'}</button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'var(--text-muted)' }}>
          已有账号？<Link to="/login" style={{ color: 'var(--brand)', textDecoration: 'none' }}>登录</Link>
        </p>
      </div>
    </div>
  );
}
