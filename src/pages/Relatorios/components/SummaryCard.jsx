import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getReportSummary } from "../../../services/api";
import WidgetError from "../../../components/WidgetError";

const fmt = (n) =>
  (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const fmtPct = (n) => `${n >= 0 ? "+" : ""}${n.toFixed(1).replace(".", ",")}%`;

const KPI = ({ label, value, sub, subColor }) => (
  <div style={{
    display: "flex", flexDirection: "column", gap: 4,
    padding: "0 24px", borderRight: `1px solid ${C.border}`,
    minWidth: 0,
  }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: C.mid, whiteSpace: "nowrap" }}>{label}</span>
    <span style={{ fontSize: 22, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{value}</span>
    {sub && (
      <span style={{ fontSize: 12, fontWeight: 600, color: subColor || C.mid }}>{sub}</span>
    )}
  </div>
);

const SummaryCard = ({ period }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getReportSummary(period)
      .then(setData)
      .catch(() => setError("Não foi possível carregar o resumo."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [period]);

  const changePct = data?.revenue_change_pct ?? 0;
  const changeColor = changePct > 0 ? C.green : changePct < 0 ? "#EF4444" : C.mid;
  const ChangeIcon = changePct > 0 ? TrendingUp : changePct < 0 ? TrendingDown : Minus;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 2px" }}>Visão geral do período</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Resumo financeiro</p>
        </div>
        {!loading && !error && data && (
          <div style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "6px 12px", borderRadius: 20,
            background: changePct > 0 ? "#F0FDF4" : changePct < 0 ? "#FEF2F2" : C.gray,
            border: `1px solid ${changePct > 0 ? "#BBF7D0" : changePct < 0 ? "#FECACA" : C.border}`,
          }}>
            <ChangeIcon size={14} color={changeColor} strokeWidth={2.5} />
            <span style={{ fontSize: 13, fontWeight: 700, color: changeColor }}>
              {changePct === 0 ? "Estável" : fmtPct(changePct)} vs período anterior
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 60 }}>
          <Loader2 size={22} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <WidgetError message={error} onRetry={load} />
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 0,
        }}>
          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "0 24px 0 0", borderRight: `1px solid ${C.border}`,
            minWidth: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>Receita</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{fmt(data?.revenue)}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>total do período</span>
          </div>

          <KPI
            label="Lucro bruto"
            value={fmt(data?.profit)}
            sub={data?.margin_pct != null ? `${data.margin_pct.toFixed(1)}% de margem` : undefined}
            subColor={data?.margin_pct > 20 ? C.green : data?.margin_pct > 10 ? "#D97706" : "#EF4444"}
          />

          <KPI
            label="Custo total"
            value={fmt(data?.cost)}
            sub="em produtos vendidos"
          />

          <KPI
            label="Transações"
            value={data?.tx_count ?? "–"}
            sub={data?.tx_count === 1 ? "venda realizada" : "vendas realizadas"}
          />

          <div style={{
            display: "flex", flexDirection: "column", gap: 4,
            padding: "0 0 0 24px",
            minWidth: 0,
          }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>Ticket médio</span>
            <span style={{ fontSize: 22, fontWeight: 800, color: C.blue, lineHeight: 1 }}>{fmt(data?.avg_ticket)}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>por venda</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
