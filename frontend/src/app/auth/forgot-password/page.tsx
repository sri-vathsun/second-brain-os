"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Request failed");
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <form onSubmit={handleSubmit} className="glass" style={{ width: "100%", maxWidth: 440, padding: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Forgot password?</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 24 }}>
          Enter your email and we will send you a reset link.
        </p>
        <input
          className="input"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        {message && <p style={{ color: "var(--accent-cyan)", marginTop: 16 }}>{message}</p>}
        {error && <p style={{ color: "var(--danger)", marginTop: 16 }}>{error}</p>}
        <button className="btn-primary" type="submit" style={{ width: "100%", justifyContent: "center", marginTop: 20 }}>
          Send reset link
        </button>
        <a href="/auth" style={{ display: "block", textAlign: "center", marginTop: 20, color: "var(--accent-cyan)" }}>
          Back to sign in
        </a>
      </form>
    </main>
  );
}