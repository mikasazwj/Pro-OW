import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { contentApi, socialApi } from "../lib/api";

interface Post { id: string; title: string; content: string; boardName: string; authorName: string; likeCount: number; commentCount: number; viewCount: number; createdAt: string; }
interface Comment { id: string; content: string; authorName: string; createdAt: string; }

const s = {
  container: { maxWidth: 768, margin: "0 auto" } as const,
  back: { display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--text-soft)", textDecoration: "none", marginBottom: 18, padding: "4px 10px", borderRadius: 8, transition: "all .15s" } as const,
  article: { background: "var(--bg-surface)", borderRadius: 14, padding: "28px 32px", marginBottom: 16, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)" } as const,
  badge: { fontSize: 11, padding: "3px 12px", borderRadius: 10, background: "var(--ow-orange-ghost)", color: "var(--ow-orange)", fontWeight: 600 } as const,
  avatar: (n: string) => ({ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, flexShrink: 0 }) as const,
  avatarSm: (n: string) => ({ width: 32, height: 32, borderRadius: 10, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }) as const,
  btn: { padding: "9px 22px", borderRadius: 10, cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s", display: "inline-flex", alignItems: "center", gap: 6 } as const,
  input: { width: "100%" as const, padding: "10px 14px", borderRadius: 10, background: "var(--bg-input)", border: "1px solid var(--border)", color: "var(--text-body)", fontSize: 13, resize: "vertical" as const, outline: "none", transition: "border-color .15s" } as const,
  comment: { display: "flex", gap: 12, padding: "16px 0", borderBottom: "1px solid var(--border-light)" } as const,
};

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isLoggedIn } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    contentApi.get<Post>("/posts/" + id).then(p => { setPost(p); setLikeCount(p.likeCount); setLoading(false); });
    contentApi.get<{ items: Comment[] }>("/posts/" + id + "/comments").then(d => setComments(d.items));
  }, [id]);

  const like = async () => {
    if (!isLoggedIn || !id) return;
    try { const r = await socialApi.likePost(id); setLiked(r.liked); setLikeCount(r.likeCount); } catch {}
  };

  const submit = async () => {
    if (!text.trim() || !id) return;
    try {
      const r: { id: string } = await contentApi.post("/posts/" + id + "/comments", { content: text });
      setComments(prev => [...prev, { id: r.id, content: text, authorName: "You", createdAt: new Date().toISOString() }]);
      setText("");
    } catch {}
  };

  if (loading) return <div style={{ textAlign: "center", padding: 64, color: "var(--text-muted)" }}>Loading...</div>;
  if (!post) return <div style={{ textAlign: "center", padding: 64, color: "var(--text-muted)" }}>Post not found</div>;

  return (
    <div style={s.container}>
      <Link to="/boards" style={s.back} onMouseOver={e => { e.currentTarget.style.background = "var(--bg-hover)"; }} onMouseOut={e => { e.currentTarget.style.background = "transparent"; }}>
        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to boards
      </Link>

      <article style={s.article}>
        <div style={{ marginBottom: 16 }}><span style={s.badge}>{post.boardName}</span></div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-strong)", marginBottom: 18, lineHeight: 1.35, letterSpacing: "-0.3px" }}>{post.title}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 24, borderBottom: "1px solid var(--border-light)" }}>
          <div style={s.avatar(post.authorName)}>{post.authorName?.[0]?.toUpperCase()}</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-strong)" }}>{post.authorName}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>{new Date(post.createdAt).toLocaleDateString("zh-CN")} &middot; {post.viewCount} views</div>
          </div>
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-body)", whiteSpace: "pre-wrap" }}>{post.content}</div>
        <div style={{ display: "flex", gap: 8, marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--border-light)" }}>
          <button onClick={like} style={{ ...s.btn, background: liked ? "var(--red-ghost)" : "var(--bg-hover)", color: liked ? "var(--red)" : "var(--text-soft)", border: liked ? "1px solid var(--red)" : "1px solid var(--border)" }}>
            <svg width="15" height="15" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            {likeCount}
          </button>
        </div>
      </article>

      <section style={s.article}>
        <h2 style={{ fontSize: 17, fontWeight: 700, marginBottom: 20 }}>Comments {comments.length}</h2>
        {isLoggedIn && (
          <div style={{ marginBottom: 24 }}>
            <textarea style={s.input} rows={3} value={text} onChange={e => setText(e.target.value)} placeholder="Write a comment..." onFocus={e => { e.currentTarget.style.borderColor = "var(--ow-orange)"; }} onBlur={e => { e.currentTarget.style.borderColor = "var(--border)"; }} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
              <button onClick={submit} disabled={!text.trim()} style={{ ...s.btn, background: text.trim() ? "var(--ow-orange)" : "var(--bg-hover)", color: text.trim() ? "#fff" : "var(--text-muted)", border: "none", boxShadow: text.trim() ? "0 2px 8px rgba(240,100,36,0.3)" : "none" }}>Post</button>
            </div>
          </div>
        )}
        {comments.length === 0 ? (
          <div style={{ textAlign: "center", padding: 36, color: "var(--text-muted)", fontSize: 13 }}>No comments yet</div>
        ) : (
          comments.map(c => (
            <div key={c.id} style={s.comment}>
              <div style={s.avatarSm(c.authorName)}>{c.authorName?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-strong)" }}>{c.authorName}</span>
                  <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString("zh-CN")}</span>
                </div>
                <p style={{ fontSize: 14, color: "var(--text-body)", lineHeight: 1.65 }}>{c.content}</p>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
