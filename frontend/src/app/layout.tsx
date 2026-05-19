import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Second Brain OS — AI-Powered Digital Memory",
  description:
    "Store, organise and retrieve your knowledge with AI-powered search, voice notes, spaced repetition, and a live knowledge graph.",
  keywords: ["AI", "second brain", "knowledge management", "notes", "PKM"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
