import { useState, useEffect } from "react";
import { Loader2, TrendingUp } from "lucide-react";
import C from "../../../theme/colors";
import { getProductReport } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function marginColor(pct) {
  if (pct >= 40) return C.green;
  if (pct >= 20) return "#D97706";
  return "#DC2626";
}

function marginBg(pct) {
  if (pct >= 40) return C.greenPale;
  if (pct >= 20) return C.amberPale;
  return "#FEF2F2";
}

const ProductReport = ({ period }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (p) => {
    setLoading(true);
    setError("");
    getProductReport(p)
      .then(items => setData(items || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar o relatório."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: C.bluePale,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <TrendingUp size={18} color={C.blue} strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>Por receita e margem</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Desempenho de produtos</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={() => load(period)} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.mid, margin: 0 }}>Sem vendas neste período</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Os dados aparecerão conforme as vendas forem registradas</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["#", "Produto", "Qtd.", "Receita", "Custo", "Margem"].map((h, i) => (
                  <th key={h} style={{
                    fontSize: 11, fontWeight: 700, color: C.mid,
                    textAlign: i === 0 ? "center" : i <= 1 ? "left" : "right",
                    padding: "0 12px 12px",
                    borderBottom: `1px solid ${C.border}`,
                    whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((p, i) => (
                <tr key={p.product_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px", textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 800, color: C.mid,
                      width: 22, height: 22, borderRadius: 6,
                      background: C.gray,
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                    }}>{i + 1}</span>
                  </td>
                  <td style={{ padding: "12px", maxWidth: 200 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 600, color: C.graphite,
                      display: "block", whiteSpace: "nowrap",
                      overflow: "hidden", textOverflow: "ellipsis",
                    }}>{p.product_name}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <span style={{ fontSize: 13, color: C.graphite }}>{p.quantity} un.</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>{fmt(p.revenue)}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <span style={{ fontSize: 13, color: C.mid }}>{fmt(p.cost)}</span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: marginColor(p.margin_pct),
                      background: marginBg(p.margin_pct),
                      padding: "3px 8px", borderRadius: 6,
                      whiteSpace: "nowrap",
                    }}>
                      {p.margin_pct.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductReport;
