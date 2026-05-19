"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function AuthForm() {
  const params = useSearchParams();
  const router = useRouter();
  const { login, signup, user, loading } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">(
    params.get("mode") === "signup" ? "signup" : "login"
  );
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && user) router.push("/dashboard");
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (mode === "signup") {
        await signup(form.username, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const orbs = [
    { size: 400, top: "5%", left: "10%", color: "rgba(124,58,237,0.25)", delay: "0s" },
    { size: 300, bottom: "15%", right: "5%", color: "rgba(6,182,212,0.18)", delay: "3s" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-base)" }}>
      {/* Left Panel */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", padding: 60, position: "relative", overflow: "hidden",
      }}
        className="hidden-mobile"
      >
        {orbs.map((o, i) => (
          <div key={i} style={{
            position: "absolute", width: o.size, height: o.size,
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            borderRadius: "50%", animation: `float 8s ease-in-out infinite`,
            animationDelay: o.delay, pointerEvents: "none",
            top: (o as { top?: string }).top, left: (o as { left?: string }).left,
            bottom: (o as { bottom?: string }).bottom, right: (o as { right?: string }).right,
          }} />
        ))}
        <div style={{ position: "relative", textAlign: "center" }}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: "float 6s ease-in-out infinite" }}>🧠</div>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Your Second Brain
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, lineHeight: 1.7, maxWidth: 380 }}>
            AI-powered knowledge management. Capture, connect, and recall everything that matters to you.
          </p>
          <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 16, textAlign: "left" }}>
            {[
              ["🎤", "Voice-to-note transcription"],
              ["🔍", "AI semantic search"],
              ["🧠", "Live knowledge graph"],
              ["📚", "Spaced repetition system"],
            ].map(([icon, text]) => (
              <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ color: "var(--text-secondary)", fontSize: 15 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div style={{
        width: "100%", maxWidth: 520, display: "flex", alignItems: "center",
        justifyContent: "center", padding: "40px 48px",
        borderLeft: "1px solid var(--glass-border)",
        background: "rgba(13,17,23,0.8)", backdropFilter: "blur(20px)",
      }}>
        <div style={{ width: "100%" }}>
          {/* Logo mobile */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 40 }}>
            <span style={{ fontSize: 28 }}>🧠</span>
            <span style={{ fontWeight: 800, fontSize: 18 }}>Second Brain OS</span>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p style={{ color: "var(--text-secondary)", marginBottom: 32 }}>
            {mode === "login"
              ? "Sign in to your second brain"
              : "Start building your knowledge base today"}
          </p>

          {/* Toggle */}
          <div style={{
            display: "flex", gap: 0, background: "var(--glass-bg)",
            border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)",
            padding: 4, marginBottom: 28,
          }}>
            {(["login", "signup"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex: 1, padding: "10px 0", borderRadius: "var(--radius-sm)",
                  border: "none", cursor: "pointer", fontWeight: 600, fontSize: 14,
                  transition: "var(--transition)",
                  background: mode === m ? "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))" : "transparent",
                  color: mode === m ? "#fff" : "var(--text-secondary)",
                }}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {mode === "signup" && (
              <div>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Username</label>
                <input className="input" placeholder="your_username"
                  value={form.username} required
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))} />
              </div>
            )}
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Email</label>
              <input className="input" type="email" placeholder="you@example.com"
                value={form.email} required
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>Password</label>
              <input className="input" type="password" placeholder="••••••••"
                value={form.password} required minLength={6}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            {error && (
              <div style={{
                padding: "12px 16px", borderRadius: "var(--radius-md)",
                background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                color: "var(--danger)", fontSize: 14,
              }}>
                ⚠️ {error}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={submitting}
              style={{ marginTop: 8, justifyContent: "center", padding: "14px" }}>
              {submitting
                ? "Please wait..."
                : mode === "login" ? "Sign In →" : "Create Account →"}
            </button>
          </form>

          <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 13, marginTop: 24 }}>
            {mode === "login" ? "No account? " : "Already have one? "}
            <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
              style={{ background: "none", border: "none", color: "var(--accent-cyan)", cursor: "pointer", fontWeight: 600 }}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
