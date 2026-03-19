import { useState, useEffect } from "react";
import { Loader2, PackageX, Download } from "lucide-react";
import C from "../../../theme/colors";
import { getDeadStock } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";
import { generateReport, buildSection, reportFileName } from "../../../utils/exportPDF";

const DeadStock = ({ companyName }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getDeadStock()
      .then(items => setData(items || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar o estoque parado."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: C.amberPale,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <PackageX size={18} color="#D97706" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>Sem vendas nos últimos 30 dias</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Estoque parado</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && !error && data.length > 0 && (
            <button
              onClick={async () => generateReport(companyName, null, [buildSection.deadStock(data)], reportFileName("estoque-parado", null))}
              title="Exportar seção"
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 6,
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                color: C.mid, transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.blue}
              onMouseLeave={e => e.currentTarget.style.color = C.mid}
            >
              <Download size={16} strokeWidth={2} />
            </button>
          )}
          {!loading && !error && data.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              color: "#D97706", background: C.amberPale,
              padding: "4px 10px", borderRadius: 8,
              flexShrink: 0,
            }}>{data.length} produto{data.length !== 1 ? "s" : ""}</span>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={load} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: 0 }}>Tudo em movimento</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Todos os produtos com estoque foram vendidos nos últimos 30 dias</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {data.map((p, i) => (
            <div key={p.product_id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < data.length - 1 ? `1px solid ${C.border}` : "none",
              gap: 12,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600, color: C.graphite,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{p.product_name}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: C.mid }}>{p.stock} un. em estoque</span>
                {p.stock > p.min_quantity && (
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: "#D97706", background: C.amberPale,
                    padding: "2px 7px", borderRadius: 5,
                  }}>acima do mínimo</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeadStock;
