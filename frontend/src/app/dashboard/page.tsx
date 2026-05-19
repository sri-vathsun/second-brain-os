"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function DashboardHome() {
  const { user } = useAuth();

  const quickLinks = [
    { title: "Review Briefing", desc: "Start your daily spaced repetition", href: "/dashboard/briefing", icon: "🌅" },
    { title: "Write Note", desc: "Jot down a quick thought", href: "/dashboard/notes", icon: "📝" },
    { title: "Voice Memo", desc: "Record a thought with Whisper AI", href: "/dashboard/voice", icon: "🎤" },
    { title: "Explore Graph", desc: "See how your ideas connect", href: "/dashboard/graph", icon: "🧠" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>
        Welcome back, <span className="gradient-text">{user?.username}</span>
      </h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 40, fontSize: 16 }}>
        What would you like to do today?
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
        {quickLinks.map((link) => (
          <Link key={link.href} href={link.href} style={{ textDecoration: "none" }}>
            <div className="glass" style={{ padding: 24, height: "100%", transition: "transform 0.2s, background 0.2s" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.background = "var(--glass-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "";
                (e.currentTarget as HTMLElement).style.background = "var(--glass-bg)";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 16 }}>{link.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)", marginBottom: 4 }}>
                {link.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
                {link.desc}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
