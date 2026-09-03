import { AppPage } from "@/components/app-page";
import { ChatInterface } from "@/components/interactive-pages";
import { BrainCircuit } from "lucide-react";

export default function AssistantPage() {
  return (
    <AppPage>
      <div className="app-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <BrainCircuit size={14} /> Grounded AI
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Context-Aware Medical Intelligence
            </span>
          </div>
          <h1 className="page-title">AI Health Assistant</h1>
          <p className="page-subtitle">
            Ask questions regarding your metabolic risk factors, model probability weights, and doctor discussion guides.
          </p>
        </div>
      </div>

      <ChatInterface />
    </AppPage>
  );
}
