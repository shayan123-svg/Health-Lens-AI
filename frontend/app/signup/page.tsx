"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { SignUp, useAuth } from "@clerk/clerk-react";
import {
  ShieldCheck,
  BrainCircuit,
  Stethoscope,
  Lock,
} from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        backgroundColor: "var(--bg-page)",
      }}
    >
      {/* Left Panel: Clinical Trust */}
      <div
        style={{
          background: "linear-gradient(145deg, #0F172A, #0F4C81)",
          color: "#FFFFFF",
          padding: "60px 48px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Link href="/" className="brand-mark" style={{ color: "#FFFFFF" }}>
          <span className="brand-logo-icon">✚</span>
          <div>
            <div style={{ lineHeight: 1.15, fontSize: "1.2rem" }}>HealthLens AI</div>
            <div style={{ fontSize: "0.72rem", fontWeight: 500, color: "#93C5FD" }}>
              Clinical Intelligence
            </div>
          </div>
        </Link>

        <div style={{ maxWidth: 460 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255, 255, 255, 0.12)",
              color: "#93C5FD",
              padding: "6px 14px",
              borderRadius: "9999px",
              fontSize: "0.78rem",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            <ShieldCheck size={16} /> Patient Account Creation
          </span>

          <h1 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", color: "#FFFFFF", marginBottom: 18, lineHeight: 1.15 }}>
            Transform health data into clinical clarity.
          </h1>

          <p style={{ color: "#CBD5E1", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 36 }}>
            Create your account to upload medical lab panels, monitor historical trends, and consult our grounded AI health assistant.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37, 99, 235, 0.3)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrainCircuit size={18} />
              </div>
              <span style={{ fontSize: "0.92rem", color: "#E2E8F0" }}>
                Automated 21-Biomarker Extraction
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37, 99, 235, 0.3)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Stethoscope size={18} />
              </div>
              <span style={{ fontSize: "0.92rem", color: "#E2E8F0" }}>
                Physician Discussion Guides & Summaries
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(37, 99, 235, 0.3)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Lock size={18} />
              </div>
              <span style={{ fontSize: "0.92rem", color: "#E2E8F0" }}>
                Secure, Private & Patient-Controlled
              </span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: "0.78rem", color: "#94A3B8" }}>
          © 2026 HealthLens AI. Designed for preventive educational healthcare insights.
        </div>
      </div>

      {/* Right Panel: Clerk Sign Up */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: "1.85rem", marginBottom: 6, color: "var(--text-primary)" }}>
              Create Patient Account
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.92rem", margin: 0 }}>
              Get started with free AI health risk screening and records.
            </p>
          </div>

          <SignUp
            signInUrl="/login"
            forceRedirectUrl="/dashboard"
            appearance={{
              variables: { colorPrimary: "#0F4C81", borderRadius: "8px" },
            }}
          />
        </div>
      </div>
    </main>
  );
}
