import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { userApi, contentApi } from '../lib/api';

interface Profile {
  id: string; username: string; nickname: string | null;
  bio: string | null; avatarUrl: string | null; role: string; createdAt: string;
}
interface Post {
  id: string; title: string; summary: string; boardName: string;
  likeCount: number; commentCount: number; createdAt: string;
}
interface Comment {
  id: string; content: string; postId: string; createdAt: string;
}

const s = {
  container: { maxWidth: 1000, margin: '0 auto' } as const,
  header: {
    background: 'var(--bg-surface)', borderRadius: 18, padding: '36px 40px',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)',
    marginBottom: 24, display: 'flex', gap: 24, alignItems: 'center',
  } as const,
  avatar: {
    width: 72, height: 72, borderRadius: 20,
    background: 'linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))',
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, flexShrink: 0,
  } as const,
  section: {
    background: 'var(--bg-surface)', borderRadius: 18, padding: '28px 36px',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)', marginBottom: 20,
  } as const,
  tab: (active: boolean) => ({
    padding: '8px 20px', borderRadius: 10, fontSize: 14, fontWeight: active ? 600 : 500,
    cursor: 'pointer', border: 'none',
    background: active ? 'var(--ow-orange-ghost)' : 'transparent',
    color: active ? 'var(--ow-orange)' : 'var(--text-soft)',
    transition: 'all .15s',
  }),
  postItem: { padding: '14px 0', borderBottom: '1px solid var(--border-light)' } as const,
};

export default function ProfilePage() {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [tab, setTab] = useState<'posts' | 'comments'>('posts');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return; }
    Promise.all([
      userApi.getProfile(),
      contentApi.get<{ items: Post[] }>('/posts?authorId=' + user!.id + '&pageSize=50'),
      contentApi.get<{ items: Comment[] }>('/comments?authorId=' + user!.id + '&pageSize=50'),
    ]).then(([p, postsData, commentsData]) => {
      setProfile(p);
      setPosts((postsData as { items: Post[] }).items);
      setComments((commentsData as { items: Comment[] }).items);
    }).finally(() => setLoading(false));
  }, [isLoggedIn, user?.id]);

  const ago = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return '刚刚'; if (m < 60) return m + '分钟前';
    const h = Math.floor(m / 60); if (h < 24) return h + '小时前';
    return Math.floor(h / 24) + '天前';
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 16 }}>加载中...</div>;
  if (!profile) return <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-muted)', fontSize: 16 }}>用户不存在</div>;

  return (
    <div style={s.container}>
      {/* Profile Header */}
      <div style={s.header}>
        <div style={s.avatar}>{profile.username[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-strong)' }}>
              {profile.nickname || profile.username}
            </h1>
            {profile.nickname && (
              <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>@{profile.username}</span>
            )}
          </div>
          {profile.bio ? (
            <p style={{ fontSize: 14, color: 'var(--text-soft)', marginBottom: 8 }}>{profile.bio}</p>
          ) : (
            <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, fontStyle: 'italic' }}>这个人很懒，什么都没写...</p>
          )}
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            <span>{posts.length} 帖子</span>
            <span>{comments.length} 评论</span>
            <span>{new Date(profile.createdAt).toLocaleDateString('zh-CN')} 加入</span>
          </div>
        </div>
        <Link
          to="/profile/edit"
          style={{
            padding: '10px 22px', borderRadius: 12, border: '1px solid var(--border)',
            color: 'var(--text-soft)', textDecoration: 'none', fontSize: 14, fontWeight: 500,
            background: 'var(--bg-hover)', transition: 'all .15s',
          }}
        >
          编辑资料
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        <button style={s.tab(tab === 'posts')} onClick={() => setTab('posts')}>
          帖子 ({posts.length})
        </button>
        <button style={s.tab(tab === 'comments')} onClick={() => setTab('comments')}>
          评论 ({comments.length})
        </button>
      </div>

      {/* Content */}
      <div style={s.section}>
        {tab === 'posts' ? (
          posts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>暂无帖子</div>
          ) : (
            posts.map(post => (
              <div key={post.id} style={s.postItem}>
                <Link to={'/post/' + post.id} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-strong)', marginBottom: 4 }}>{post.title}</div>
                  <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.summary}</p>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 14 }}>
                    <span>{post.boardName}</span>
                    <span>❤ {post.likeCount}</span>
                    <span>💬 {post.commentCount}</span>
                    <span>{ago(post.createdAt)}</span>
                  </div>
                </Link>
              </div>
            ))
          )
        ) : (
          comments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>暂无评论</div>
          ) : (
            comments.map(c => (
              <div key={c.id} style={s.postItem}>
                <Link to={'/post/' + c.postId} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, marginBottom: 4 }}>
                    {c.content.length > 200 ? c.content.slice(0, 200) + '...' : c.content}
                  </p>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ago(c.createdAt)}</div>
                </Link>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}