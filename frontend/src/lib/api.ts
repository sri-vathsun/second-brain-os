const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// How long to wait before aborting a request (ms)
const REQUEST_TIMEOUT_MS = 15_000;

// Maximum retries for network errors (not HTTP errors)
const MAX_RETRIES = 2;

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Determines a user-friendly error message from a raw fetch error.
 */
function getNetworkErrorMessage(err: unknown): string {
  if (err instanceof DOMException && err.name === "AbortError") {
    return "Request timed out. The server took too long to respond. Please try again.";
  }
  if (err instanceof TypeError) {
    // This is the classic "Failed to fetch" — means the server is unreachable
    return "Unable to connect to the server. Please make sure the backend is running and try again.";
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "An unexpected network error occurred. Please try again.";
}

/**
 * Sleep helper for retry backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        // HTTP error (4xx / 5xx) — don't retry these
        const err = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(err.detail || `Request failed with status ${res.status}`);
      }

      return await res.json();
    } catch (err: unknown) {
      clearTimeout(timeout);

      // If it's an HTTP-level error (our own Error thrown above), don't retry
      if (err instanceof Error && !(err instanceof TypeError) && !(err instanceof DOMException)) {
        throw err;
      }

      lastError = err;

      // Only retry on network/timeout errors, not on the last attempt
      if (attempt < MAX_RETRIES) {
        await sleep(500 * (attempt + 1)); // 500ms, 1000ms backoff
      }
    }
  }

  // All retries exhausted — throw a user-friendly error
  throw new Error(getNetworkErrorMessage(lastError));
}

// ─── Types ────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Note {
  id: number;
  title: string;
  content: string | null;
  user_id: number;
  tags: unknown[];
  review_count: number;
  last_reviewed_at: string | null;
  created_at: string | null;
}

export interface DailyBriefingData {
  notes_for_review: Note[];
  productivity_insights: { total_notes: number; notes_to_review_count: number };
  smart_suggestions: Note[];
}

export interface GraphData {
  nodes: { id: string; data: { label: string }; position: { x: number; y: number } }[];
  edges: { id: string; source: string; target: string; animated?: boolean }[];
}

// ─── API calls ────────────────────────────────────────────────────────────

export const api = {
  // Auth
  signup: (data: { username: string; email: string; password: string }) =>
    request<AuthResponse>("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request<User>("/auth/me"),

  // Notes
  getNotes: () => request<Note[]>("/notes/notes"),

  createNote: (data: { title: string; content: string }) =>
    request<Note>("/notes/notes", { method: "POST", body: JSON.stringify(data) }),

  updateNote: (id: number, data: { title?: string; content?: string }) =>
    request<Note>(`/notes/notes/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteNote: (id: number) =>
    request<{ message: string }>(`/notes/notes/${id}`, { method: "DELETE" }),

  // Search
  search: (query: string) =>
    request<Note[]>("/search/search", { method: "POST", body: JSON.stringify({ query }) }),

  // Summarize
  summarize: (text: string) =>
    request<{ summary: string }>("/summarize/summarize", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Knowledge Graph
  getKnowledgeGraph: () => request<GraphData>("/api/knowledge-graph"),

  // Daily Briefing
  getDailyBriefing: () => request<DailyBriefingData>("/api/daily-briefing"),

  // Upload (multipart — special case)
  uploadPDF: async (file: File) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000); // 30s for uploads

    try {
      const res = await fetch(`${API_URL}/upload/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Upload failed" }));
        throw new Error(err.detail || "Upload failed");
      }
      return res.json();
    } catch (err: unknown) {
      clearTimeout(timeout);
      if (err instanceof Error && !(err instanceof TypeError) && !(err instanceof DOMException)) {
        throw err;
      }
      throw new Error(getNetworkErrorMessage(err));
    }
  },
};
