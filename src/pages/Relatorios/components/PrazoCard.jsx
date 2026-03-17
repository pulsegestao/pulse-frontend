import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Clock, ArrowRight } from "lucide-react";
import C from "../../../theme/colors";
import { getPrazoReport } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

const PrazoCard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getPrazoReport()
      .then(d => setData(d))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar os recebíveis."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sales = data?.sales || [];
  const preview = sales.slice(0, 3);

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
            <Clock size={18} color="#D97706" strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>Vendas a prazo pendentes</p>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Recebíveis</p>
          </div>
        </div>
        {!loading && !error && data?.total_pending > 0 && (
          <span style={{
            fontSize: 12, fontWeight: 700,
            color: "#D97706", background: C.amberPale,
            padding: "4px 10px", borderRadius: 8,
            flexShrink: 0,
          }}>{fmt(data.total_pending)}</span>
        )}
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
      ) : sales.length === 0 ? (
        <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.green, margin: 0 }}>Tudo recebido</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Nenhuma venda a prazo pendente</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {preview.map((s, i) => (
            <div key={s.sale_id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 0",
              borderBottom: i < preview.length - 1 ? `1px solid ${C.border}` : "none",
              gap: 12,
            }}>
              <span style={{
                fontSize: 13, fontWeight: 600, color: C.graphite,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>{s.customer_name || "Sem cliente"}</span>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 12, color: C.mid }}>{fmtDate(s.created_at)}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>{fmt(s.total_amount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && (
        <button
          onClick={() => navigate("/relatorios/prazo")}
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
          Gerenciar recebíveis
          <ArrowRight size={14} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
};

export default PrazoCard;
