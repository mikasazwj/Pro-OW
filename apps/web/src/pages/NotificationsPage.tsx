import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { socialApi } from "../lib/api";

interface Notification { id: string; title: string; content: string; sourceType: string; sourceId: string; isRead: number; createdAt: string; }
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  useEffect(() => { socialApi.getNotifications().then(d => setNotifs(d.items as Notification[])); socialApi.readAll(); }, []);
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 24, letterSpacing: "-0.3px" }}>通知中心</h1>
      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 64, color: "var(--text-muted)", background: "var(--bg-surface)", borderRadius: 14, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" }}><div style={{ fontSize: 14, fontWeight: 500 }}>暂无通知</div></div>
      ) : (
        notifs.map(n => (
          <Link key={n.id} to={n.sourceType === "post" ? "/post/" + n.sourceId : "/boards"} style={{ display: "block", padding: "18px 22px", background: "var(--bg-surface)", borderRadius: 12, marginBottom: 8, textDecoration: "none", color: "inherit", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)", borderLeft: n.isRead ? "1px solid var(--border-light)" : "3px solid var(--ow-orange)", opacity: n.isRead ? 0.65 : 1, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: n.isRead ? "var(--bg-hover)" : "var(--ow-orange-ghost)", color: n.isRead ? "var(--text-muted)" : "var(--ow-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{n.isRead ? "📬" : "📨"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: "var(--text-strong)" }}>{n.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-soft)", lineHeight: 1.5 }}>{n.content}</div>
                <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6 }}>{new Date(n.createdAt).toLocaleDateString("zh-CN")}</div>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--ow-orange)", flexShrink: 0, marginTop: 8 }} />}
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
