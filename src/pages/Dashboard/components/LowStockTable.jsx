import { useEffect, useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import C from "../../../theme/colors";
import { getLowStock } from "../../../services/api";

const getUrgency = (ratio) => {
  if (ratio <= 0.5) return { label: "Crítico", color: "#DC2626", bg: "#FEE2E2" };
  return { label: "Baixo", color: "#D97706", bg: "#FEF9C3" };
};

const Badge = ({ label, color, bg }) => (
  <span style={{
    display: "inline-block",
    padding: "3px 10px",
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 700,
    background: bg,
    color,
    letterSpacing: "0.3px",
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const UrgencyBar = ({ ratio, color }) => (
  <div style={{
    width: "100%", height: 5, borderRadius: 4,
    background: "#F3F4F6", overflow: "hidden", marginTop: 4,
  }}>
    <div style={{
      width: `${Math.min(Math.round(ratio * 100), 100)}%`,
      height: "100%", borderRadius: 4,
      background: color,
      transition: "width 0.4s ease",
    }} />
  </div>
);

const LowStockTable = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getLowStock()
      .then(data => setProducts(data || []))
      .catch(err => setError(err.message || "Erro ao carregar estoque."))
      .finally(() => setLoading(false));
  }, []);

  const sorted = [...products].sort((a, b) => {
    const ra = a.inventory?.min_quantity > 0 ? a.inventory.quantity / a.inventory.min_quantity : 0;
    const rb = b.inventory?.min_quantity > 0 ? b.inventory.quantity / b.inventory.min_quantity : 0;
    return ra - rb;
  }).slice(0, 5);

  return (
    <div style={{
      background: "white",
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>
          Atenção necessária
        </p>
        <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>
          Estoque baixo
        </p>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "32px 0" }}>
          <Loader2 size={22} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      ) : error ? (
        <p style={{ fontSize: 13, color: "#EF4444", textAlign: "center", padding: "24px 0", margin: 0 }}>
          {error}
        </p>
      ) : sorted.length === 0 ? (
        <p style={{ fontSize: 13, color: C.mid, textAlign: "center", padding: "24px 0", margin: 0 }}>
          Estoque em dia! Nenhum produto abaixo do mínimo.
        </p>
      ) : (
        <>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 48px 48px 76px",
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

          {sorted.map((p, i) => {
            const qty = p.inventory?.quantity ?? 0;
            const min = p.inventory?.min_quantity ?? 0;
            const ratio = min > 0 ? qty / min : 0;
            const { label, color, bg } = getUrgency(ratio);

            return (
              <div key={p.id} style={{
                display: "grid",
                gridTemplateColumns: "1fr 48px 48px 76px",
                gap: 8,
                padding: "12px 0",
                borderBottom: i < sorted.length - 1 ? `1px solid ${C.border}` : "none",
                alignItems: "center",
              }}>
                <div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>{p.name}</span>
                  <UrgencyBar ratio={ratio} color={color} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color }}>{qty}</span>
                <span style={{ fontSize: 13, color: C.mid }}>{min}</span>
                <Badge label={label} color={color} bg={bg} />
              </div>
            );
          })}
        </>
      )}

      <button
        onClick={() => navigate("/gerir-estoque")}
        style={{
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

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LowStockTable;
