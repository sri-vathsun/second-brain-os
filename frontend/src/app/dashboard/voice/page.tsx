"use client";

import { useRouter } from "next/navigation";
import VoiceRecorder from "@/components/VoiceRecorder";

export default function VoicePage() {
  const router = useRouter();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Voice Memos</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Record your thoughts, and we'll automatically transcribe them.
        </p>
      </div>

      <VoiceRecorder onNewNote={() => router.push("/dashboard/notes")} />
    </div>
  );
}
