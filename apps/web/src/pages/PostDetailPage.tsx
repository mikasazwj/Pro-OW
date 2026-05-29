import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { contentApi } from '../lib/api';

interface Post { id: string; title: string; content: string; boardId: string; boardName: string; boardSlug: string; authorId: string; viewCount: number; likeCount: number; commentCount: number; createdAt: string; }
interface Comment { id: string; content: string; parentId: string | null; likeCount: number; createdAt: string; }

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    contentApi.get<Post>('/posts/' + id).then(p => { setPost(p); setLoading(false); });
    contentApi.get<{ items: Comment[] }>('/posts/' + id + '/comments').then(d => setComments(d.items));
  }, [id]);

  const handleComment = async () => {
    if (!newComment.trim() || !id) return;
    const r: { id: string } = await contentApi.post('/posts/' + id + '/comments', { content: newComment });
    setComments(prev => [...prev, { id: r.id, content: newComment, parentId: null, likeCount: 0, createdAt: new Date().toISOString() }]);
    setNewComment('');
  };

  if (loading) return <div className="text-center text-gray-500 py-20">加载中...</div>;
  if (!post) return <div className="text-center text-gray-500 py-20">帖子不存在</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/boards" className="text-ow-blue text-sm hover:underline mb-4 inline-block">← 返回列表</Link>
      
      <div className="bg-ow-darker rounded-xl p-6 mb-6">
        <span className="text-ow-blue text-xs">{post.boardName}</span>
        <h1 className="text-2xl font-bold text-white mt-1">{post.title}</h1>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>{post.viewCount} 阅读</span>
          <span>{post.likeCount} 赞</span>
          <span>{post.commentCount} 评论</span>
          <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
        <div className="mt-6 text-gray-300 leading-relaxed whitespace-pre-wrap">{post.content}</div>
      </div>

      {/* Comments */}
      <div className="bg-ow-darker rounded-xl p-6">
        <h3 className="text-lg font-bold text-white mb-4">评论 ({comments.length})</h3>
        
        {isLoggedIn && (
          <div className="flex gap-2 mb-6">
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="写评论..." className="flex-1 p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none text-sm" />
            <button onClick={handleComment} disabled={!newComment.trim()} className="px-4 py-2 bg-ow-blue rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-50">发布</button>
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">暂无评论</p>
        ) : (
          <div className="space-y-4">
            {comments.map(c => (
              <div key={c.id} className="border-b border-gray-800 pb-4 last:border-0">
                <p className="text-gray-300 text-sm">{c.content}</p>
                <span className="text-xs text-gray-600 mt-1">{new Date(c.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
