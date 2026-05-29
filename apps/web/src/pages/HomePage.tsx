import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-page)", gap: 24 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 80, height: 80, borderRadius: 22, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 32px rgba(240,100,36,0.35)" }}>
          <span style={{ fontSize: 36, color: "#fff", fontWeight: 800 }}>OW</span>
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-1px", marginBottom: 8 }}>Pro-OW</h1>
        <p style={{ fontSize: 17, color: "var(--text-soft)", lineHeight: 1.6 }}>守望先锋社区论坛</p>
      </div>
      {isLoggedIn && user ? (
        <div style={{ background: "var(--bg-surface)", borderRadius: 14, padding: "20px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
            {user.username[0].toUpperCase()}
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-strong)" }}>{user.username}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>已登录 · {user.id.slice(0, 8)}...</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Link to="/boards" style={{ padding: "8px 20px", background: "var(--ow-orange)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", boxShadow: "0 2px 8px rgba(240,100,36,0.3)", transition: "all .15s" }}>进入论坛</Link>
            <button onClick={handleLogout} style={{ padding: "8px 20px", background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-soft)", borderRadius: 10, fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "all .15s" }}>退出登录</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ padding: "12px 32px", background: "var(--ow-orange)", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(240,100,36,0.3)", transition: "all .15s" }}>登录</Link>
          <Link to="/register" style={{ padding: "12px 32px", background: "var(--bg-surface)", color: "var(--text-strong)", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", transition: "all .15s" }}>注册</Link>
        </div>
      )}
      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 24 }}>MVP v0.1 — 前后端已联通</p>
    </div>
  );
}
