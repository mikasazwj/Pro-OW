import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../lib/api';

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, color: 'var(--text-soft)', textDecoration: 'none', marginBottom: 24, padding: '6px 14px', borderRadius: 10, transition: 'all .15s' },
  card: { background: 'var(--bg-surface)', borderRadius: 18, padding: '36px 40px', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' },
  label: { fontSize: 14, fontWeight: 700, marginBottom: 8, color: 'var(--text-strong)', display: 'block' },
  input: { width: '100%', padding: '12px 16px', borderRadius: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-body)', fontSize: 15, outline: 'none', transition: 'border-color .15s' },
  btn: { padding: '12px 30px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 16, fontWeight: 600, background: 'var(--ow-orange)', color: '#fff', boxShadow: '0 2px 8px rgba(240,100,36,0.3)', transition: 'all .15s' },
};

export default function ProfileEditPage() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    userApi.getProfile().then(p => {
      setNickname(p.nickname || '');
      setBio(p.bio || '');
    }).finally(() => setLoading(false));
  }, [isLoggedIn]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await userApi.updateProfile({ nickname: nickname || undefined, bio: bio || undefined });
      setMessage('保存成功');
      setTimeout(() => navigate('/profile'), 800);
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 16 }}>加载中...</div>;

  return (
    <div style={s.container}>
      <Link to="/profile" style={s.back} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        返回个人主页
      </Link>

      <div style={s.card}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, letterSpacing: '-0.5px' }}>编辑资料</h1>

        {message && (
          <div style={{ padding: '12px 16px', borderRadius: 12, background: message.includes('成功') ? 'rgba(22,163,74,0.1)' : 'var(--red-ghost)', border: '1px solid ' + (message.includes('成功') ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.2)'), color: message.includes('成功') ? 'var(--green)' : 'var(--red)', fontSize: 14, fontWeight: 500, marginBottom: 24 }}>
            {message}
          </div>
        )}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 24 }}>
            <label style={s.label}>昵称</label>
            <input style={s.input} value={nickname} onChange={e => setNickname(e.target.value)} placeholder="设置昵称" maxLength={30} onFocus={e => { e.currentTarget.style.borderColor = 'var(--ow-orange)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <label style={s.label}>个人简介</label>
            <textarea style={{ ...s.input, resize: 'vertical', minHeight: 120 }} value={bio} onChange={e => setBio(e.target.value)} placeholder="介绍一下自己..." maxLength={200} onFocus={e => { e.currentTarget.style.borderColor = 'var(--ow-orange)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" disabled={saving} style={{ ...s.btn, opacity: saving ? 0.6 : 1 }}>
              {saving ? '保存中...' : '保存'}
            </button>
            <Link to="/profile" style={{ padding: '12px 30px', borderRadius: 12, border: '1px solid var(--border)', color: 'var(--text-soft)', textDecoration: 'none', fontSize: 16, fontWeight: 500, background: 'var(--bg-hover)', display: 'inline-flex', alignItems: 'center' }}>
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}