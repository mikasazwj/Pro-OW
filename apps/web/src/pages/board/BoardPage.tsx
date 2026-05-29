import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { contentApi, socialApi } from '../../lib/api';

interface Board { id: string; name: string; slug: string; }
interface Post { id: string; title: string; summary: string; boardName: string; boardSlug: string; authorName: string; likeCount: number; commentCount: number; createdAt: string; }

export default function BoardPage() {
  const { isLoggedIn, token } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeBoard, setActiveBoard] = useState('');
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'latest' | 'hot'>('latest');

  const fetchPosts = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeBoard) params.set('boardId', activeBoard);
    if (sortBy === 'hot') params.set('sort', 'hot');
    contentApi.get<{ items: Post[] }>('/posts' + (params.toString() ? '?' + params.toString() : ''))
      .then(d => setPosts(d.items))
      .finally(() => setLoading(false));
  };

  useEffect(() => { contentApi.get<Board[]>('/boards').then(setBoards); }, []);
  useEffect(() => { fetchPosts(); }, [activeBoard, sortBy]);

  const handleLike = async (postId: string) => {
    if (!isLoggedIn) return;
    try {
      const r = await socialApi.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: r.likeCount } : p));
    } catch (e) { /* ignore */ }
  };

  const timeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return mins + '分钟前';
    const hours = Math.floor(mins / 60);
    if (hours < 24) return hours + '小时前';
    return Math.floor(hours / 24) + '天前';
  };

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <div className="glass sticky top-0 lg:top-0 z-20 px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <button onClick={() => setActiveBoard('')} className={'badge cursor-pointer transition-all ' + (!activeBoard ? 'bg-brand-orange text-text-inverse' : 'bg-surface-card text-text-secondary hover:bg-surface-hover')}>全部</button>
          {boards.map(b => (
            <button key={b.id} onClick={() => setActiveBoard(b.id)} className={'badge cursor-pointer whitespace-nowrap transition-all ' + (activeBoard === b.id ? 'bg-brand-orange text-text-inverse' : 'bg-surface-card text-text-secondary hover:bg-surface-hover')}>{b.name}</button>
          ))}
        </div>
        <div className="flex gap-2">
          {[{ v: 'latest', l: '最新' }, { v: 'hot', l: '最热' }].map(s => (
            <button key={s.v} onClick={() => setSortBy(s.v as 'latest' | 'hot')} className={'text-xs px-3 py-1.5 rounded-lg transition-all ' + (sortBy === s.v ? 'bg-brand-blue text-white' : 'text-text-muted hover:text-text-secondary')}>{s.l}</button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 lg:px-8 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
            <p className="text-text-muted text-sm">加载中...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="text-5xl">📝</span>
            <p className="text-text-secondary text-lg font-medium">还没有帖子</p>
            <p className="text-text-muted text-sm">成为第一个发帖的人吧</p>
            {isLoggedIn && <Link to="/post/new" className="btn-primary mt-2">✏️ 发布第一条帖子</Link>}
          </div>
        ) : (
          <div className="grid gap-3 max-w-4xl mx-auto">
            {posts.map((post, i) => (
              <div key={post.id} className="card animate-slide-up group" style={{ animationDelay: i * 30 + 'ms', animationFillMode: 'backwards' }}>
                <Link to={'/post/' + post.id} className="block p-5">
                  <div className="flex items-start gap-4">
                    {/* Avatar placeholder */}
                    <div className="hidden sm:flex w-10 h-10 rounded-xl bg-brand-orange-muted items-center justify-center text-brand-orange font-bold text-sm flex-shrink-0">
                      {post.authorName?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="badge bg-brand-blue-muted text-brand-blue-light text-2xs">{post.boardName}</span>
                        {i === 0 && sortBy === 'latest' && <span className="badge bg-brand-orange-muted text-brand-orange text-2xs">NEW</span>}
                      </div>
                      <h3 className="text-[15px] font-semibold text-text-primary group-hover:text-brand-orange transition-colors leading-snug truncate">{post.title}</h3>
                      <p className="text-[13px] text-text-muted mt-1.5 line-clamp-2 leading-relaxed">{post.summary}</p>
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-4 px-5 pb-4 text-xs text-text-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-surface-hover flex items-center justify-center text-2xs font-bold">{post.authorName?.[0]?.toUpperCase()}</span>
                    {post.authorName}
                  </span>
                  <span className="text-surface-border">·</span>
                  <span>{timeAgo(post.createdAt)}</span>
                  <span className="text-surface-border">·</span>
                  <button onClick={(e) => { e.preventDefault(); handleLike(post.id); }} className="flex items-center gap-1 hover:text-semantic-error transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {post.likeCount}
                  </button>
                  <Link to={'/post/' + post.id} className="flex items-center gap-1 hover:text-text-secondary transition-colors" onClick={e => e.stopPropagation()}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {post.commentCount}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
