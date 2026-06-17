"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onNewNote?: () => void;
}

// Tell TypeScript about the browser Speech API
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export default function VoiceRecorder({ onNewNote }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "saving" | "done" | "error">("idle");
  const [liveText, setLiveText]     = useState("");   // shown while recording
  const [finalText, setFinalText]   = useState("");   // accumulated confirmed words
  const [statusMsg, setStatusMsg]   = useState("");
  const [supported, setSupported]   = useState(true);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef   = useRef("");                  // ref so onstop closure sees latest
  const onNewNoteRef   = useRef(onNewNote);
  onNewNoteRef.current = onNewNote;

  // Check browser support once on mount
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) setSupported(false);
  }, []);

  const startRecording = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatusMsg("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      setState("error");
      return;
    }

    const recognition = new SR();
    recognition.continuous      = true;   // keep listening until we call .stop()
    recognition.interimResults  = true;   // show words as they're spoken
    recognition.lang            = "en-US";
    recognitionRef.current = recognition;

    // Reset state
    setLiveText("");
    setFinalText("");
    finalTextRef.current = "";
    setStatusMsg("");

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let confirmed = finalTextRef.current;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          confirmed += (confirmed ? " " : "") + text.trim();
        } else {
          interim = text;
        }
      }

      finalTextRef.current = confirmed;
      setFinalText(confirmed);
      setLiveText(interim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg =
        event.error === "not-allowed"
          ? "Microphone access denied. Please allow mic access in your browser."
          : event.error === "no-speech"
          ? "No speech detected. Please speak clearly and try again."
          : `Error: ${event.error}. Please try again.`;
      setStatusMsg(msg);
      setState("error");
    };

    recognition.onend = () => {
      // onend fires after .stop() — do nothing here; saving is handled by stopRecording
    };

    recognition.start();
    setState("recording");
  };

  const stopRecording = async () => {
    recognitionRef.current?.stop();
    setState("saving");

    // Give the browser 400 ms to fire the final onresult before we read the ref
    await new Promise((r) => setTimeout(r, 400));

    const text = finalTextRef.current.trim();
    if (!text) {
      setStatusMsg("Nothing was transcribed. Please speak louder and try again.");
      setState("error");
      return;
    }

    // Save directly to the Notes endpoint — no AI backend call needed
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const title  = `Voice Note — ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/notes/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ title, content: text }),
        }
      );

      if (!res.ok) throw new Error("Failed to save note");

      setStatusMsg(`✅ Saved as "${title}"`);
      setState("done");
      onNewNoteRef.current?.();
    } catch {
      setStatusMsg("Transcribed successfully but failed to save. Check your connection.");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setLiveText("");
    setFinalText("");
    finalTextRef.current = "";
    setStatusMsg("");
  };

  // ── Unsupported browser message ───────────────────────────────────────────
  if (!supported) {
    return (
      <div className="glass" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Browser Not Supported
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Voice Memos require Chrome or Edge. Please open this page in one of those browsers.
        </p>
      </div>
    );
  }

  const btnSize = 80;
  const isRecording  = state === "recording";
  const isSaving     = state === "saving";
  const isIdle       = state === "idle";

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
        maxWidth: 560,
        margin: "0 auto",
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 22 }}>🎤 Voice Memo</h2>
      <p style={{ color: "var(--text-secondary)", fontSize: 14, maxWidth: 380 }}>
        Speak your thoughts — they&apos;ll be transcribed live and saved as a note instantly.
      </p>

      {/* ── Mic button ─────────────────────────────────────────────────────── */}
      <div style={{ position: "relative" }}>
        {isRecording && (
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "3px solid rgba(239,68,68,0.5)",
              animation: "recordPulse 1.5s ease-in-out infinite",
              pointerEvents: "none",   /* ← FIX: don't intercept button clicks */
            }}
          />
        )}
        <button
          onClick={isIdle ? startRecording : isRecording ? stopRecording : undefined}
          disabled={isSaving}
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: "50%",
            border: "none",
            fontSize: 32,
            cursor: isSaving ? "wait" : "pointer",
            transition: "transform 0.15s, box-shadow 0.2s",
            background: isRecording
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            boxShadow: isRecording
              ? "0 0 40px rgba(239,68,68,0.5)"
              : "0 0 40px var(--accent-glow)",
            color: "#fff",
          }}
          onMouseEnter={(e) => { (e.currentTarget.style.transform = "scale(1.08)"); }}
          onMouseLeave={(e) => { (e.currentTarget.style.transform = "scale(1)"); }}
        >
          {isSaving ? "💾" : isRecording ? "⏹" : "🎤"}
        </button>
      </div>

      {/* ── Wave bars while recording ────────────────────────────────────── */}
      {isRecording && (
        <div style={{ display: "flex", gap: 5, alignItems: "center", height: 40 }}>
          {[...Array(11)].map((_, i) => (
            <div
              key={i}
              style={{
                width: 4,
                borderRadius: 99,
                background: "var(--danger)",
                animation: "waveBar 0.8s ease-in-out infinite",
                animationDelay: `${i * 0.07}s`,
                height: `${16 + Math.abs(5 - i) * 4}px`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Live transcript box ──────────────────────────────────────────── */}
      {(isRecording || isSaving) && (
        <div
          style={{
            width: "100%",
            minHeight: 80,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--glass-border)",
            borderRadius: "var(--radius-md)",
            padding: "14px 16px",
            textAlign: "left",
            fontSize: 14,
            lineHeight: 1.7,
            color: "var(--text-primary)",
          }}
        >
          {finalText && <span>{finalText} </span>}
          {liveText  && <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>{liveText}</span>}
          {!finalText && !liveText && (
            <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
              Start speaking…
            </span>
          )}
        </div>
      )}

      {/* ── Status text ─────────────────────────────────────────────────── */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color:
            state === "error"  ? "var(--danger)"
            : state === "done" ? "var(--success)"
            : state === "saving" ? "var(--accent-cyan)"
            : "var(--text-secondary)",
        }}
      >
        {isIdle      && "Click the mic to start recording"}
        {isRecording && "Listening… click ⏹ to stop and save"}
        {isSaving    && "Saving your note…"}
        {(state === "done" || state === "error") && statusMsg}
      </div>

      {/* ── Record another button ────────────────────────────────────────── */}
      {(state === "done" || state === "error") && (
        <button className="btn-ghost" onClick={reset}>
          Record Another
        </button>
      )}
    </div>
  );
}
