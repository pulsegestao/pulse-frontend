import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle, RotateCcw, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import WidgetError from "../../components/WidgetError";
import { getSalesPrazo, receiveSale, returnSale } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";
import { isAuthenticated } from "../../hooks/useAuth";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const TABS = [
  { key: "pending",  label: "Pendentes" },
  { key: "received", label: "Recebidas" },
  { key: "returned", label: "Devolvidas" },
];

const STATUS_BADGE = {
  pending:  { label: "Pendente",  color: "#D97706", bg: C.amberPale },
  received: { label: "Recebida",  color: C.green,   bg: C.greenPale },
  returned: { label: "Devolvida", color: C.mid,     bg: C.gray },
};

const SaleCard = ({ sale, onReceive, onReturn }) => {
  const [expanded, setExpanded] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnStock, setReturnStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const badge = STATUS_BADGE[sale.receivable_status] || STATUS_BADGE.pending;

  const handleReceive = async () => {
    setLoading(true);
    try {
      await onReceive(sale.id);
      setReceiveOpen(false);
      toast.success("Recebimento confirmado!");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    try {
      await onReturn(sale.id, returnStock);
      setReturnOpen(false);
      toast.success("Devolução registrada.");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.border}`,
      borderRadius: 14,
      padding: 20,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: C.graphite }}>
              {sale.customer_name || "Sem cliente"}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700,
              color: badge.color, background: badge.bg,
              padding: "2px 8px", borderRadius: 6,
            }}>{badge.label}</span>
          </div>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>{fmtDate(sale.created_at)}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: C.graphite }}>{fmt(sale.total_amount)}</span>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: C.mid }}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            {(sale.items || []).map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: C.graphite }}>{item.product_name} × {item.quantity}</span>
                <span style={{ color: C.mid }}>{fmt(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sale.receivable_status === "pending" && (
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={() => setReceiveOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.green, color: "white",
              border: "none", borderRadius: 8,
              padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}
          >
            <CheckCircle size={14} /> Confirmar recebimento
          </button>
          <button
            onClick={() => setReturnOpen(true)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, color: "#DC2626", fontWeight: 500, padding: 0,
            }}
          >
            Confirmar devolução ↗
          </button>
        </div>
      )}

      {receiveOpen && (
        <div style={{
          marginTop: 14, padding: 16,
          background: C.greenPale, borderRadius: 10,
          border: `1px solid ${C.green}22`,
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 12px" }}>
            Confirmar recebimento de <strong>{fmt(sale.total_amount)}</strong>
            {sale.customer_name ? ` de ${sale.customer_name}` : ""}?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setReceiveOpen(false)}
              style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px 14px",
                fontSize: 13, fontWeight: 600, color: C.mid, cursor: "pointer",
              }}
            >Cancelar</button>
            <button
              onClick={handleReceive}
              disabled={loading}
              style={{
                background: C.green, color: "white",
                border: "none", borderRadius: 8,
                padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >{loading ? "Confirmando..." : "Confirmar"}</button>
          </div>
        </div>
      )}

      {returnOpen && (
        <div style={{
          marginTop: 14, padding: 16,
          background: "#FEF2F2", borderRadius: 10,
          border: "1px solid #FECACA",
        }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: C.graphite, cursor: "pointer", marginBottom: 10 }}>
            <input
              type="checkbox"
              checked={returnStock}
              onChange={e => setReturnStock(e.target.checked)}
            />
            Reverter o estoque dos produtos
          </label>
          <p style={{ fontSize: 12, color: "#DC2626", margin: "0 0 12px" }}>Esta ação não pode ser desfeita.</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setReturnOpen(false)}
              style={{
                background: C.surface, border: `1px solid ${C.border}`,
                borderRadius: 8, padding: "7px 14px",
                fontSize: 13, fontWeight: 600, color: C.mid, cursor: "pointer",
              }}
            >Cancelar</button>
            <button
              onClick={handleReturn}
              disabled={loading || !returnStock}
              style={{
                background: "#DC2626", color: "white",
                border: "none", borderRadius: 8,
                padding: "7px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                opacity: loading || !returnStock ? 0.5 : 1,
              }}
            >{loading ? "Processando..." : "Confirmar devolução"}</button>
          </div>
        </div>
      )}
    </div>
  );
};

const VendasPrazoPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!isAuthenticated()) {
    navigate("/login");
    return null;
  }

  const load = useCallback((status) => {
    setLoading(true);
    setError("");
    getSalesPrazo(status)
      .then(items => setSales(items || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  const handleReceive = async (id) => {
    await receiveSale(id);
    load(tab);
  };

  const handleReturn = async (id, rs) => {
    await returnSale(id, rs);
    load(tab);
  };

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh" }}>
      <DashboardHeader />
      <QuickActionsBar />
      <main style={{ padding: "124px 24px 48px", maxWidth: 800, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <button
            onClick={() => navigate("/relatorios")}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.surface,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color={C.graphite} strokeWidth={2} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.amberPale,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Clock size={18} color="#D97706" strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>Gestão de recebíveis</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0 }}>Vendas a Prazo</p>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", background: C.gray, borderRadius: 10, padding: 3, gap: 2, marginBottom: 24, width: "fit-content" }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "6px 16px", borderRadius: 8, border: "none",
                background: tab === t.key ? C.surface : "transparent",
                color: tab === t.key ? C.graphite : C.mid,
                fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
                cursor: "pointer",
                boxShadow: tab === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >{t.label}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
            <Loader2 size={28} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : error ? (
          <WidgetError message={error} onRetry={() => load(tab)} />
        ) : sales.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: 200, gap: 8 }}>
            <RotateCcw size={32} color={C.border} strokeWidth={1.5} />
            <p style={{ fontSize: 14, fontWeight: 600, color: C.mid, margin: 0 }}>
              Nenhuma venda {TABS.find(t => t.key === tab)?.label.toLowerCase()}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {sales.map(s => (
              <SaleCard
                key={s.id}
                sale={s}
                onReceive={handleReceive}
                onReturn={handleReturn}
              />
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default VendasPrazoPage;
