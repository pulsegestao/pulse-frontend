import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, Download } from "lucide-react";
import C from "../../../theme/colors";
import { getLowStock } from "../../../services/api";
import WidgetError from "../../../components/WidgetError";
import { generateReport, reportFileName } from "../../../utils/exportPDF";

const LowStockCard = ({ companyName }) => {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getLowStock()
      .then(items => setData(items || []))
      .catch(() => setError("Não foi possível carregar o estoque baixo."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleExport = () => {
    generateReport(companyName, null, [{
      title: "Estoque Abaixo do Mínimo",
      subtitle: "Produtos que precisam de reposição",
      head: [["Produto", "Atual", "Mínimo", "Déficit"]],
      body: data.map(p => [
        p.name,
        `${p.inventory.quantity} un.`,
        `${p.inventory.min_quantity} un.`,
        `${p.inventory.min_quantity - p.inventory.quantity} un.`,
      ]),
      columnStyles: {
        1: { halign: "right", cellWidth: 24 },
        2: { halign: "right", cellWidth: 24 },
        3: { halign: "right", cellWidth: 24 },
      },
    }], reportFileName("estoque-baixo", null));
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 16, padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)", border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "#FEF3C7",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <AlertTriangle size={18} color="#D97706" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 2px" }}>Reposição necessária</p>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Estoque abaixo do mínimo</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!loading && !error && data.length > 0 && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              padding: "3px 10px", borderRadius: 20,
              background: "#FEF3C7", color: "#D97706",
            }}>
              {data.length} {data.length === 1 ? "produto" : "produtos"}
            </span>
          )}
          <button
            onClick={handleExport}
            title="Exportar PDF"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 32, height: 32, borderRadius: 8,
              border: `1.5px solid ${C.border}`, background: C.surface,
              cursor: "pointer", color: C.mid, transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = C.blue; e.currentTarget.style.borderColor = C.blue; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.mid; e.currentTarget.style.borderColor = C.border; }}
          >
            <Download size={14} strokeWidth={2} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
          <Loader2 size={22} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <WidgetError message={error} onRetry={load} />
      ) : data.length === 0 ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 80, gap: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: 0 }}>Estoque em dia</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Nenhum produto abaixo do mínimo</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 80px 80px 80px",
            padding: "6px 12px", borderRadius: 8,
            background: C.gray,
          }}>
            {["Produto", "Atual", "Mínimo", "Déficit"].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.mid, textAlign: h === "Produto" ? "left" : "right" }}>{h}</span>
            ))}
          </div>
          {data.map((p, i) => {
            const deficit = p.inventory.min_quantity - p.inventory.quantity;
            return (
              <div key={p.id} style={{
                display: "grid", gridTemplateColumns: "1fr 80px 80px 80px",
                padding: "10px 12px",
                borderBottom: i < data.length - 1 ? `1px solid ${C.border}` : "none",
                borderRadius: i === data.length - 1 ? "0 0 8px 8px" : 0,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#D97706", textAlign: "right" }}>
                  {p.inventory.quantity} un.
                </span>
                <span style={{ fontSize: 13, color: C.mid, textAlign: "right" }}>
                  {p.inventory.min_quantity} un.
                </span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#EF4444", textAlign: "right" }}>
                  -{deficit} un.
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LowStockCard;
