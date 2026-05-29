import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { contentApi } from '../lib/api';

const BOARDS = [
  { id: 'b1', name: '综合讨论', icon: '💬' },
  { id: 'b2', name: '英雄攻略', icon: '⚔️' },
  { id: 'b3', name: '赛事资讯', icon: '🏆' },
  { id: 'b4', name: '组队开黑', icon: '👥' },
  { id: 'b5', name: '创意工坊', icon: '🔧' },
  { id: 'b6', name: '灌水区', icon: '💦' },
];

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
    if (!title.trim()) { setError('请输入标题'); return; }
    if (content.trim().length < 10) { setError('正文至少10个字'); return; }
    setLoading(true);
    try {
      const r: { id: string } = await contentApi.post('/posts', { boardId, title, content });
      navigate('/post/' + r.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '发布失败');
    } finally { setLoading(false); }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <Link to="/boards" className="inline-flex items-center gap-1 text-text-muted hover:text-brand-blue text-sm mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> 返回
      </Link>

      <div className="card p-6 lg:p-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">✏️ 发布新帖</h1>

        {error && (
          <div className="mb-6 p-4 bg-semantic-error/10 border border-semantic-error/30 rounded-xl text-sm text-semantic-error flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">选择板块</label>
            <div className="grid grid-cols-3 gap-2">
              {BOARDS.map(b => (
                <button key={b.id} type="button" onClick={() => setBoardId(b.id)}
                  className={'flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ' +
                    (boardId === b.id ? 'bg-brand-orange text-text-inverse shadow-glow' : 'bg-surface-base text-text-secondary hover:bg-surface-card border border-surface-border')}>
                  {b.icon} {b.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">标题</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="一句话说清楚你要讨论什么..."
              maxLength={200} className="input-field text-sm" />
            <p className="text-2xs text-text-muted mt-1 text-right">{title.length}/200</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">正文</label>
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="详细说说你的想法...（至少10个字）" rows={12}
              className="input-field text-sm resize-y" />
            <p className="text-2xs text-text-muted mt-1 text-right">{content.length} 字</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="btn-primary flex-1 text-sm py-3">
              {loading ? '⏳ 发布中...' : '🚀 发布帖子'}
            </button>
            <Link to="/boards" className="btn-secondary text-sm py-3">取消</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
