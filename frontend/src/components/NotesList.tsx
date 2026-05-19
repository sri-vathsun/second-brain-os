"use client";

import { useState, useEffect, useCallback } from "react";
import { api, Note } from "@/lib/api";

interface Props { onNoteSelect?: (note: Note) => void; }

export default function NotesList({ onNoteSelect }: Props) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [filtered, setFiltered] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  const fetchNotes = useCallback(async () => {
    try {
      const data = await api.getNotes();
      setNotes(data);
      setFiltered(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (!search.trim()) { setFiltered(notes); return; }
      try {
        const results = await api.search(search);
        setFiltered(results);
      } catch { setFiltered(notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()))); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, notes]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    try {
      const note = await api.createNote({ title: newTitle.trim(), content: newContent.trim() });
      setNotes(p => [note, ...p]);
      setFiltered(p => [note, ...p]);
      setNewTitle(""); setNewContent(""); setShowForm(false);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create note");
    } finally { setCreating(false); }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleting(id);
    try {
      await api.deleteNote(id);
      setNotes(p => p.filter(n => n.id !== id));
      setFiltered(p => p.filter(n => n.id !== id));
    } catch { /* ignore */ } finally { setDeleting(null); }
  };

  const timeAgo = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <input className="input" placeholder="🔍 Search notes..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button className="btn-primary" onClick={() => setShowForm(p => !p)} style={{ whiteSpace: "nowrap" }}>
          {showForm ? "✕ Cancel" : "+ New Note"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="glass" style={{ padding: 20, marginBottom: 20, display: "flex", flexDirection: "column", gap: 12 }}>
          <input className="input" placeholder="Note title..." value={newTitle} required
            onChange={e => setNewTitle(e.target.value)} autoFocus />
          <textarea className="input" placeholder="Content (optional)..." value={newContent}
            onChange={e => setNewContent(e.target.value)} style={{ minHeight: 100 }} />
          <button type="submit" className="btn-primary" disabled={creating} style={{ alignSelf: "flex-end" }}>
            {creating ? "Creating..." : "Create Note"}
          </button>
        </form>
      )}

      {error && (
        <div style={{ padding: 16, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "var(--danger)", marginBottom: 16, fontSize: 14 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ height: 140, borderRadius: 12, background: "linear-gradient(90deg, var(--glass-bg) 25%, rgba(255,255,255,0.06) 50%, var(--glass-bg) 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite", border: "1px solid var(--glass-border)" }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--text-muted)" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{search ? "🔍" : "📝"}</div>
          <p style={{ fontSize: 17 }}>{search ? "No notes match your search" : "No notes yet. Create your first one!"}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {filtered.map((note) => (
            <div key={note.id} className="glass" onClick={() => onNoteSelect?.(note)}
              style={{ padding: 20, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s", position: "relative" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 40px rgba(124,58,237,0.2)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; (e.currentTarget as HTMLElement).style.boxShadow = ""; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <h3 style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, flex: 1 }}>{note.title}</h3>
                <button className="btn-danger" onClick={e => handleDelete(note.id, e)}
                  disabled={deleting === note.id}
                  style={{ flexShrink: 0, padding: "4px 8px", fontSize: 12 }}>
                  {deleting === note.id ? "..." : "🗑"}
                </button>
              </div>
              {note.content && (
                <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 8, lineHeight: 1.6,
                  overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                  {note.content}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{timeAgo(note.created_at)}</span>
                <span style={{ fontSize: 11, color: "var(--accent-purple)", background: "rgba(124,58,237,0.1)", padding: "2px 8px", borderRadius: 99 }}>
                  📖 {note.review_count}×
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
