import { useState, useEffect } from "react";
import { PieChart, Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getCategoryBreakdown } from "../../../services/api";
import WidgetError from "../../../components/WidgetError";

const fmt = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });

const BAR_COLORS = ["#0F766E", "#0D9488", "#16A34A", "#D97706", "#EA580C", "#DC2626", "#0891B2"];

const CategoryBreakdown = ({ period }) => {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCategoryBreakdown(period);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setError("Falha ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [period]);

  const maxRevenue = items.length > 0 ? Math.max(...items.map(i => i.revenue)) : 1;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: "22px 24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.bluePale,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <PieChart size={18} color={C.blue} strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: 0 }}>Receita</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Por Categoria</p>
        </div>
      </div>

      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Loader2 size={20} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
        </div>
      )}

      {!loading && error && <WidgetError message={error} onRetry={load} />}

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
