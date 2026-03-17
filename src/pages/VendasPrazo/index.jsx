import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle, RotateCcw, ChevronDown, ChevronUp,
  Loader2, Banknote, QrCode, CreditCard, X,
} from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import WidgetError from "../../components/WidgetError";
import {
  getSalesPrazo, receiveSale, returnSale,
  getPaymentIntegrations, getCompanySettings,
  createPaymentIntent, getPaymentIntentStatus,
} from "../../services/api";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";
import { isAuthenticated } from "../../hooks/useAuth";

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const fmtDate = (d) => new Date(d).toLocaleString("pt-BR", {
  day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
});

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

const VIA_LABEL = {
  confirmed: "Manual",
  cash:      "Dinheiro",
  pix:       "PIX",
  credit:    "Cartão",
};

// ── Overlay backdrop ──────────────────────────────────────────────────────────

const Overlay = ({ children, onClose }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{ width: "100%", maxWidth: 440 }}>
      {children}
    </div>
  </div>
);

// ── ReceiveModal ──────────────────────────────────────────────────────────────

const ReceiveModal = ({ sale, onClose, onSuccess }) => {
  const pollingRef = useRef(null);
  const [phase, setPhase] = useState("loading");
  const [mpIntegration, setMpIntegration] = useState(null);
  const [pixKey, setPixKey] = useState("");
  const [cashReceived, setCashReceived] = useState("");
  const [cardState, setCardState] = useState("idle");
  const [intentId, setIntentId] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.all([
      getPaymentIntegrations().catch(() => []),
      getCompanySettings().catch(() => ({})),
    ]).then(([ints, company]) => {
      setMpIntegration((ints || []).find(i => i.provider === "mercadopago") || null);
      setPixKey(company.pix_key || "");
      setPhase("select");
    });
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  const handleConfirm = async (via) => {
    setConfirming(true);
    try {
      await onSuccess(via);
      onClose();
    } catch (e) {
      toast.error(friendlyError(e.message));
      setConfirming(false);
    }
  };

  const startMachinePayment = async () => {
    setCardState("processing");
    try {
      const result = await createPaymentIntent({ amount: sale.total_amount, description: "Venda a Prazo" });
      setIntentId(result.intent_id);
      pollingRef.current = setInterval(async () => {
        try {
          const status = await getPaymentIntentStatus(result.intent_id);
          if (["PROCESSED", "APPROVED"].includes(status.status)) {
            clearInterval(pollingRef.current);
            setCardState("approved");
          } else if (["ERROR", "CANCELED", "REJECTED"].includes(status.status)) {
            clearInterval(pollingRef.current);
            setCardState("denied");
          }
        } catch {
          clearInterval(pollingRef.current);
          setCardState("denied");
        }
      }, 3000);
    } catch (e) {
      toast.error(friendlyError(e.message));
      setCardState("idle");
    }
  };

  const cancelMachinePayment = async () => {
    clearInterval(pollingRef.current);
    if (intentId) {
      try { await getPaymentIntentStatus(intentId); } catch {}
    }
    setCardState("idle");
    setIntentId(null);
  };

  const received = parseFloat(cashReceived.replace(",", ".")) || 0;
  const change = received - sale.total_amount;

  const modalBase = {
    background: C.surface,
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
  };

  const backBtn = (
    <button
      onClick={() => setPhase("select")}
      style={{
        background: "none", border: "none", cursor: "pointer",
        color: C.mid, padding: 0, display: "flex", alignItems: "center", gap: 6,
        fontSize: 13, fontWeight: 500, marginBottom: 20,
      }}
    >
      <ArrowLeft size={14} strokeWidth={2} /> Voltar
    </button>
  );

  const closeBtn = (
    <button
      onClick={onClose}
      style={{
        position: "absolute", top: 16, right: 16,
        background: "none", border: "none", cursor: "pointer",
        color: C.mid, padding: 4,
      }}
    >
      <X size={16} strokeWidth={2} />
    </button>
  );

  const headerInfo = (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: C.mid, margin: "0 0 4px" }}>
        {sale.customer_name || "Sem cliente"}
      </p>
      <p style={{ fontSize: 24, fontWeight: 800, color: C.graphite, margin: 0 }}>
        {fmt(sale.total_amount)}
      </p>
    </div>
  );

  if (phase === "loading") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ ...modalBase, display: "flex", alignItems: "center", justifyContent: "center", height: 200 }}>
          <Loader2 size={28} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </Overlay>
    );
  }

  if (phase === "select") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ ...modalBase, position: "relative" }}>
          {closeBtn}
          <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
            Registrar recebimento
          </p>
          {headerInfo}

          <button
            onClick={() => handleConfirm("confirmed")}
            disabled={confirming}
            style={{
              width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#D97706", color: "white",
              border: "none", borderRadius: 10,
              padding: "13px 20px", fontSize: 14, fontWeight: 700,
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={16} strokeWidth={2} />
            {confirming ? "Confirmando..." : "Confirmar recebimento"}
          </button>
          <p style={{ fontSize: 12, color: C.mid, textAlign: "center", margin: "8px 0 0" }}>
            Pagamento já foi recebido — apenas registrar
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "20px 0" }}>
            <div style={{ flex: 1, height: 1, background: C.border }} />
            <span style={{ fontSize: 12, color: C.mid, whiteSpace: "nowrap" }}>ou cobrar agora</span>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {[
              { id: "cash",   label: "Dinheiro", Icon: Banknote,    color: "#16A34A", bg: C.greenPale },
              { id: "pix",    label: "PIX",      Icon: QrCode,      color: "#7C3AED", bg: "#EDE9FE" },
              { id: "credit", label: "Cartão",   Icon: CreditCard,  color: C.blue,   bg: C.bluePale },
            ].map(({ id, label, Icon, color, bg }) => (
              <button
                key={id}
                onClick={() => setPhase(id)}
                style={{
                  flex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "14px 10px",
                  background: bg, border: `1.5px solid ${color}22`,
                  borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={20} color={color} strokeWidth={2} />
                <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </Overlay>
    );
  }

  if (phase === "cash") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ ...modalBase, position: "relative" }}>
          {closeBtn}
          {backBtn}
          <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
            Pagamento em Dinheiro
          </p>
          {headerInfo}

          <label style={{ fontSize: 13, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 6 }}>
            Valor recebido (R$)
          </label>
          <input
            autoFocus
            type="number"
            min="0"
            step="0.01"
            value={cashReceived}
            onChange={e => setCashReceived(e.target.value)}
            placeholder="0,00"
            style={{
              width: "100%", boxSizing: "border-box",
              padding: "11px 14px", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: C.pageBg,
              fontSize: 16, fontWeight: 700, color: C.graphite,
              outline: "none", fontFamily: "inherit",
            }}
          />

          {received >= sale.total_amount && (
            <div style={{
              marginTop: 14, padding: 14,
              background: C.greenPale, borderRadius: 10,
              border: `1px solid ${C.green}33`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>Troco</span>
              <span style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(change)}</span>
            </div>
          )}

          <button
            onClick={() => handleConfirm("cash")}
            disabled={received < sale.total_amount || confirming}
            style={{
              width: "100%", marginTop: 16,
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: C.green, color: "white",
              border: "none", borderRadius: 10,
              padding: "13px 20px", fontSize: 14, fontWeight: 700,
              cursor: received < sale.total_amount || confirming ? "not-allowed" : "pointer",
              opacity: received < sale.total_amount || confirming ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={16} strokeWidth={2} />
            {confirming ? "Confirmando..." : "Confirmar recebimento"}
          </button>
        </div>
      </Overlay>
    );
  }

  if (phase === "pix") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ ...modalBase, position: "relative" }}>
          {closeBtn}
          {backBtn}
          <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
            Pagamento via PIX
          </p>
          {headerInfo}

          <div style={{
            padding: 16, borderRadius: 12,
            background: "#EDE9FE", border: "1px solid #7C3AED22",
            marginBottom: 16,
          }}>
            <p style={{ fontSize: 12, color: "#7C3AED", fontWeight: 600, margin: "0 0 6px" }}>Chave PIX</p>
            {pixKey ? (
              <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0, wordBreak: "break-all" }}>
                {pixKey}
              </p>
            ) : (
              <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
                Nenhuma chave configurada. Configure em Configurações.
              </p>
            )}
          </div>

          <button
            onClick={() => handleConfirm("pix")}
            disabled={confirming}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#7C3AED", color: "white",
              border: "none", borderRadius: 10,
              padding: "13px 20px", fontSize: 14, fontWeight: 700,
              cursor: confirming ? "not-allowed" : "pointer",
              opacity: confirming ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={16} strokeWidth={2} />
            {confirming ? "Confirmando..." : "Confirmar recebimento"}
          </button>
        </div>
      </Overlay>
    );
  }

  if (phase === "credit") {
    return (
      <Overlay onClose={onClose}>
        <div style={{ ...modalBase, position: "relative" }}>
          {closeBtn}
          {backBtn}
          <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
            Pagamento por Cartão
          </p>
          {headerInfo}

          {mpIntegration && cardState === "idle" && (
            <button
              onClick={startMachinePayment}
              style={{
                width: "100%", marginBottom: 10,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                background: C.blue, color: "white",
                border: "none", borderRadius: 10,
                padding: "13px 20px", fontSize: 14, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              <CreditCard size={16} strokeWidth={2} />
              Enviar para maquininha
            </button>
          )}

          {cardState === "processing" && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: C.bluePale, border: `1px solid ${C.blue}33`,
              marginBottom: 12, textAlign: "center",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 8 }}>
                <Loader2 size={18} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Aguardando maquininha...</span>
              </div>
              <button
                onClick={cancelMachinePayment}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: C.mid, fontFamily: "inherit",
                }}
              >Cancelar</button>
            </div>
          )}

          {cardState === "approved" && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: C.greenPale, border: `1px solid ${C.green}33`,
              marginBottom: 12, textAlign: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: C.green, margin: 0 }}>
                ✓ Pagamento aprovado na maquininha!
              </p>
            </div>
          )}

          {cardState === "denied" && (
            <div style={{
              padding: 16, borderRadius: 12,
              background: "#FEF2F2", border: "1px solid #FECACA",
              marginBottom: 12, textAlign: "center",
            }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#DC2626", margin: "0 0 8px" }}>
                Pagamento negado ou erro.
              </p>
              <button
                onClick={() => { setCardState("idle"); setIntentId(null); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, color: C.blue, fontFamily: "inherit",
                }}
              >Tentar novamente</button>
            </div>
          )}

          <button
            onClick={() => handleConfirm("credit")}
            disabled={confirming || cardState === "processing"}
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: cardState === "approved" ? C.green : C.surface,
              color: cardState === "approved" ? "white" : C.graphite,
              border: cardState === "approved" ? "none" : `1.5px solid ${C.border}`,
              borderRadius: 10,
              padding: "13px 20px", fontSize: 14, fontWeight: 700,
              cursor: confirming || cardState === "processing" ? "not-allowed" : "pointer",
              opacity: confirming || cardState === "processing" ? 0.5 : 1,
              fontFamily: "inherit",
            }}
          >
            <CheckCircle size={16} strokeWidth={2} />
            {confirming ? "Confirmando..." : cardState === "approved" ? "Confirmar recebimento" : "Confirmar manualmente (aprovado)"}
          </button>
        </div>
      </Overlay>
    );
  }

  return null;
};

// ── SaleCard ──────────────────────────────────────────────────────────────────

const SaleCard = ({ sale, onReceive, onReturn }) => {
  const [expanded, setExpanded] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [returnStock, setReturnStock] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const badge = STATUS_BADGE[sale.receivable_status] || STATUS_BADGE.pending;
  const viaBadge = sale.received_via ? VIA_LABEL[sale.received_via] : null;

  const handleReceiveSuccess = async (via) => {
    await onReceive(sale.id, via);
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
    <>
      <div style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
        padding: 20,
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.graphite }}>
                {sale.customer_name || "Sem cliente"}
              </span>
              <span style={{
                fontSize: 11, fontWeight: 700,
                color: badge.color, background: badge.bg,
                padding: "2px 8px", borderRadius: 6,
              }}>{badge.label}</span>
              {viaBadge && (
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: C.mid, background: C.gray,
                  padding: "2px 8px", borderRadius: 6,
                }}>via {viaBadge}</span>
              )}
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
              onClick={() => setShowReceiveModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                background: C.green, color: "white",
                border: "none", borderRadius: 8,
                padding: "8px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer",
              }}
            >
              <CheckCircle size={14} /> Receber pagamento
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

      {showReceiveModal && (
        <ReceiveModal
          sale={sale}
          onClose={() => setShowReceiveModal(false)}
          onSuccess={handleReceiveSuccess}
        />
      )}
    </>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const VendasPrazoPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("pending");
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const toast = useToast();

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

  const handleReceive = async (id, via) => {
    await receiveSale(id, via);
    toast.success("Recebimento confirmado!");
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
