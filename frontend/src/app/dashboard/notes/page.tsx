"use client";

import { useState } from "react";
import NotesList from "@/components/NotesList";
import NoteView from "@/components/NoteView";
import { Note } from "@/lib/api";

export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Notes</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          All your thoughts, ideas, and knowledge in one place.
        </p>
      </div>

      <NotesList onNoteSelect={setSelectedNote} />

      {selectedNote && (
        <NoteView note={selectedNote} onClose={() => setSelectedNote(null)} />
      )}
    </div>
  );
}
