"use client";

import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider } from "@/lib/auth-context";

const publishableKey =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || "";

export function Providers({ children }: { children: React.ReactNode }) {
  if (!publishableKey) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          backgroundColor: "var(--bg-page)",
        }}
      >
        <div className="card" style={{ maxWidth: 480, padding: 32 }}>
          <h1 style={{ fontSize: "1.35rem", marginBottom: 12 }}>
            Clerk is not configured yet
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", lineHeight: 1.6 }}>
            Authentication requires a Clerk publishable key. Create a free
            application at clerk.com, copy the publishable key from
            <strong> Configure → API Keys</strong>, and add it to{" "}
            <code>frontend/.env.local</code> as{" "}
            <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code>. Then restart the
            dev server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ClerkProvider publishableKey={publishableKey}>
      <AuthProvider>{children}</AuthProvider>
    </ClerkProvider>
  );
}
