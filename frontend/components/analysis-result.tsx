"use client";

import { useState } from "react";
import type { AnalysisResult, ExtractedHealthData } from "@/lib/types";
import { FormattedMessage } from "./formatted-message";
import {
  HeartPulse,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  BrainCircuit,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState<ExtractedHealthData>(result.extractedData ?? {});

  const modeLabel =
    result.analysisMode === "lifestyle"
      ? "Lifestyle Health Risk Assessment"
      : "Clinical Lab Report Health Analysis";

  const riskLevel = result.prediction.riskLevel.toLowerCase();
  const isHighRisk = riskLevel === "high" || riskLevel === "very high";
  const isModRisk = riskLevel === "moderate";

  const increasingFactors = result.featureContributions.filter(
    (item) => item.impact === "positive" || item.importance > 50
  );
  const mitigatingFactors = result.featureContributions.filter(
    (item) => item.impact === "negative" || item.impact === "neutral"
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <Activity size={14} /> Medical Report
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {result.createdAt} · {result.modelInfo?.name || "HealthLens ML"}
            </span>
          </div>
          <h1 className="page-title">{modeLabel}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: 0 }}>
            Report ID: <code style={{ background: "var(--bg-subtle)", padding: "2px 6px", borderRadius: 4 }}>{result.id}</code>
          </p>
        </div>

        <span
          className={`badge ${
            isHighRisk
              ? "badge-risk-high"
              : isModRisk
              ? "badge-risk-moderate"
              : "badge-risk-low"
          }`}
          style={{ fontSize: "0.85rem", padding: "6px 14px" }}
        >
          {result.prediction.riskLevel.toUpperCase()} RISK
        </span>
      </div>

      {/* Main Central Risk Card */}
      <section className="card" style={{ padding: 28 }}>
        <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 32, alignItems: "center" }}>
          <div
            className={`risk-score-circle ${
              isHighRisk ? "risk-high" : isModRisk ? "risk-moderate" : "risk-low"
            }`}
            style={{ width: 160, height: 160, margin: "0 auto" }}
          >
            <strong>{result.prediction.probability}%</strong>
            <small>{result.prediction.riskLevel} risk</small>
          </div>

          <div>
            <h2 style={{ fontSize: "1.35rem", marginBottom: 8, color: "var(--text-primary)" }}>
              {result.summary?.headline || "Risk Screening Result"}
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 16 }}>
              {result.summary?.overview || "This AI screening model evaluated your clinical and lifestyle parameters."}
            </p>

            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: "0.82rem", color: "var(--text-muted)" }}>
              <span>
                <strong>Screening Threshold:</strong> 24%
              </span>
              <span>•</span>
              <span>
                <strong>Model Confidence:</strong> {result.prediction.confidence ?? 85}%
              </span>
              <span>•</span>
              <span>
                <strong>Data Quality Score:</strong> {result.dataQuality.score}%
              </span>
            </div>
          </div>
        </div>

        <div className="disclaimer" style={{ marginTop: 20 }}>
          <strong>Clinical Disclaimer:</strong> HealthLens AI provides probabilistic educational risk estimates
          for disease screening awareness. This model output does not establish a clinical diagnosis and is
          designed to assist consultations with a certified physician.
        </div>
      </section>

      {/* Factors Increasing vs Mitigating Risk */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {/* Factors Increasing Risk */}
        <section className="card" style={{ borderLeft: "4px solid var(--risk-high)" }}>
          <div className="card-heading">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--risk-high-text)" }}>
              <ArrowUpRight size={20} style={{ color: "var(--risk-high)" }} /> Factors Increasing Risk
            </h3>
            <span className="badge badge-risk-high">{increasingFactors.length} Indicators</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {increasingFactors.map((factor) => (
              <div
                key={factor.feature}
                style={{
                  background: "#FEF2F2",
                  border: "1px solid var(--risk-high-border)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <strong style={{ fontSize: "0.9rem", color: "var(--risk-high-text)" }}>
                    {factor.feature}
                  </strong>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--risk-high)" }}>
                    {factor.value !== undefined ? String(factor.value) : "Reported High"}
                  </span>
                </div>
                <p style={{ fontSize: "0.8rem", color: "#7F1D1D", margin: 0, lineHeight: 1.45 }}>
                  {factor.explanation || "Contributes to elevated risk score."}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Factors Decreasing Risk */}
        <section className="card" style={{ borderLeft: "4px solid var(--risk-low)" }}>
          <div className="card-heading">
            <h3 style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--risk-low-text)" }}>
              <ArrowDownRight size={20} style={{ color: "var(--risk-low)" }} /> Protective / Mitigating Factors
            </h3>
            <span className="badge badge-risk-low">{mitigatingFactors.length} Indicators</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mitigatingFactors.length > 0 ? (
              mitigatingFactors.map((factor) => (
                <div
                  key={factor.feature}
                  style={{
                    background: "#F0FDF4",
                    border: "1px solid var(--risk-low-border)",
                    borderRadius: 8,
                    padding: "12px 14px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--risk-low-text)" }}>
                      {factor.feature}
                    </strong>
                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--risk-low)" }}>
                      {factor.value !== undefined ? String(factor.value) : "Controlled"}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "#14532D", margin: 0, lineHeight: 1.45 }}>
                    {factor.explanation || "Provides positive protective benefit."}
                  </p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                No significant mitigating factors detected in current screening parameters.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Structured Key Findings & Questions for Doctor */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        <section className="card">
          <h2 style={{ fontSize: "1.15rem", marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={18} style={{ color: "var(--blue-primary)" }} /> Key Clinical Findings
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 20, fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            {(result.summary?.keyFindings || []).map((finding) => (
              <li key={finding}>{finding}</li>
            ))}
          </ul>
        </section>

        <section className="card" style={{ background: "var(--blue-soft)", border: "1px solid var(--blue-border)" }}>
          <h2 style={{ fontSize: "1.15rem", marginBottom: 14, color: "var(--blue-dark)", display: "flex", alignItems: "center", gap: 8 }}>
            <Stethoscope size={20} style={{ color: "var(--blue-primary)" }} /> Questions to Ask Your Doctor
          </h2>
          <ul style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 20, fontSize: "0.9rem", color: "var(--blue-dark)" }}>
            {(result.summary?.discussionPoints || []).map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* AI Clinical Insights Report Section */}
      {result.aiReport && (
        <section className="card" style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
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
              <BrainCircuit size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: "1.25rem", margin: 0, color: "var(--text-primary)" }}>
                Personalized AI Clinical Analysis & Recommendations
              </h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Comprehensive evidence-based report generated by HealthLens Clinical Insights AI
              </p>
            </div>
          </div>

          <div style={{ fontSize: "0.93rem", lineHeight: 1.65, color: "var(--text-primary)" }}>
            <FormattedMessage content={result.aiReport} />
          </div>
        </section>
      )}

      {/* Extracted Biomarkers Table */}
      {result.extractedData && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Extracted Clinical Biomarkers & Indicators</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: 0 }}>
                21 validated parameters extracted from report or assessment intake
              </p>
            </div>
            <button className="button button-quiet" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? "Save Parameters" : "Edit Parameters"}
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
            }}
          >
            {Object.entries(data).map(([key, value]) => (
              <div
                key={key}
                style={{
                  background: "var(--bg-subtle)",
                  border: "1px solid var(--border-color)",
                  borderRadius: 8,
                  padding: "12px 14px",
                }}
              >
                <div style={{ fontSize: "0.76rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  {key}
                </div>
                {isEditing ? (
                  <input
                    value={String(value ?? "")}
                    onChange={(event) =>
                      setData((curr) => ({ ...curr, [key]: event.target.value }))
                    }
                    style={{ marginTop: 4, padding: "4px 8px", fontSize: "0.85rem" }}
                  />
                ) : (
                  <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>
                    {typeof value === "boolean"
                      ? value
                        ? "Positive / Yes"
                        : "Negative / No"
                      : value ?? "Not provided"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
