"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ShieldCheck,
  BrainCircuit,
  Activity,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  FileText,
  HeartPulse,
  TrendingUp,
  AlertCircle,
  Menu,
  X,
} from "lucide-react";

export function MarketingNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-nav">
      <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" className="brand-mark">
          <span className="brand-logo-icon">✚</span>
          <div>
            <div style={{ lineHeight: 1.15, fontSize: "1.15rem" }}>HealthLens AI</div>
            <div style={{ fontSize: "0.68rem", fontWeight: 500, color: "var(--text-muted)" }}>
              Clinical Intelligence
            </div>
          </div>
        </Link>

        <nav className="nav-links" aria-label="Primary navigation">
          <a href="#how-it-works">How It Works</a>
          <a href="#features">Features</a>
          <a href="#trust">Clinical Trust</a>
          <Link href="/pricing">Plans</Link>
        </nav>

        <div className="nav-actions">
          <Link href="/login" className="button button-quiet" style={{ border: "none" }}>
            Sign in
          </Link>
          <Link href="/signup" className="button button-primary">
            Get started <ArrowRight size={16} />
          </Link>
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer" }}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          style={{
            position: "absolute",
            top: 74,
            left: 0,
            right: 0,
            background: "#FFFFFF",
            borderBottom: "1px solid var(--border-color)",
            padding: "16px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxShadow: "0 10px 15px -3px rgba(15, 23, 42, 0.1)",
          }}
        >
          <a href="#how-it-works" onClick={() => setOpen(false)}>How It Works</a>
          <a href="#features" onClick={() => setOpen(false)}>Features</a>
          <a href="#trust" onClick={() => setOpen(false)}>Clinical Trust</a>
          <Link href="/pricing" onClick={() => setOpen(false)}>Plans</Link>
          <Link href="/login" onClick={() => setOpen(false)}>Sign in</Link>
          <Link href="/signup" className="button button-primary" onClick={() => setOpen(false)}>
            Get started free
          </Link>
        </div>
      )}
    </header>
  );
}

export function TrustIndicators() {
  const items = [
    {
      icon: ShieldCheck,
      title: "Privacy Focused",
      desc: "Client-encrypted data handling",
    },
    {
      icon: BrainCircuit,
      title: "21-Biomarker ML Model",
      desc: "Validated epidemiological indicators",
    },
    {
      icon: Activity,
      title: "Calibrated Risk Estimates",
      desc: "Probabilistic screening predictions",
    },
    {
      icon: Stethoscope,
      title: "Doctor-Ready Guidance",
      desc: "Targeted clinical consultation points",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        margin: "32px 0 60px",
      }}
    >
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            style={{
              background: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: 10,
              padding: "16px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
              boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "var(--blue-light)",
                color: "var(--blue-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)" }}>
                {item.title}
              </div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                {item.desc}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPreview() {
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--border-color)",
        borderRadius: 14,
        padding: 24,
        boxShadow: "0 20px 35px -5px rgba(15, 23, 42, 0.1), 0 8px 12px -6px rgba(15, 23, 42, 0.05)",
        position: "relative",
      }}
      aria-label="Clinical HealthLens Dashboard Preview"
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid var(--border-color)",
          paddingBottom: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "var(--blue-light)",
              color: "var(--blue-primary)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <HeartPulse size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.92rem", color: "var(--text-primary)" }}>
              Clinical Screening Record
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Verified ML Health Assessment
            </div>
          </div>
        </div>
        <span className="badge badge-blue">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--blue-primary)" }} />
          Screened Live
        </span>
      </div>

      {/* Main Score & Biomarker Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 20, marginBottom: 20 }}>
        <div
          style={{
            background: "#FFFBEB",
            border: "1px solid var(--risk-mod-border)",
            borderRadius: 12,
            padding: 16,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--risk-mod-text)",
            }}
          >
            Diabetes Risk
          </span>
          <strong
            style={{
              fontFamily: "var(--font-heading)",
              fontSize: "2.4rem",
              fontWeight: 800,
              color: "var(--text-primary)",
              lineHeight: 1.1,
              margin: "6px 0",
            }}
          >
            27%
          </strong>
          <span className="badge badge-risk-moderate">Moderate</span>
        </div>

        {/* Feature contribution bars */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, justifyContent: "center" }}>
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>Blood Pressure (Elevated)</span>
              <span style={{ color: "var(--risk-high)", fontWeight: 700 }}>+75% impact</span>
            </div>
            <div className="risk-bar-track risk-high" style={{ height: 6 }}>
              <i style={{ width: "75%" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>BMI: 27.1 (Overweight)</span>
              <span style={{ color: "var(--risk-mod)", fontWeight: 700 }}>+62% impact</span>
            </div>
            <div className="risk-bar-track risk-moderate" style={{ height: 6 }}>
              <i style={{ width: "62%" }} />
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.78rem", marginBottom: 4 }}>
              <span style={{ fontWeight: 600 }}>Physical Activity (Protective)</span>
              <span style={{ color: "var(--risk-low)", fontWeight: 700 }}>-45% impact</span>
            </div>
            <div className="risk-bar-track risk-low" style={{ height: 6 }}>
              <i style={{ width: "45%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Insights Note */}
      <div
        style={{
          background: "var(--blue-soft)",
          border: "1px solid var(--blue-border)",
          borderRadius: 8,
          padding: "12px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
        }}
      >
        <BrainCircuit size={18} style={{ color: "var(--blue-primary)", flexShrink: 0, marginTop: 2 }} />
        <div style={{ fontSize: "0.82rem", color: "var(--blue-dark)", lineHeight: 1.45 }}>
          <strong>Clinical Insight:</strong> Screening suggests follow-up on resting blood pressure and routine HbA1c testing with your physician.
        </div>
      </div>
    </div>
  );
}
