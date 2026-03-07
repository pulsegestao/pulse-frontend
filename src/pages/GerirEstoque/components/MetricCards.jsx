import { Package, AlertTriangle, XCircle, DollarSign } from "lucide-react";
import C from "../../../theme/colors";

const Card = ({ label, value, sub, icon: Icon, color, bg }) => (
  <div style={{
    background: C.surface,
    borderRadius: 14,
    padding: "20px 22px",
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: 16,
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: 13,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={22} color={color} strokeWidth={2} />
    </div>
    <div>
      <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label}
      </p>
      <p style={{ fontSize: 24, fontWeight: 800, color: C.graphite, margin: 0, lineHeight: 1.1 }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: 12, color: C.mid, margin: "3px 0 0" }}>{sub}</p>
      )}
    </div>
  </div>
);

const MetricCards = ({ products }) => {
  const total = products.length;
  const lowStock = products.filter(p => p.inventory?.quantity <= p.inventory?.min_quantity && p.inventory?.quantity > p.inventory?.min_quantity / 2).length;
  const critical = products.filter(p => p.inventory?.quantity <= p.inventory?.min_quantity / 2).length;
  const totalValue = products.reduce((acc, p) => acc + (p.sale_price || 0) * (p.inventory?.quantity || 0), 0);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(4, 1fr)",
      gap: 16,
      marginBottom: 24,
    }} className="estoque-metrics-grid">
      <Card
        label="Total de produtos"
        value={total}
        sub="SKUs cadastrados"
        icon={Package}
        color={C.blue}
        bg={C.bluePale}
      />
      <Card
        label="Estoque baixo"
        value={lowStock}
        sub="Abaixo do mínimo"
        icon={AlertTriangle}
        color="#D97706"
        bg={C.amberPale}
      />
      <Card
        label="Críticos"
        value={critical}
        sub="Risco de ruptura"
        icon={XCircle}
        color="#DC2626"
        bg={C.redPale}
      />
      <Card
        label="Valor em estoque"
        value={`R$ ${totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        sub="Preço de venda × qtd"
        icon={DollarSign}
        color={C.green}
        bg={C.greenPale}
      />
    </div>
  );
};

export default MetricCards;
