"use client";

import { useState, useEffect, useCallback } from "react";
import { api, DailyBriefingData } from "@/lib/api";

export default function DailyBriefing() {
  const [data, setData] = useState<DailyBriefingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetch = useCallback(async () => {
    try {
      const res = await api.getDailyBriefing();
      setData(res);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Could not load briefing");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  if (loading) return (
    <div style={{ display: "grid", gap: 16 }}>
      {[1,2].map(i => <div key={i} style={{ height: 120, borderRadius: 12, background: "var(--glass-bg)", border: "1px solid var(--glass-border)", animation: "shimmer 1.5s infinite" }} />)}
    </div>
  );

  if (error) return (
    <div style={{ padding: 20, borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}>
      ⚠️ {error} — Make sure the backend is running.
    </div>
  );

  const { productivity_insights: pi, notes_for_review: nfr, smart_suggestions: ss } = data!;
  const reviewScore = pi.total_notes > 0 ? Math.round(((pi.total_notes - pi.notes_to_review_count) / pi.total_notes) * 100) : 100;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Total Notes", value: pi.total_notes, icon: "📝", color: "var(--accent-purple)" },
          { label: "For Review", value: pi.notes_to_review_count, icon: "🔔", color: "var(--warning)" },
          { label: "Memory Score", value: `${reviewScore}%`, icon: "🏆", color: "var(--success)" },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="glass" style={{ padding: 20 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Review queue */}
      <div className="glass" style={{ padding: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
          🔔 Notes to Review Today
          <span style={{ fontSize: 12, background: "rgba(245,158,11,0.2)", color: "var(--warning)", padding: "2px 8px", borderRadius: 99 }}>
            {nfr.length}
          </span>
        </h3>
        {nfr.length === 0 ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)" }}>
            <span style={{ fontSize: 32 }}>🎉</span>
            <p style={{ marginTop: 8 }}>All caught up! No reviews needed today.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {nfr.map(note => (
              <div key={note.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 16px", borderRadius: "var(--radius-md)",
                background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)",
              }}>
                <span style={{ fontSize: 16 }}>📖</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{note.title}</div>
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 2 }}>
                    Reviewed {note.review_count}× · Memory fading
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart suggestions */}
      {ss.length > 0 && (
        <div className="glass" style={{ padding: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>💡 Smart Suggestions</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ss.map(note => (
              <div key={note.id} style={{
                padding: "12px 16px", borderRadius: "var(--radius-md)",
                background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)",
              }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{note.title}</div>
                {note.content && (
                  <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.content.slice(0, 100)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
