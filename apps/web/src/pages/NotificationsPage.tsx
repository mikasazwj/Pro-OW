import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { socialApi } from '../lib/api';

interface Notification { id: string; title: string; content: string; sourceType: string; sourceId: string; isRead: number; createdAt: string; }

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    socialApi.getNotifications().then(d => setNotifs(d.items as Notification[]));
    socialApi.readAll();
  }, []);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 lg:px-8 py-6">
      <h1 className="text-2xl font-bold text-text-primary mb-6">🔔 通知中心</h1>

      {notifs.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3">
          <span className="text-4xl">🔕</span>
          <p className="text-text-secondary font-medium">暂无通知</p>
          <p className="text-text-muted text-sm">当有人回复你的帖子时会在这里显示</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <Link key={n.id} to={n.sourceType === 'post' ? '/post/' + n.sourceId : '/boards'}
              className={'card block p-4 transition-all duration-200 ' + (n.isRead ? 'opacity-60 hover:opacity-100' : 'border-l-2 border-l-brand-orange')}>
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5">{n.isRead ? '📬' : '📨'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-text-primary">{n.title}</p>
                  <p className="text-xs text-text-muted mt-1">{n.content}</p>
                  <p className="text-2xs text-text-muted mt-2">{new Date(n.createdAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
                {!n.isRead && <span className="w-2 h-2 rounded-full bg-brand-orange flex-shrink-0 mt-2" />}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
