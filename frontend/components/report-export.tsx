"use client";

import type { AnalysisResult } from "@/lib/types";

const RISK_COLORS: Record<string, string> = {
  low: "#16A34A",
  moderate: "#D97706",
  high: "#DC2626",
  "very high": "#DC2626",
};

function formatValue(value: string | number | boolean | null | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

export function ReportExportDocument({
  result,
  patientName,
}: {
  result: AnalysisResult;
  patientName?: string | null;
}) {
  const riskLevel = result.prediction.riskLevel.toLowerCase();
  const riskColor = RISK_COLORS[riskLevel] ?? "#334155";

  const increasingFactors = result.featureContributions.filter(
    (item) => item.impact === "positive" || item.importance > 50
  );
  const mitigatingFactors = result.featureContributions.filter(
    (item) => item.impact === "negative" || item.impact === "neutral"
  );

  const generatedAt = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const label =
    result.analysisMode === "lifestyle"
      ? "Lifestyle Health Risk Assessment"
      : "Clinical Lab Report Analysis";

  return (
    <div
      style={{
        background: "#FFFFFF",
        color: "#0F172A",
        maxWidth: 800,
        margin: "0 auto",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: "0.9rem",
        lineHeight: 1.55,
      }}
    >
      {/* Document Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          borderBottom: "3px solid #0F4C81",
          paddingBottom: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0F4C81" }}>
            ✚ HealthLens AI
          </div>
          <div style={{ fontSize: "0.75rem", color: "#64748B", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Patient Screening Summary
          </div>
        </div>
        <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#475569" }}>
          <div>Generated: {generatedAt}</div>
          <div>Report ID: {result.id.slice(0, 8)}…</div>
        </div>
      </header>

      {/* Patient & Screening Info */}
      <section style={{ marginBottom: 24 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <tbody>
            <tr>
              <td style={{ padding: "6px 0", color: "#64748B", width: "22%" }}>Patient</td>
              <td style={{ padding: "6px 0", fontWeight: 600 }}>{patientName || "—"}</td>
              <td style={{ padding: "6px 0", color: "#64748B", width: "22%" }}>Assessment Date</td>
              <td style={{ padding: "6px 0", fontWeight: 600 }}>{result.createdAt}</td>
            </tr>
            <tr>
              <td style={{ padding: "6px 0", color: "#64748B" }}>Assessment Type</td>
              <td style={{ padding: "6px 0", fontWeight: 600 }}>{label}</td>
              <td style={{ padding: "6px 0", color: "#64748B" }}>Model</td>
              <td style={{ padding: "6px 0", fontWeight: 600 }}>
                {result.modelInfo?.name || "HealthLens ML"} v{result.modelInfo?.version || "—"}
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      {/* Risk Estimate */}
      <section
        style={{
          border: "1px solid #E2E8F0",
          borderRadius: 10,
          padding: "18px 20px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "#64748B", marginBottom: 4 }}>
              Estimated {result.prediction.condition || "Diabetes Risk"}
            </div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: riskColor }}>
              {result.prediction.probability}%
              <span style={{ fontSize: "0.9rem", fontWeight: 700, marginLeft: 10, color: riskColor }}>
                {result.prediction.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>
          <div style={{ fontSize: "0.8rem", color: "#475569", textAlign: "right" }}>
            <div>Screening threshold: 24%</div>
            <div>Model confidence: {result.prediction.confidence ?? "—"}%</div>
            <div>Data quality score: {result.dataQuality.score}%</div>
          </div>
        </div>
        {result.summary?.overview && (
          <p style={{ margin: "12px 0 0", color: "#334155" }}>{result.summary.overview}</p>
        )}
      </section>

      {/* Contributing Factors */}
      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "1rem", margin: "0 0 10px", color: "#0F4C81" }}>Contributing Factors</h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #E2E8F0", textAlign: "left" }}>
              <th style={{ padding: "8px 6px" }}>Factor</th>
              <th style={{ padding: "8px 6px" }}>Value</th>
              <th style={{ padding: "8px 6px" }}>Effect</th>
              <th style={{ padding: "8px 6px" }}>Relative Influence</th>
            </tr>
          </thead>
          <tbody>
            {[...increasingFactors, ...mitigatingFactors].map((factor) => (
              <tr key={factor.feature} style={{ borderBottom: "1px solid #F1F5F9" }}>
                <td style={{ padding: "8px 6px", fontWeight: 600 }}>{factor.feature}</td>
                <td style={{ padding: "8px 6px" }}>{formatValue(factor.value)}</td>
                <td style={{ padding: "8px 6px" }}>
                  <span
                    style={{
                      color:
                        factor.impact === "positive"
                          ? "#DC2626"
                          : factor.impact === "negative"
                          ? "#16A34A"
                          : "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    {factor.impact === "positive"
                      ? "Increases risk"
                      : factor.impact === "negative"
                      ? "Reduces risk"
                      : "Neutral"}
                  </span>
                </td>
                <td style={{ padding: "8px 6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 90, height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${Math.min(100, factor.importance)}%`,
                          height: "100%",
                          background:
                            factor.impact === "positive"
                              ? "#DC2626"
                              : factor.impact === "negative"
                              ? "#16A34A"
                              : "#94A3B8",
                        }}
                      />
                    </div>
                    <span style={{ color: "#64748B", fontSize: "0.78rem" }}>{factor.importance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Key Findings & Doctor Questions */}
      {(result.summary?.keyFindings?.length || result.summary?.discussionPoints?.length) ? (
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: "1rem", margin: "0 0 8px", color: "#0F4C81" }}>Key Findings</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {(result.summary?.keyFindings || []).map((finding) => (
                <li key={finding}>{finding}</li>
              ))}
            </ul>
          </div>
          <div>
            <h2 style={{ fontSize: "1rem", margin: "0 0 8px", color: "#0F4C81" }}>Questions for the Doctor</h2>
            <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6 }}>
              {(result.summary?.discussionPoints || []).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Extracted Biomarkers */}
      {result.extractedData && Object.keys(result.extractedData).length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: "1rem", margin: "0 0 10px", color: "#0F4C81" }}>Screening Inputs Used</h2>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
            <tbody>
              {Object.entries(result.extractedData).map(([key, value], idx, arr) =>
                idx % 2 === 0 ? (
                  <tr key={key} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "6px", color: "#64748B", width: "20%" }}>{key}</td>
                    <td style={{ padding: "6px", fontWeight: 600, width: "30%" }}>{formatValue(value)}</td>
                    {arr[idx + 1] ? (
                      <>
                        <td style={{ padding: "6px", color: "#64748B", width: "20%" }}>{arr[idx + 1][0]}</td>
                        <td style={{ padding: "6px", fontWeight: 600, width: "30%" }}>{formatValue(arr[idx + 1][1])}</td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: "6px" }} />
                        <td style={{ padding: "6px" }} />
                      </>
                    )}
                  </tr>
                ) : null
              )}
            </tbody>
          </table>
        </section>
      )}

      {/* Disclaimer */}
      <footer
        style={{
          borderTop: "1px solid #E2E8F0",
          paddingTop: 14,
          marginTop: 8,
          fontSize: "0.75rem",
          color: "#64748B",
          lineHeight: 1.5,
        }}
      >
        <strong style={{ color: "#334155" }}>Clinical Disclaimer:</strong> This document contains a probabilistic,
        educational risk estimate generated by HealthLens AI for disease screening awareness. It is not a medical
        diagnosis and does not replace professional clinical judgment. All model outputs are intended to support,
        not substitute, consultation with a certified physician.
        <div style={{ marginTop: 8 }}>HealthLens AI · Screening threshold 24% · HistGradientBoosting model calibrated on BRFSS data</div>
      </footer>
    </div>
  );
}
