const levelConfig: Record<string, { color: string; bg: string }> = {  
  Bronze: { color: "#CD7F32", bg: "rgba(205,127,50,0.12)" },  
  Silver: { color: "#C0C0C0", bg: "rgba(192,192,192,0.12)" },  
  Gold: { color: "#FFD700", bg: "rgba(255,215,0,0.15)" },  
  Platinum: { color: "#E5E4E2", bg: "rgba(229,228,226,0.15)" },  
  Diamond: { color: "#B9F2FF", bg: "rgba(185,242,255,0.15)" },  
  Master: { color: "#A0A0FF", bg: "rgba(160,160,255,0.15)" },  
  Grandmaster: { color: "#FF8C00", bg: "rgba(255,140,0,0.15)" },  
  Top500: { color: "#FF4500", bg: "rgba(255,69,0,0.15)" },  
};  
  
export default function LevelBadge({ level, exp }: { level?: string; exp?: number }) {  
  if (!level) return null;  
  return (  
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}33` }}>  
      {level} {exp !== undefined && (<span style={{ opacity: 0.7, fontSize: 11 }}>{exp} XP</span>)}  
    </span>  
  );  
} 
