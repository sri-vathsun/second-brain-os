"use client";
import Link from "next/link";
import { useEffect, useRef } from "react";

const features = [
  { icon: "🎤", title: "Voice Memos", desc: "Capture thoughts instantly. Whisper AI transcribes your voice into searchable notes." },
  { icon: "🔍", title: "Semantic Search", desc: "Find anything in seconds using AI-powered similarity search across all your knowledge." },
  { icon: "🧠", title: "Knowledge Graph", desc: "Visualise how your ideas connect. Explore relationships across your entire second brain." },
  { icon: "📚", title: "Spaced Repetition", desc: "Never forget anything again. Our forgetting curve algorithm surfaces notes at the perfect moment." },
  { icon: "📄", title: "PDF Import", desc: "Upload documents and instantly convert them into searchable, summarisable notes." },
  { icon: "🌅", title: "Daily Briefing", desc: "Start every day with a personalised briefing of what to review and what to explore next." },
];

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!heroRef.current) return;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      const x = ((e.clientX - left) / width - 0.5) * 30;
      const y = ((e.clientY - top) / height - 0.5) * 30;
      heroRef.current.style.setProperty("--mx", `${x}px`);
      heroRef.current.style.setProperty("--my", `${y}px`);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100vh", overflow: "hidden" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid var(--glass-border)",
        backdropFilter: "blur(20px)", position: "sticky", top: 0, zIndex: 50,
        background: "rgba(5,8,20,0.8)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🧠</span>
          <span style={{ fontWeight: 800, fontSize: 18, color: "var(--text-primary)" }}>Second Brain OS</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/auth" className="btn-ghost" style={{ padding: "10px 22px" }}>Sign In</Link>
          <Link href="/auth?mode=signup" className="btn-primary" style={{ padding: "10px 22px" }}>Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <div ref={heroRef} style={{
        position: "relative", padding: "100px 40px 80px",
        textAlign: "center", overflow: "hidden",
      }}>
        {/* Orbs */}
        <div style={{
          position: "absolute", top: "10%", left: "15%", width: 500, height: 500,
          background: "radial-gradient(circle, rgba(124,58,237,0.25) 0%, transparent 70%)",
          borderRadius: "50%", animation: "float 8s ease-in-out infinite", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "10%", width: 400, height: 400,
          background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)",
          borderRadius: "50%", animation: "float 10s ease-in-out infinite reverse", pointerEvents: "none",
        }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "6px 16px", borderRadius: 99,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)",
            color: "#a78bfa", fontSize: 13, fontWeight: 600, marginBottom: 28,
          }}>
            ✨ AI-Powered Knowledge Management
          </div>

          <h1 style={{
            fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 900,
            lineHeight: 1.1, marginBottom: 24, color: "var(--text-primary)",
          }}>
            Your Second Brain,{" "}
            <span className="gradient-text">Supercharged by AI</span>
          </h1>

          <p style={{
            fontSize: 20, color: "var(--text-secondary)", maxWidth: 580,
            margin: "0 auto 48px", lineHeight: 1.7,
          }}>
            Store, organise and retrieve your knowledge with voice notes,
            semantic search, spaced repetition, and a live knowledge graph.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/auth?mode=signup" className="btn-primary" style={{ fontSize: 17, padding: "14px 36px" }}>
              Start Building Your Brain →
            </Link>
            <Link href="/auth" className="btn-ghost" style={{ fontSize: 17, padding: "14px 36px" }}>
              Sign In
            </Link>
          </div>

          {/* Stats */}
          <div style={{
            display: "flex", gap: 48, justifyContent: "center",
            marginTop: 64, flexWrap: "wrap",
          }}>
            {[["∞", "Notes"], ["6", "AI Features"], ["100%", "Private"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div className="gradient-text" style={{ fontSize: 36, fontWeight: 800 }}>{num}</div>
                <div style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ textAlign: "center", fontSize: 40, fontWeight: 800, marginBottom: 16 }}>
          Everything your brain needs
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-secondary)", fontSize: 17, marginBottom: 56 }}>
          Six powerful tools, one intelligent system.
        </p>
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20,
        }}>
          {features.map((f) => (
            <div key={f.title} className="glass" style={{
              padding: 28, transition: "transform 0.2s, box-shadow 0.2s", cursor: "default",
            }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 60px var(--accent-glow)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.boxShadow = "";
              }}
            >
              <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: 14, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ padding: "80px 40px", textAlign: "center" }}>
        <div style={{
          maxWidth: 700, margin: "0 auto",
          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
          border: "1px solid rgba(124,58,237,0.3)",
          borderRadius: 24, padding: "60px 40px",
        }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>
            Ready to upgrade your memory?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 36, fontSize: 17 }}>
            Join and start building your second brain today. It's free.
          </p>
          <Link href="/auth?mode=signup" className="btn-primary" style={{ fontSize: 17, padding: "14px 40px" }}>
            Get Started — It's Free
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid var(--glass-border)", padding: "24px 40px",
        textAlign: "center", color: "var(--text-muted)", fontSize: 13,
      }}>
        © 2025 Second Brain OS. Built with ❤️ and AI.
      </footer>
    </div>
  );
}
