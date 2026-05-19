"use client";

import { useState, useRef, useCallback } from "react";

interface Props { onNewNote?: () => void; }

export default function VoiceRecorder({ onNewNote }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing" | "done" | "error">("idle");
  const [result, setResult] = useState("");
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      recorder.ondataavailable = e => audioChunks.current.push(e.data);
      recorder.onstop = handleStop;
      recorder.start();
      mediaRecorder.current = recorder;
      setState("recording");
    } catch { setState("error"); setResult("Microphone access denied."); }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach(t => t.stop());
    setState("transcribing");
  };

  const handleStop = useCallback(async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });
    const form = new FormData();
    form.append("file", blob, "voice.webm");
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transcribe`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Transcription failed");
      const note = await res.json();
      setResult(`✅ Note created: "${note.title}"`);
      setState("done");
      onNewNote?.();
    } catch (e: unknown) {
      setResult(e instanceof Error ? e.message : "Transcription failed — AI service may be offline.");
      setState("error");
    }
  }, [onNewNote]);

  const reset = () => { setState("idle"); setResult(""); };

  const btnSize = 80;

  return (
    <div className="glass" style={{ padding: 40, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, textAlign: "center" }}>
      <h2 style={{ fontWeight: 800, fontSize: 22 }}>🎤 Voice Memo</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 360 }}>
        Record your thoughts and they'll be automatically transcribed and saved as a note.
      </p>

      {/* Mic button */}
      <div style={{ position: "relative" }}>
        {state === "recording" && (
          <div style={{
            position: "absolute", inset: -16, borderRadius: "50%",
            border: "3px solid rgba(239,68,68,0.5)",
            animation: "recordPulse 1.5s ease-in-out infinite",
          }} />
        )}
        <button onClick={state === "recording" ? stopRecording : state === "idle" ? startRecording : undefined}
          disabled={state === "transcribing"}
          style={{
            width: btnSize, height: btnSize, borderRadius: "50%", border: "none",
            fontSize: 32, cursor: state === "transcribing" ? "wait" : "pointer",
            transition: "all 0.2s",
            background: state === "recording"
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            boxShadow: state === "recording"
              ? "0 0 40px rgba(239,68,68,0.4)"
              : "0 0 40px var(--accent-glow)",
            color: "#fff",
          }}
        >
          {state === "transcribing" ? "⟳" : state === "recording" ? "⏹" : "🎤"}
        </button>
      </div>

      {/* Wave bars while recording */}
      {state === "recording" && (
        <div style={{ display: "flex", gap: 4, alignItems: "center", height: 40 }}>
          {[...Array(9)].map((_, i) => (
            <div key={i} style={{
              width: 4, height: 30, borderRadius: 99,
              background: "var(--danger)",
              animation: `waveBar 0.8s ease-in-out infinite`,
              animationDelay: `${i * 0.09}s`,
            }} />
          ))}
        </div>
      )}

      {/* Status */}
      <div style={{ fontSize: 15, color: state === "error" ? "var(--danger)" : state === "done" ? "var(--success)" : "var(--text-secondary)" }}>
        {state === "idle" && "Click the mic to start recording"}
        {state === "recording" && "Recording… click to stop"}
        {state === "transcribing" && "Transcribing with Whisper AI…"}
        {(state === "done" || state === "error") && result}
      </div>

      {(state === "done" || state === "error") && (
        <button className="btn-ghost" onClick={reset}>Record Another</button>
      )}
    </div>
  );
}
