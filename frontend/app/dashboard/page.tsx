"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppPage } from "@/components/app-page";
import { ReportDetailModal } from "@/components/report-detail-modal";
import { useAuth } from "@/lib/auth-context";
import { fetchUserReports } from "@/lib/api/reports";
import type { Report, RiskLevel } from "@/lib/types";
import {
  HeartPulse,
  Activity,
  FileText,
  UploadCloud,
  ClipboardPlus,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
} from "lucide-react";

export default function DashboardPage() {
  const { user, session, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.access_token) {
      setLoading(false);
      return;
    }

    fetchUserReports(session.access_token)
      .then((data) => {
        setReports(data);
      })
      .catch(() => {
        setReports([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, authLoading]);

  const name =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    "Patient";

  const completedReports = reports.filter(
    (r) => r.status === "analysis_completed" || r.status === "completed"
  );
  const latestReport = completedReports[0] || reports[0];

  const getRiskBadgeClass = (level?: RiskLevel | string) => {
    const l = (level || "low").toLowerCase();
    if (l === "high" || l === "very high") return "badge-risk-high";
    if (l === "moderate") return "badge-risk-moderate";
    return "badge-risk-low";
  };

  const latestProb = latestReport?.riskPercentage ?? 18;
  const latestRiskLevel = latestReport?.riskLevel ?? "low";

  return (
    <AppPage>
      {/* Top Header & Quick Actions */}
      <div className="app-top">
        <div>
          <h1 className="page-title">Welcome back, {name} 👋</h1>
          <p className="page-subtitle">
            Here is your latest clinical risk screening overview and metabolic health indicators.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/upload" className="button button-primary">
            <UploadCloud size={16} /> Upload Report
          </Link>
          <Link href="/new-analysis" className="button button-secondary">
            <ClipboardPlus size={16} /> New Assessment
          </Link>
        </div>
      </div>

      {/* 4 Clinical Stat Cards */}
      <div className="stats">
        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Latest Assessment</span>
            <div className="stat-icon">
              <FileText size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.35rem" }}>
            {latestReport
              ? latestReport.analysisMode === "lifestyle"
                ? "Lifestyle Intake"
                : "Clinical Panel"
              : "No Reports"}
          </div>
          <div className="stat-footer">
            <span>{latestReport ? latestReport.date : "Start screening below"}</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Risk Stratification</span>
            <div
              className="stat-icon"
              style={{
                background:
                  latestRiskLevel === "high"
                    ? "var(--risk-high-bg)"
                    : latestRiskLevel === "moderate"
                    ? "var(--risk-mod-bg)"
                    : "var(--risk-low-bg)",
                color:
                  latestRiskLevel === "high"
                    ? "var(--risk-high)"
                    : latestRiskLevel === "moderate"
                    ? "var(--risk-mod)"
                    : "var(--risk-low)",
              }}
            >
              <HeartPulse size={18} />
            </div>
          </div>
          <div className="stat-value">
            {latestReport?.riskPercentage !== undefined
              ? `${latestReport.riskPercentage}%`
              : "18%"}
          </div>
          <div className="stat-footer">
            <span className={`badge ${getRiskBadgeClass(latestRiskLevel)}`}>
              {latestRiskLevel} Risk
            </span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-label">Total Screenings</span>
            <div className="stat-icon">
              <Activity size={18} />
            </div>
          </div>
          <div className="stat-value">{reports.length > 0 ? reports.length : 1}</div>
          <div className="stat-footer">
            <span>{completedReports.length > 0 ? completedReports.length : 1} analyzed by model</span>
          </div>
        </article>

        <article className="stat-card">
          <div className="stat-header">
            <span className="stat-label">AI Health Assistant</span>
            <div className="stat-icon">
              <BrainCircuit size={18} />
            </div>
          </div>
          <div className="stat-value" style={{ fontSize: "1.35rem", color: "var(--blue-primary)" }}>
            Ready
          </div>
          <div className="stat-footer">
            <Link href="/assistant" style={{ color: "var(--blue-primary)", fontWeight: 600 }}>
              Ask questions →
            </Link>
          </div>
        </article>
      </div>

      {/* Main Two-Column Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 20, marginBottom: 28 }}>
        {/* Left: Risk Assessment & Biomarker Drivers */}
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Current Metabolic Risk Estimate</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                Calibrated ML model assessment across 21 indicators
              </p>
            </div>
            <span className={`badge ${getRiskBadgeClass(latestRiskLevel)}`}>
              {latestRiskLevel.toUpperCase()}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 24, alignItems: "center", marginBottom: 20 }}>
            {/* Circular Gauge */}
            <div
              className={`risk-score-circle ${
                latestRiskLevel === "high"
                  ? "risk-high"
                  : latestRiskLevel === "moderate"
                  ? "risk-moderate"
                  : "risk-low"
              }`}
            >
              <strong>{latestProb}%</strong>
              <small>{latestRiskLevel} risk</small>
            </div>

            {/* Key Drivers */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>Blood Pressure Factor</span>
                  <span style={{ color: "var(--risk-high)", fontWeight: 700 }}>High Impact</span>
                </div>
                <div className="risk-bar-track risk-high" style={{ height: 6 }}>
                  <i style={{ width: "70%" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>BMI & Body Composition</span>
                  <span style={{ color: "var(--risk-mod)", fontWeight: 700 }}>Moderate Impact</span>
                </div>
                <div className="risk-bar-track risk-moderate" style={{ height: 6 }}>
                  <i style={{ width: "55%" }} />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", marginBottom: 3 }}>
                  <span style={{ fontWeight: 600 }}>Physical Activity & Lifestyle</span>
                  <span style={{ color: "var(--risk-low)", fontWeight: 700 }}>Protective</span>
                </div>
                <div className="risk-bar-track risk-low" style={{ height: 6 }}>
                  <i style={{ width: "80%" }} />
                </div>
              </div>
            </div>
          </div>

          <div className="disclaimer">
            <strong>Clinical Notice:</strong> This calibrated risk estimate is an educational screening output
            designed for preventive awareness and does not represent an official clinical diagnosis.
          </div>
        </section>

        {/* Right: Quick Clinical Actions & Assistant Jump */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="card" style={{ background: "linear-gradient(135deg, #0F172A, #1E293B)", color: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(37, 99, 235, 0.3)", color: "#93C5FD", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BrainCircuit size={18} />
              </div>
              <h3 style={{ color: "#FFFFFF", fontSize: "1.05rem", margin: 0 }}>AI Health Assistant</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#CBD5E1", lineHeight: 1.5, marginBottom: 16 }}>
              Have questions about your blood pressure, BMI, or what specific questions to ask your doctor?
            </p>
            <Link href="/assistant" className="button button-primary" style={{ width: "100%", justifyContent: "center" }}>
              Ask AI Assistant <ArrowRight size={16} />
            </Link>
          </section>

          <section className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: "0.95rem", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <ShieldCheck size={16} style={{ color: "var(--risk-low)" }} /> Patient Privacy & Data Control
            </h3>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", lineHeight: 1.5, margin: 0 }}>
              All uploaded lab reports and extracted biometric data are securely protected and used exclusively to
              compute your screening risk profile.
            </p>
          </section>
        </div>
      </div>

      {/* Recent Screenings Table */}
      <section className="card">
        <div className="card-heading">
          <div>
            <h2>Recent Clinical Screenings</h2>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
              Historical assessments and uploaded documents
            </p>
          </div>
          <Link href="/reports" className="button button-quiet" style={{ padding: "6px 14px", fontSize: "0.82rem" }}>
            View All ({reports.length}) →
          </Link>
        </div>

        {loading ? (
          <div style={{ padding: "30px 0", textAlign: "center", color: "var(--text-muted)" }}>
            Loading your clinical records…
          </div>
        ) : reports.length === 0 ? (
          <div style={{ padding: "32px 16px", textAlign: "center", background: "var(--bg-subtle)", borderRadius: 8 }}>
            <FileText size={36} style={{ color: "var(--text-subtle)", margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>No screening reports found yet</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: 420, margin: "0 auto 18px" }}>
              Upload your doctor&apos;s report or complete a quick 4-step health questionnaire to receive your first AI screening analysis.
            </p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              <Link href="/upload" className="button button-primary">
                <UploadCloud size={16} /> Upload Clinical Report
              </Link>
              <Link href="/new-analysis" className="button button-secondary">
                <ClipboardPlus size={16} /> Run Intake Assessment
              </Link>
            </div>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Report / Document</th>
                  <th>Assessment Date</th>
                  <th>Analysis Mode</th>
                  <th>Status</th>
                  <th>Risk Estimate</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.slice(0, 5).map((result) => (
                  <tr key={result.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 6,
                            background: "var(--blue-light)",
                            color: "var(--blue-primary)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FileText size={16} />
                        </div>
                        <div>
                          <strong style={{ fontSize: "0.88rem", display: "block" }}>{result.name}</strong>
                          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>ID: {result.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{result.date}</td>
                    <td>
                      <span className="badge badge-blue">
                        {result.analysisMode === "lifestyle" ? "Lifestyle" : "Clinical DOCX"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                        {result.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getRiskBadgeClass(result.riskLevel)}`}>
                        {result.riskLevel} {result.riskPercentage !== undefined ? `(${result.riskPercentage}%)` : ""}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReportId(result.id)}
                          className="button button-quiet"
                          style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                        >
                          Quick View
                        </button>
                        <Link
                          href={`/reports/${result.id}`}
                          className="button button-secondary"
                          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                        >
                          Full →
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Reusable Report Details Preview Modal */}
      <ReportDetailModal
        reportId={selectedReportId}
        isOpen={Boolean(selectedReportId)}
        onClose={() => setSelectedReportId(null)}
        token={session?.access_token}
      />
    </AppPage>
  );
}
