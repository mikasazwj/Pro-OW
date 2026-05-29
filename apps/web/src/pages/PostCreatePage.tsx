import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { contentApi } from "../lib/api";

const BOARDS = ["综合讨论","英雄攻略","赛事资讯","组队开黑","创意工坊","灌水区"];
const s: Record<string, any> = {
  container: { maxWidth: 1100, margin: "0 auto" },
  back: { display: "inline-flex", alignItems: "center", gap: 6, fontSize: 15, color: "var(--text-soft)", textDecoration: "none", marginBottom: 24, padding: "6px 14px", borderRadius: 10, transition: "all .15s" },
  card: { background: "var(--bg-surface)", borderRadius: 18, padding: "36px 40px", boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" },
  input: { width: "100%", padding: "14px 18px", borderRadius: 12, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-body)", fontSize: 16, outline: "none", transition: "border-color .15s" },
  btn: { padding: "12px 30px", borderRadius: 12, border: "none", cursor: "pointer", fontSize: 16, fontWeight: 600, background: "var(--ow-orange)", color: "#fff", boxShadow: "0 2px 8px rgba(240,100,36,0.3)", transition: "all .15s" },
  cancelBtn: { padding: "12px 30px", borderRadius: 12, border: "1px solid var(--border)", color: "var(--text-soft)", textDecoration: "none", fontSize: 16, fontWeight: 500, background: "var(--bg-hover)", display: "inline-flex", alignItems: "center" },
  tag: (a: boolean) => ({ padding: "8px 20px", borderRadius: 24, border: "1px solid " + (a ? "var(--ow-orange)" : "var(--border)"), background: a ? "var(--ow-orange-ghost)" : "transparent", color: a ? "var(--ow-orange)" : "var(--text-soft)", cursor: "pointer", fontSize: 15, fontWeight: 500, transition: "all .15s" }),
};
export default function PostCreatePage() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [boardId, setBoardId] = useState("b1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!title.trim()) return setError("请输入标题"); if (content.trim().length < 10) return setError("正文至少10个字"); setLoading(true); try { const r: { id: string } = await contentApi.post("/posts", { boardId, title, content }); navigate("/post/" + r.id); } catch (err: unknown) { setError(err instanceof Error ? err.message : "发布失败"); } finally { setLoading(false); } };
  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}><svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>返回</Link>
      <div style={s.card}>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 32, letterSpacing: "-0.5px" }}>发布新帖</h1>
        {error && <div style={{ padding: "14px 18px", borderRadius: 12, background: "var(--red-ghost)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--red)", fontSize: 15, fontWeight: 500, marginBottom: 24 }}>{error}</div>}
        <form onSubmit={submit}>
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "var(--text-strong)" }}>选择板块</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>{BOARDS.map((name, i) => (<button key={i} type="button" onClick={() => setBoardId("b" + (i + 1))} style={s.tag(boardId === "b" + (i + 1))}>{name}</button>))}</div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <input style={s.input} value={title} onChange={e => setTitle(e.target.value)} placeholder="标题" maxLength={200} onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
          </div>
          <div style={{ marginBottom: 32 }}>
            <textarea style={{ ...s.input, resize: "vertical", fontFamily: "inherit" }} rows={14} value={content} onChange={e => setContent(e.target.value)} placeholder="正文（至少10个字）" onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={loading} style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}>{loading ? "发布中..." : "发布帖子"}</button>
            <Link to="/boards" style={s.cancelBtn}>取消</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
