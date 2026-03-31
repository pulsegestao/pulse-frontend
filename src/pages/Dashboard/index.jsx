import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import C from "../../theme/colors";
import DashboardHeader from "./components/DashboardHeader";
import MetricsCards from "./components/MetricsCards";
import SalesChart from "./components/SalesChart";
import LowStockTable from "./components/LowStockTable";
import TopProducts from "./components/TopProducts";
import InsightPreview from "./components/InsightPreview";
import { isAuthenticated, getProfile } from "../../hooks/useAuth";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import { countUnreadInsights } from "../../services/api";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
};

const formatDate = () => {
  const d = new Date().toLocaleDateString("pt-BR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  return d.charAt(0).toUpperCase() + d.slice(1);
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const firstName = getProfile()?.userName?.split(" ")[0] || "voce";
  const [unreadCount, setUnreadCount] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) navigate("/", { replace: true });
    countUnreadInsights()
      .then(data => setUnreadCount(data.count ?? 0))
      .catch(() => {});
  }, []);

  return (
  <div style={{ minHeight: "100vh", background: C.pageBg }}>
    <DashboardHeader />
      <QuickActionsBar />

    <main style={{
      maxWidth: 1280,
      margin: "0 auto",
      padding: "124px 24px 48px",
    }}>
      {/* Greeting */}
      <div style={{ marginBottom: 28, paddingTop: 8 }}>
        <h1 style={{
          fontSize: 26, fontWeight: 800, color: C.graphite,
          margin: "0 0 4px", letterSpacing: "-0.3px",
        }}>
          {getGreeting()}, {firstName}
        </h1>
        <p style={{ fontSize: 14, color: C.mid, margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
          {formatDate()}
          {unreadCount > 0 && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 10px", borderRadius: 100,
              background: C.bluePale, color: C.blue,
              fontSize: 12, fontWeight: 700,
            }}>
              {unreadCount} {unreadCount === 1 ? "alerta ativo" : "alertas ativos"}
            </span>
          )}
        </p>
      </div>

      {/* Metrics */}
      <MetricsCards />

      {/* Chart + Low Stock */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.55fr 1fr",
        gap: 20,
        marginTop: 20,
      }} className="dash-row-2">
        <SalesChart />
        <LowStockTable />
      </div>

      {/* Top Products + Insights */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20,
        marginTop: 20,
      }} className="dash-row-3">
        <TopProducts />
        <InsightPreview />
      </div>
    </main>

    <style>{`
      @media (max-width: 1024px) {
        .dash-row-2, .dash-row-3 { grid-template-columns: 1fr !important; }
        .metrics-grid { grid-template-columns: repeat(3, 1fr) !important; }
      }
      @media (max-width: 768px) {
        .metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
      }
      @media (max-width: 480px) {
        .metrics-grid { grid-template-columns: 1fr !important; }
      }
    `}</style>
  </div>
  );
};

export default DashboardPage;
