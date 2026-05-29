import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socialApi } from '../lib/api';

interface Post { id: string; title: string; summary: string; boardName: string; authorName: string; likeCount: number; commentCount: number; createdAt: string; }

export default function FavoritesPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { socialApi.getFavorites().then(d => setPosts(d.items as Post[])).finally(() => setLoading(false)); }, []);
  const ago = (d: string) => { const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000); if (m < 1) return '刚刚'; if (m < 60) return m + '分钟前'; const h = Math.floor(m / 60); if (h < 24) return h + '小时前'; return Math.floor(h / 24) + '天前'; };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>我的收藏</h1>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>加载中...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)', background: 'var(--bg-surface)', borderRadius: 16, boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}>还没有收藏任何帖子</div>
      ) : (
        posts.map(post => (
          <Link key={post.id} to={'/post/' + post.id} style={{ display: 'block', padding: '18px 24px', background: 'var(--bg-surface)', borderRadius: 14, marginBottom: 10, textDecoration: 'none', color: 'inherit', boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-light)' }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-strong)', marginBottom: 4 }}>{post.title}</div>
            <p style={{ fontSize: 13, color: 'var(--text-soft)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.summary}</p>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 14 }}>
              <span>{post.boardName}</span><span>{post.authorName}</span><span>{ago(post.createdAt)}</span>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}