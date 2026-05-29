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
      <header style={{ background: "var(--bg-surface)", boxShadow: "var(--shadow-nav)", padding: "0 24px", height: 56, display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <Link to="/boards" style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 800, fontSize: 17, color: "var(--text-strong)", textDecoration: "none", letterSpacing: "-0.3px" }}>
            <span style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: "#fff" }}>OW</span>
            Pro-OW
          </Link>
          <nav style={{ display: "flex", gap: 2, flex: 1 }}>
            <Link to="/boards" style={{ padding: "6px 14px", borderRadius: 8, fontSize: 13, fontWeight: isActive("/boards") ? 600 : 500, color: isActive("/boards") ? "var(--ow-orange)" : "var(--text-soft)", background: isActive("/boards") ? "var(--ow-orange-ghost)" : "transparent", textDecoration: "none", transition: "all .15s" }}>广场</Link>
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isLoggedIn ? (<>
              <Link to="/notifications" style={{ position: "relative", width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", color: isActive("/notifications") ? "var(--ow-orange)" : "var(--text-soft)", background: isActive("/notifications") ? "var(--ow-orange-ghost)" : "transparent", transition: "all .15s" }}>
                <svg width="19" height="19" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                {unread > 0 && <span style={{ position: "absolute", top: 4, right: 4, background: "var(--red)", color: "#fff", fontSize: 10, fontWeight: 700, minWidth: 16, height: 16, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>{unread > 99 ? "99+" : unread}</span>}
              </Link>
              <Link to="/post/new" style={{ padding: "7px 18px", background: "var(--ow-orange)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all .15s", boxShadow: "0 2px 8px rgba(240,100,36,0.3)" }} onMouseOver={e => { e.currentTarget.style.background = "var(--ow-orange-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.background = "var(--ow-orange)"; e.currentTarget.style.transform = "none"; }}>发帖</Link>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 10px", borderRadius: 10, background: "var(--bg-hover)" }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{(user?.username || "?")[0].toUpperCase()}</div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-body)" }}>{user?.username}</span>
              </div>
              <button onClick={handleLogout} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12, padding: "6px 10px", borderRadius: 8, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; e.currentTarget.style.color = "var(--red)"; }} onMouseOut={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "var(--text-muted)"; }}>退出</button>
            </>) : (<>
              <Link to="/login" style={{ color: "var(--text-soft)", fontSize: 13, fontWeight: 500, textDecoration: "none", padding: "6px 14px", borderRadius: 8, transition: "all .15s" }} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseOut={e => { e.currentTarget.style.background = "none"; }}>登录</Link>
              <Link to="/register" style={{ padding: "7px 18px", background: "var(--ow-orange)", color: "#fff", borderRadius: 10, fontSize: 13, fontWeight: 600, textDecoration: "none", transition: "all .15s", boxShadow: "0 2px 8px rgba(240,100,36,0.3)" }} onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.transform = "none"; }}>注册</Link>
            </>)}
          </div>
        </div>
      </header>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 16px 80px" }}><Outlet /></main>
    </div>
  );
}
