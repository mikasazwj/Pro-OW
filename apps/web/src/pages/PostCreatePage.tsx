import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contentApi } from '../lib/api';

const BOARDS = ['综合讨论','英雄攻略','赛事资讯','组队开黑','创意工坊','灌水区'];

const s: Record<string, any> = {
  container: { maxWidth: 768, margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 },
  card: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '28px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 14, outline: 'none' },
  btn: { padding: '10px 28px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, background: 'var(--brand)', color: '#fff' },
  tag: (active: boolean) => ({ padding: '6px 16px', borderRadius: 20, border: '1px solid ' + (active ? 'var(--brand)' : 'var(--border)'), background: active ? 'var(--brand-muted)' : 'transparent', color: active ? 'var(--brand)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: 12, fontWeight: 500, transition: 'all .15s' }),
};

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [boardId, setBoardId] = useState('b1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError('请输入标题');
    if (content.trim().length < 10) return setError('正文至少10个字');
    setLoading(true);
    try { const r: { id: string } = await contentApi.post('/posts', { boardId, title, content }); navigate('/post/' + r.id); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : '发布失败'); }
    finally { setLoading(false); }
  };

  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back}>← 返回</Link>

      <div style={s.card}>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>发布新帖</h1>

        {error && <div style={{ padding: '10px 14px', borderRadius: 6, background: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.3)', color: 'var(--red)', fontSize: 13, marginBottom: 16 }}>{error}</div>}

        <form onSubmit={submit}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>选择板块</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {BOARDS.map((name, i) => (
                <button key={i} type="button" onClick={() => setBoardId('b' + (i + 1))} style={s.tag(boardId === 'b' + (i + 1))}>{name}</button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="标题" maxLength={200} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <textarea style={{ ...s.input, resize: 'vertical' }} rows={10} value={content} onChange={e => setContent(e.target.value)} placeholder="正文（至少10个字）" />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.5 : 1 }}>{loading ? '发布中...' : '发布帖子'}</button>
            <Link to="/boards" style={{ padding: '10px 24px', borderRadius: 6, border: '1px solid var(--border)', color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>取消</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
