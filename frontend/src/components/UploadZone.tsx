"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

interface Props { onUploadSuccess?: () => void; }

export default function UploadZone({ onUploadSuccess }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{ filename: string; note_id: number; characters: number } | null>(null);
  const [error, setError] = useState("");

  const handleFile = (f: File) => {
    if (!f.type.includes("pdf")) { setError("Only PDF files are supported."); return; }
    setFile(f); setError(""); setResult(null);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  }, []);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const res = await api.uploadPDF(file);
      setResult(res); setFile(null);
      onUploadSuccess?.();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Upload failed"); }
    finally { setUploading(false); }
  };

  return (
    <div className="glass" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
      <h2 style={{ fontWeight: 800, fontSize: 22 }}>📄 Upload PDF</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
        Upload a PDF document — it will be extracted and saved as a searchable note automatically.
      </p>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById("pdf-input")?.click()}
        style={{
          border: `2px dashed ${isDragging ? "var(--accent-purple)" : file ? "var(--success)" : "var(--glass-border)"}`,
          borderRadius: "var(--radius-lg)", padding: "48px 24px",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
          cursor: "pointer", transition: "all 0.2s",
          background: isDragging ? "rgba(124,58,237,0.08)" : file ? "rgba(16,185,129,0.08)" : "transparent",
        }}
      >
        <div style={{ fontSize: 48 }}>{file ? "📄" : "⬆️"}</div>
        <div style={{ fontWeight: 600, fontSize: 16, textAlign: "center" }}>
          {file ? file.name : "Drop your PDF here"}
        </div>
        <div style={{ color: "var(--text-muted)", fontSize: 13 }}>
          {file ? `${(file.size / 1024).toFixed(1)} KB` : "or click to browse"}
        </div>
        <input id="pdf-input" type="file" accept=".pdf" hidden
          onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
      </div>

      {error && (
        <div style={{ padding: 14, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)", fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      {result && (
        <div style={{ padding: 20, borderRadius: 12, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div style={{ color: "var(--success)", fontWeight: 700, marginBottom: 6 }}>✅ Upload successful!</div>
          <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>
            {result.filename} → Note #{result.note_id} created ({result.characters.toLocaleString()} characters extracted)
          </div>
        </div>
      )}

      {file && !result && (
        <button className="btn-primary" onClick={handleUpload} disabled={uploading} style={{ justifyContent: "center" }}>
          {uploading ? "Uploading & Extracting…" : `Upload "${file.name}"`}
        </button>
      )}
    </div>
  );
}
