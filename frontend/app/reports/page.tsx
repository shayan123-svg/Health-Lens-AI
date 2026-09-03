"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppPage } from "@/components/app-page";
import { ReportDetailModal } from "@/components/report-detail-modal";
import { useAuth } from "@/lib/auth-context";
import { deleteReportById, fetchUserReports } from "@/lib/api/reports";
import type { Report, RiskLevel } from "@/lib/types";
import {
  FileText,
  UploadCloud,
  Trash2,
  Eye,
  ShieldCheck,
  Activity,
  AlertCircle,
  ClipboardPlus,
} from "lucide-react";

export default function ReportsPage() {
  const { session, loading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const loadReports = async () => {
    if (!session?.access_token) return;
    try {
      setLoading(true);
      const data = await fetchUserReports(session.access_token);
      setReports(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load clinical reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!session?.access_token) {
      setLoading(false);
      return;
    }
    loadReports();
  }, [session, authLoading]);

  const handleDelete = async (reportId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session?.access_token) return;
    if (!confirm("Are you sure you want to delete this clinical report record?")) return;

    setDeletingId(reportId);
    try {
      await deleteReportById(reportId, session.access_token);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch (err: any) {
      alert(err.message || "Failed to delete report");
    } finally {
      setDeletingId(null);
    }
  };

  const getRiskBadgeClass = (level?: RiskLevel | string) => {
    const l = (level || "low").toLowerCase();
    if (l === "high" || l === "very high") return "badge-risk-high";
    if (l === "moderate") return "badge-risk-moderate";
    return "badge-risk-low";
  };

  return (
    <AppPage>
      <div className="app-top">
        <div>
          <h1 className="page-title">Medical Reports Library</h1>
          <p className="page-subtitle">
            Historical laboratory documents, extracted biometric indicators, and ML model predictions.
          </p>
        </div>
        <Link href="/upload" className="button button-primary">
          <UploadCloud size={16} /> Upload New Report
        </Link>
      </div>

      {loading || authLoading ? (
        <section className="card" style={{ padding: "40px 20px", textAlign: "center", color: "var(--text-muted)" }}>
          Loading your clinical records…
        </section>
      ) : !session ? (
        <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <ShieldCheck size={44} style={{ color: "var(--blue-primary)", margin: "0 auto 16px" }} />
          <h2 style={{ marginBottom: 8 }}>Sign In to View Your Medical Records</h2>
          <p style={{ maxWidth: 440, margin: "0 auto 24px", color: "var(--text-muted)" }}>
            Access your verified screening history, extracted biomarker panels, and physician discussion guides.
          </p>
          <Link href="/login" className="button button-primary">
            Sign In to Patient Portal
          </Link>
        </section>
      ) : error ? (
        <section className="card" style={{ textAlign: "center", padding: "36px 20px" }}>
          <AlertCircle size={36} style={{ color: "var(--risk-high)", margin: "0 auto 12px" }} />
          <h2 style={{ color: "var(--risk-high)", marginBottom: 8 }}>Unable to Load Reports</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{error}</p>
          <button onClick={loadReports} className="button button-primary">
            Retry Connection
          </button>
        </section>
      ) : reports.length === 0 ? (
        <section className="card" style={{ textAlign: "center", padding: "48px 20px" }}>
          <FileText size={44} style={{ color: "var(--text-subtle)", margin: "0 auto 16px" }} />
          <h2 style={{ marginBottom: 8 }}>No Screening Reports Yet</h2>
          <p style={{ maxWidth: 460, margin: "0 auto 24px", color: "var(--text-muted)", fontSize: "0.92rem" }}>
            Upload a clinical document in DOCX or PDF format or complete a quick intake assessment to generate your first analysis.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/upload" className="button button-primary">
              <UploadCloud size={16} /> Upload Clinical File
            </Link>
            <Link href="/new-analysis" className="button button-secondary">
              <ClipboardPlus size={16} /> Run Intake Assessment
            </Link>
          </div>
        </section>
      ) : (
        <section className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Medical Document</th>
                  <th>Assessment Date</th>
                  <th>Analysis Mode</th>
                  <th>Status</th>
                  <th>Risk Estimate</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
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
                          <button
                            type="button"
                            onClick={() => setSelectedReportId(report.id)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: 0,
                              fontWeight: 700,
                              color: "var(--blue-dark)",
                              display: "block",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                          >
                            {report.name}
                          </button>
                          <span style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                            ID: {report.id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{report.date}</td>
                    <td>
                      <span className="badge badge-blue">
                        {report.analysisMode === "lifestyle" ? "Lifestyle Intake" : "Clinical Document"}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-blue" style={{ textTransform: "capitalize" }}>
                        {report.status.replace("_", " ")}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getRiskBadgeClass(report.riskLevel)}`}>
                        {report.riskLevel} {report.riskPercentage !== undefined ? `(${report.riskPercentage}%)` : ""}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedReportId(report.id)}
                          className="button button-quiet"
                          style={{ padding: "5px 12px", fontSize: "0.78rem" }}
                          title="Preview report details"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={(e) => handleDelete(report.id, e)}
                          disabled={deletingId === report.id}
                          className="button button-danger"
                          style={{ padding: "5px 10px", fontSize: "0.78rem" }}
                          title="Delete report"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

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
