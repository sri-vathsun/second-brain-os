"use client";

import { useState } from "react";
import { api, Note } from "@/lib/api";

interface Props { note: Note; onClose: () => void; }

export default function NoteView({ note, onClose }: Props) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [strength] = useState(Math.random() * 0.7 + 0.1); // placeholder

  const handleSummarize = async () => {
    setLoading(true);
    setSummary(null);
    try {
      const res = await api.summarize(note.content || note.title);
      setSummary(res.summary);
    } catch { setSummary("Could not generate summary — AI service may be offline."); }
    finally { setLoading(false); }
  };

  const strengthPct = Math.round(strength * 100);
  const strengthColor = strength > 0.7 ? "var(--success)" : strength > 0.4 ? "var(--warning)" : "var(--danger)";

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="glass" style={{
        width: "100%", maxWidth: 680, maxHeight: "85vh",
        display: "flex", flexDirection: "column", overflow: "hidden",
        borderRadius: "var(--radius-xl)", border: "1px solid var(--glass-border)",
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid var(--glass-border)",
          display: "flex", alignItems: "flex-start", gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4 }}>{note.title}</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {note.created_at ? new Date(note.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Unknown date"}
              {" · "}{note.review_count} reviews
            </p>
          </div>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "var(--text-muted)",
            cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4,
          }}>✕</button>
        </div>

        {/* Memory strength */}
        <div style={{ padding: "12px 24px", borderBottom: "1px solid var(--glass-border)", background: "rgba(255,255,255,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 13, color: "var(--text-muted)", whiteSpace: "nowrap" }}>Memory strength</span>
            <div style={{ flex: 1, height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${strengthPct}%`, background: strengthColor, borderRadius: 99, transition: "width 1s ease" }} />
            </div>
            <span style={{ fontSize: 13, color: strengthColor, fontWeight: 600, minWidth: 36 }}>{strengthPct}%</span>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: 15, whiteSpace: "pre-wrap" }}>
            {note.content || "(No content)"}
          </p>

          {/* Summary */}
          {summary && (
            <div style={{
              marginTop: 24, padding: 20, borderRadius: "var(--radius-md)",
              background: "linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))",
              border: "1px solid rgba(124,58,237,0.2)",
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent-purple)", marginBottom: 8 }}>🤖 AI Summary</div>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{summary}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid var(--glass-border)", display: "flex", gap: 12 }}>
          <button className="btn-primary" onClick={handleSummarize} disabled={loading} style={{ flex: 1, justifyContent: "center" }}>
            {loading ? (
              <><span style={{ animation: "spin-slow 1s linear infinite", display: "inline-block" }}>⟳</span> Summarising...</>
            ) : "✨ AI Summarise"}
          </button>
          <button className="btn-ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
