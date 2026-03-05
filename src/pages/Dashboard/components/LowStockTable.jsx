import { ArrowRight } from "lucide-react";
import C from "../../../theme/colors";

const PRODUCTS = [
  { name: "Arroz 5kg",        current: 3,  min: 10, status: "critico" },
  { name: "Azeite 500ml",     current: 2,  min: 8,  status: "critico" },
  { name: "Feijão 1kg",       current: 5,  min: 15, status: "baixo"   },
  { name: "Macarrão 500g",    current: 7,  min: 20, status: "baixo"   },
  { name: "Sal refinado 1kg", current: 4,  min: 10, status: "baixo"   },
];

const STATUS_CONFIG = {
  critico: { label: "Crítico", bg: "#FEE2E2", color: "#DC2626" },
  baixo:   { label: "Baixo",   bg: "#FEF9C3", color: "#A16207" },
};

const Badge = ({ status }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 100,
      fontSize: 11,
      fontWeight: 700,
      background: cfg.bg,
      color: cfg.color,
      letterSpacing: "0.3px",
    }}>
      {cfg.label}
    </span>
  );
};

const LowStockTable = () => (
  <div style={{
    background: "white",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    border: `1px solid ${C.border}`,
    display: "flex",
    flexDirection: "column",
    gap: 0,
  }}>
    {/* Header */}
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>
        Atenção necessária
      </p>
      <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>
        Estoque baixo
      </p>
    </div>

    {/* Table header */}
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 48px 52px 76px",
      gap: 8,
      padding: "8px 0",
      borderBottom: `1px solid ${C.border}`,
    }}>
      {["Produto", "Atual", "Mín.", "Status"].map(h => (
        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.mid, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {h}
        </span>
      ))}
    </div>

    {/* Rows */}
    {PRODUCTS.map((p, i) => (
      <div key={p.name} style={{
        display: "grid",
        gridTemplateColumns: "1fr 48px 52px 76px",
        gap: 8,
        padding: "12px 0",
        borderBottom: i < PRODUCTS.length - 1 ? `1px solid ${C.border}` : "none",
        alignItems: "center",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>{p.name}</span>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: p.status === "critico" ? "#DC2626" : "#A16207",
        }}>
          {p.current}
        </span>
        <span style={{ fontSize: 13, color: C.mid }}>{p.min}</span>
        <Badge status={p.status} />
      </div>
    ))}

    {/* Footer button */}
    <button style={{
      marginTop: 16,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      padding: "10px",
      borderRadius: 10,
      border: `1.5px solid ${C.border}`,
      background: "transparent",
      color: C.blue,
      fontSize: 13, fontWeight: 700,
      cursor: "pointer",
      fontFamily: "inherit",
      transition: "all 0.15s",
      width: "100%",
    }}
      onMouseEnter={e => { e.currentTarget.style.background = C.bluePale; e.currentTarget.style.borderColor = C.blue; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.border; }}
    >
      Ver todos os produtos
      <ArrowRight size={14} strokeWidth={2.5} />
    </button>
  </div>
);

export default LowStockTable;
