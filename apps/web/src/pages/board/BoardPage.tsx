import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { contentApi, socialApi } from '../../lib/api';

interface Board { id: string; name: string; }
interface Post { id: string; title: string; summary: string; boardName: string; authorName: string; likeCount: number; commentCount: number; createdAt: string; }

const S = {
  page: { maxWidth: 800, margin: '0 auto' },
  tabs: { display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' as const },
  tab: (active: boolean) => ({
    padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: '1px solid ' + (active ? 'var(--brand)' : 'var(--border)'),
    color: active ? 'var(--brand)' : 'var(--text-secondary)',
    background: active ? 'var(--brand-muted)' : 'transparent',
    transition: 'all .15s', whiteSpace: 'nowrap' as const,
  }),
  sortBtn: (active: boolean) => ({
    fontSize: 12, padding: '4px 10px', borderRadius: 6, cursor: 'pointer',
    background: active ? 'var(--bg-hover)' : 'transparent',
    color: active ? 'var(--text-primary)' : 'var(--text-muted)',
    border: 'none', fontWeight: active ? 600 : 400,
  }),
  card: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8,
    marginBottom: 8, transition: 'border-color .15s',
  },
  empty: { textAlign: 'center' as const, padding: '64px 0', color: 'var(--text-muted)' },
  chip: (color: string) => ({ fontSize: 11, padding: '1px 8px', borderRadius: 10, background: color, color: '#fff', fontWeight: 500 }),
  meta: { fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 },
  metaBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 3, padding: 2 },
  avatar: (name: string) => ({
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #f78166, #db6d28)',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700, flexShrink: 0,
  }),
};

export default function BoardPage() {
  const { isLoggedIn } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeBoard, setActiveBoard] = useState('');
  const [sortBy, setSortBy] = useState<'latest' | 'hot'>('latest');
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (activeBoard) p.set('boardId', activeBoard);
    if (sortBy === 'hot') p.set('sort', 'hot');
    contentApi.get<{ items: Post[] }>('/posts?' + p.toString()).then(d => setPosts(d.items)).finally(() => setLoading(false));
  };

  useEffect(() => { contentApi.get<Board[]>('/boards').then(setBoards); }, []);
  useEffect(() => { fetch(); }, [activeBoard, sortBy]);

  const like = async (id: string) => {
    if (!isLoggedIn) return;
    try { const r = await socialApi.likePost(id); setPosts(prev => prev.map(p => p.id === id ? { ...p, likeCount: r.likeCount } : p)); } catch {}
  };

  const ago = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return '刚刚'; if (m < 60) return m + '分钟前';
    const h = Math.floor(m / 60); if (h < 24) return h + '小时前';
    return Math.floor(h / 24) + '天前';
  };

  return (
    <div style={S.page}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={S.tabs}>
          <button style={S.tab(!activeBoard)} onClick={() => setActiveBoard('')}>全部</button>
          {boards.map(b => <button key={b.id} style={S.tab(activeBoard === b.id)} onClick={() => setActiveBoard(b.id)}>{b.name}</button>)}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button style={S.sortBtn(sortBy === 'latest')} onClick={() => setSortBy('latest')}>最新</button>
          <button style={S.sortBtn(sortBy === 'hot')} onClick={() => setSortBy('hot')}>最热</button>
        </div>
      </div>

      {loading ? <div style={S.empty}>加载中...</div> : posts.length === 0 ? <div style={S.empty}>暂无帖子</div> : posts.map(post => (
        <div key={post.id} style={S.card} onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--brand)')} onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
          <Link to={'/post/' + post.id} style={{ display: 'block', padding: '16px 20px', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={S.avatar(post.authorName)}>{post.authorName?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={S.chip('#30363d')}>{post.boardName}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3' }}>{post.title}</span>
                </div>
                <p style={{ fontSize: 13, color: '#8b949e', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{post.summary}</p>
                <div style={S.meta}>
                  <span style={{ fontWeight: 500, color: '#8b949e' }}>{post.authorName}</span>
                  <span>{ago(post.createdAt)}</span>
                  <button style={S.metaBtn} onClick={e => { e.preventDefault(); like(post.id); }} title="点赞">
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {post.likeCount}
                  </button>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
