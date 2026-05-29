import { useEffect, useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentApi, socialApi } from '../lib/api';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

interface Post { id: string; title: string; content: string; authorId: string; boardName: string; authorName: string; likeCount: number; commentCount: number; viewCount: number; createdAt: string; }
interface Comment { id: string; content: string; authorId: string; authorName: string; parentId: string | null; replyToId: string | null; replyToAuthorName: string | null; createdAt: string; }

const s = {
  container: { maxWidth: 1100, margin: '0 auto' } as const,
  back: { display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 15, color: 'var(--text-soft)', textDecoration: 'none', marginBottom: 24, padding: '6px 14px', borderRadius: 10, transition: 'all .15s' } as const,
  article: { background: 'var(--bg-surface)', borderRadius: 18, padding: '36px 40px', marginBottom: 20, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' } as const,
  badge: { fontSize: 12, padding: '4px 14px', borderRadius: 12, background: 'var(--ow-orange-ghost)', color: 'var(--ow-orange)', fontWeight: 600 } as const,
  avatar: (n: string) => ({ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, flexShrink: 0 }) as const,
  avatarSm: (n: string) => ({ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, flexShrink: 0 }) as const,
  avatarXs: (n: string) => ({ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }) as const,
  btn: { padding: '12px 28px', borderRadius: 12, cursor: 'pointer', fontSize: 15, fontWeight: 600, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 8 } as const,
  input: { width: '100%' as const, padding: '14px 18px', borderRadius: 12, background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-body)', fontSize: 15, resize: 'vertical' as const, outline: 'none', transition: 'border-color .15s' } as const,
  comment: { display: 'flex', gap: 14, padding: '20px 0', borderBottom: '1px solid var(--border-light)' } as const,
  dangerBtn: { padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 4, background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)' } as const,
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [loading, setLoading] = useState(true);
  const [replyTo, setReplyTo] = useState<{ id: string; authorName: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    contentApi.get<Post>('/posts/' + id).then(p => { setPost(p); setLikeCount(p.likeCount); setLoading(false); });
    contentApi.get<{ items: Comment[] }>('/posts/' + id + '/comments').then(d => setComments(d.items));
    if (isLoggedIn) { socialApi.checkFavorite(id).then(r => setFavorited(r.favorited)).catch(() => {}); }
  }, [id]);

  const postHtml = useMemo(() => {
    if (!post) return '';
    try { return marked(post.content) as string; } catch { return post.content; }
  }, [post]);

  const isAdmin = user?.role === 'admin';
  const isPostOwner = user?.id === post?.authorId;

  const like = async () => { if (!isLoggedIn || !id) return; try { const r = await socialApi.likePost(id); setLiked(r.liked); setLikeCount(r.likeCount); } catch {} };
  const toggleFav = async () => {
    if (!isLoggedIn || !id) return;
    try {
      if (favorited) { await socialApi.unfavoritePost(id); setFavorited(false); }
      else { await socialApi.favoritePost(id); setFavorited(true); }
    } catch {}
  };
  const submit = async () => {
    if (!text.trim() || !id) return;
    try {
      const body: Record<string, string> = { content: text };
      if (replyTo) { body.parentId = replyTo.id; body.replyToId = replyTo.id; body.replyToAuthorName = replyTo.authorName; }
      const r: Comment = await contentApi.post('/posts/' + id + '/comments', body);
      setComments(prev => [...prev, r]);
      setText('');
      setReplyTo(null);
    } catch {}
  };

  const deletePost = async () => {
    if (!id || !window.confirm('确定删除此帖子吗？')) return;
    try {
      await socialApi.deletePost(id);
      navigate('/boards');
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '删除失败');
    }
  };

  const deleteComment = async (commentId: string) => {
    if (!id || !window.confirm('确定删除此评论吗？')) return;
    try {
      await socialApi.deleteComment(id, commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : '删除失败');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 16 }}>加载中...</div>;
  if (!post) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 16 }}>帖子不存在</div>;

  const topComments = comments.filter(c => !c.parentId);
  const replies = (parentId: string) => comments.filter(c => c.parentId === parentId);

  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back} onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-hover)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>返回广场</Link>
      <article style={s.article}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={s.badge}>{post.boardName}</span>
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{new Date(post.createdAt).toLocaleDateString('zh-CN')} · {post.viewCount} 次阅读</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-strong)', letterSpacing: '-0.5px', margin: 0 }}>{post.title}</h1>
          </div>
          {(isAdmin || isPostOwner) && (
            <button onClick={deletePost} style={{ ...s.dangerBtn, color: 'var(--red)', borderColor: 'rgba(220,38,38,0.3)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; }} onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              删除帖子
            </button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border-light)' }}>
          <div style={s.avatar(post.authorName)}>{post.authorName?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-strong)' }}>{post.authorName}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{new Date(post.createdAt).toLocaleString('zh-CN')}</div>
          </div>
        </div>
        <div style={{ fontSize: 16, lineHeight: 1.85, color: 'var(--text-body)' }} className="markdown-body" dangerouslySetInnerHTML={{ __html: postHtml }} />
        <div style={{ display: 'flex', gap: 10, marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border-light)' }}>
          <button onClick={like} style={{ ...s.btn, background: liked ? 'rgba(220,38,38,0.08)' : 'var(--bg-hover)', color: liked ? 'var(--red)' : 'var(--text-soft)', border: liked ? '1px solid var(--red)' : '1px solid var(--border)' }}>
            <svg width="16" height="16" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {likeCount}
          </button>
          <button onClick={toggleFav} style={{ ...s.btn, background: favorited ? 'rgba(247,179,43,0.12)' : 'var(--bg-hover)', color: favorited ? '#C7940A' : 'var(--text-soft)', border: favorited ? '1px solid rgba(247,179,43,0.3)' : '1px solid var(--border)' }}>
            {favorited ? '★ 已收藏' : '☆ 收藏'}
          </button>
        </div>
      </article>
      <section style={s.article}>
        <h2 style={{ fontSize: 19, fontWeight: 700, marginBottom: 24 }}>评论 {comments.length}</h2>
        {isLoggedIn ? (
          <div style={{ marginBottom: 28 }}>
            {replyTo && (
              <div style={{ padding: '8px 14px', borderRadius: 10, background: 'var(--ow-orange-ghost)', marginBottom: 12, fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>回复 <b>{replyTo.authorName}</b></span>
                <button onClick={() => setReplyTo(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 18 }}>×</button>
              </div>
            )}
            <textarea style={s.input} rows={3} value={text} onChange={e => setText(e.target.value)} placeholder={replyTo ? '写下回复...' : '写下你的评论...'} onFocus={e => { e.currentTarget.style.borderColor = 'var(--ow-orange)'; }} onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; }} />
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={submit} disabled={!text.trim()} style={{ ...s.btn, background: text.trim() ? 'var(--ow-orange)' : 'var(--bg-hover)', color: text.trim() ? '#fff' : 'var(--text-muted)', border: 'none', boxShadow: text.trim() ? '0 2px 8px rgba(240,100,36,0.3)' : 'none' }}>{replyTo ? '回复' : '发布评论'}</button>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0', marginBottom: 28, color: 'var(--text-muted)', fontSize: 14 }}>
            <Link to="/login" style={{ color: 'var(--ow-orange)', fontWeight: 600 }}>登录</Link>后即可评论
          </div>
        )}
        {topComments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)', fontSize: 15 }}>还没有评论</div>
        ) : (
          topComments.map(c => {
            const canDelete = isAdmin || user?.id === c.authorId;
            return (
            <div key={c.id}>
              <div style={s.comment}>
                <div style={s.avatarSm(c.authorName)}>{c.authorName?.[0]?.toUpperCase()}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)' }}>{c.authorName}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
                    {isLoggedIn && (
                      <button onClick={() => setReplyTo({ id: c.id, authorName: c.authorName })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 6 }} onMouseOver={e => { e.currentTarget.style.color = 'var(--ow-orange)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>回复</button>
                    )}
                    {canDelete && (
                      <button onClick={() => deleteComment(c.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)', padding: '2px 8px', borderRadius: 6 }} onMouseOver={e => { e.currentTarget.style.color = 'var(--red)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>删除</button>
                    )}
                  </div>
                  <p style={{ fontSize: 15, color: 'var(--text-body)', lineHeight: 1.7 }}>{c.content}</p>
                </div>
              </div>
              {replies(c.id).map(reply => {
                const canDeleteReply = isAdmin || user?.id === reply.authorId;
                return (
                <div key={reply.id} style={{ ...s.comment, marginLeft: 48, borderBottom: '1px solid var(--border-light)', paddingTop: 12, paddingBottom: 12 }}>
                  <div style={s.avatarXs(reply.authorName)}>{reply.authorName?.[0]?.toUpperCase()}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-strong)' }}>{reply.authorName}</span>
                      {reply.replyToAuthorName && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>回复 {reply.replyToAuthorName}</span>}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(reply.createdAt).toLocaleDateString('zh-CN')}</span>
                      {canDeleteReply && (
                        <button onClick={() => deleteComment(reply.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text-muted)', padding: '1px 6px', borderRadius: 4 }} onMouseOver={e => { e.currentTarget.style.color = 'var(--red)'; }} onMouseOut={e => { e.currentTarget.style.color = 'var(--text-muted)'; }}>删除</button>
                      )}
                    </div>
                    <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.65 }}>{reply.content}</p>
                  </div>
                </div>
                );
              })}
            </div>
            );
          })
        )}
      </section>
    </div>
  );
}