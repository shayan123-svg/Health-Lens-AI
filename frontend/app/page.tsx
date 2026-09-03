import Link from "next/link";
import {
  DashboardPreview,
  MarketingNav,
  TrustIndicators,
} from "@/components/marketing";
import { Testimonials } from "@/components/testimonials";
import { getApprovedReviews } from "@/lib/api/reviews";
import {
  UploadCloud,
  BrainCircuit,
  Activity,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Sparkles,
  HeartPulse,
} from "lucide-react";

const workflowSteps = [
  {
    step: "01",
    title: "Upload Health Information",
    description: "Securely upload your clinical lab reports (PDF, Word, or Scans) or complete our structured intake assessment.",
    icon: UploadCloud,
  },
  {
    step: "02",
    title: "AI Extracts 21 Biomarkers",
    description: "HealthLens AI normalizes clinical parameters including blood pressure, glucose, BMI, and metabolic markers.",
    icon: BrainCircuit,
  },
  {
    step: "03",
    title: "Receive Calibrated Risk Insights",
    description: "Review disease risk estimates, confidence scores, and individual biomarker contributions.",
    icon: Activity,
  },
  {
    step: "04",
    title: "Prepare for Doctor Consultation",
    description: "Review structured summaries, clinical discussion points, and targeted questions for your healthcare provider.",
    icon: Stethoscope,
  },
];

const clinicalFeatures = [
  {
    title: "Automated Clinical Extraction",
    description: "Convert unstructured medical documents and lab panels into clean, structured records in seconds.",
    icon: FileCheck,
  },
  {
    title: "Validated Predictive Modeling",
    description: "Powered by machine learning models trained on comprehensive epidemiological metabolic health indicators.",
    icon: BrainCircuit,
  },
  {
    title: "Explainable Biomarker Drivers",
    description: "Understand exactly which clinical parameters increase or decrease your risk scores.",
    icon: HeartPulse,
  },
  {
    title: "Longitudinal Health History",
    description: "Track your health trajectory over time to measure the real impact of positive lifestyle adjustments.",
    icon: Activity,
  },
  {
    title: "Grounded AI Health Assistant",
    description: "Ask natural language questions grounded directly in your specific screening parameters.",
    icon: Sparkles,
  },
];

export default async function Home() {
  const reviews = await getApprovedReviews();

  return (
    <main style={{ minHeight: "100vh", backgroundColor: "var(--bg-page)" }}>
      <MarketingNav />

      {/* Hero Section */}
      <section className="wrap" style={{ padding: "64px 0 48px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.05fr 0.95fr",
            gap: "56px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "var(--blue-light)",
                color: "var(--blue-primary)",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 20,
              }}
            >
              <HeartPulse size={16} /> Clinical AI Health Intelligence
            </div>

            <h1
              style={{
                fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)",
                lineHeight: 1.12,
                color: "var(--text-primary)",
                marginBottom: 20,
              }}
            >
              Understand your health. <br />
              <span style={{ color: "var(--blue-primary)" }}>Make informed decisions.</span>
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                maxWidth: 540,
                marginBottom: 32,
              }}
            >
              Upload clinical reports or provide biometric indicators to receive AI-powered
              metabolic risk analysis, understand your primary health drivers, and prepare
              meaningful questions for your doctor.
            </p>

            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              <Link className="button button-primary" href="/signup" style={{ padding: "12px 24px", fontSize: "0.95rem" }}>
                Analyze your health <ArrowRight size={18} />
              </Link>
              <a className="button button-quiet" href="#how-it-works" style={{ padding: "12px 20px" }}>
                View how it works
              </a>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldCheck size={16} style={{ color: "var(--risk-low)" }} /> Secure & Private
              </span>
              <span>•</span>
              <span>Instant AI Biomarker Screening</span>
            </div>
          </div>

          <div>
            <DashboardPreview />
          </div>
        </div>

        {/* 4 Trust Indicators */}
        <TrustIndicators />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" style={{ background: "#FFFFFF", borderTop: "1px solid var(--border-color)", borderBottom: "1px solid var(--border-color)", padding: "80px 0" }}>
        <div className="wrap">
          <div style={{ textAlign: "center", maxWidth: 650, margin: "0 auto 56px" }}>
            <span style={{ color: "var(--blue-primary)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Clinical Workflow
            </span>
            <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", marginTop: 8, marginBottom: 16 }}>
              From complex lab reports to actionable clarity.
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
              A transparent, 4-step process designed to assist patients in understanding their metabolic health status.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 24,
            }}
          >
            {workflowSteps.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: 28,
                    borderRadius: 14,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
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
                        <Icon size={22} />
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 800,
                          fontSize: "1.1rem",
                          color: "var(--border-medium)",
                        }}
                      >
                        {item.step}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "1.15rem", marginBottom: 10, color: "var(--text-primary)" }}>
                      {item.title}
                    </h3>
                    <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="wrap" style={{ padding: "88px 0" }}>
        <div style={{ maxWidth: 640, marginBottom: 50 }}>
          <span style={{ color: "var(--blue-primary)", fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Evidence-Based Technology
          </span>
          <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", marginTop: 8, marginBottom: 14 }}>
            Built for clinical trust, clarity, and precision.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "1.05rem" }}>
            Every component is engineered to separate meaningful health signals from data noise.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 24,
          }}
        >
          {clinicalFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: 28,
                  borderRadius: 14,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
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
                  <Icon size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "1.1rem", marginBottom: 8 }}>{feat.title}</h3>
                  <p style={{ fontSize: "0.88rem", color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    {feat.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust & Medical Safety Banner */}
      <section id="trust" style={{ background: "var(--navy-dark)", color: "#FFFFFF", padding: "80px 0" }}>
        <div className="wrap" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 50, alignItems: "center" }}>
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(37, 99, 235, 0.2)",
                color: "#93C5FD",
                padding: "6px 14px",
                borderRadius: "9999px",
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 18,
              }}
            >
              <ShieldCheck size={16} /> Privacy & Safety First
            </div>
            <h2 style={{ fontSize: "clamp(2rem, 3.2vw, 2.75rem)", color: "#FFFFFF", marginBottom: 20 }}>
              Transparent, patient-owned health intelligence.
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "1.05rem", lineHeight: 1.6, marginBottom: 28 }}>
              HealthLens AI is built with privacy-first architecture. All screening outputs are clearly
              calibrated as probabilistic educational risk estimates designed to empower patient-physician
              dialogue, not replace formal clinical diagnoses.
            </p>
            <Link href="/signup" className="button button-primary">
              Explore Patient Workspace <ArrowRight size={16} />
            </Link>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 14,
              padding: 32,
            }}
          >
            <h3 style={{ color: "#FFFFFF", fontSize: "1.2rem", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
              <Stethoscope size={20} style={{ color: "var(--blue-primary)" }} /> Physician Partnership
            </h3>
            <p style={{ color: "#CBD5E1", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 20 }}>
              HealthLens generated findings include explicit discussion guides and questions you can take directly
              to your annual physical or specialist consultation.
            </p>
            <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 16, fontSize: "0.8rem", color: "#94A3B8" }}>
              * Compliant with educational medical AI disclosure standards.
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <Testimonials reviews={reviews} />

      {/* Clinical Footer */}
      <footer style={{ background: "#0B1120", color: "#E2E8F0", padding: "56px 0 40px", borderTop: "1px solid #1E293B" }}>
        <div className="wrap" style={{ display: "flex", justifyContent: "space-between", gap: 40, flexWrap: "wrap", marginBottom: 40 }}>
          <div style={{ maxWidth: 460 }}>
            <div className="brand-mark" style={{ color: "#FFFFFF", marginBottom: 14 }}>
              <span className="brand-logo-icon">✚</span>
              <span>HealthLens AI</span>
            </div>
            <p style={{ fontSize: "0.84rem", color: "#94A3B8", lineHeight: 1.6 }}>
              HealthLens AI provides predictive educational screening insights based on clinical indicators.
              It is not a substitute for professional medical advice, formal diagnosis, or individualized clinical treatment.
            </p>
          </div>

          <div style={{ display: "flex", gap: 48, fontSize: "0.88rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <strong style={{ color: "#FFFFFF", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Platform</strong>
              <Link href="/dashboard" style={{ color: "#94A3B8" }}>Patient Portal</Link>
              <Link href="/new-analysis" style={{ color: "#94A3B8" }}>New Assessment</Link>
              <Link href="/upload" style={{ color: "#94A3B8" }}>Upload Report</Link>
              <Link href="/assistant" style={{ color: "#94A3B8" }}>AI Assistant</Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <strong style={{ color: "#FFFFFF", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Information</strong>
              <Link href="/pricing" style={{ color: "#94A3B8" }}>Plans & Pricing</Link>
              <Link href="/contact" style={{ color: "#94A3B8" }}>Support & Contact</Link>
              <Link href="/feedback" style={{ color: "#94A3B8" }}>Patient Feedback</Link>
            </div>
          </div>
        </div>

        <div className="wrap" style={{ borderTop: "1px solid #1E293B", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#64748B" }}>
          <div>© 2026 HealthLens AI Inc. All rights reserved.</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--risk-low)" }} />
            <span>AI Inference Engine Operational</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
