"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UploadCloud,
  FileText,
  BrainCircuit,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Activity,
  HeartPulse,
  Sparkles,
  ShieldCheck,
  Send,
  Loader2,
} from "lucide-react";
import { askAssistant } from "@/lib/api/assistant";
import {
  backendReportToAnalysisResult,
  createTextReport,
  fetchReportById,
  fetchUserReports,
  triggerAnalyze,
} from "@/lib/api/reports";
import type { AssistantContext } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";
import { apiClient } from "@/lib/api/axios-client";
import { FormattedMessage } from "./formatted-message";

const numericField = (message: string) =>
  z
    .string()
    .refine((value) => Number.isFinite(Number(value)) && Number(value) > 0, message);

const schema = z.object({
  age: z
    .string()
    .refine(
      (value) =>
        Number.isFinite(Number(value)) && Number(value) >= 18 && Number(value) <= 120,
      "Enter a valid age — this screening is for adults (18+)"
    ),
  sex: z.string().min(1, "Choose biological sex"),
  height: numericField("Enter height in cm"),
  weight: numericField("Enter weight in kg"),
  glucose: numericField("Enter fasting glucose (mg/dL)"),
  pressure: z.string().min(3, "Enter blood pressure (e.g. 120/80)"),
  cholesterol: numericField("Enter total cholesterol (mg/dL)"),
  heartRate: numericField("Enter resting heart rate (bpm)"),
  smoking: z.string().min(1, "Select smoking status"),
  activity: z.string().min(1, "Select activity level"),
});

type FormData = z.infer<typeof schema>;

function ageToCategory(ageYears: number): number {
  if (ageYears <= 24) return 1;
  if (ageYears <= 29) return 2;
  if (ageYears <= 34) return 3;
  if (ageYears <= 39) return 4;
  if (ageYears <= 44) return 5;
  if (ageYears <= 49) return 6;
  if (ageYears <= 54) return 7;
  if (ageYears <= 59) return 8;
  if (ageYears <= 64) return 9;
  if (ageYears <= 69) return 10;
  if (ageYears <= 74) return 11;
  if (ageYears <= 79) return 12;
  return 13;
}

// Phrases intentionally match the backend's rule-based extraction patterns
// so the manual intake flows through the same pipeline as uploaded reports.
function buildIntakeText(values: FormData): string {
  const ageYears = Number(values.age);
  const height = Number(values.height);
  const weight = Number(values.weight);
  const bmi = weight / (height / 100) ** 2;

  const [systolic, diastolic] = values.pressure.split("/").map((part) => Number(part.trim()));
  const highBloodPressure = systolic >= 140 || diastolic >= 90;

  const cholesterol = Number(values.cholesterol);
  const highCholesterol = cholesterol >= 240;

  const lines = [
    "Patient-submitted intake assessment for diabetes risk screening.",
    `Age category: ${ageToCategory(ageYears)} (${ageYears} years old)`,
    values.sex === "Male" ? "Sex: 1" : values.sex === "Female" ? "Sex: 0" : "",
    `BMI: ${bmi.toFixed(1)} (height ${height} cm, weight ${weight} kg)`,
    highBloodPressure
      ? `Patient reports high blood pressure (reading ${values.pressure}).`
      : `No high blood pressure reported (reading ${values.pressure}).`,
    highCholesterol
      ? `Patient reports high cholesterol (total cholesterol ${cholesterol} mg/dL).`
      : `No high cholesterol reported (total cholesterol ${cholesterol} mg/dL).`,
    values.smoking === "Yes" ? "Current smoker." : "Non-smoker.",
    values.activity === "Low" ? "Physical activity: no" : "Physical activity: yes",
    `Fasting blood glucose: ${values.glucose} mg/dL.`,
    `Resting heart rate: ${values.heartRate} bpm.`,
  ];

  return lines.filter(Boolean).join("\n");
}

export function NewAnalysisForm() {
  const router = useRouter();
  const { session } = useAuth();
  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: "28",
      sex: "Male",
      height: "175",
      weight: "82",
      glucose: "105",
      pressure: "120/80",
      cholesterol: "176",
      heartRate: "72",
      smoking: "No",
      activity: "Moderate",
    },
  });

  const formValues = watch();
  const height = Number(formValues.height);
  const weight = Number(formValues.weight);
  const bmi =
    height && weight ? (weight / ((height / 100) ** 2)).toFixed(1) : "—";

  const nextStep = async () => {
    let valid = false;
    if (step === 1) valid = await trigger(["age", "sex", "height", "weight"]);
    if (step === 2) valid = await trigger(["glucose", "pressure", "cholesterol", "heartRate"]);
    if (step === 3) valid = await trigger(["smoking", "activity"]);
    if (valid) setStep((s) => s + 1);
  };

  const prevStep = () => setStep((s) => Math.max(1, s - 1));

  const onSubmit = async () => {
    setSubmitError(null);

    if (!session?.access_token) {
      setSubmitError("Please sign in to run a screening analysis.");
      return;
    }

    setProcessing(true);

    try {
      const rawText = buildIntakeText(formValues);
      const created = await createTextReport(
        rawText,
        "Manual Intake Assessment",
        session.access_token
      );

      if (!created.complete) {
        router.push(`/upload/${created.report_id}/missing-fields`);
        return;
      }

      await triggerAnalyze(created.report_id, session.access_token);
      router.push(`/reports/${created.report_id}`);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to run the screening analysis. Please try again.");
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 4-Step Medical Stepper Header */}
      <div className="stepper-header">
        <div
          className={`step-node ${step === 1 ? "active" : step > 1 ? "completed" : ""}`}
          onClick={() => setStep(1)}
        >
          <div className="step-node-num">{step > 1 ? "✓" : "1"}</div>
          <span className="step-node-label">Biometrics</span>
        </div>

        <div
          className={`step-node ${step === 2 ? "active" : step > 2 ? "completed" : ""}`}
          onClick={() => step > 2 && setStep(2)}
        >
          <div className="step-node-num">{step > 2 ? "✓" : "2"}</div>
          <span className="step-node-label">Vitals & Labs</span>
        </div>

        <div
          className={`step-node ${step === 3 ? "active" : step > 3 ? "completed" : ""}`}
          onClick={() => step > 3 && setStep(3)}
        >
          <div className="step-node-num">{step > 3 ? "✓" : "3"}</div>
          <span className="step-node-label">Lifestyle</span>
        </div>

        <div
          className={`step-node ${step === 4 ? "active" : ""}`}
          onClick={() => step === 4 && setStep(4)}
        >
          <div className="step-node-num">4</div>
          <span className="step-node-label">Review</span>
        </div>
      </div>

      {/* Step 1: Patient Biometrics */}
      {step === 1 && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Step 1: Patient Biometrics</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Basic demographic and physical measurements
              </p>
            </div>
            <span className="badge badge-blue">Intake Form</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="age">Age (Years)</label>
              <input id="age" type="number" placeholder="e.g. 35" {...register("age")} />
              {errors.age && <span className="form-error">{errors.age.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="sex">Biological Sex</label>
              <select id="sex" {...register("sex")}>
                <option value="">Select Option</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.sex && <span className="form-error">{errors.sex.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="height">Height (cm)</label>
              <input id="height" type="number" placeholder="e.g. 175" {...register("height")} />
              {errors.height && <span className="form-error">{errors.height.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="weight">Weight (kg)</label>
              <input id="weight" type="number" placeholder="e.g. 78" {...register("weight")} />
              {errors.weight && <span className="form-error">{errors.weight.message}</span>}
            </div>
          </div>

          <div
            style={{
              background: "var(--blue-soft)",
              border: "1px solid var(--blue-border)",
              borderRadius: 8,
              padding: "14px 16px",
              marginTop: 18,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "0.9rem", color: "var(--blue-dark)" }}>Calculated BMI:</strong>{" "}
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary)" }}>{bmi}</span>
            </div>
            <span className="badge badge-blue">Model Indicator</span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
            <button type="button" onClick={nextStep} className="button button-primary">
              Continue to Vitals <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Step 2: Vitals & Labs */}
      {step === 2 && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Step 2: Vitals & Laboratory Panels</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Recent clinic blood pressure or routine fasting blood measurements
              </p>
            </div>
            <span className="badge badge-blue">Clinical Markers</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="pressure">Resting Blood Pressure (Systolic / Diastolic)</label>
              <input id="pressure" type="text" placeholder="e.g. 120/80" {...register("pressure")} />
              {errors.pressure && <span className="form-error">{errors.pressure.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="glucose">Fasting Blood Glucose (mg/dL)</label>
              <input id="glucose" type="number" placeholder="e.g. 98" {...register("glucose")} />
              {errors.glucose && <span className="form-error">{errors.glucose.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="cholesterol">Total Cholesterol (mg/dL)</label>
              <input id="cholesterol" type="number" placeholder="e.g. 185" {...register("cholesterol")} />
              {errors.cholesterol && <span className="form-error">{errors.cholesterol.message}</span>}
            </div>

            <div className="field">
              <label htmlFor="heartRate">Resting Heart Rate (bpm)</label>
              <input id="heartRate" type="number" placeholder="e.g. 72" {...register("heartRate")} />
              {errors.heartRate && <span className="form-error">{errors.heartRate.message}</span>}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button type="button" onClick={prevStep} className="button button-quiet">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" onClick={nextStep} className="button button-primary">
              Continue to Lifestyle <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Step 3: Lifestyle Context */}
      {step === 3 && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Step 3: Lifestyle & Preventive Context</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Behavioral factors influencing long-term metabolic health
              </p>
            </div>
            <span className="badge badge-blue">Behavioral Factors</span>
          </div>

          <div className="form-grid">
            <div className="field">
              <label htmlFor="smoking">Smoking Status</label>
              <select id="smoking" {...register("smoking")}>
                <option value="No">No / Non-smoker</option>
                <option value="Yes">Yes / Current smoker</option>
                <option value="Former smoker">Former smoker</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="activity">Physical Activity Level</label>
              <select id="activity" {...register("activity")}>
                <option value="Low">Low (Sedentary)</option>
                <option value="Moderate">Moderate (1-3 days/week)</option>
                <option value="High">High (4+ days/week)</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
            <button type="button" onClick={prevStep} className="button button-quiet">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" onClick={nextStep} className="button button-primary">
              Review & Submit <ArrowRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Step 4: Review & Run Screening */}
      {step === 4 && (
        <section className="card">
          <div className="card-heading">
            <div>
              <h2>Step 4: Clinical Review & Confirmation</h2>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: 0 }}>
                Verify your entered indicators before ML model evaluation
              </p>
            </div>
            <span className="badge badge-blue">Ready for Analysis</span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12,
              background: "var(--bg-subtle)",
              padding: 18,
              borderRadius: 10,
              marginBottom: 20,
            }}
          >
            <div><strong>Age:</strong> {formValues.age} yrs</div>
            <div><strong>Sex:</strong> {formValues.sex}</div>
            <div><strong>Height / Weight:</strong> {formValues.height} cm / {formValues.weight} kg</div>
            <div><strong>Calculated BMI:</strong> {bmi}</div>
            <div><strong>Blood Pressure:</strong> {formValues.pressure}</div>
            <div><strong>Fasting Glucose:</strong> {formValues.glucose} mg/dL</div>
            <div><strong>Total Cholesterol:</strong> {formValues.cholesterol} mg/dL</div>
            <div><strong>Resting Heart Rate:</strong> {formValues.heartRate} bpm</div>
            <div><strong>Smoking Status:</strong> {formValues.smoking}</div>
            <div><strong>Physical Activity:</strong> {formValues.activity}</div>
          </div>

          <div className="disclaimer" style={{ marginBottom: 20 }}>
            <strong>Notice:</strong> Submitting this intake will execute the HealthLens 21-biomarker ML risk classifier.
            Results are provided for preventive awareness and educational guidance.
          </div>

          {submitError && (
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
                marginBottom: 16,
              }}
            >
              <AlertCircle size={16} />
              <span>{submitError}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button type="button" onClick={prevStep} className="button button-quiet" disabled={processing}>
              <ArrowLeft size={16} /> Edit Data
            </button>
            <button type="submit" className="button button-primary" disabled={processing}>
              {processing ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Evaluating with HealthLens ML…
                </>
              ) : (
                <>
                  <Activity size={16} /> Run Clinical Screening Analysis
                </>
              )}
            </button>
          </div>
        </section>
      )}
    </form>
  );
}

export function UploadPanel() {
  const router = useRouter();
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [step, setStep] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  const pipelineSteps = [
    "Uploading clinical document…",
    "Parsing medical text structure…",
    "Extracting 21 epidemiological biomarkers…",
    "Checking feature completeness…",
    "Executing HealthLens ML Risk Classifier…",
    "Generating physician-ready insights…",
  ];

  async function runPipeline(chosen: File) {
    setFile(chosen);
    setError(null);

    if (!session?.access_token) {
      setError("Please sign in to upload and analyze clinical medical documents.");
      return;
    }

    try {
      setStep(0);
      const formData = new FormData();
      formData.append("file", chosen);

      const uploadRes = await apiClient.post("/api/v1/reports/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const currentReportId = uploadRes.data.report_id;

      setStep(1);
      await new Promise((r) => setTimeout(r, 350));
      setStep(2);

      const extractRes = await apiClient.post(`/api/v1/reports/${currentReportId}/extract`);
      const extractData = extractRes.data;
      setStep(3);

      await new Promise((r) => setTimeout(r, 300));

      if (!extractData.complete) {
        setStep(4);
        await new Promise((r) => setTimeout(r, 400));
        router.push(`/upload/${currentReportId}/missing-fields`);
        return;
      }

      setStep(4);
      await apiClient.post(`/api/v1/reports/${currentReportId}/analyze`);

      setStep(5);
      await new Promise((r) => setTimeout(r, 450));
      router.push(`/reports/${currentReportId}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during medical report parsing.");
      setStep(-1);
    }
  }

  if (error) {
    return (
      <section className="card" style={{ textAlign: "center", padding: "36px 24px" }}>
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--risk-high-bg)",
            color: "var(--risk-high)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertCircle size={28} />
        </div>
        <h2 style={{ color: "var(--risk-high)", marginBottom: 8 }}>Upload Processing Issue</h2>
        <p style={{ color: "var(--text-secondary)", maxWidth: 460, margin: "0 auto 20px" }}>{error}</p>
        <button
          className="button button-primary"
          onClick={() => {
            setFile(null);
            setError(null);
            setStep(-1);
          }}
        >
          Try Again
        </button>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
        <ShieldCheck size={44} style={{ color: "var(--blue-primary)", margin: "0 auto 16px" }} />
        <h2 style={{ marginBottom: 8 }}>Secure Clinical Document Upload</h2>
        <p style={{ maxWidth: 440, margin: "0 auto 24px", color: "var(--text-muted)", fontSize: "0.92rem" }}>
          Please sign in to your patient account to upload laboratory reports, extract biomarkers, and view historical analyses.
        </p>
        <button className="button button-primary" onClick={() => router.push("/login")}>
          Sign in to Patient Portal
        </button>
      </section>
    );
  }

  const isImageFile = (filename: string) =>
    /\.(png|jpe?g|webp)$/i.test(filename);

  if (!file) {
    return (
      <label className="drop-zone">
        <input
          hidden
          type="file"
          accept=".docx,.pdf,.png,.jpg,.jpeg,.webp"
          onChange={(e) => {
            const chosen = e.target.files?.[0];
            if (chosen) runPipeline(chosen);
          }}
        />
        <div className="upload-icon-circle">
          <UploadCloud size={28} />
        </div>
        <h2 style={{ fontSize: "1.35rem", marginBottom: 6 }}>Upload Clinical Lab Document or Scan</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: 20 }}>
          Drag and drop your report or click to browse files
        </p>
        <span className="button button-primary">Select Medical File</span>
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap", justifyContent: "center" }}>
          <span className="badge badge-blue">PDF</span>
          <span className="badge badge-blue">DOCX</span>
          <span className="badge badge-blue">PNG / JPG</span>
          <span className="badge badge-blue">Up to 10 MB</span>
        </div>
      </label>
    );
  }

  return (
    <section className="card">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 8,
            background: "var(--blue-light)",
            color: "var(--blue-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isImageFile(file.name) ? <Activity size={22} /> : <FileText size={22} />}
        </div>
        <div>
          <h2 style={{ fontSize: "1.15rem", margin: 0 }}>{file.name}</h2>
          <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
            {isImageFile(file.name)
              ? "Clinical Multimodal Vision Pipeline Active"
              : "Clinical AI Document Pipeline Active"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pipelineSteps.map((label, index) => {
          const isDone = index < step;
          const isCurrent = index === step;
          return (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderRadius: 8,
                background: isCurrent ? "var(--blue-soft)" : isDone ? "#F0FDF4" : "var(--bg-subtle)",
                border: `1px solid ${isCurrent ? "var(--blue-border)" : isDone ? "var(--risk-low-border)" : "var(--border-color)"}`,
              }}
            >
              {isDone ? (
                <CheckCircle2 size={18} style={{ color: "var(--risk-low)", flexShrink: 0 }} />
              ) : isCurrent ? (
                <Loader2 size={18} className="animate-spin" style={{ color: "var(--blue-primary)", flexShrink: 0 }} />
              ) : (
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid var(--border-medium)" }} />
              )}
              <span
                style={{
                  fontSize: "0.88rem",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? "var(--blue-dark)" : isDone ? "var(--risk-low-text)" : "var(--text-muted)",
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

async function loadLatestAnalysisContext(
  token: string
): Promise<AssistantContext | null> {
  const reports = await fetchUserReports(token);
  const latest = reports.find(
    (r) => r.status === "analysis_completed" || r.status === "completed"
  );
  if (!latest) return null;

  const report = await fetchReportById(latest.id, token);
  const result = backendReportToAnalysisResult(report);

  return {
    analysisId: result.id,
    analysisMode: result.analysisMode,
    prediction: result.prediction,
    featureContributions: result.featureContributions,
    extractedData: result.extractedData,
  };
}

export function ChatInterface() {
  const { session, loading: authLoading } = useAuth();
  const [context, setContext] = useState<AssistantContext | null>(null);
  const contextLoaded = useRef(false);

  const [messages, setMessages] = useState<Array<{ role: "user" | "bot"; text: string }>>([
    {
      role: "bot",
      text: "Hello! I am your HealthLens Clinical AI Assistant. I can explain your metabolic risk indicators, model prediction weights, and suggest specific questions to discuss with your doctor.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);

  useEffect(() => {
    if (authLoading || !session?.access_token || contextLoaded.current) return;
    contextLoaded.current = true;
    loadLatestAnalysisContext(session.access_token)
      .then(setContext)
      .catch(() => {});
  }, [authLoading, session]);

  const send = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!input.trim() || thinking) return;

    const question = input.trim();
    const newMessages = [...messages, { role: "user" as const, text: question }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);

    try {
      const response = await askAssistant(question, context, newMessages);
      setMessages((current) => [...current, { role: "bot", text: response.answer }]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "bot",
          text: "I apologize, but I encountered an issue processing your question. Please try asking again in a moment.",
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  const promptSuggestions = [
    "What does my diabetes risk estimate mean?",
    "Which lifestyle factors are influencing my risk most?",
    "What specific questions should I ask my doctor?",
    "How can I improve my metabolic health score?",
  ];

  return (
    <>
      <section className="chat">
        <div className="messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={index}>
              {message.role === "bot" ? (
                <FormattedMessage content={message.text || ""} />
              ) : (
                message.text
              )}
            </div>
          ))}
          {thinking && (
            <div className="message bot" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={16} className="animate-spin" style={{ color: "var(--blue-primary)" }} />
              <span>Analyzing screening context with HealthLens AI…</span>
            </div>
          )}
        </div>

        <form className="chat-form" onSubmit={send}>
          <input
            id="question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your risk factors, lab markers, or doctor questions..."
            disabled={thinking}
          />
          <button className="button button-primary" disabled={thinking || !input.trim()}>
            <Send size={16} /> Send
          </button>
        </form>
      </section>

      <div className="suggestions">
        {promptSuggestions.map((prompt) => (
          <button className="suggestion" onClick={() => setInput(prompt)} key={prompt} type="button">
            {prompt}
          </button>
        ))}
      </div>

      <div className="disclaimer" style={{ marginTop: 18 }}>
        <strong>Medical Disclaimer:</strong> HealthLens AI provides educational screening insights based on
        provided health indicators and does not replace formal clinical diagnosis, individualized prescription,
        or emergency medical services.
      </div>
    </>
  );
}

export function PricingCards() {
  const [yearly, setYearly] = useState(false);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
        <div
          style={{
            background: "#FFFFFF",
            border: "1px solid var(--border-color)",
            padding: 4,
            borderRadius: 10,
            display: "inline-flex",
            gap: 4,
          }}
        >
          <button
            onClick={() => setYearly(false)}
            className={`button ${!yearly ? "button-primary" : "button-quiet"}`}
            style={{ padding: "8px 18px", fontSize: "0.85rem", border: "none" }}
          >
            Monthly Billing
          </button>
          <button
            onClick={() => setYearly(true)}
            className={`button ${yearly ? "button-primary" : "button-quiet"}`}
            style={{ padding: "8px 18px", fontSize: "0.85rem", border: "none" }}
          >
            Annual Billing · Save 20%
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 24,
          maxWidth: 880,
          margin: "0 auto",
        }}
      >
        {/* Free Plan */}
        <section className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 32 }}>
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 12 }}>Standard Intake</span>
            <h2 style={{ fontSize: "1.6rem", marginBottom: 8 }}>Patient Free</h2>
            <div style={{ fontSize: "2.4rem", fontWeight: 800, margin: "16px 0 8px", color: "var(--text-primary)" }}>
              $0
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 24 }}>
              Basic metabolic health screenings and educational summaries.
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 0, listStyle: "none", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--risk-low)" }} /> Standard 21-indicator ML model
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--risk-low)" }} /> Clinical intake questionnaire
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--risk-low)" }} /> Basic AI Assistant interactions
              </li>
            </ul>
          </div>
          <button className="button button-quiet" style={{ width: "100%", marginTop: 28 }}>
            Get Started Free
          </button>
        </section>

        {/* Pro Plan */}
        <section
          className="card"
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 32,
            border: "2px solid var(--blue-primary)",
            position: "relative",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 12 }}>Physician-Ready</span>
            <h2 style={{ fontSize: "1.6rem", marginBottom: 8 }}>Clinical Pro</h2>
            <div style={{ fontSize: "2.4rem", fontWeight: 800, margin: "16px 0 8px", color: "var(--blue-primary)" }}>
              ${yearly ? "79" : "7.99"}
              <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "var(--text-muted)" }}>
                {yearly ? " / year" : " / month"}
              </span>
            </div>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: 24 }}>
              Comprehensive document parsing and longitudinal biomarker tracking.
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, paddingLeft: 0, listStyle: "none", fontSize: "0.88rem", color: "var(--text-secondary)" }}>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--blue-primary)" }} /> Unlimited PDF & DOCX Lab Uploads
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--blue-primary)" }} /> Full Longitudinal Trend Tracking
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--blue-primary)" }} /> Exportable Doctor Discussion PDF Reports
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={16} style={{ color: "var(--blue-primary)" }} /> Priority LLM Health Assistant Access
              </li>
            </ul>
          </div>
          <button className="button button-primary" style={{ width: "100%", marginTop: 28 }}>
            Start Clinical Pro Plan
          </button>
        </section>
      </div>
    </>
  );
}
