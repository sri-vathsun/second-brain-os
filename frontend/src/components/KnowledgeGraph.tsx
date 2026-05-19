"use client";

import { useEffect, useState, useCallback } from "react";
import ReactFlow, {
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  OnNodesChange,
  OnEdgesChange,
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import { api, GraphData } from "@/lib/api";

export default function KnowledgeGraph() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: GraphData = await api.getKnowledgeGraph();
        
        // Map nodes to add our custom styles
        const styledNodes = data.nodes.map(n => ({
          ...n,
          style: {
            background: "rgba(13, 17, 23, 0.8)",
            color: "var(--text-primary)",
            border: "1px solid var(--glass-border)",
            borderRadius: "8px",
            padding: "10px 14px",
            fontSize: "14px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            width: "auto",
          }
        }));

        const styledEdges = data.edges.map(e => ({
          ...e,
          style: { stroke: "var(--accent-purple)", strokeWidth: 2 },
          animated: true,
        }));

        setNodes(styledNodes);
        setEdges(styledEdges);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load graph");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  if (loading) {
    return (
      <div className="glass" style={{ height: "600px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-muted)", fontSize: 18, animation: "pulse-glow 2s infinite" }}>
          🧠 Mapping your mind...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 20, borderRadius: 12, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "var(--danger)" }}>
        ⚠️ {error}
      </div>
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="glass" style={{ height: "400px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
        <div style={{ fontSize: 48 }}>🕸️</div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>Your graph is empty</div>
        <p style={{ color: "var(--text-muted)" }}>Create some notes to start seeing connections.</p>
      </div>
    );
  }

  return (
    <div className="glass" style={{ height: "650px", width: "100%", overflow: "hidden", position: "relative" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="rgba(255,255,255,0.05)" />
        <Controls style={{ display: "flex", flexDirection: "column", gap: 4, padding: 4, background: "var(--bg-surface)", border: "1px solid var(--glass-border)", borderRadius: "8px" }} />
      </ReactFlow>
    </div>
  );
}
