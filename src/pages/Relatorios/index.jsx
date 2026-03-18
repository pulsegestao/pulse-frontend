import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import ProductReport from "./components/ProductReport";
import PaymentMethods from "./components/PaymentMethods";
import DeadStock from "./components/DeadStock";
import PrazoCard from "./components/PrazoCard";
import CategoryBreakdown from "./components/CategoryBreakdown";
import { isAuthenticated } from "../../hooks/useAuth";
import QuickActionsBar from "../../components/layout/QuickActionsBar";

const PERIODS = ["Semana", "Mês", "Ano"];
const PERIOD_KEY = { "Semana": "week", "Mês": "month", "Ano": "year" };

const RelatoriosPage = () => {
  const navigate = useNavigate();
  const [period, setPeriod] = useState("Mês");

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const periodKey = PERIOD_KEY[period];

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh" }}>
      <DashboardHeader />
      <QuickActionsBar />
      <main style={{ padding: "124px 24px 48px", maxWidth: 1100, margin: "0 auto" }}>

        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 28,
          flexWrap: "wrap",
          gap: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1.5px solid ${C.border}`,
                background: C.surface,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <ArrowLeft size={16} color={C.graphite} strokeWidth={2} />
            </button>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 2px" }}>Análise e métricas</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0 }}>Relatórios</p>
            </div>
          </div>

          <div style={{ display: "flex", background: C.gray, borderRadius: 10, padding: 3, gap: 2 }}>
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                style={{
                  padding: "6px 16px", borderRadius: 8, border: "none",
                  background: period === p ? C.surface : "transparent",
                  color: period === p ? C.blue : C.mid,
                  fontSize: 13, fontWeight: period === p ? 700 : 500,
                  cursor: "pointer",
                  boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s", fontFamily: "inherit",
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <ProductReport period={periodKey} />
          <CategoryBreakdown period={periodKey} />
          <PaymentMethods period={periodKey} />
          <DeadStock />
          <PrazoCard />
        </div>

      </main>
    </div>
  );
};

export default RelatoriosPage;
