"use client";

import { useState, useRef } from "react";

interface Props { onNewNote?: () => void; }

export default function VoiceRecorder({ onNewNote }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "transcribing" | "done" | "error">("idle");
  const [result, setResult] = useState("");

  // Keep all mutable recording state in refs — avoids stale closure bugs entirely
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const audioChunksRef  = useRef<Blob[]>([]);
  const onNewNoteRef    = useRef(onNewNote);
  onNewNoteRef.current  = onNewNote; // always up-to-date without re-creating callbacks

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current   = stream;
      audioChunksRef.current = [];

      // Pick a MIME type the browser actually supports
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/mp4",
      ].find((m) => MediaRecorder.isTypeSupported(m)) || "";

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        // All audio data is collected here — safe to build the blob
        const chunks = audioChunksRef.current;
        if (!chunks.length) {
          setResult("No audio recorded. Please try again.");
          setState("error");
          return;
        }

        const blob     = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
        const form     = new FormData();
        const ext      = (recorder.mimeType || "audio/webm").includes("mp4") ? "mp4"
                       : (recorder.mimeType || "").includes("ogg")           ? "ogg"
                       : "webm";
        form.append("file", blob, `voice.${ext}`);

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transcribe`,
            {
              method: "POST",
              headers: token ? { Authorization: `Bearer ${token}` } : {},
              body: form,
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: "Transcription failed" }));
            throw new Error(err.detail || "Transcription failed");
          }

          const note = await res.json();
          setResult(`✅ Note saved: "${note.title || "Voice Note"}"`);
          setState("done");
          onNewNoteRef.current?.();
        } catch (e: unknown) {
          setResult(
            e instanceof Error
              ? e.message
              : "Transcription failed — please try again."
          );
          setState("error");
        }
      };

      // Request data every 250 ms so we get chunks reliably across browsers
      recorder.start(250);
      setState("recording");
    } catch {
      setResult("Microphone access denied. Please allow mic access and try again.");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    // Stop all tracks so the browser mic indicator goes away
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setState("transcribing");
  };

  const reset = () => {
    setState("idle");
    setResult("");
    audioChunksRef.current = [];
  };

  const btnSize = 80;

  return (
    <div
      className="glass"
      style={{
        padding: 40,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 24,
        textAlign: "center",
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 22 }}>🎤 Voice Memo</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 360 }}>
        Record your thoughts and they&apos;ll be automatically transcribed and saved as a note.
      </p>

      {/* Mic button */}
      <div style={{ position: "relative" }}>
        {state === "recording" && (
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "3px solid rgba(239,68,68,0.5)",
              animation: "recordPulse 1.5s ease-in-out infinite",
            }}
          />
        )}
        <button
          onClick={
            state === "idle"      ? startRecording
            : state === "recording" ? stopRecording
            : undefined
          }
          disabled={state === "transcribing"}
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: "50%",
            border: "none",
            fontSize: 32,
            cursor: state === "transcribing" ? "wait" : "pointer",
            transition: "all 0.2s",
            background:
              state === "recording"
                ? "linear-gradient(135deg, #ef4444, #dc2626)"
                : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            boxShadow:
              state === "recording"
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
            <div
              key={i}
              style={{
                width: 4,
                height: 30,
                borderRadius: 99,
                background: "var(--danger)",
                animation: "waveBar 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.09}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      <div
        style={{
          fontSize: 15,
          color:
            state === "error"
              ? "var(--danger)"
              : state === "done"
              ? "var(--success)"
              : "var(--text-secondary)",
        }}
      >
        {state === "idle"         && "Click the mic to start recording"}
        {state === "recording"    && "Recording… click ⏹ to stop"}
        {state === "transcribing" && "Transcribing… please wait"}
        {(state === "done" || state === "error") && result}
      </div>

      {(state === "done" || state === "error") && (
        <button className="btn-ghost" onClick={reset}>
          Record Another
        </button>
      )}
    </div>
  );
}
