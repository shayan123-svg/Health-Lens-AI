import { AppPage } from "@/components/app-page";
import { HistoryChart } from "@/components/history-chart";
import { Activity } from "lucide-react";

export default function HistoryPage() {
  return (
    <AppPage>
      <div className="app-top">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span className="badge badge-blue">
              <Activity size={14} /> Longitudinal Analytics
            </span>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
              Historical Screening Records
            </span>
          </div>
          <h1 className="page-title">Health History & Risk Trajectory</h1>
          <p className="page-subtitle">
            Track your metabolic risk estimates and lifestyle biomarkers across consecutive health screenings.
          </p>
        </div>
      </div>

      <HistoryChart />
    </AppPage>
  );
}
