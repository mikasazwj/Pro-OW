import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { contentApi, socialApi } from '../../lib/api';

interface Board { id: string; name: string; description: string; }
interface Post { id: string; title: string; summary: string; boardName: string; boardSlug: string; authorName: string; likeCount: number; commentCount: number; createdAt: string; }

export default function BoardPage() {
  const { isLoggedIn, user, token } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeBoard, setActiveBoard] = useState('');
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  const fetchPosts = () => {
    const params = activeBoard ? '?boardId=' + activeBoard : '';
    contentApi.get<{ items: Post[] }>('/posts' + params).then(d => setPosts(d.items));
  };

  useEffect(() => { contentApi.get<Board[]>('/boards').then(setBoards); }, []);
  useEffect(() => { setLoading(true); fetchPosts(); setLoading(false); }, [activeBoard]);
  useEffect(() => { if (isLoggedIn) { socialApi.getNotifications().then((d: { unreadCount: number }) => setUnreadNotifs(d.unreadCount)); } }, [isLoggedIn, token]);

  const handleLike = async (postId: string) => {
    if (!isLoggedIn) return;
    try {
      const r: { liked: boolean; likeCount: number } = await socialApi.likePost(postId);
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, likeCount: r.likeCount } : p));
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-ow-orange">Pro-OW</h1>
          <p className="text-gray-400 text-sm mt-1">守望先锋社区论坛</p>
        </div>
        <div className="flex items-center gap-4">
          {isLoggedIn ? (<>
            <Link to="/notifications" className="relative text-gray-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{unreadNotifs}</span>}
            </Link>
            <span className="text-gray-400 text-sm">{user?.username}</span>
            <Link to="/post/new" className="px-4 py-2 bg-ow-orange text-black font-bold rounded-lg hover:bg-orange-400 transition-colors text-sm">发帖</Link>
          </>) : (<Link to="/login" className="px-4 py-2 bg-ow-blue rounded-lg text-sm hover:bg-blue-600">登录</Link>)}
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setActiveBoard('')} className={'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ' + (!activeBoard ? 'bg-ow-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>全部</button>
        {boards.map(b => (<button key={b.id} onClick={() => setActiveBoard(b.id)} className={'px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ' + (activeBoard === b.id ? 'bg-ow-blue text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700')}>{b.name}</button>))}
      </div>

      {loading ? (<div className="text-center text-gray-500 py-20">加载中...</div>) : posts.length === 0 ? (<div className="text-center text-gray-500 py-20"><p className="text-lg mb-2">还没有帖子</p>{isLoggedIn && <Link to="/post/new" className="text-ow-blue hover:underline">发布第一条帖子</Link>}</div>) : (
        <div className="space-y-3">
          {posts.map(post => (
            <div key={post.id} className="block p-4 bg-ow-darker rounded-xl hover:bg-gray-800 transition-colors">
              <Link to={'/post/' + post.id} className="block">
                <h3 className="text-white font-bold truncate">{post.title}</h3>
                <p className="text-gray-500 text-sm mt-1 truncate">{post.summary}</p>
              </Link>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="text-ow-blue">{post.boardName}</span>
                <span>{post.authorName}</span>
                <button onClick={() => handleLike(post.id)} className="hover:text-red-400 transition-colors">{post.likeCount} 赞</button>
                <Link to={'/post/' + post.id} className="hover:text-gray-300">{post.commentCount} 评论</Link>
                <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
