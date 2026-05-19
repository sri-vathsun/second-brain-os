"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", icon: "🏠", label: "Dashboard" },
  { href: "/dashboard/notes", icon: "📝", label: "Notes" },
  { href: "/dashboard/graph", icon: "🧠", label: "Knowledge Graph" },
  { href: "/dashboard/briefing", icon: "🌅", label: "Daily Briefing" },
  { href: "/dashboard/voice", icon: "🎤", label: "Voice Memos" },
  { href: "/dashboard/upload", icon: "📤", label: "Upload PDF" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside style={{
      width: 240, minHeight: "100vh", flexShrink: 0,
      borderRight: "1px solid var(--glass-border)",
      background: "rgba(13,17,23,0.9)", backdropFilter: "blur(20px)",
      display: "flex", flexDirection: "column", padding: "24px 0",
      position: "sticky", top: 0, height: "100vh", overflowY: "auto",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 20px 24px", borderBottom: "1px solid var(--glass-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 26 }}>🧠</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.2 }}>Second Brain</div>
            <div style={{ color: "var(--text-muted)", fontSize: 11 }}>OS v1.0</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        {navItems.map(({ href, icon, label }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 12px", borderRadius: "var(--radius-md)",
              textDecoration: "none", fontSize: 14, fontWeight: active ? 600 : 400,
              transition: "var(--transition)",
              background: active
                ? "linear-gradient(135deg, rgba(124,58,237,0.25), rgba(6,182,212,0.15))"
                : "transparent",
              color: active ? "var(--text-primary)" : "var(--text-secondary)",
              border: active ? "1px solid rgba(124,58,237,0.3)" : "1px solid transparent",
            }}>
              <span style={{ fontSize: 18 }}>{icon}</span>
              {label}
              {active && (
                <div style={{
                  marginLeft: "auto", width: 6, height: 6, borderRadius: "50%",
                  background: "var(--accent-purple)",
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div style={{ padding: "16px 12px 0", borderTop: "1px solid var(--glass-border)" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "12px", borderRadius: "var(--radius-md)",
          background: "var(--glass-bg)", marginBottom: 8,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-purple), var(--accent-cyan))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 14, flexShrink: 0,
          }}>
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.username}
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.email}
            </div>
          </div>
        </div>
        <button onClick={logout} style={{
          width: "100%", padding: "9px 12px", borderRadius: "var(--radius-md)",
          background: "transparent", border: "1px solid var(--glass-border)",
          color: "var(--text-muted)", fontSize: 13, cursor: "pointer",
          transition: "var(--transition)", display: "flex", alignItems: "center", gap: 8,
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLElement).style.color = "var(--danger)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.25)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = ""; (e.currentTarget as HTMLElement).style.borderColor = ""; }}
        >
          🚪 Sign Out
        </button>
      </div>
    </aside>
  );
}
