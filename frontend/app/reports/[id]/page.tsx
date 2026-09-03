"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AppPage } from "@/components/app-page";
import { AnalysisResultView } from "@/components/analysis-result";
import { useAuth } from "@/lib/auth-context";
import {
  backendReportToAnalysisResult,
  fetchReportById,
} from "@/lib/api/reports";
import type { AnalysisResult } from "@/lib/types";

export default function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { session, loading: authLoading } = useAuth();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!session?.access_token) {
      setError("Please sign in to view this report.");
      setLoading(false);
      return;
    }

    fetchReportById(id, session.access_token)
      .then((report) => {
        const transformed = backendReportToAnalysisResult(report);
        setResult(transformed);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load report");
        setLoading(false);
      });
  }, [id, session, authLoading]);

  if (loading || authLoading) {
    return (
      <AppPage>
        <section className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
          <h2>Loading analysis report…</h2>
          <p className="report-meta">Fetching ML predictions and screening results.</p>
        </section>
      </AppPage>
    );
  }

  if (error || !result) {
    return (
      <AppPage>
        <Link href="/reports" className="text-link">
          ← All reports
        </Link>
        <section
          className="card"
          style={{ maxWidth: 600, margin: "30px 0" }}
        >
          <h2 style={{ color: "var(--color-danger, #e05)" }}>Report not found</h2>
          <p>{error || "We couldn't retrieve this analysis report."}</p>
          <Link href="/reports" className="button button-primary" style={{ marginTop: 14 }}>
            Go to your reports
          </Link>
        </section>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <Link href="/reports" className="text-link">
        ← All reports
      </Link>
      <div style={{ marginTop: 22 }}>
        <AnalysisResultView result={result} />
      </div>
    </AppPage>
  );
}
