import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2 } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import SummaryCard from "./components/SummaryCard";
import RevenueChart from "./components/RevenueChart";
import ProductReport from "./components/ProductReport";
import CategoryBreakdown from "./components/CategoryBreakdown";
import PaymentMethods from "./components/PaymentMethods";
import DeadStock from "./components/DeadStock";
import LowStockCard from "./components/LowStockCard";
import PrazoCard from "./components/PrazoCard";
import { isAuthenticated, getProfile } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import {
  getProductReport, getCategoryBreakdown,
  getPaymentMethods, getDeadStock, getPrazoReport, getLowStock,
} from "../../services/api";
import { generateReport, buildSection, reportFileName } from "../../utils/exportPDF";

const PERIODS = ["Semana", "Mês", "Ano"];
const PERIOD_KEY = { "Semana": "week", "Mês": "month", "Ano": "year" };

const RelatoriosPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [period, setPeriod] = useState("Mês");
  const [exporting, setExporting] = useState(false);

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const periodKey = PERIOD_KEY[period];
  const companyName = getProfile()?.companyName || "";

  const handleExportFull = async () => {
    setExporting(true);
    try {
      const [products, categories, payments, deadStock, prazo, lowStock] = await Promise.all([
        getProductReport(periodKey).catch(() => []),
        getCategoryBreakdown(periodKey).catch(() => []),
        getPaymentMethods(periodKey).catch(() => []),
        getDeadStock().catch(() => []),
        getPrazoReport().catch(() => ({})),
        getLowStock().catch(() => []),
      ]);
      generateReport(companyName, periodKey, [
        buildSection.products(products),
        buildSection.categories(categories),
        buildSection.payments(payments),
        buildSection.deadStock(deadStock),
        buildSection.lowStock(lowStock),
        buildSection.prazo(prazo),
      ], reportFileName("relatorio", periodKey));
      toast.success("PDF exportado com sucesso.");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setExporting(false);
    }
  };

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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            <button
              onClick={handleExportFull}
              disabled={exporting}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "8px 16px", borderRadius: 10,
                border: `1.5px solid ${C.blue}`,
                background: C.blue, color: "white",
                fontSize: 13, fontWeight: 700,
                cursor: exporting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: exporting ? 0.7 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {exporting
                ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Gerando...</>
                : <><Download size={14} strokeWidth={2.5} /> Exportar PDF</>
              }
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <SummaryCard period={periodKey} />
          <RevenueChart period={periodKey} companyName={companyName} />
          <ProductReport period={periodKey} companyName={companyName} />
          <CategoryBreakdown period={periodKey} companyName={companyName} />
          <PaymentMethods period={periodKey} companyName={companyName} />
          <LowStockCard companyName={companyName} />
          <DeadStock companyName={companyName} />
          <PrazoCard companyName={companyName} />
        </div>

      </main>
    </div>
  );
};

export default RelatoriosPage;
