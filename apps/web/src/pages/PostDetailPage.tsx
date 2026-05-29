import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentApi, socialApi } from '../lib/api';

interface Post { id: string; title: string; content: string; boardName: string; authorName: string; likeCount: number; commentCount: number; viewCount: number; createdAt: string; }
interface Comment { id: string; content: string; authorName: string; createdAt: string; }

const s = {
  container: { maxWidth: 768, margin: '0 auto' },
  back: { display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'none', marginBottom: 16 },
  article: { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, padding: '24px 28px', marginBottom: 16 },
  badge: { fontSize: 11, padding: '2px 10px', borderRadius: 10, background: 'var(--bg-hover)', color: 'var(--text-secondary)', fontWeight: 500 },
  avatar: (n: string) => ({ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #f78166, #db6d28)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, flexShrink: 0 }),
  btn: { padding: '8px 20px', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer', fontSize: 13, fontWeight: 600, background: 'var(--brand)', color: '#fff', transition: 'opacity .15s' },
  input: { width: '100%', padding: '10px 14px', borderRadius: 6, background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)', fontSize: 13, resize: 'vertical' as const, outline: 'none' },
  comment: { display: 'flex', gap: 10, padding: '14px 0', borderBottom: '1px solid var(--border)' },
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    contentApi.get<Post>('/posts/' + id).then(p => { setPost(p); setLikeCount(p.likeCount); setLoading(false); });
    contentApi.get<{ items: Comment[] }>('/posts/' + id + '/comments').then(d => setComments(d.items));
  }, [id]);

  const like = async () => {
    if (!isLoggedIn || !id) return;
    try { const r = await socialApi.likePost(id); setLiked(r.liked); setLikeCount(r.likeCount); } catch {}
  };

  const submit = async () => {
    if (!text.trim() || !id) return;
    try {
      const r: { id: string } = await contentApi.post('/posts/' + id + '/comments', { content: text });
      setComments(prev => [...prev, { id: r.id, content: text, authorName: '我', createdAt: new Date().toISOString() }]);
      setText('');
    } catch {}
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>加载中...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>帖子不存在</div>;

  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back}>← 返回列表</Link>

      <article style={s.article}>
        <div style={{ marginBottom: 16 }}>
          <span style={s.badge}>{post.boardName}</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#e6edf3', marginBottom: 16, lineHeight: 1.4 }}>{post.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={s.avatar(post.authorName)}>{post.authorName?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{post.authorName}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('zh-CN')} · {post.viewCount} 次阅读</div>
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.75, color: '#c9d1d9', whiteSpace: 'pre-wrap' }}>{post.content}</div>

        <div style={{ display: 'flex', gap: 8, marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button onClick={like} style={{ ...s.btn, background: liked ? 'var(--red)' : 'var(--bg-hover)', color: liked ? '#fff' : 'var(--text-secondary)', border: liked ? 'none' : '1px solid var(--border)' }}>
            <svg width="14" height="14" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24" style={{ marginRight: 4, verticalAlign: -2 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {likeCount}
          </button>
        </div>
      </article>

      <section style={{ ...s.article, padding: '20px 28px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>评论 {comments.length}</h2>

        {isLoggedIn && (
          <div style={{ marginBottom: 20 }}>
            <textarea style={s.input} rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="写下你的评论..." />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={submit} disabled={!text.trim()} style={{ ...s.btn, opacity: text.trim() ? 1 : 0.4 }}>发布评论</button>
            </div>
          </div>
        )}

        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 13 }}>还没有评论</div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={s.comment}>
              <div style={s.avatar(c.authorName)}>{c.authorName?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{c.authorName}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                </div>
                <p style={{ fontSize: 14, color: '#c9d1d9', lineHeight: 1.6 }}>{c.content}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
