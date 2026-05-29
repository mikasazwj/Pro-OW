import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-page)" },
  card: { width: 440, padding: 44, background: "var(--bg-surface)", borderRadius: 20, boxShadow: "0 4px 32px rgba(18,19,28,0.10)", border: "1px solid var(--border-light)" },
  input: { width: "100%", padding: "14px 18px", borderRadius: 12, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-body)", fontSize: 16, outline: "none", marginBottom: 16, transition: "border-color .15s" },
  btn: { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "var(--ow-orange)", color: "#fff", fontSize: 17, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(240,100,36,0.3)", transition: "all .15s" },
};
export default function LoginPage() {
  const { login } = useAuth(); const navigate = useNavigate();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => { e.preventDefault(); setError(""); setLoading(true); try { await login(email, password); navigate("/boards"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "登录失败"); } finally { setLoading(false); } };
  return (
    <div style={s.page}><div style={s.card}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 28, color: "#fff", fontWeight: 800 }}>OW</div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-strong)", marginBottom: 6 }}>欢迎回来</h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)" }}>登录 Pro-OW</p>
      </div>
      {error && <div style={{ padding: "12px 16px", borderRadius: 12, background: "var(--red-ghost)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", fontSize: 14, fontWeight: 500, marginBottom: 20 }}>{error}</div>}
      <form onSubmit={submit}>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" required onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="密码" required onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.5 : 1, marginTop: 8 }}>{loading ? "登录中..." : "登录"}</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 24, fontSize: 15, color: "var(--text-muted)" }}>还没有账号？<Link to="/register" style={{ color: "var(--ow-orange)", textDecoration: "none", fontWeight: 600 }}>立即注册</Link></p>
    </div></div>
  );
}
