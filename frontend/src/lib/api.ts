const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
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
    const res = await fetch(`${API_URL}/upload/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new Error(err.detail || "Upload failed");
    }
    return res.json();
  },
};
