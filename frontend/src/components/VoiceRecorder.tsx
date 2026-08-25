"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onNewNote?: () => void;
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, value: string) => {
    for (let index = 0; index < value.length; index++) view.setUint8(offset + index, value.charCodeAt(index));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let index = 0; index < samples.length; index++) {
    const sample = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(44 + index * 2, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export default function VoiceRecorder({ onNewNote }: Props) {
  const [state, setState] = useState<"idle" | "recording" | "saving" | "done" | "error">("idle");
  const [statusMsg, setStatusMsg] = useState("");
  const supported = typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const samplesRef = useRef<Float32Array[]>([]);

  useEffect(() => {
    return () => {
      processorRef.current?.disconnect();
      sourceRef.current?.disconnect();
      audioContextRef.current?.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      sourceRef.current = source;
      processorRef.current = processor;
      samplesRef.current = [];
      processor.onaudioprocess = (event) => {
        samplesRef.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
      };
      source.connect(processor);
      processor.connect(audioContext.destination);
      setStatusMsg("");
      setState("recording");
    } catch (error) {
      const message = error instanceof DOMException && error.name === "NotAllowedError"
        ? "Microphone access denied. Allow mic access in browser settings."
        : "Could not access your microphone. Check that it is connected and try again.";
      setStatusMsg(message);
      setState("error");
    }
  };

  const stopRecording = async () => {
    const audioContext = audioContextRef.current;
    if (!audioContext || !sourceRef.current || !processorRef.current) return;

    setState("saving");
    setStatusMsg("");

    try {
      processorRef.current.disconnect();
      sourceRef.current.disconnect();
      await audioContext.close();
      streamRef.current?.getTracks().forEach((track) => track.stop());
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
