import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentApi } from '../lib/api';

interface Board { id: string; name: string; }

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [boardId, setBoardId] = useState('b1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (content.length < 10) { setError('内容至少10个字'); return; }
    setLoading(true);
    try {
      const r: { id: string } = await contentApi.post('/posts', { boardId, title, content });
      navigate('/post/' + r.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">发布新帖</h1>
      
      {error && <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-400 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <select value={boardId} onChange={e => setBoardId(e.target.value)} className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none text-sm">
          <option value="b1">综合讨论</option>
          <option value="b2">英雄攻略</option>
          <option value="b3">赛事资讯</option>
          <option value="b4">组队开黑</option>
          <option value="b5">创意工坊</option>
          <option value="b6">灌水区</option>
        </select>
        
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="标题" maxLength={200} className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none text-sm" required />

        <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="正文（至少10个字）" rows={10} className="w-full p-3 bg-gray-800 rounded-lg border border-gray-700 focus:border-ow-blue outline-none text-sm resize-y" required />

        <button type="submit" disabled={loading} className="w-full p-3 bg-ow-orange text-black font-bold rounded-lg hover:bg-orange-400 transition-colors disabled:opacity-50">
          {loading ? '发布中...' : '发布帖子'}
        </button>
      </form>
    </div>
  );
}
