"use client";

import KnowledgeGraph from "@/components/KnowledgeGraph";

export default function GraphPage() {
  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Knowledge Graph</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Visualise the connections between your ideas based on shared semantics.
        </p>
      </div>

      <KnowledgeGraph />
    </div>
  );
}
