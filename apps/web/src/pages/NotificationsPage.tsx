import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socialApi } from '../lib/api';

interface Notification { id: string; title: string; content: string; sourceType: string; sourceId: string; isRead: number; createdAt: string; }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    socialApi.getNotifications().then((d) => setNotifs(d.items as Notification[]));
    socialApi.readAll();
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/boards" className="text-ow-blue text-sm hover:underline mb-4 inline-block">← 返回</Link>
      <h1 className="text-2xl font-bold text-white mb-6">通知</h1>
      
      {notifs.length === 0 ? (
        <p className="text-gray-500 text-center py-16">暂无通知</p>
      ) : (
        <div className="space-y-3">
          {notifs.map(n => (
            <Link
              key={n.id}
              to={n.sourceType === 'post' ? '/post/' + n.sourceId : '/boards'}
              className={'block p-4 rounded-xl transition-colors ' + (n.isRead ? 'bg-ow-darker' : 'bg-blue-500/10 border border-blue-500/30')}
            >
              <p className="text-white text-sm font-bold">{n.title}</p>
              <p className="text-gray-400 text-xs mt-1">{n.content}</p>
              <span className="text-gray-600 text-xs mt-2 block">{new Date(n.createdAt).toLocaleDateString('zh-CN')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
