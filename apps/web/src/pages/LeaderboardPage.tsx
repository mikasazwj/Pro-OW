import { useEffect, useState } from "react";  
import { Link } from "react-router-dom";  
import { socialApi } from "../lib/api";  
import LevelBadge from "../components/LevelBadge";  
  
interface LeaderboardUser { id: string; username: string; nickname: string | null; exp: number; level: string; postCount: number; commentCount: number; }  
  
export default function LeaderboardPage() {  
  const [users, setUsers] = useState<LeaderboardUser[]>([]);  
  const [loading, setLoading] = useState(true);  
  
  useEffect(() => {  
    socialApi.getLeaderboard().then(data => setUsers(data)).finally(() => setLoading(false));  
  }, []);  
  
  if (loading) return <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>加载中...</div>;  
  
  return (  
    <div style={{ maxWidth: 900, margin: "0 auto" }}>  
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-strong)", marginBottom: 24 }}>积分排行榜</h1>  
      <div style={{ background: "var(--bg-surface)", borderRadius: 18, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)", overflow: "hidden" }}>  
        {users.map((u, i) => ( 
          <div key={u.id} style={{ display: "flex", alignItems: "center", padding: "14px 24px", borderBottom: "1px solid var(--border-light)", background: i < 3 ? "var(--ow-orange-ghost)" : "transparent" }}>  
            <span style={{ width: 40, fontSize: 18, fontWeight: 700, color: i < 3 ? "var(--ow-orange)" : "var(--text-muted)" }}>#{i + 1}</span>  
            <Link to={`/profile`} style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, textDecoration: "none", color: "inherit" }}>  
              <div style={{ width: 42, height: 42, borderRadius: 14, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700 }}>{u.username[0].toUpperCase()}</div>  
              <div>  
                <div style={{ fontWeight: 600, color: "var(--text-strong)", fontSize: 15 }}>{u.nickname || u.username}</div>  
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>@{u.username} | {u.postCount} 帖 | {u.commentCount} 评论</div>  
              </div>  
            </Link>  
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>  
              <LevelBadge level={u.level} exp={u.exp} />  
              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ow-orange)" }}>{u.exp} XP</span>  
            </div>  
          </div>  
        ))}  
      </div>  
    </div>  
  );  
} 
