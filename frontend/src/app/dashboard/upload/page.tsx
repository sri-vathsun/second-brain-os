"use client";

import { useRouter } from "next/navigation";
import UploadZone from "@/components/UploadZone";

export default function UploadPage() {
  const router = useRouter();

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Upload PDF</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: 16 }}>
          Extract text from documents and add them to your second brain.
        </p>
      </div>

      <UploadZone onUploadSuccess={() => router.push("/dashboard/notes")} />
    </div>
  );
}
