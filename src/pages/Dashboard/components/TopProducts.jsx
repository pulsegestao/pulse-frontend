import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getTopProducts } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";

const PERIODS = ["Semana", "Mês", "Ano"];
const PERIOD_KEY = { "Semana": "week", "Mês": "month", "Ano": "year" };

const RANK_COLORS = [
  { bg: C.orangePale, color: "#D97706" },
  { bg: C.greenPale,  color: C.green   },
  { bg: C.bluePale,   color: C.blue    },
  { bg: C.purplePale, color: "#7C3AED" },
  { bg: C.pinkPale,   color: "#DB2777" },
];

const TopProducts = () => {
  const [period, setPeriod]   = useState("Semana");
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = (p) => {
    setLoading(true);
    setError("");
    getTopProducts(PERIOD_KEY[p])
      .then(items => setData(items || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar o ranking."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const maxQty = data.length > 0 ? data[0].quantity : 1;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Ranking do período</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Mais vendidos</p>
        </div>

        <div style={{ display: "flex", background: C.gray, borderRadius: 10, padding: 3, gap: 2 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 14px", borderRadius: 8, border: "none",
                background: period === p ? C.surface : "transparent",
                color: period === p ? C.graphite : C.mid,
                fontSize: 12, fontWeight: period === p ? 700 : 500,
                cursor: "pointer",
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180 }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={() => load(period)} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 180, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.mid, margin: 0 }}>Sem vendas neste período</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Os produtos mais vendidos aparecerão aqui</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {data.map((p, i) => {
            const rank = RANK_COLORS[i] || RANK_COLORS[RANK_COLORS.length - 1];
            const pct = Math.round((p.quantity / maxQty) * 100);
            return (
              <div key={p.product_id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: rank.bg,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 800, color: rank.color,
                  flexShrink: 0,
                }}>
                  {i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {p.product_name}
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.mid, flexShrink: 0, marginLeft: 8 }}>
                      {p.quantity} un.
                    </span>
                  </div>
                  <div style={{ height: 5, background: C.border, borderRadius: 4 }}>
                    <div style={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 4,
                      background: rank.color,
                      opacity: 0.7,
                    }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TopProducts;
