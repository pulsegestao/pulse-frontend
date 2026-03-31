import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react";
import C from "../../../theme/colors";
import { getDashboardSummary } from "../../../services/api";

const fmtBRL = (n) =>
  `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const calcDelta = (today, yesterday) => {
  if (yesterday == null || today == null) return null;
  if (yesterday === 0) return today > 0 ? { pct: 100, up: true } : null;
  const pct = ((today - yesterday) / yesterday) * 100;
  return { pct: Math.abs(Math.round(pct)), up: pct >= 0 };
};

const DeltaBadge = ({ delta }) => {
  if (!delta) return <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>sem dados de ontem</span>;
  const color = delta.up ? C.green : "#DC2626";
  const Icon = delta.up ? ArrowUpRight : ArrowDownRight;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 700, color }}>
      <Icon size={13} strokeWidth={2.5} />
      {delta.pct}% vs ontem
    </span>
  );
};

const MetricCard = ({ label, value, unit, delta, deltaObj, icon: Icon, iconColor, iconBg }) => (
  <div style={{
    background: C.surface,
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    border: `1px solid ${C.border}`,
  }}>
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: C.mid }}>{label}</span>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={19} color={iconColor} strokeWidth={2} />
      </div>
    </div>
    <div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: 30, fontWeight: 800, color: C.blue, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 600, color: C.mid }}>{unit}</span>
        )}
      </div>
      <div style={{ marginTop: 6 }}>
        {deltaObj !== undefined ? <DeltaBadge delta={deltaObj} /> : (
          <span style={{ fontSize: 12, fontWeight: 600, color: C.mid }}>{delta}</span>
        )}
      </div>
    </div>
  </div>
);

const MetricsCards = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    getDashboardSummary()
      .then(data => setSummary(data))
      .catch(() => setSummary(null));
  }, []);

  const salesTotal    = summary != null ? fmtBRL(summary.sales_today ?? 0) : "\u2013";
  const salesCount    = summary != null ? String(summary.sales_count_today ?? 0) : "\u2013";
  const lowStockCount = summary != null ? (summary.low_stock_count ?? 0) : null;

  const salesToday      = summary?.sales_today ?? 0;
  const salesCountToday = summary?.sales_count_today ?? 0;
  const salesYesterday      = summary?.sales_yesterday;
  const salesCountYesterday = summary?.sales_count_yesterday;

  const avgTicket = summary != null && salesCountToday > 0
    ? fmtBRL(salesToday / salesCountToday)
    : summary != null ? "R$ 0,00" : "\u2013";

  const grossProfit = summary != null ? fmtBRL(summary.gross_profit_today ?? 0) : "\u2013";

  const revDelta   = summary != null ? calcDelta(salesToday, salesYesterday) : null;
  const countDelta = summary != null ? calcDelta(salesCountToday, salesCountYesterday) : null;

  const metrics = [
    {
      label: "Faturamento hoje",
      value: salesTotal,
      deltaObj: revDelta,
      icon: DollarSign,
      iconColor: C.blue,
      iconBg: C.bluePale,
    },
    {
      label: "Vendas hoje",
      value: salesCount,
      unit: salesCountToday === 1 ? "venda" : "vendas",
      deltaObj: countDelta,
      icon: ShoppingCart,
      iconColor: C.blue,
      iconBg: C.bluePale,
    },
    {
      label: "Ticket medio",
      value: avgTicket,
      delta: "por venda",
      icon: TrendingUp,
      iconColor: C.blue,
      iconBg: C.bluePale,
    },
    {
      label: "Lucro bruto",
      value: grossProfit,
      delta: "hoje",
      icon: DollarSign,
      iconColor: C.green,
      iconBg: C.greenPale,
    },
    {
      label: "Estoque baixo",
      value: lowStockCount !== null ? String(lowStockCount) : "\u2013",
      unit: lowStockCount === 1 ? "produto" : "produtos",
      delta: "abaixo do minimo",
      icon: AlertTriangle,
      iconColor: lowStockCount > 0 ? "#D97706" : C.blue,
      iconBg: lowStockCount > 0 ? C.amberPale : C.bluePale,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }} className="metrics-grid">
      {metrics.map(m => <MetricCard key={m.label} {...m} />)}
    </div>
  );
};

export default MetricsCards;
