"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { AppPage } from "@/components/app-page";
import { ReportExportDocument } from "@/components/report-export";
import { useAuth } from "@/lib/auth-context";
import {
  backendReportToAnalysisResult,
  fetchReportById,
} from "@/lib/api/reports";
import type { AnalysisResult } from "@/lib/types";

export default function ReportExportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user, session, loading: authLoading } = useAuth();
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
        setResult(backendReportToAnalysisResult(report));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load report");
        setLoading(false);
      });
  }, [id, session, authLoading]);

  // Friendly default file name for "Save as PDF".
  useEffect(() => {
    if (!result) return;
    const previous = document.title;
    const safeName = result.reportName.replace(/[^a-z0-9]+/gi, "-");
    document.title = `HealthLens-Report-${safeName}-${result.id.slice(0, 8)}`;
    return () => {
      document.title = previous;
    };
  }, [result]);

  const patientName =
    (user?.user_metadata?.full_name as string) ||
    user?.email?.split("@")[0] ||
    null;

  if (loading || authLoading) {
    return (
      <AppPage>
        <section className="card" style={{ maxWidth: 600, margin: "40px auto" }}>
          <h2>Preparing your report…</h2>
          <p className="report-meta">Building the doctor-friendly summary.</p>
        </section>
      </AppPage>
    );
  }

  if (error || !result) {
    return (
      <AppPage>
        <section className="card" style={{ maxWidth: 600, margin: "30px auto" }}>
          <h2>Report not found</h2>
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
      <div
        className="no-print"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link href={`/reports/${result.id}`} className="text-link">
          <ArrowLeft size={16} /> Back to full analysis
        </Link>
        <button className="button button-primary" onClick={() => window.print()}>
          <Printer size={16} /> Print / Save as PDF
        </button>
      </div>

      <div className="print-area">
        <ReportExportDocument result={result} patientName={patientName} />
      </div>
    </AppPage>
  );
}
