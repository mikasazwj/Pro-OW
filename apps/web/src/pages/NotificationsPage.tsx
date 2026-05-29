import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { socialApi } from "../lib/api";

interface Notification { id: string; title: string; content: string; sourceType: string; sourceId: string; isRead: number; createdAt: string; }
export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<Notification[]>([]);
  useEffect(() => { socialApi.getNotifications().then(d => setNotifs(d.items as Notification[])); socialApi.readAll(); }, []);
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>通知中心</h1>
      {notifs.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)", background: "var(--bg-surface)", borderRadius: 18, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)", fontSize: 16 }}>暂无通知</div>
      ) : (notifs.map(n => (
        <Link key={n.id} to={n.sourceType === "post" ? "/post/" + n.sourceId : "/boards"} style={{ display: "block", padding: "22px 28px", background: "var(--bg-surface)", borderRadius: 16, marginBottom: 10, textDecoration: "none", color: "inherit", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)", borderLeft: n.isRead ? "1px solid var(--border-light)" : "4px solid var(--ow-orange)", opacity: n.isRead ? 0.65 : 1, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: n.isRead ? "var(--bg-hover)" : "var(--ow-orange-ghost)", color: n.isRead ? "var(--text-muted)" : "var(--ow-orange)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{n.isRead ? "📬" : "📨"}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4, color: "var(--text-strong)" }}>{n.title}</div>
              <div style={{ fontSize: 14, color: "var(--text-soft)", lineHeight: 1.6 }}>{n.content}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{new Date(n.createdAt).toLocaleDateString("zh-CN")}</div>
            </div>
            {!n.isRead && <div style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--ow-orange)", flexShrink: 0, marginTop: 10 }} />}
          </div>
        </Link>
      )))}
    </div>
  );
}
