"use client";

import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!token) return setError("This reset link is missing its token.");
    if (password !== confirmation) return setError("Passwords do not match.");
    try {
      const result = await api.resetPassword(token, password);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={handleSubmit} className="glass" style={{ width: "100%", maxWidth: 440, padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Choose a new password</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>Use at least 6 characters.</p>
        <input className="input" type="password" placeholder="New password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} required />
        <input className="input" type="password" placeholder="Confirm new password" minLength={6} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required style={{ marginTop: 12 }} />
        {message && <p style={{ color: "var(--accent-cyan)", marginTop: 16 }}>{message}</p>}
        {error && <p style={{ color: "var(--danger)", marginTop: 16 }}>{error}</p>}
        <button className="btn-primary" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>Reset password</button>
        <a href="/auth" style={{ display: "block", textAlign: "center", marginTop: 20, color: "var(--accent-cyan)" }}>Back to sign in</a>
      </form>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}