"use client";

import DailyBriefing from "@/components/DailyBriefing";

export default function BriefingPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Daily Briefing</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Your personalised spaced repetition and review queue.
        </p>
      </div>

      <DailyBriefing />
    </div>
  );
}
