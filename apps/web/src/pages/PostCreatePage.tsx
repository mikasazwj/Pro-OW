import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { contentApi } from "../lib/api";

const BOARDS = ["Discussion", "Strategy", "Esports", "LFG", "Workshop", "Off-Topic"];

const s: Record<string, any> = {
  container: { maxWidth: 768, margin: "0 auto" },
  back: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-soft)", textDecoration: "none", marginBottom: 18, padding: "4px 10px", borderRadius: 8, transition: "all .15s" },
  card: { background: "var(--bg-surface)", borderRadius: 14, padding: "30px 32px", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" },
  input: { width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-body)", fontSize: 14, outline: "none", transition: "border-color .15s" },
  btn: { padding: "10px 26px", borderRadius: 10, border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, background: "var(--ow-orange)", color: "#fff", boxShadow: "0 2px 8px rgba(240,100,36,0.3)", transition: "all .15s" },
  cancelBtn: { padding: "10px 26px", borderRadius: 10, border: "1px solid var(--border)", color: "var(--text-soft)", textDecoration: "none", fontSize: 14, fontWeight: 500, background: "var(--bg-hover)", display: "inline-flex", alignItems: "center" },
  tag: (active: boolean) => ({ padding: "6px 16px", borderRadius: 20, border: "1px solid " + (active ? "var(--ow-orange)" : "var(--border)"), background: active ? "var(--ow-orange-ghost)" : "transparent", color: active ? "var(--ow-orange)" : "var(--text-soft)", cursor: "pointer", fontSize: 13, fontWeight: 500, transition: "all .15s" }),
};

export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [boardId, setBoardId] = useState("b1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return setError("Please enter a title");
    if (content.trim().length < 10) return setError("Content must be at least 10 characters");
    setLoading(true);
    try { const r: { id: string } = await contentApi.post("/posts", { boardId, title, content }); navigate("/post/" + r.id); } catch (err: unknown) { setError(err instanceof Error ? err.message : "Failed to publish"); } finally { setLoading(false); }
  };
  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back</Link>
      <div style={s.card}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, letterSpacing: "-0.3px" }}>New Post</h1>
        {error && <div style={{ padding: "10px 14px", borderRadius: 10, background: "var(--red-ghost)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", fontSize: 13, fontWeight: 500, marginBottom: 20 }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: "var(--text-strong)" }}>Board</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BOARDS.map((name, i) => (<button key={i} type="button" onClick={() => setBoardId("b" + (i + 1))} style={s.tag(boardId === "b" + (i + 1))}>{name}</button>))}
            </div>
          </div>
          <div style={{ marginBottom: 22 }}>
            <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="Post title" maxLength={200} onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <textarea style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }} rows={12} value={content} onChange={e => setContent(e.target.value)} placeholder="Write your post (min 10 chars)" onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>{loading ? "Publishing..." : "Publish"}</button>
            <Link to="/boards" style={s.cancelBtn}>Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
