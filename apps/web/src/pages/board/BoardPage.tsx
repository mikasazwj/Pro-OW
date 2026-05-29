import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { contentApi, socialApi } from "../../lib/api";

interface Board { id: string; name: string; }
interface Post { id: string; title: string; summary: string; boardName: string; authorName: string; likeCount: number; commentCount: number; createdAt: string; }

const S = {
  page: { maxWidth: 800, margin: "0 auto" } as const,
  pill: (active: boolean) => ({ padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1px solid " + (active ? "var(--ow-orange)" : "var(--border)"), color: active ? "var(--ow-orange)" : "var(--text-soft)", background: active ? "var(--ow-orange-ghost)" : "transparent", transition: "all .15s", whiteSpace: "nowrap" as const }),
  sort: (active: boolean) => ({ fontSize: 13, padding: "4px 12px", borderRadius: 8, cursor: "pointer", background: active ? "var(--bg-hover)" : "transparent", color: active ? "var(--text-strong)" : "var(--text-muted)", border: "none", fontWeight: active ? 600 : 400 }),
  card: { background: "var(--bg-surface)", borderRadius: 12, marginBottom: 10, boxShadow: "var(--shadow-card)", border: "1px solid var(--border-light)", transition: "all .2s", overflow: "hidden" } as const,
  empty: { textAlign: "center" as const, padding: "64px 0", color: "var(--text-muted)" },
  badge: { fontSize: 11, padding: "2px 10px", borderRadius: 10, background: "var(--ow-orange-ghost)", color: "var(--ow-orange)", fontWeight: 600 },
  meta: { fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 14 } as const,
  metaBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: 12, display: "flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 6, transition: "all .15s" } as const,
  avatar: (name: string) => ({ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, var(--ow-orange), var(--ow-orange-light))", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }) as const,
};

export default function BoardPage() {
  const { isLoggedIn } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeBoard, setActiveBoard] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "hot">("latest");
  const [loading, setLoading] = useState(true);

  const fetch = () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (activeBoard) p.set("boardId", activeBoard);
    if (sortBy === "hot") p.set("sort", "hot");
    contentApi.get<{ items: Post[] }>("/posts?" + p.toString()).then(d => setPosts(d.items)).finally(() => setLoading(false));
  };

  useEffect(() => { contentApi.get<Board[]>("/boards").then(setBoards); }, []);
  useEffect(() => { fetch(); }, [activeBoard, sortBy]);

  const like = async (id: string) => {
    if (!isLoggedIn) return;
    try { const r = await socialApi.likePost(id); setPosts(prev => prev.map(p => p.id === id ? { ...p, likeCount: r.likeCount } : p)); } catch {}
  };

  const ago = (d: string) => {
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
    if (m < 1) return "Just now"; if (m < 60) return m + "m ago";
    const h = Math.floor(m / 60); if (h < 24) return h + "h ago";
    return Math.floor(h / 24) + "d ago";
  };

  return (
    <div style={S.page}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button style={S.pill(!activeBoard)} onClick={() => setActiveBoard("")}>All</button>
          {boards.map(b => <button key={b.id} style={S.pill(activeBoard === b.id)} onClick={() => setActiveBoard(b.id)}>{b.name}</button>)}
        </div>
        <div style={{ display: "flex", gap: 4, background: "var(--bg-hover)", borderRadius: 8, padding: 2 }}>
          <button style={S.sort(sortBy === "latest")} onClick={() => setSortBy("latest")}>Latest</button>
          <button style={S.sort(sortBy === "hot")} onClick={() => setSortBy("hot")}>Hot</button>
        </div>
      </div>

      {loading ? <div style={S.empty}>Loading...</div> : posts.length === 0 ? <div style={S.empty}>No posts yet</div> : posts.map(post => (
        <div key={post.id} style={S.card} onMouseOver={e => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-1px)"; }} onMouseOut={e => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "none"; }}>
          <Link to={"/post/" + post.id} style={{ display: "block", padding: "18px 22px", textDecoration: "none", color: "inherit" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={S.avatar(post.authorName)}>{post.authorName?.[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={S.badge}>{post.boardName}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)" }}>{post.title}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-soft)", marginBottom: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{post.summary}</p>
                <div style={S.meta}>
                  <span style={{ fontWeight: 500, color: "var(--text-body)" }}>{post.authorName}</span>
                  <span>{ago(post.createdAt)}</span>
                  <button style={S.metaBtn} onClick={e => { e.preventDefault(); like(post.id); }} onMouseOver={e => { e.currentTarget.style.color = "var(--red)"; }} onMouseOut={e => { e.currentTarget.style.color = "var(--text-muted)"; }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {post.likeCount}
                  </button>
                  <span style={{ display: "flex", alignItems: "center", gap: 3 }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    {post.commentCount}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
