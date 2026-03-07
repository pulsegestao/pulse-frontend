import { useEffect, useState } from "react";
import { DollarSign, ShoppingCart, Package, AlertTriangle } from "lucide-react";
import C from "../../../theme/colors";
import { getLowStock } from "../../../services/api";

const deltaColor = (positive) => {
  if (positive === true) return C.green;
  if (positive === false) return "#D97706";
  return C.mid;
};

const MetricCard = ({ label, value, unit, delta, positive, icon: Icon, iconColor, iconBg }) => (
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
        <span style={{ fontSize: 30, fontWeight: 800, color: C.graphite, lineHeight: 1 }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 13, fontWeight: 600, color: C.mid }}>{unit}</span>
        )}
      </div>
      <p style={{
        fontSize: 12, fontWeight: 600,
        color: deltaColor(positive),
        margin: "6px 0 0",
      }}>
        {delta}
      </p>
    </div>
  </div>
);

const MetricsCards = () => {
  const [lowStockCount, setLowStockCount] = useState("–");

  useEffect(() => {
    getLowStock()
      .then(data => setLowStockCount((data || []).length))
      .catch(() => setLowStockCount("–"));
  }, []);

  const metrics = [
    {
      label: "Faturamento hoje",
      value: "R$ 3.840",
      delta: "+12% vs ontem",
      positive: true,
      icon: DollarSign,
      iconColor: C.blue,
      iconBg: C.bluePale,
    },
    {
      label: "Vendas hoje",
      value: "24",
      unit: "vendas",
      delta: "+3 vs ontem",
      positive: true,
      icon: ShoppingCart,
      iconColor: C.green,
      iconBg: C.greenPale,
    },
    {
      label: "Itens em estoque",
      value: "1.247",
      unit: "produtos",
      delta: "cadastrados",
      positive: null,
      icon: Package,
      iconColor: "#7C3AED",
      iconBg: C.purplePale,
    },
    {
      label: "Atenção ao estoque",
      value: String(lowStockCount),
      unit: lowStockCount === 1 ? "produto" : "produtos",
      delta: "baixo + crítico combinados",
      positive: lowStockCount === 0 ? null : false,
      icon: AlertTriangle,
      iconColor: "#D97706",
      iconBg: C.amberPale,
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
    }} className="metrics-grid">
      {metrics.map(m => <MetricCard key={m.label} {...m} />)}
    </div>
  );
};

export default MetricsCards;
