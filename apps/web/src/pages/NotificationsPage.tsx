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
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>通知中心</h1>

      {notifs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>暂无通知</div>
      ) : (
        notifs.map(n => (
          <Link key={n.id} to={n.sourceType === 'post' ? '/post/' + n.sourceId : '/boards'}
            style={{
              display: 'block', padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 8, marginBottom: 8, textDecoration: 'none', color: 'inherit',
              opacity: n.isRead ? 0.6 : 1, borderLeft: n.isRead ? '1px solid var(--border)' : '3px solid var(--brand)',
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{n.isRead ? '📬' : '📨'}</span>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.content}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString('zh-CN')}</div>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--brand)', flexShrink: 0, marginTop: 6 }} />}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
