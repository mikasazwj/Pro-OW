import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { contentApi } from '../../lib/api';

interface Board { id: string; name: string; description: string; }
interface Post { id: string; title: string; summary: string; boardName: string; boardSlug: string; likeCount: number; commentCount: number; createdAt: string; }

export default function BoardPage() {
  const { isLoggedIn, user } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeBoard, setActiveBoard] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    contentApi.get<Board[]>('/boards').then(setBoards);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = activeBoard ? '?boardId=' + activeBoard : '';
    contentApi.get<{ items: Post[] }>('/posts' + params)
      .then(d => setPosts(d.items))
      .finally(() => setLoading(false));
  }, [activeBoard]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ow-orange">Pro-OW</h1>
          <p className="text-gray-400 text-sm mt-1">守望先锋社区论坛</p>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <span className="text-gray-400 text-sm">{user?.username}</span>
              <Link to="/post/new" className="px-4 py-2 bg-ow-orange text-black font-bold rounded-lg hover:bg-orange-400 transition-colors text-sm">发帖</Link>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-ow-blue rounded-lg text-sm hover:bg-blue-600">登录</Link>
          )}
        </div>
      </div>

      {/* Board tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setActiveBoard('')} className={'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ' + (!activeBoard ? 'bg-ow-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>全部</button>
        {boards.map(b => (
          <button key={b.id} onClick={() => setActiveBoard(b.id)} className={'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ' + (activeBoard === b.id ? 'bg-ow-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>{b.name}</button>
        ))}
      </div>

      {/* Post list */}
      {loading ? (
        <div className="text-center text-gray-500 py-20">加载中...</div>
      ) : posts.length === 0 ? (
        <div className="text-center text-gray-500 py-20">
          <p className="text-lg mb-2">还没有帖子</p>
          {isLoggedIn && <Link to="/post/new" className="text-ow-blue hover:underline">发布第一条帖子</Link>}
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map(post => (
            <Link key={post.id} to={'/post/' + post.id} className="block p-4 bg-ow-darker rounded-xl hover:bg-gray-800 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-bold truncate">{post.title}</h3>
                  <p className="text-gray-500 text-sm mt-1 truncate">{post.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="text-ow-blue">{post.boardName}</span>
                <span>{post.likeCount} 赞</span>
                <span>{post.commentCount} 评论</span>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
