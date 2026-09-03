"use client";

import { useEffect, useState } from "react";
import type { AnalysisMode, Report } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { fetchUserReports } from "@/lib/api/reports";
import { Activity, Calendar, HeartPulse, Filter } from "lucide-react";

interface HistoryEntry {
  id?: string;
  date: string;
  risk: number;
  analysisMode: AnalysisMode;
}

export function HistoryChart() {
  const { session, loading: authLoading } = useAuth();
  const [filter, setFilter] = useState<AnalysisMode | "all">("all");
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.access_token) {
      setEntries([]);
      setLoading(false);
      return;
    }

    fetchUserReports(session.access_token)
      .then((reports: Report[]) => {
        const completed = reports
          .filter(
            (r) =>
              (r.status === "analysis_completed" || r.status === "completed") &&
              r.riskPercentage !== undefined
          )
          .map((r) => ({
            id: r.id,
            date: r.date,
            risk: Math.round(r.riskPercentage!),
            analysisMode: r.analysisMode,
          }))
          .reverse();

        setEntries(completed);
      })
      .catch(() => {
        setEntries([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [session, authLoading]);

  const filteredEntries = entries.filter(
    (item) => filter === "all" || item.analysisMode === filter
  );

  const getBarColor = (risk: number) => {
    if (risk > 40) return "var(--risk-high)";
    if (risk > 20) return "var(--risk-mod)";
    return "var(--risk-low)";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", gap: 6, background: "var(--bg-subtle)", padding: 4, borderRadius: 8 }}>
          {(["all", "lifestyle", "clinical"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`button ${filter === mode ? "button-primary" : "button-quiet"}`}
              style={{
                padding: "6px 14px",
                fontSize: "0.82rem",
                border: "none",
                borderRadius: 6,
                minHeight: 32,
              }}
            >
              {mode === "all"
                ? "All Screenings"
                : mode === "lifestyle"
                ? "Lifestyle Intakes"
                : "Clinical Lab Panels"}
            </button>
          ))}
        </div>

        <span className="badge badge-blue">Live Patient History</span>
      </div>

      {loading ? (
        <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
          Loading longitudinal health trajectory…
        </div>
      ) : filteredEntries.length === 0 ? (
        <div
          style={{
            background: "var(--bg-subtle)",
            border: "1px solid var(--border-color)",
            borderRadius: 10,
            padding: "32px 20px",
            textAlign: "center",
          }}
        >
          <Activity size={32} style={{ color: "var(--text-subtle)", margin: "0 auto 10px" }} />
          <h3 style={{ fontSize: "1.05rem", marginBottom: 6 }}>No screening records for this filter</h3>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
            Select &ldquo;All Screenings&rdquo; or complete a new assessment to log data.
          </p>
        </div>
      ) : (
        <section
          className="card"
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h3 style={{ fontSize: "1.05rem", margin: 0 }}>Metabolic Risk Trajectory (%)</h3>
              <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: 0 }}>
                Historical probability estimates across recorded screenings
              </p>
            </div>
            <div style={{ display: "flex", gap: 14, fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--risk-low)" }} /> Low (&lt;20%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--risk-mod)" }} /> Moderate (20-40%)
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--risk-high)" }} /> High (&gt;40%)
              </span>
            </div>
          </div>

          <div
            style={{
              height: 240,
              display: "flex",
              alignItems: "flex-end",
              gap: 20,
              borderBottom: "1px solid var(--border-color)",
              paddingBottom: 16,
              paddingTop: 20,
            }}
          >
            {filteredEntries.map((item, idx) => {
              const barHeight = Math.max(28, Math.min(item.risk * 2.1, 180));
              const barColor = getBarColor(item.risk);
              return (
                <div
                  key={item.id ?? idx}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <strong style={{ fontSize: "0.88rem", color: "var(--text-primary)" }}>
                    {item.risk}%
                  </strong>
                  <div
                    style={{
                      width: "100%",
                      maxWidth: 48,
                      height: barHeight,
                      background: barColor,
                      borderRadius: "6px 6px 0 0",
                      transition: "height 0.3s ease",
                    }}
                  />
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)" }}>
                      {item.date}
                    </div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "capitalize" }}>
                      {item.analysisMode}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
