import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { socialApi } from "../../lib/api";

export default function AppLayout() {
  const { isLoggedIn, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  useEffect(() => { if (isLoggedIn) socialApi.getNotifications().then(d => setUnread(d.unreadCount)); }, [isLoggedIn]);
  const isActive = (p: string) => location.pathname.startsWith(p);
  const handleLogout = () => { logout(); navigate("/login"); };
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)" }}>
      <header style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-nav)", padding: "0 32px", height: 64, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 32, width: "100%" }}>
          <Link to="/boards" style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 20, color: "var(--text-strong)", textDecoration: "none", letterSpacing: "-0.5px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#fff" }}>OW</span>
            Pro-OW
          </Link>
          <nav style={{ display: "flex", gap: 4, flex: 1 }}>
            <Link to="/boards" style={{ padding: "8px 16px", borderRadius: 10, fontSize: 15, fontWeight: isActive("/boards") ? 600 : 500, color: isActive("/boards") ? "var(--ow-orange)" : "var(--text-soft)", background: isActive("/boards") ? "var(--ow-orange-ghost)" : "transparent", textDecoration: "none", transition: "all .15s" }}>广场</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isLoggedIn ? (<>
              <Link to="/notifications" style={{ position: "relative", width: 40, height: 40, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", color: isActive("/notifications") ? "var(--ow-orange)" : "var(--text-soft)", background: isActive("/notifications") ? "var(--ow-orange-ghost)" : "transparent", transition: "all .15s" }}>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unread > 0 && <span style={{ position: "absolute", top: 2, right: 2, background: "var(--red)", color: "#fff", fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <Link to="/post/new" style={{ padding: "9px 22px", background: "var(--ow-orange)", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all .15s", boxShadow: "0 2px 8px rgba(240,100,36,0.3)" }} onMouseOver={e => { e.currentTarget.style.background = "var(--ow-orange-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.background = "var(--ow-orange)"; e.currentTarget.style.transform = "none"; }}>发帖</Link>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "5px 12px", borderRadius: 12, background: "var(--bg-hover)" }}>
                <div style={{ width: 30, height: 30, borderRadius: 10, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{(user?.username || "?")[0].toUpperCase()}</div>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-body)" }}>{user?.username}</span>
              </div>
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14, padding: "8px 12px", borderRadius: 10, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--red)"; }} onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}>退出</button>
            </>) : (<>
              <Link to="/login" style={{ color: "var(--text-soft)", fontSize: 15, fontWeight: 500, textDecoration: "none", padding: "8px 16px", borderRadius: 10, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseOut={e => { e.currentTarget.style.background = "none"; }}>登录</Link>
              <Link to="/register" style={{ padding: "9px 22px", background: "var(--ow-orange)", color: "#fff", borderRadius: 12, fontSize: 15, fontWeight: 600, textDecoration: "none", transition: "all .15s", boxShadow: "0 2px 8px rgba(240,100,36,0.3)" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; }}>注册</Link>
            </>)}
          </div>
        </div>
      </header>
      <main style={{ padding: "36px 32px 96px" }}><Outlet /></main>
    </div>
  );
}
