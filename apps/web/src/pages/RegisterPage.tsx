import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-page)" },
  card: { width: 400, padding: 36, background: "var(--bg-surface)", borderRadius: 16, boxShadow: "0 4px 24px rgba(18,19,28,0.08)", border: "1px solid var(--border-light)" },
  input: { width: "100%", padding: "11px 16px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-body)", fontSize: 14, outline: "none", marginBottom: 14, transition: "border-color .15s" },
  btn: { width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "var(--ow-orange)", color: "#fff", fontSize: 15, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(240,100,36,0.3)", transition: "all .15s" },
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setLoading(true);
    try { await register(email, username, password); navigate("/boards"); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Registration failed"); } finally { setLoading(false); }
  };
  return (
    <div style={s.page}><div style={s.card}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, var(--ow-orange), #E55A1E)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24, color: "#fff", fontWeight: 800 }}>OW</div>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-strong)", marginBottom: 4 }}>Join Pro-OW</h1>
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Create your account</p>
      </div>
      {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--red-ghost)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", fontSize: 13, fontWeight: 500, marginBottom: 16 }}>{error}</div>}
      <form onSubmit={submit}>
        <input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <input style={s.input} type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Username" required onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <input style={s.input} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
        <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.5 : 1 }}>{loading ? "Creating..." : "Sign Up"}</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" }}>Have an account? <Link to="/login" style={{ color: "var(--ow-orange)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link></p>
    </div></div>
  );
}
