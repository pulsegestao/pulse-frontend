import { useState, useEffect } from "react";
import { Flame, Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getVelocityRanking } from "../../../services/api";
import WidgetError from "../../../components/WidgetError";

const trendLabel = (direction) => {
  if (direction === "up")   return { text: "Acelerando ↑",    color: "#16A34A" };
  if (direction === "down") return { text: "Desacelerando ↓", color: "#DC2626" };
  return                           { text: "Estável →",        color: C.mid    };
};

const VelocityRanking = () => {
  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getVelocityRanking(10);
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError("Falha ao carregar ranking.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const maxScore = items.length > 0 ? Math.max(...items.map(i => Math.abs(i.velocity_score))) : 1;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      border: `1px solid ${C.border}`,
      padding: "22px 24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.amberPale,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Flame size={18} color="#D97706" strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: 0 }}>Análise de vendas</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Produtos em Destaque</p>
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
          Nenhum dado de velocidade disponível ainda.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {items.map((item, idx) => {
            const trend = trendLabel(item.trend_direction);
            const pct   = maxScore > 0 ? (Math.abs(item.velocity_score) / maxScore) * 100 : 0;
            const barColor = item.velocity_score >= 0 ? "#16A34A" : "#DC2626";
            return (
              <div key={item.product_id || idx} style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: 6,
                      background: C.gray,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: 800, color: C.mid,
                      flexShrink: 0,
                    }}>
                      {idx + 1}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: C.graphite,
                      maxWidth: 140, overflow: "hidden",
                      textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {item.product_name || item.product_id}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: trend.color, whiteSpace: "nowrap" }}>
                    {trend.text}
                  </span>
                </div>
                {/* Barra de progresso */}
                <div style={{ height: 5, borderRadius: 3, background: C.gray, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${pct}%`,
                    background: barColor,
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

export default VelocityRanking;
