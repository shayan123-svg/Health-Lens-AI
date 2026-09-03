import { apiClient } from "./axios-client";
import type { AssistantContext } from "../types";

export interface ChatHistoryItem {
  role: "user" | "bot" | "assistant";
  text?: string;
  content?: string;
}

export async function askAssistant(
  question: string,
  context?: AssistantContext | null,
  history?: ChatHistoryItem[]
): Promise<{ answer: string }> {
  try {
    const formattedHistory = history?.map((msg) => ({
      role: msg.role === "bot" ? "assistant" : msg.role,
      content: msg.text || msg.content || "",
    }));

    const res = await apiClient.post("/api/v1/assistant/chat", {
      question,
      report_id: context?.analysisId || undefined,
      context: context
        ? {
            analysisMode: context.analysisMode,
            prediction: context.prediction,
            featureContributions: context.featureContributions,
            extractedData: context.extractedData,
          }
        : undefined,
      history: formattedHistory,
    });

    if (res.data?.answer) {
      return { answer: res.data.answer };
    }
  } catch (error) {
    console.warn("[askAssistant] Backend API unavailable, falling back to local response:", error);
  }

  // Graceful fallback if backend is offline
  const topic = question.toLowerCase();

  if (!context) {
    return {
      answer:
        "I can answer general questions about diabetes risk screening, but I could not reach the HealthLens analysis service for your personal results. Upload a medical report or complete an assessment, then ask me again.",
    };
  }

  const factors = context.featureContributions
    .slice(0, 2)
    .map((item) => item.feature)
    .join(" and ");
  const clinical =
    context.analysisMode === "clinical"
      ? " You can also review the extracted health information before discussing it with a healthcare professional."
      : "";
  const answer =
    topic.includes("why") || topic.includes("moderate")
      ? `This ${context.prediction.riskLevel} risk estimate was most influenced by ${factors}. It is an AI model output for educational screening, not a clinical diagnosis.${clinical}`
      : `This analysis estimates a ${context.prediction.probability}% ${context.prediction.condition.toLowerCase()}. ${factors} were among the most influential factors. A healthcare professional can help interpret it alongside your full clinical context.`;

  return { answer };
}
