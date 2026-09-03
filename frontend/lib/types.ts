export type RiskLevel = "low" | "moderate" | "high" | "very high";
export type AnalysisMode = "lifestyle" | "clinical";

export interface RiskPrediction {
  condition: string;
  probability: number;
  riskLevel: RiskLevel;
  confidence?: number;
}

export interface FeatureContribution {
  feature: string;
  value?: string | number;
  impact: "positive" | "negative" | "neutral";
  importance: number;
  explanation?: string;
}

export interface DataQualityIssue {
  field?: string;
  severity: "info" | "warning" | "error";
  message: string;
}

export type ExtractedHealthData = Record<string, string | number | boolean | null>;

export interface AnalysisSummary {
  headline: string;
  overview: string;
  keyFindings: string[];
  discussionPoints: string[];
}

export interface AnalysisResult {
  id: string;
  analysisMode: AnalysisMode;
  status: "completed" | "processing" | "failed";
  prediction: RiskPrediction;
  featureContributions: FeatureContribution[];
  dataQuality: { score: number; issues: DataQualityIssue[] };
  extractedData?: ExtractedHealthData;
  summary: AnalysisSummary;
  aiReport?: string;
  createdAt: string;
  reportName: string;
  modelInfo?: { name: string; version: string };
}

export interface Review {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  title?: string;
  review: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface ReviewSubmission {
  rating: number;
  title?: string;
  review: string;
  userName?: string;
}

export interface AssistantContext {
  analysisId: string;
  analysisMode: AnalysisMode;
  prediction: RiskPrediction;
  featureContributions: FeatureContribution[];
  extractedData?: ExtractedHealthData;
}

export interface Report {
  id: string;
  name: string;
  date: string;
  analysisMode: AnalysisMode;
  status: "completed" | "processing" | "failed" | string;
  riskLevel: RiskLevel;
  riskPercentage?: number;
}

export interface BackendFeatureContribution {
  feature: string;
  display_name: string;
  value: number | boolean | string;
  /** Signed probability shift vs. the feature's neutral baseline. */
  risk_impact: number;
  direction: "increases_risk" | "decreases_risk";
}

export interface BackendPrediction {
  risk_probability: number;
  risk_percentage: number;
  screening_threshold: number;
  screening_positive: boolean;
  risk_category: string;
  model_version: string;
  summary?: AnalysisSummary | string;
  ai_summary?: AnalysisSummary | string;
  feature_contributions?: BackendFeatureContribution[];
}

export interface BackendReport {
  report_id: string;
  filename: string;
  stored_filename?: string;
  file_type: string;
  status: string;
  extracted_features?: Record<string, any>;
  user_features?: Record<string, any>;
  final_features?: Record<string, any>;
  prediction?: BackendPrediction;
  summary?: AnalysisSummary | string;
  model_version?: string;
  created_at: string;
  updated_at?: string;
  user_id?: string;
}

export interface MissingFieldQuestion {
  field: string;
  question: string;
  type: "boolean" | "number" | "select";
  min?: number;
  max?: number;
  options?: Array<{ label: string; value: number | string }>;
}

export interface MissingFieldsResponse {
  report_id: string;
  complete: boolean;
  missing_count: number;
  fields: MissingFieldQuestion[];
}
