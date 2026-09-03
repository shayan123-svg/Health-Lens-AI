"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { User, ShieldCheck, CreditCard, Sliders, Check, Copy } from "lucide-react";

export function SettingsPanel() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const fullName =
    (user?.user_metadata?.full_name as string) || "HealthLens Patient";
  const email = user?.email || "patient@healthlens.ai";
  const userId = user?.id || "Session Active";

  const handleCopyId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--blue-light)",
              color: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <User size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 2 }}>Patient Profile</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              {fullName} · {email}
            </p>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Patient ID: {userId.slice(0, 18)}…
            </span>
          </div>
        </div>
        <button className="button button-quiet" onClick={handleCopyId}>
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy ID</>}
        </button>
      </section>

      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--blue-light)",
              color: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sliders size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 2 }}>Clinical Preferences</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              Light appearance · 21-biomarker confidence intervals enabled · Doctor discussion guides active
            </p>
          </div>
        </div>
        <span className="badge badge-blue">Active</span>
      </section>

      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--blue-light)",
              color: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CreditCard size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 2 }}>Subscription Status</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              Plan: Patient Free Tier (Full 21-factor ML screening active)
            </p>
          </div>
        </div>
        <span className="badge badge-risk-low">Free Plan</span>
      </section>

      <section className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "var(--blue-light)",
              color: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", marginBottom: 2 }}>Privacy & Data Security</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", margin: 0 }}>
              Clinical records and document uploads are protected with Supabase Row-Level Security encryption.
            </p>
          </div>
        </div>
        <span className="badge badge-risk-low">Encrypted</span>
      </section>
    </div>
  );
}
