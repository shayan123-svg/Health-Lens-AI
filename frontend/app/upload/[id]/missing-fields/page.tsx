"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppPage } from "@/components/app-page";
import { useAuth } from "@/lib/auth-context";
import {
  fetchMissingFields,
  submitMissingFields,
  triggerAnalyze,
} from "@/lib/api/reports";
import type { MissingFieldQuestion } from "@/lib/types";
import {
  ClipboardCheck,
  BrainCircuit,
  Loader2,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";

export default function MissingFieldsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: reportId } = use(params);
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [questions, setQuestions] = useState<MissingFieldQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!session?.access_token) {
      router.push("/login");
      return;
    }

    fetchMissingFields(reportId, session.access_token)
      .then((res) => {
        if (res.complete || res.fields.length === 0) {
          triggerAnalyze(reportId, session.access_token).then(() => {
            router.push(`/reports/${reportId}`);
          });
          return;
        }

        setQuestions(res.fields);
        const initAnswers: Record<string, any> = {};
        res.fields.forEach((q) => {
          if (q.type === "boolean") {
            initAnswers[q.field] = 0;
          } else if (q.type === "number") {
            initAnswers[q.field] = q.min ?? 25;
          } else if (q.options && q.options.length > 0) {
            initAnswers[q.field] = q.options[0].value;
          }
        });
        setAnswers(initAnswers);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load questions");
        setLoading(false);
      });
  }, [reportId, session, authLoading, router]);

  const handleChange = (field: string, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.access_token) return;

    setSubmitting(true);
    setError(null);

    try {
      await submitMissingFields(reportId, answers, session.access_token);
      await triggerAnalyze(reportId, session.access_token);
      router.push(`/reports/${reportId}`);
    } catch (err: any) {
      setError(err.message || "Failed to complete analysis");
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <AppPage>
        <section className="card" style={{ maxWidth: 600, margin: "40px auto", textAlign: "center", padding: "40px 24px" }}>
          <Loader2 size={36} className="animate-spin" style={{ color: "var(--blue-primary)", margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "1.35rem", marginBottom: 6 }}>Checking Extracted Biomarkers…</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>
            Validating completeness against the 21-factor epidemiological model.
          </p>
        </section>
      </AppPage>
    );
  }

  if (error && questions.length === 0) {
    return (
      <AppPage>
        <section className="card" style={{ maxWidth: 600, margin: "40px auto", textAlign: "center", padding: "40px 24px" }}>
          <AlertCircle size={36} style={{ color: "var(--risk-high)", margin: "0 auto 16px" }} />
          <h2 style={{ color: "var(--risk-high)", marginBottom: 8 }}>Unable to Load Questionnaire</h2>
          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>{error}</p>
          <Link href="/upload" className="button button-primary">
            Back to Document Upload
          </Link>
        </section>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <div className="app-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <ClipboardCheck size={14} /> Intake Completion
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              {questions.length} Supplemental Indicators Needed
            </span>
          </div>
          <h1 className="page-title">Complete Your Biomarker Profile</h1>
          <p className="page-subtitle">
            Your document was parsed successfully. Please provide the remaining parameters below to enable full ML risk scoring.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ maxWidth: 720, marginTop: 10 }}>
        <section className="card" style={{ padding: 32 }}>
          <div className="card-heading" style={{ marginBottom: 24 }}>
            <h2>Required Indicators ({questions.length} fields)</h2>
            <span className="badge badge-blue">Model Input</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {questions.map((q) => (
              <div key={q.field} className="field">
                <label htmlFor={q.field} style={{ fontWeight: 600, fontSize: "0.92rem" }}>
                  {q.question}
                </label>

                {q.type === "boolean" && (
                  <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                    <button
                      type="button"
                      className={`button ${
                        answers[q.field] === 1 ? "button-primary" : "button-quiet"
                      }`}
                      style={{ flex: 1, padding: "10px 16px" }}
                      onClick={() => handleChange(q.field, 1)}
                    >
                      Yes / Positive
                    </button>
                    <button
                      type="button"
                      className={`button ${
                        answers[q.field] === 0 ? "button-primary" : "button-quiet"
                      }`}
                      style={{ flex: 1, padding: "10px 16px" }}
                      onClick={() => handleChange(q.field, 0)}
                    >
                      No / Normal
                    </button>
                  </div>
                )}

                {q.type === "number" && (
                  <input
                    id={q.field}
                    type="number"
                    min={q.min}
                    max={q.max}
                    value={answers[q.field] ?? ""}
                    onChange={(e) =>
                      handleChange(q.field, parseFloat(e.target.value) || 0)
                    }
                    style={{ marginTop: 6 }}
                  />
                )}

                {q.type === "select" && q.options && (
                  <select
                    id={q.field}
                    value={answers[q.field] ?? ""}
                    onChange={(e) =>
                      handleChange(
                        q.field,
                        isNaN(Number(e.target.value))
                          ? e.target.value
                          : Number(e.target.value)
                      )
                    }
                    style={{ marginTop: 6 }}
                  >
                    {q.options.map((opt) => (
                      <option key={String(opt.value)} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {error && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "var(--risk-high-bg)",
                border: "1px solid var(--risk-high-border)",
                color: "var(--risk-high)",
                padding: "10px 14px",
                borderRadius: 6,
                fontSize: "0.85rem",
                marginTop: 20,
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="button button-primary"
            style={{ marginTop: 28, width: "100%", padding: "12px 20px" }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Evaluating 21 Biomarkers…
              </>
            ) : (
              <>
                <BrainCircuit size={16} /> Complete & Run Clinical Screening
              </>
            )}
          </button>
        </section>
      </form>
    </AppPage>
  );
}
