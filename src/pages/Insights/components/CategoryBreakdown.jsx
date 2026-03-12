import { useState, useEffect } from "react";
import { PieChart, Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getCategoryBreakdown } from "../../../services/api";
import WidgetError from "../../../components/WidgetError";

const PERIODS = [
  { label: "Semana", value: "week"  },
  { label: "Mês",    value: "month" },
  { label: "Ano",    value: "year"  },
];

const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const BAR_COLORS = ["#1E3A8A", "#16A34A", "#7C3AED", "#D97706", "#EA580C", "#DC2626", "#0891B2"];

const CategoryBreakdown = () => {
  const [period, setPeriod]   = useState("month");
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = async (p) => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategoryBreakdown(p);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Falha ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); }, [period]);

  const maxRevenue = items.length > 0 ? Math.max(...items.map(i => i.revenue)) : 1;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: "22px 24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
      marginTop: 16,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.purplePale,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PieChart size={18} color="#7C3AED" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: 0 }}>Receita</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Por Categoria</p>
          </div>
        </div>

        {/* Period selector */}
        <div style={{
          display: "flex", gap: 2,
          background: C.gray, borderRadius: 8, padding: 3,
        }}>
          {PERIODS.map(p => {
            const active = p.value === period;
            return (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                style={{
                  padding: "4px 10px", borderRadius: 6,
                  border: "none",
                  background: active ? C.surface : "transparent",
                  color: active ? C.graphite : C.mid,
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  cursor: "pointer", fontFamily: "inherit",
                  boxShadow: active ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                }}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Loader2 size={20} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {!loading && error && <WidgetError message={error} onRetry={() => load(period)} />}

      {!loading && !error && items.length === 0 && (
        <p style={{ fontSize: 13, color: C.mid, textAlign: "center", padding: "24px 0" }}>
          Nenhuma venda registrada no período.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item, idx) => {
            const pct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
            const color = BAR_COLORS[idx % BAR_COLORS.length];
            const name = item.category_id || "Sem categoria";
            return (
              <div key={item.category_id || idx} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>{name}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>{fmt(item.revenue)}</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: C.gray, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: color,
                    borderRadius: 3,
                    transition: "width 0.4s ease",
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CategoryBreakdown;
