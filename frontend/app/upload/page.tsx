import { AppPage } from "@/components/app-page";
import { UploadPanel } from "@/components/interactive-pages";
import { UploadCloud, FileCheck, ShieldCheck, Stethoscope } from "lucide-react";

export default function UploadPage() {
  return (
    <AppPage>
      <div className="app-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <UploadCloud size={14} /> OCR & Parsing
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Automated Document Processing
            </span>
          </div>
          <h1 className="page-title">Upload Clinical Medical Report</h1>
          <p className="page-subtitle">
            Upload a doctor&apos;s summary or clinical laboratory report for automated biomarker extraction and ML risk scoring.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24 }}>
        <UploadPanel />

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20, background: "var(--blue-soft)", border: "1px solid var(--blue-border)" }}>
            <h3 style={{ fontSize: "1rem", marginBottom: 8, color: "var(--blue-dark)", display: "flex", alignItems: "center", gap: 8 }}>
              <FileCheck size={18} style={{ color: "var(--blue-primary)" }} /> Supported Formats
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--blue-dark)", lineHeight: 1.5, marginBottom: 10 }}>
              Upload clinical records in <strong>PDF</strong>, <strong>DOCX</strong>, or lab photo scans (<strong>PNG, JPG, WEBP</strong>). HealthLens parses text, tables, and biomarkers automatically.
            </p>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Max file size: 10 MB</span>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.95rem", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={16} style={{ color: "var(--risk-low)" }} /> Clinical Data Privacy
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              Documents are processed securely and never shared with third-party advertising networks.
            </p>
          </div>
        </aside>
      </div>
    </AppPage>
  );
}
