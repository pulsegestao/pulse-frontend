import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Activity, CheckCheck, Loader2 } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import InsightsSummary from "./components/InsightsSummary";
import InsightFeed from "./components/InsightFeed";
import VelocityRanking from "./components/VelocityRanking";
import { isAuthenticated } from "../../hooks/useAuth";
import { markAllInsightsRead } from "../../services/api";
import { useToast } from "../../hooks/useToast";

const InsightsPage = () => {
  const navigate  = useNavigate();
  const toast     = useToast();
  const [summaryKey, setSummaryKey] = useState(0);
  const [marking, setMarking]       = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login", { replace: true });
  }, []);

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await markAllInsightsRead();
      setSummaryKey(k => k + 1);
      toast.success("Todos os pulsos foram marcados como lidos.");
    } catch {
      toast.error("Falha ao marcar todos como lidos.");
    } finally {
      setMarking(false);
    }
  };

  const handleInsightRead = () => setSummaryKey(k => k + 1);

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "124px 24px 48px" }}>
        {/* Page header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: C.bluePale,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Activity size={20} color={C.blue} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>
                Sinta o pulso do seu negócio
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
                Pulso
              </h1>
            </div>
          </div>

          <button
            onClick={handleMarkAll}
            disabled={marking}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px",
              borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.surface,
              color: C.mid,
              fontSize: 13, fontWeight: 600,
              cursor: marking ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (!marking) { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; } }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.mid; }}
          >
            {marking
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Marcando...</>
              : <><CheckCheck size={14} strokeWidth={2} /> Marcar todos como lidos</>
            }
          </button>
        </div>

        {/* Summary */}
        <InsightsSummary refreshKey={summaryKey} />

        {/* Main grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.4fr 1fr",
          gap: 20,
          alignItems: "start",
        }} className="insights-grid">
          {/* Feed */}
          <InsightFeed onInsightRead={handleInsightRead} />

          {/* Sidebar */}
          <div>
            <VelocityRanking />
          </div>
        </div>
      </main>

      <style>{`
        @media (max-width: 1024px) {
          .insights-grid { grid-template-columns: 1fr !important; }
          .insights-summary-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          .insights-summary-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default InsightsPage;
