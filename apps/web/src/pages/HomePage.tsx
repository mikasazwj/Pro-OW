import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate("/login"); };
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-page)", gap: 28 }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 96, height: 96, borderRadius: 26, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 12px 40px rgba(240,100,36,0.40)" }}>
          <span style={{ fontSize: 42, color: "#fff", fontWeight: 800 }}>OW</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 800, color: "var(--text-strong)", letterSpacing: "-1.5px", marginBottom: 10 }}>Pro-OW</h1>
        <p style={{ fontSize: 20, color: "var(--text-soft)", lineHeight: 1.6 }}>守望先锋社区论坛</p>
      </div>
      {isLoggedIn && user ? (
        <div style={{ background: "var(--bg-surface)", borderRadius: 18, padding: "28px 36px", display: "flex", flexDirection: "column", alignItems: "center", gap: 18, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700 }}>{user.username[0].toUpperCase()}</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-strong)" }}>{user.username}</div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>已登录 · {user.id.slice(0, 8)}...</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/boards" style={{ padding: "12px 28px", background: "var(--ow-orange)", color: "#fff", borderRadius: 14, fontSize: 16, fontWeight: 600, textDecoration: "none", boxShadow: "0 4px 16px rgba(240,100,36,0.35)", transition: "all .15s" }}>进入论坛</Link>
            <button onClick={handleLogout} style={{ padding: "12px 28px", background: "var(--bg-hover)", border: "1px solid var(--border)", color: "var(--text-soft)", borderRadius: 14, fontSize: 16, fontWeight: 500, cursor: "pointer", transition: "all .15s" }}>退出登录</button>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14 }}>
          <Link to="/login" style={{ padding: "16px 40px", background: "var(--ow-orange)", color: "#fff", borderRadius: 16, fontSize: 18, fontWeight: 600, textDecoration: "none", boxShadow: "0 6px 24px rgba(240,100,36,0.35)", transition: "all .15s" }}>登录</Link>
          <Link to="/register" style={{ padding: "16px 40px", background: "var(--bg-surface)", color: "var(--text-strong)", borderRadius: 16, fontSize: 18, fontWeight: 600, textDecoration: "none", border: "1px solid var(--border)", boxShadow: "var(--shadow-card)", transition: "all .15s" }}>注册</Link>
        </div>
      )}
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 32 }}>MVP v0.1 — 前后端已联通</p>
    </div>
  );
}
