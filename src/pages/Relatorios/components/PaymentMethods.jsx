import { useState, useEffect } from "react";
import { Loader2, CreditCard } from "lucide-react";
import C from "../../../theme/colors";
import { getPaymentMethods } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const METHOD_LABELS = {
  cash: "Dinheiro",
  debit: "Débito",
  credit: "Crédito",
  pix: "PIX",
};

const METHOD_COLORS = {
  cash: C.green,
  debit: C.blue,
  credit: "#7C3AED",
  pix: "#D97706",
};

const METHOD_BG = {
  cash: C.greenPale,
  debit: C.bluePale,
  credit: C.purplePale,
  pix: C.amberPale,
};

const PaymentMethods = ({ period }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = (p) => {
    setLoading(true);
    setError("");
    getPaymentMethods(p)
      .then(items => setData(items || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar os dados."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const total = data.reduce((sum, d) => sum + d.revenue, 0);

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
          background: C.purplePale,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CreditCard size={18} color="#7C3AED" strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>Distribuição por forma</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Métodos de pagamento</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160 }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={() => load(period)} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: C.mid, margin: 0 }}>Sem vendas neste período</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Os métodos de pagamento utilizados aparecerão aqui</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {total > 0 && (
            <p style={{ fontSize: 13, color: C.mid, margin: "0 0 4px" }}>
              Total: <strong style={{ color: C.graphite }}>{fmt(total)}</strong>
            </p>
          )}
          {data.map(d => {
            const color = METHOD_COLORS[d.method] || C.blue;
            const bg = METHOD_BG[d.method] || C.bluePale;
            const label = METHOD_LABELS[d.method] || d.method;
            return (
              <div key={d.method}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color, background: bg,
                      padding: "2px 8px", borderRadius: 6,
                    }}>{label}</span>
                    <span style={{ fontSize: 12, color: C.mid }}>{d.count} transações</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>{fmt(d.revenue)}</span>
                    <span style={{ fontSize: 12, color: C.mid, minWidth: 36, textAlign: "right" }}>{d.pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div style={{ height: 6, background: C.border, borderRadius: 4 }}>
                  <div style={{
                    height: "100%",
                    width: `${d.pct}%`,
                    borderRadius: 4,
                    background: color,
                    opacity: 0.75,
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

export default PaymentMethods;
