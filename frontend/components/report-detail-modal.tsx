"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "./modal";
import { FormattedMessage } from "./formatted-message";
import { fetchReportById, backendReportToAnalysisResult } from "@/lib/api/reports";
import type { AnalysisResult, RiskLevel } from "@/lib/types";
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  CheckCircle2,
  ExternalLink,
  Loader2,
  AlertCircle,
  Stethoscope,
  ShieldCheck,
} from "lucide-react";

interface ReportDetailModalProps {
  reportId: string | null;
  isOpen: boolean;
  onClose: () => void;
  token?: string;
}

export function ReportDetailModal({
  reportId,
  isOpen,
  onClose,
  token,
}: ReportDetailModalProps) {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !reportId) {
      setResult(null);
      setError(null);
      return;
    }

    let isMounted = true;

    async function fetchDetails() {
      setLoading(true);
      setError(null);

      try {
        const rawReport = await fetchReportById(reportId as string, token);
        if (isMounted) {
          const adapted = backendReportToAnalysisResult(rawReport);
          setResult(adapted);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(
            err.response?.data?.detail ||
              err.message ||
              "Failed to load clinical report details."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [isOpen, reportId, token]);

  const riskLevel = (result?.prediction?.riskLevel || "low").toLowerCase();
  const isHighRisk = riskLevel === "high" || riskLevel === "very high";
  const isModRisk = riskLevel === "moderate";

  const increasingFactors = (result?.featureContributions || []).filter(
    (item) => item.impact === "positive" || item.importance > 50
  );
  const mitigatingFactors = (result?.featureContributions || []).filter(
    (item) => item.impact === "negative" || item.impact === "neutral"
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span>{result?.reportName || "Medical Report Details"}</span>
          {result && (
            <span
              className={`badge ${
                isHighRisk
                  ? "badge-risk-high"
                  : isModRisk
                  ? "badge-risk-moderate"
                  : "badge-risk-low"
              }`}
              style={{ fontSize: "0.78rem", padding: "4px 10px" }}
            >
              {result.prediction.riskLevel.toUpperCase()} RISK
            </span>
          )}
        </div>
      }
      subtitle={
        result
          ? `${result.createdAt} · ${result.analysisMode === "clinical" ? "Clinical Lab Document" : "Lifestyle Assessment"}`
          : "Fetching clinical analysis details…"
      }
      footer={
        result ? (
          <>
            <button type="button" onClick={onClose} className="button button-quiet">
              Close Preview
            </button>
            <Link
              href={`/reports/${result.id}`}
              className="button button-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <ExternalLink size={15} /> Open Full Report Page
            </Link>
          </>
        ) : undefined
      }
    >
      {/* Loading State */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            gap: 14,
            color: "var(--text-muted)",
          }}
        >
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--blue-primary)" }} />
          <p style={{ fontSize: "0.95rem", margin: 0 }}>Loading clinical report analysis…</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: "40px 20px",
            gap: 12,
          }}
        >
          <AlertCircle size={40} style={{ color: "var(--risk-high)" }} />
          <h3 style={{ fontSize: "1.15rem", color: "var(--risk-high)", margin: 0 }}>
            Unable to Load Report Details
          </h3>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: 420 }}>
            {error}
          </p>
          <button
            type="button"
            onClick={() => {
              if (reportId) {
                setLoading(true);
                setError(null);
                fetchReportById(reportId, token)
                  .then((raw) => setResult(backendReportToAnalysisResult(raw)))
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              }
            }}
            className="button button-primary"
            style={{ marginTop: 8 }}
          >
            Retry Loading
          </button>
        </div>
      )}

      {/* Success Content */}
      {!loading && !error && result && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Main Risk Overview Banner */}
          <div
            style={{
              background: "var(--bg-subtle)",
              border: "1px solid var(--border-color)",
              borderRadius: 12,
              padding: "20px 24px",
              display: "grid",
              gridTemplateColumns: "140px 1fr",
              gap: 24,
              alignItems: "center",
            }}
          >
            <div
              className={`risk-score-circle ${
                isHighRisk ? "risk-high" : isModRisk ? "risk-moderate" : "risk-low"
              }`}
              style={{ width: 120, height: 120, margin: "0 auto" }}
            >
              <strong style={{ fontSize: "1.75rem" }}>{result.prediction.probability}%</strong>
              <small style={{ fontSize: "0.65rem" }}>{result.prediction.riskLevel} risk</small>
            </div>

            <div>
              <h3 style={{ fontSize: "1.15rem", marginBottom: 6, color: "var(--text-primary)" }}>
                {result.summary?.headline || "Clinical Risk Screening Result"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.5, margin: "0 0 12px" }}>
                {result.summary?.overview}
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                <span>
                  <strong>Threshold:</strong> 24%
                </span>
                <span>•</span>
                <span>
                  <strong>Model Confidence:</strong> {result.prediction.confidence ?? 85}%
                </span>
                <span>•</span>
                <span>
                  <strong>Data Quality:</strong> {result.dataQuality.score}%
                </span>
              </div>
            </div>
          </div>

          {/* Key Findings & Doctor Questions */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                padding: "16px 18px",
                background: "#FFFFFF",
              }}
            >
              <h4
                style={{
                  fontSize: "0.98rem",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--blue-dark)",
                }}
              >
                <CheckCircle2 size={16} style={{ color: "var(--blue-primary)" }} /> Key Findings
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, fontSize: "0.86rem", color: "var(--text-secondary)" }}>
                {(result.summary?.keyFindings || []).map((finding, idx) => (
                  <li key={idx}>{finding}</li>
                ))}
              </ul>
            </div>

            <div
              style={{
                border: "1px solid var(--blue-border)",
                borderRadius: 10,
                padding: "16px 18px",
                background: "var(--blue-soft)",
              }}
            >
              <h4
                style={{
                  fontSize: "0.98rem",
                  marginBottom: 10,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "var(--blue-dark)",
                }}
              >
                <Stethoscope size={16} style={{ color: "var(--blue-primary)" }} /> Questions to Ask Doctor
              </h4>
              <ul style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 18, fontSize: "0.86rem", color: "var(--blue-dark)" }}>
                {(result.summary?.discussionPoints || []).map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Factors Increasing vs Mitigating Risk */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {/* Risk Elevating Factors */}
            <div
              style={{
                border: "1px solid var(--risk-high-border)",
                borderRadius: 10,
                padding: "16px",
                background: "#FEF2F2",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: "0.92rem", color: "var(--risk-high-text)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <ArrowUpRight size={16} /> Elevating Factors
                </h4>
                <span className="badge badge-risk-high" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                  {increasingFactors.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {increasingFactors.length > 0 ? (
                  increasingFactors.map((f, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid var(--risk-high-border)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--risk-high-text)" }}>
                        <span>{f.feature}</span>
                        <span>{f.value !== undefined ? String(f.value) : "High"}</span>
                      </div>
                      {f.explanation && (
                        <p style={{ margin: "2px 0 0", color: "#991B1B", fontSize: "0.76rem" }}>
                          {f.explanation}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    No major elevated risk factors detected.
                  </p>
                )}
              </div>
            </div>

            {/* Protective Mitigating Factors */}
            <div
              style={{
                border: "1px solid var(--risk-low-border)",
                borderRadius: 10,
                padding: "16px",
                background: "#F0FDF4",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <h4 style={{ fontSize: "0.92rem", color: "var(--risk-low-text)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <ArrowDownRight size={16} /> Protective Factors
                </h4>
                <span className="badge badge-risk-low" style={{ fontSize: "0.72rem", padding: "2px 8px" }}>
                  {mitigatingFactors.length}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {mitigatingFactors.length > 0 ? (
                  mitigatingFactors.map((f, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid var(--risk-low-border)",
                        borderRadius: 6,
                        padding: "8px 12px",
                        fontSize: "0.82rem",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "var(--risk-low-text)" }}>
                        <span>{f.feature}</span>
                        <span>{f.value !== undefined ? String(f.value) : "Controlled"}</span>
                      </div>
                      {f.explanation && (
                        <p style={{ margin: "2px 0 0", color: "#166534", fontSize: "0.76rem" }}>
                          {f.explanation}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                    No mitigating factors recorded in current panel.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* AI Clinical Insights Narrative (if available) */}
          {result.aiReport && (
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                padding: "20px",
                background: "#FFFFFF",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
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
                  <BrainCircuit size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: "1.05rem", margin: 0, color: "var(--text-primary)" }}>
                    AI Clinical Insights & Recommendations
                  </h4>
                  <p style={{ fontSize: "0.76rem", color: "var(--text-muted)", margin: 0 }}>
                    Evidence-based preventive summary generated by HealthLens AI
                  </p>
                </div>
              </div>

              <div style={{ fontSize: "0.88rem", lineHeight: 1.6 }}>
                <FormattedMessage content={result.aiReport} />
              </div>
            </div>
          )}

          {/* Extracted Biomarkers / Parameters Summary */}
          {result.extractedData && Object.keys(result.extractedData).length > 0 && (
            <div
              style={{
                border: "1px solid var(--border-color)",
                borderRadius: 10,
                padding: "18px",
                background: "var(--bg-subtle)",
              }}
            >
              <h4 style={{ fontSize: "0.95rem", marginBottom: 12, color: "var(--text-primary)" }}>
                Validated Indicators ({Object.keys(result.extractedData).length} features)
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 8,
                }}
              >
                {Object.entries(result.extractedData).map(([key, val]) => (
                  <div
                    key={key}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid var(--border-color)",
                      borderRadius: 6,
                      padding: "8px 10px",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 600 }}>
                      {key}
                    </div>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                      {typeof val === "boolean" ? (val ? "Yes / Positive" : "No / Negative") : val ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
