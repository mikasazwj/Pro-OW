import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentApi, socialApi } from '../lib/api';

interface Post { id: string; title: string; content: string; boardId: string; boardName: string; authorId: string; authorName: string; viewCount: number; likeCount: number; commentCount: number; createdAt: string; }
interface Comment { id: string; content: string; parentId: string | null; authorName: string; likeCount: number; createdAt: string; }

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    contentApi.get<Post>('/posts/' + id).then(p => { setPost(p); setLikeCount(p.likeCount); setLoading(false); });
    contentApi.get<{ items: Comment[] }>('/posts/' + id + '/comments').then(d => setComments(d.items));
  }, [id]);

  const handleLike = async () => {
    if (!isLoggedIn || !id) return;
    try {
      const r = await socialApi.likePost(id);
      setLiked(r.liked);
      setLikeCount(r.likeCount);
    } catch (e) { /* ignore */ }
  };

  const handleComment = async () => {
    if (!newComment.trim() || !id) return;
    try {
      const r: { id: string } = await contentApi.post('/posts/' + id + '/comments', { content: newComment });
      setComments(prev => [...prev, { id: r.id, content: newComment, parentId: null, authorName: '我', likeCount: 0, createdAt: new Date().toISOString() }]);
      setNewComment('');
    } catch (e) { /* ignore */ }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return <div className="flex flex-col items-center py-32"><span className="text-5xl mb-4">🔍</span><p className="text-text-secondary">帖子不存在</p></div>;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto px-4 lg:px-8 py-6">
      <Link to="/boards" className="inline-flex items-center gap-1 text-text-muted hover:text-brand-blue text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> 返回列表
      </Link>

      <article className="card p-6 lg:p-8 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-brand-blue-muted text-brand-blue-light">{post.boardName}</span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-surface-border">
          <div className="w-10 h-10 rounded-xl bg-brand-orange-muted flex items-center justify-center text-brand-orange font-bold text-sm">{post.authorName?.[0]?.toUpperCase()}</div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{post.authorName}</p>
            <p className="text-xs text-text-muted">{new Date(post.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })} · {post.viewCount} 阅读</p>
          </div>
        </div>
        <div className="prose prose-invert max-w-none text-[15px] leading-relaxed text-text-secondary whitespace-pre-wrap">{post.content}</div>

        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-surface-border">
          <button onClick={handleLike} className={'flex items-center gap-2 text-sm transition-all ' + (liked ? 'text-semantic-error' : 'text-text-muted hover:text-semantic-error')}>
            <svg className="w-5 h-5" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            <span>{likeCount} 赞</span>
          </button>
        </div>
      </article>

      <section className="card p-6 lg:p-8">
        <h2 className="text-lg font-bold text-text-primary mb-6">评论 ({comments.length})</h2>

        {isLoggedIn && (
          <div className="flex gap-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-brand-orange-muted flex-shrink-0 flex items-center justify-center text-brand-orange text-xs font-bold">我</div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="写下你的评论..."
                rows={2}
                className="input-field resize-none text-sm"
              />
              <div className="flex justify-end mt-2">
                <button onClick={handleComment} disabled={!newComment.trim()} className="btn-primary text-sm px-6 py-2">发布评论</button>
              </div>
            </div>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-text-muted text-sm text-center py-12">暂无评论，来抢沙发吧 🛋️</p>
        ) : (
          <div className="space-y-1">
            {comments.map(c => (
              <div key={c.id} className="flex gap-3 py-4 group">
                <div className="w-8 h-8 rounded-lg bg-surface-hover flex-shrink-0 flex items-center justify-center text-text-secondary text-xs font-bold">{c.authorName?.[0]?.toUpperCase()}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-text-primary">{c.authorName}</span>
                    <span className="text-2xs text-text-muted">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                  </div>
                  <p className="text-sm text-text-secondary leading-relaxed">{c.content}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
