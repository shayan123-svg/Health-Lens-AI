import { AppPage } from "@/components/app-page";
import { NewAnalysisForm } from "@/components/interactive-pages";
import { ClipboardPlus, ShieldCheck, HeartPulse, Stethoscope } from "lucide-react";

export default function NewAnalysisPage() {
  return (
    <AppPage>
      <div className="app-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <ClipboardPlus size={14} /> Intake Stepper
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Guided Clinical Assessment
            </span>
          </div>
          <h1 className="page-title">New Health Assessment</h1>
          <p className="page-subtitle">
            Complete the 4-step intake questionnaire to evaluate your metabolic risk factors.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <NewAnalysisForm />

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20, background: "var(--blue-soft)", border: "1px solid var(--blue-border)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: 8, color: "var(--blue-dark)", display: "flex", alignItems: "center", gap: 8 }}>
              <HeartPulse size={18} style={{ color: "var(--blue-primary)" }} /> Clinical Intake
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--blue-dark)", lineHeight: 1.5, margin: 0 }}>
              Provide recent resting blood pressure readings and routine fasting lab values where available for highest model accuracy.
            </p>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.95rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={16} style={{ color: "var(--risk-low)" }} /> Privacy Protection
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Your entered parameters are processed securely in your private session and stored with strict encryption.
            </p>
          </div>
        </aside>
      </div>
    </AppPage>
  );
}
