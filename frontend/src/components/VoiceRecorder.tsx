"use client";

import { useState, useRef, useEffect } from "react";
import { api } from "@/lib/api";

interface Props {
  onNewNote?: () => void;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function VoiceRecorder({ onNewNote }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "saving" | "done" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const supported = typeof window !== "undefined" &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const transcriptRef = useRef("");
  const stoppingRef = useRef(false);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const saveTranscript = async () => {
    const transcript = transcriptRef.current.trim();
    if (!transcript) throw new Error("No speech detected. Please speak clearly and try again.");
    await api.createNote({ title: "Voice Note", content: transcript });
    setStatusMsg("Voice memo transcribed and saved.");
    setState("done");
    onNewNote?.();
  };

  const startRecording = () => {
    try {
      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Recognition) throw new Error("Speech recognition is not supported in this browser.");
      const recognition = new Recognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      transcriptRef.current = "";
      stoppingRef.current = false;
      recognition.onresult = (event) => {
        let transcript = "";
        for (let index = 0; index < event.results.length; index++) {
          transcript += event.results[index][0].transcript;
        }
        transcriptRef.current = transcript;
      };
      recognition.onerror = () => {
        stoppingRef.current = false;
        setStatusMsg("Browser speech recognition failed. Allow microphone access and try again.");
        setState("error");
      };
      recognition.onend = () => {
        if (stoppingRef.current) {
          setState("saving");
          void saveTranscript().catch((error: unknown) => {
            setStatusMsg(error instanceof Error ? error.message : "Could not save the voice memo.");
            setState("error");
          });
        }
      };
      recognitionRef.current = recognition;
      recognition.start();
      setStatusMsg("");
      setState("recording");
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : "Could not start speech recognition.");
      setState("error");
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;

    setState("saving");
    setStatusMsg("");
    stoppingRef.current = true;
    recognitionRef.current.stop();
  /*

    try {
      processorRef.current.disconnect();
      sourceRef.current.disconnect();
      if (audioContext.state !== "closed") await audioContext.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      audioContextRef.current = null;
      processorRef.current = null;
      sourceRef.current = null;
      const samples = samplesRef.current;
      const length = samples.reduce((total, chunk) => total + chunk.length, 0);
      if (length === 0) throw new Error("No audio captured. Please speak and try again.");
      const merged = new Float32Array(length);
      let offset = 0;
      for (const chunk of samples) {
        merged.set(chunk, offset);
        offset += chunk.length;
      }
      const recording = encodeWav(merged, audioContext.sampleRate);

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", recording, "voice-memo.wav");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/transcribe`,
        {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        }
      );
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.detail || "Transcription failed");
      }
      setStatusMsg("Voice memo transcribed and saved.");
      setState("done");
      onNewNote?.();
    } catch (error) {
      setStatusMsg(error instanceof Error ? error.message : "Could not transcribe the recording. Please try again.");
      setState("error");
    }
  */
  };

  const reset = () => {
    setState("idle");
    setStatusMsg("");
  };

  if (!supported) {
    return (
      <div className="glass" style={{ padding: 40, textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🚫</div>
        <h2 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Browser Not Supported</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
          Voice Memos require Chrome or Edge. Please open this page in one of those browsers.
        </p>
      </div>
    );
  }

  const btnSize    = 80;
  const isRecording = state === "recording";
  const isSaving    = state === "saving";
  const isIdle      = state === "idle";

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
      Record your thoughts — they&apos;ll be transcribed and saved as a note.
      </p>

      {/* Mic button */}
      <div style={{ position: "relative" }}>
        {isRecording && (
          <div
            style={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: "3px solid rgba(239,68,68,0.5)",
              animation: "recordPulse 1.5s ease-in-out infinite",
              pointerEvents: "none", /* ← never intercept button clicks */
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
            position: "relative", /* ensure button is above ring */
            zIndex: 1,
          }}
          onMouseEnter={(e) => { (e.currentTarget.style.transform = "scale(1.08)"); }}
          onMouseLeave={(e) => { (e.currentTarget.style.transform = "scale(1)"); }}
        >
          {isSaving ? "💾" : isRecording ? "⏹" : "🎤"}
        </button>
      </div>

      {/* Wave bars */}
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

      {/* Status */}
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          color:
            state === "error"   ? "var(--danger)"
            : state === "done"  ? "var(--success)"
            : state === "saving"? "var(--accent-cyan)"
            : "var(--text-secondary)",
        }}
      >
        {isIdle      && "Click the mic to start recording"}
        {isRecording && "Recording… click ⏹ to transcribe and save"}
        {isSaving    && "Saving your note…"}
        {(state === "done" || state === "error") && statusMsg}
      </div>

      {(state === "done" || state === "error") && (
        <button className="btn-ghost" onClick={reset}>
          Record Another
        </button>
      )}
    </div>
  );
}
