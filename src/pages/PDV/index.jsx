import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Plus, Minus, Trash2, ShoppingCart,
  QrCode, CreditCard, Banknote, Wallet, Check, Package, LogOut,
  Loader2, AlertCircle, Smartphone, Clock, UserPlus,
} from "lucide-react";
import C from "../../theme/colors";
import { isAuthenticated, getProfile } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  getPaymentIntegrations,
  getCompanySettings,
  getProducts,
  createPaymentIntent,
  getPaymentIntentStatus,
  cancelPaymentIntent,
  registerSale,
  searchCustomers,
  createCustomer,
} from "../../services/api";

const fmt = (n) => `R$ ${n.toFixed(2).replace(".", ",")}`;

// ── Constants ──────────────────────────────────────────────────────────────────


const PAYMENT_METHODS_BASE = [
  { id: "pix",  label: "PIX",     icon: QrCode,     color: C.green,   bg: C.greenPale },
  { id: "card", label: "Cartão",  icon: CreditCard, color: C.blue,    bg: C.bluePale  },
  { id: "cash", label: "Dinheiro",icon: Banknote,   color: "#D97706", bg: C.amberPale },
];

const PAYMENT_METHODS = [
  ...PAYMENT_METHODS_BASE,
  { id: "mixed", label: "Misto", icon: Wallet, color: "#7C3AED", bg: C.purplePale },
];

const PRAZO_METHOD = { id: "prazo", label: "A Prazo", icon: Clock, color: "#B45309", bg: C.amberPale };

// ── PDV Header (52px) ──────────────────────────────────────────────────────────

const PDVHeader = ({ companyName, userName, onExit }) => (
  <header style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    height: 52,
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    display: "flex", alignItems: "center",
    padding: "0 24px", justifyContent: "space-between",
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 12h4l3-8 4 16 3-8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <div style={{ width: 1, height: 18, background: C.border }} />
      <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>Caixa</span>
      {companyName && <span style={{ fontSize: 12, color: C.mid }}>· {companyName}</span>}
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {userName && <span style={{ fontSize: 12, color: C.mid }}>{userName}</span>}
      <button
        onClick={onExit}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8,
          background: "transparent", border: `1.5px solid ${C.border}`,
          fontSize: 12, fontWeight: 700, color: C.mid,
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.mid; }}
      >
        <LogOut size={12} strokeWidth={2} />
        Sair do caixa
      </button>
    </div>
  </header>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

const QtyBtn = ({ onClick, disabled, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      width: 28, height: 28, borderRadius: 7,
      border: `1.5px solid ${disabled ? C.gray : C.border}`,
      background: C.surface,
      cursor: disabled ? "default" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}
  >
    {children}
  </button>
);

const ProductCard = ({ product, onAdd }) => {
  const outOfStock = product.stock <= 0;
  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      style={{
        display: "flex", flexDirection: "column", gap: 8,
        padding: "14px 16px", borderRadius: 12,
        background: outOfStock ? C.gray : C.surface,
        border: `1.5px solid ${outOfStock ? C.border : C.border}`,
        cursor: outOfStock ? "not-allowed" : "pointer",
        textAlign: "left", fontFamily: "inherit",
        transition: "all 0.15s", width: "100%", boxSizing: "border-box",
        opacity: outOfStock ? 0.55 : 1,
        position: "relative",
      }}
      onMouseEnter={e => {
        if (outOfStock) return;
        e.currentTarget.style.borderColor = C.blue + "55";
        e.currentTarget.style.background = C.bluePale;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        if (outOfStock) return;
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.background = C.surface;
        e.currentTarget.style.transform = "none";
      }}
    >
      {outOfStock && (
        <span style={{
          position: "absolute", top: 8, right: 8,
          padding: "2px 7px", borderRadius: 6,
          background: C.redPale, color: "#DC2626",
          fontSize: 9, fontWeight: 800, letterSpacing: "0.3px",
          textTransform: "uppercase",
        }}>
          Sem estoque
        </span>
      )}
      <p style={{ fontSize: 13, fontWeight: 600, color: outOfStock ? C.mid : C.graphite, margin: 0, lineHeight: 1.35 }}>
        {product.name}
      </p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: outOfStock ? C.mid : C.green }}>{fmt(product.price)}</span>
        <span style={{ padding: "2px 7px", borderRadius: 6, background: C.gray, fontSize: 10, fontWeight: 600, color: C.mid }}>
          {product.unit}
        </span>
      </div>
    </button>
  );
};

const CartItem = ({ item, onUpdateQty, onRemove }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${C.border}` }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {item.name}
      </p>
      <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
        {fmt(item.price)} × {item.qty} ={" "}
        <span style={{ color: C.green, fontWeight: 700 }}>{fmt(item.price * item.qty)}</span>
      </p>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
      <QtyBtn onClick={() => onUpdateQty(item.id, -1)} disabled={item.qty <= 1}>
        <Minus size={12} strokeWidth={2.5} color={item.qty <= 1 ? C.border : C.graphite} />
      </QtyBtn>
      <span style={{ width: 26, textAlign: "center", fontSize: 13, fontWeight: 700, color: C.graphite }}>
        {item.qty}
      </span>
      <QtyBtn onClick={() => onUpdateQty(item.id, 1)} disabled={item.qty >= item.stock}>
        <Plus size={12} strokeWidth={2.5} color={item.qty >= item.stock ? C.border : C.graphite} />
      </QtyBtn>
      <button
        onClick={() => onRemove(item.id)}
        style={{ width: 28, height: 28, borderRadius: 7, border: "none", background: C.redPale, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4 }}
      >
        <Trash2 size={12} strokeWidth={2} color="#EF4444" />
      </button>
    </div>
  </div>
);

const PaymentBtn = ({ method, selected, onSelect }) => {
  const Icon = method.icon;
  return (
    <button
      onClick={() => onSelect(method)}
      style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
        padding: "12px 8px", borderRadius: 12,
        border: selected ? `2px solid ${method.color}` : `1.5px solid ${C.border}`,
        background: selected ? method.bg : C.surface,
        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
      }}
      onMouseEnter={e => { if (!selected) { e.currentTarget.style.background = method.bg; e.currentTarget.style.borderColor = method.color + "55"; } }}
      onMouseLeave={e => { if (!selected) { e.currentTarget.style.background = C.surface; e.currentTarget.style.borderColor = C.border; } }}
    >
      <Icon size={20} color={method.color} strokeWidth={2} />
      <span style={{ fontSize: 12, fontWeight: 700, color: method.color }}>{method.label}</span>
    </button>
  );
};

// ── Payment Modal ──────────────────────────────────────────────────────────────

const PaymentModal = ({ method, total, selectedCustomer, onClose, onSuccess }) => {
  const pollingRef = useRef(null);
  const finalEntriesRef = useRef(null);

  // Integrations
  const [loading, setLoading] = useState(true);
  const [mpIntegration, setMpIntegration] = useState(null);
  const [pixKey, setPixKey] = useState("");

  // Planning phase (mixed only): list of payment entries
  const [paymentEntries, setPaymentEntries] = useState([{ id: 1, methodId: null, amount: "" }]);

  // Phase state machine
  const [payPhase, setPayPhase] = useState("loading"); // "loading" | "planning" | "executing"

  // Executing phase
  const [execEntries, setExecEntries] = useState([]);
  const [execIndex, setExecIndex] = useState(0);

  // Per-entry execution
  const [cashReceived, setCashReceived] = useState("");
  const [cardState, setCardState] = useState("idle"); // "idle" | "processing" | "approved" | "denied"
  const [intentId, setIntentId] = useState(null);

  // Success state
  const [success, setSuccess] = useState(false);
  const [successChange, setSuccessChange] = useState(0);

  // Load integrations + PIX key, then set initial phase
  useEffect(() => {
    Promise.all([
      getPaymentIntegrations().catch(() => []),
      getCompanySettings().catch(() => ({})),
    ]).then(([ints, company]) => {
      setMpIntegration((ints || []).find(i => i.provider === "mercadopago") || null);
      setPixKey(company.pix_key || "");
      if (method?.id === "mixed") {
        setPayPhase("planning");
      } else if (method?.id === "prazo") {
        setPayPhase("prazo_confirm");
      } else {
        setExecEntries([{ id: 1, methodId: method?.id, amount: total, status: "pending", change: 0 }]);
        setExecIndex(0);
        setPayPhase("executing");
      }
    }).finally(() => setLoading(false));
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, []);

  // ── Planning (mixed) ──

  const mixedSum = paymentEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const mixedDiff = mixedSum - total;
  const mixedOk = Math.abs(mixedDiff) < 0.01;
  const mixedStatus = mixedOk
    ? { text: "Total completo ✓", color: C.green }
    : mixedDiff < 0
      ? { text: `Faltam ${fmt(Math.abs(mixedDiff))}`, color: "#EF4444" }
      : { text: `Excede em ${fmt(Math.abs(mixedDiff))}`, color: "#D97706" };
  const mixedCanStart = mixedOk && paymentEntries.every(e => e.methodId && parseFloat(e.amount) > 0);

  const addEntry = () => setPaymentEntries(p => [...p, { id: Date.now(), methodId: null, amount: "" }]);
  const removeEntry = (id) => { if (paymentEntries.length > 1) setPaymentEntries(p => p.filter(e => e.id !== id)); };
  const updateEntry = (id, field, val) => setPaymentEntries(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  const startExecution = () => {
    const entries = paymentEntries.map(e => ({ ...e, status: "pending", change: 0, transactionId: null }));
    setExecEntries(entries);
    setExecIndex(0);
    setPayPhase("executing");
    setCashReceived("");
    setCardState("idle");
    setIntentId(null);
  };

  // ── Executing ──

  const currentEntry = execEntries[execIndex];
  const currentMethod = currentEntry ? PAYMENT_METHODS_BASE.find(m => m.id === currentEntry.methodId) : null;
  const entryAmount = parseFloat(currentEntry?.amount || 0);
  const received = parseFloat(String(cashReceived).replace(",", ".")) || 0;
  const cashChange = received - entryAmount;

  const confirmCurrentEntry = (change = 0, transactionId = null) => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    setIntentId(null);
    const updated = execEntries.map((e, i) =>
      i === execIndex ? { ...e, status: "confirmed", change, transactionId } : e
    );
    setExecEntries(updated);

    if (execIndex + 1 < updated.length) {
      setExecIndex(i => i + 1);
      setCashReceived("");
      setCardState("idle");
    } else {
      finalEntriesRef.current = updated;
      const totalChange = updated.reduce((s, e) => s + (e.change || 0), 0);
      setSuccessChange(totalChange);
      setSuccess(true);
      if (totalChange <= 0) setTimeout(() => onSuccess(updated), 2500);
    }
  };

  const handleSendToMachine = async () => {
    setCardState("processing");
    try {
      const result = await createPaymentIntent({ amount: entryAmount, description: "Venda PDV" });
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
    } catch {
      setCardState("denied");
    }
  };

  const handleCancelMachine = async () => {
    if (pollingRef.current) { clearInterval(pollingRef.current); pollingRef.current = null; }
    if (intentId) { cancelPaymentIntent(intentId).catch(() => {}); setIntentId(null); }
    setCardState("idle");
  };

  // ── Render ──

  return (
    <div
      onClick={!success ? onClose : undefined}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 20, padding: "28px",
          width: 440, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
          border: `1px solid ${C.border}`, boxSizing: "border-box",
        }}
      >
        {/* ── Success ── */}
        {success ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", background: C.greenPale,
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
            }}>
              <Check size={28} color={C.green} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>Venda registrada!</p>
            <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>
              {fmt(total)} via {method?.label}
            </p>
            {successChange > 0 && (
              <div style={{
                marginTop: 20, padding: "16px 20px", borderRadius: 14,
                background: C.greenPale, border: `1px solid ${C.green}33`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Troco a dar</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.green }}>{fmt(successChange)}</span>
              </div>
            )}
            <button
              onClick={() => onSuccess(finalEntriesRef.current)}
              style={{
                marginTop: 24, padding: "11px 32px", borderRadius: 10,
                background: C.green, color: "white", border: "none",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {successChange > 0 ? "Troco entregue · Fechar" : "Fechar"}
            </button>
          </div>

        ) : loading ? (
          /* ── Loading integrations ── */
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Loader2 size={28} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>Carregando...</p>
          </div>

        ) : payPhase === "planning" ? (
          /* ── Planning (mixed only) ── */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: C.purplePale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Wallet size={22} color="#7C3AED" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Pagamento Misto</p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>Total: <strong style={{ color: C.green }}>{fmt(total)}</strong></p>
              </div>
            </div>

            <p style={{ fontSize: 12, color: C.mid, margin: "0 0 12px" }}>
              Adicione quantos pagamentos precisar. A soma deve cobrir{" "}
              <strong style={{ color: C.graphite }}>{fmt(total)}</strong>.
            </p>

            <div style={{ maxHeight: 280, overflowY: "auto", marginBottom: 10 }}>
              {paymentEntries.map((entry, idx) => {
                const info = PAYMENT_METHODS_BASE.find(m => m.id === entry.methodId);
                return (
                  <div key={entry.id} style={{
                    background: C.gray, borderRadius: 12, padding: "12px 14px",
                    marginBottom: 8, border: `1px solid ${info ? info.color + "33" : C.border}`,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.graphite }}>Pagamento {idx + 1}</span>
                      {paymentEntries.length > 1 && (
                        <button onClick={() => removeEntry(entry.id)} style={{ width: 22, height: 22, borderRadius: 6, border: "none", background: C.redPale, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <X size={11} strokeWidth={2.5} color="#EF4444" />
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                      {PAYMENT_METHODS_BASE.map(m => {
                        const sel = entry.methodId === m.id;
                        const MIcon = m.icon;
                        return (
                          <button key={m.id} onClick={() => updateEntry(entry.id, "methodId", m.id)} style={{
                            flex: 1, padding: "7px 4px", borderRadius: 9,
                            border: `1.5px solid ${sel ? m.color : C.border}`,
                            background: sel ? m.bg : C.surface,
                            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                            cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                          }}>
                            <MIcon size={14} color={sel ? m.color : C.mid} strokeWidth={2} />
                            <span style={{ fontSize: 11, fontWeight: 700, color: sel ? m.color : C.mid }}>{m.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <input
                      type="number" min="0" step="0.01" placeholder="0,00"
                      value={entry.amount}
                      onChange={e => updateEntry(entry.id, "amount", e.target.value)}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 9,
                        border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 700,
                        color: C.graphite, background: C.surface, outline: "none",
                        fontFamily: "inherit", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = info?.color || C.blue}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>
                );
              })}
            </div>

            <button
              onClick={addEntry}
              style={{
                width: "100%", padding: "9px", borderRadius: 9,
                border: `1.5px dashed ${C.border}`, background: "transparent",
                fontSize: 12, fontWeight: 700, color: C.mid, cursor: "pointer",
                fontFamily: "inherit", marginBottom: 12,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                transition: "all 0.12s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}
            >
              <Plus size={13} strokeWidth={2.5} />
              Adicionar pagamento
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: C.gray, marginBottom: 20 }}>
              <span style={{ fontSize: 12, color: C.mid }}>
                Informado: <strong style={{ color: C.graphite }}>{fmt(mixedSum)}</strong>
              </span>
              <span style={{ fontSize: 13, fontWeight: 700, color: mixedStatus.color }}>{mixedStatus.text}</span>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 700, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancelar
              </button>
              <button
                onClick={startExecution}
                disabled={!mixedCanStart}
                style={{
                  flex: 2, padding: "11px", borderRadius: 10, border: "none",
                  background: mixedCanStart ? "#7C3AED" : C.border,
                  color: mixedCanStart ? "white" : C.mid,
                  fontSize: 13, fontWeight: 700, cursor: mixedCanStart ? "pointer" : "not-allowed",
                  fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                Iniciar cobrança →
              </button>
            </div>
          </>

        ) : payPhase === "prazo_confirm" ? (
          /* ── Prazo confirm ── */
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: C.amberPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock size={22} color="#B45309" strokeWidth={2} />
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Venda a Prazo</p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>Total: <strong style={{ color: C.green }}>{fmt(total)}</strong></p>
              </div>
            </div>
            {selectedCustomer ? (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: C.amberPale, marginBottom: 20, border: "1px solid #D9770633" }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: "0 0 2px" }}>{selectedCustomer.name}</p>
                {selectedCustomer.cpf && <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>{selectedCustomer.cpf}</p>}
              </div>
            ) : (
              <div style={{ padding: "12px 16px", borderRadius: 10, background: C.gray, marginBottom: 20 }}>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>Sem cliente vinculado</p>
              </div>
            )}
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 700, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >Cancelar</button>
              <button
                onClick={() => onSuccess([{ id: 1, methodId: "prazo", amount: total, status: "confirmed", change: 0 }])}
                style={{ flex: 2, padding: "11px", borderRadius: 10, border: "none", background: "#B45309", color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                <Clock size={15} strokeWidth={2} />
                Confirmar venda a prazo
              </button>
            </div>
          </>

        ) : (
          /* ── Executing (step-lock) ── */
          <>
            {/* Progress strip (only for multiple entries) */}
            {execEntries.length > 1 && (
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {execEntries.map((e, i) => {
                  const m = PAYMENT_METHODS_BASE.find(m => m.id === e.methodId);
                  const done = i < execIndex;
                  const active = i === execIndex;
                  return (
                    <div key={e.id} style={{
                      flex: 1, borderRadius: 8, padding: "7px 10px",
                      background: done ? C.greenPale : active ? (m?.bg || C.gray) : C.gray,
                      border: `1px solid ${done ? C.green + "55" : active ? (m?.color || C.border) + "55" : C.border}`,
                    }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: done ? C.green : active ? (m?.color || C.mid) : C.mid, margin: 0 }}>
                        {done ? "✓ " : ""}{m?.label}
                      </p>
                      <p style={{ fontSize: 11, fontWeight: 800, color: done ? C.green : active ? (m?.color || C.graphite) : C.mid, margin: "2px 0 0" }}>
                        {fmt(parseFloat(e.amount))}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current entry header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: currentMethod?.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {currentMethod && <currentMethod.icon size={22} color={currentMethod.color} strokeWidth={2} />}
              </div>
              <div>
                {execEntries.length > 1 && (
                  <p style={{ fontSize: 12, color: C.mid, margin: "0 0 2px" }}>
                    Pagamento {execIndex + 1} de {execEntries.length}
                  </p>
                )}
                <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>
                  {fmt(entryAmount)} via {currentMethod?.label}
                </p>
              </div>
            </div>

            {/* ── Dinheiro ── */}
            {currentEntry?.methodId === "cash" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 6 }}>
                  Valor recebido (R$)
                </label>
                <input
                  type="number" min="0" step="0.01" placeholder="0,00"
                  value={cashReceived}
                  onChange={e => setCashReceived(e.target.value)}
                  autoFocus
                  style={{
                    width: "100%", padding: "11px 14px", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, fontSize: 20, fontWeight: 700,
                    color: C.graphite, background: C.surface, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = "#D97706"}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                {received >= entryAmount && (
                  <div style={{ marginTop: 12, padding: "11px 16px", borderRadius: 10, background: C.greenPale, border: `1px solid ${C.green}33`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Troco</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{fmt(cashChange)}</span>
                  </div>
                )}
                <button
                  onClick={() => confirmCurrentEntry(cashChange > 0 ? cashChange : 0)}
                  disabled={received < entryAmount}
                  style={{
                    width: "100%", marginTop: 14, padding: "12px", borderRadius: 10, border: "none",
                    background: received >= entryAmount ? "#D97706" : C.border,
                    color: received >= entryAmount ? "white" : C.mid,
                    fontSize: 13, fontWeight: 700, cursor: received >= entryAmount ? "pointer" : "not-allowed",
                    fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                >
                  <Check size={15} strokeWidth={2.5} />
                  Confirmar recebimento
                </button>
              </div>
            )}

            {/* ── PIX ── */}
            {currentEntry?.methodId === "pix" && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ background: C.gray, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                  <QrCode size={64} color={C.mid} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                  {pixKey ? (
                    <>
                      <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 6px" }}>Chave PIX</p>
                      <p style={{ fontSize: 14, fontWeight: 800, color: C.graphite, margin: 0, fontFamily: "monospace" }}>
                        {pixKey}
                      </p>
                    </>
                  ) : (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 4px" }}>QR Code (simulado)</p>
                      <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Configure sua chave PIX em Configurações → Integrações</p>
                    </>
                  )}
                </div>
                <button
                  onClick={() => confirmCurrentEntry(0)}
                  style={{
                    width: "100%", padding: "12px", borderRadius: 10, border: "none",
                    background: C.green, color: "white",
                    fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                  onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                >
                  <Check size={15} strokeWidth={2.5} />
                  Confirmar recebimento
                </button>
              </div>
            )}

            {/* ── Cartão ── */}
            {currentEntry?.methodId === "card" && (
              <div style={{ marginBottom: 20 }}>
                {cardState === "idle" && (
                  <div style={{ background: C.gray, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                    <CreditCard size={48} color={C.mid} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 4px" }}>
                      {mpIntegration ? "Pronto para enviar à maquininha" : "Insira o cartão na maquininha"}
                    </p>
                    <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
                      {mpIntegration ? `Device: ${mpIntegration.device_id}` : "Maquininha não configurada — use confirmação manual"}
                    </p>
                  </div>
                )}

                {cardState === "processing" && (
                  <div style={{ background: C.bluePale, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 14 }}>
                    <Loader2 size={40} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 4px" }}>Aguardando maquininha...</p>
                    <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Passe o cartão na maquininha</p>
                  </div>
                )}

                {cardState === "approved" && (
                  <div style={{ background: C.greenPale, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 14, border: `1px solid ${C.green}33` }}>
                    <Check size={40} color={C.green} strokeWidth={2.5} style={{ display: "block", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 14, fontWeight: 800, color: C.green, margin: 0 }}>Aprovado!</p>
                  </div>
                )}

                {cardState === "denied" && (
                  <div style={{ background: C.redPale, borderRadius: 12, padding: "20px", textAlign: "center", marginBottom: 14, border: "1px solid #EF444433" }}>
                    <AlertCircle size={40} color="#EF4444" strokeWidth={2} style={{ display: "block", margin: "0 auto 10px" }} />
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#EF4444", margin: "0 0 4px" }}>Pagamento negado</p>
                    <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Tente novamente ou use outro método</p>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mpIntegration && cardState === "idle" && (
                    <button
                      onClick={handleSendToMachine}
                      style={{
                        width: "100%", padding: "12px", borderRadius: 10, border: "none",
                        background: C.blue, color: "white",
                        fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      <Smartphone size={15} strokeWidth={2} />
                      Enviar para maquininha
                    </button>
                  )}

                  {cardState === "processing" && (
                    <button onClick={handleCancelMachine} style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.mid, cursor: "pointer", fontFamily: "inherit" }}>
                      Cancelar
                    </button>
                  )}

                  {cardState === "approved" && (
                    <button
                      onClick={() => confirmCurrentEntry(0, intentId)}
                      style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: C.green, color: "white", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
                      onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                    >
                      <Check size={15} strokeWidth={2.5} />
                      Confirmar
                    </button>
                  )}

                  {(cardState === "idle" || cardState === "denied") && (
                    <button
                      onClick={() => confirmCurrentEntry(0)}
                      style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.mid, cursor: "pointer", fontFamily: "inherit" }}
                      onMouseEnter={e => e.currentTarget.style.background = C.gray}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      Confirmar manualmente (aprovado)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Cancel button */}
            <button
              onClick={onClose}
              style={{ width: "100%", padding: "10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.mid, cursor: "pointer", fontFamily: "inherit" }}
              onMouseEnter={e => e.currentTarget.style.background = C.gray}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Cancelar cobrança
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const PDVPage = () => {
  const navigate  = useNavigate();
  const profile   = getProfile();
  const inputRef  = useRef(null);
  const customerTimerRef = useRef(null);
  const toast     = useToast();

  const [products,        setProducts       ] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [search,          setSearch         ] = useState("");
  const [cart,            setCart           ] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal,       setShowModal      ] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  const [selectedCustomer,      setSelectedCustomer     ] = useState(null);
  const [customerQuery,         setCustomerQuery        ] = useState("");
  const [customerResults,       setCustomerResults      ] = useState([]);
  const [customerDropdownOpen,  setCustomerDropdownOpen ] = useState(false);
  const [showNewCustomerModal,  setShowNewCustomerModal ] = useState(false);
  const [newCustName,           setNewCustName          ] = useState("");
  const [newCustCPF,            setNewCustCPF           ] = useState("");
  const [newCustPhone,          setNewCustPhone         ] = useState("");
  const [savingCustomer,        setSavingCustomer       ] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login", { replace: true }); return; }
    inputRef.current?.focus();
    getProducts()
      .then(data => setProducts(
        (data || []).filter(p => p.active).map(p => ({ id: p.id, name: p.name, price: p.sale_price, unit: p.unit || "UN", stock: p.inventory?.quantity ?? 0 }))
      ))
      .catch(() => toast.error("Falha ao carregar produtos."))
      .finally(() => setProductsLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPayment?.id !== "prazo" || customerQuery.length < 1) {
      setCustomerResults([]);
      return;
    }
    if (customerTimerRef.current) clearTimeout(customerTimerRef.current);
    customerTimerRef.current = setTimeout(() => {
      searchCustomers(customerQuery).then(r => setCustomerResults(r || [])).catch(() => {});
    }, 300);
    return () => { if (customerTimerRef.current) clearTimeout(customerTimerRef.current); };
  }, [customerQuery, selectedPayment]);

  const handleSelectPayment = (method) => {
    setSelectedPayment(method);
    if (!method || method.id !== "prazo") {
      setSelectedCustomer(null);
      setCustomerQuery("");
      setCustomerResults([]);
    }
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustName.trim()) return;
    setSavingCustomer(true);
    try {
      const c = await createCustomer({ name: newCustName.trim(), cpf: newCustCPF.trim(), phone: newCustPhone.trim(), email: "" });
      setSelectedCustomer(c);
      setShowNewCustomerModal(false);
      setCustomerDropdownOpen(false);
      setCustomerQuery("");
      setNewCustName(""); setNewCustCPF(""); setNewCustPhone("");
    } catch (e) {
      toast.error("Não foi possível cadastrar o cliente.");
    } finally {
      setSavingCustomer(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        if (existing.qty >= product.stock) {
          toast.warning(`Estoque esgotado para ${product.name}.`);
          return prev;
        }
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
    inputRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id !== id) return i;
      if (delta > 0 && i.qty >= i.stock) {
        toast.warning(`Estoque esgotado para ${i.name}.`);
        return i;
      }
      return { ...i, qty: Math.max(1, i.qty + delta) };
    }));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setSelectedPayment(null);
    setSelectedCustomer(null);
    setCustomerQuery("");
    setConfirmingClear(false);
  };

  const filteredProducts = search.length > 1
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredProducts.length === 1) addToCart(filteredProducts[0]);
  };

  const total      = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty   = cart.reduce((sum, i) => sum + i.qty, 0);
  const canFinalize = cart.length > 0 && selectedPayment !== null;

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <PDVHeader
        companyName={profile?.companyName || ""}
        userName={profile?.userName || ""}
        onExit={() => navigate("/dashboard")}
      />

      <div style={{ display: "flex", height: "calc(100vh - 52px)", marginTop: 52 }}>

        {/* ── Catálogo ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "12px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface, position: "sticky", top: 0, zIndex: 10 }}>
            <div style={{ position: "relative" }}>
              <Search size={16} color={C.mid} strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar produto ou escanear código de barras…"
                style={{
                  width: "100%", padding: "11px 36px 11px 40px",
                  borderRadius: 10, border: `1.5px solid ${C.border}`,
                  fontSize: 14, color: C.graphite, background: C.surface,
                  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
              {search && (
                <button onClick={() => { setSearch(""); inputRef.current?.focus(); }} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  <X size={14} color={C.mid} />
                </button>
              )}
            </div>
          </div>

          <div style={{ padding: "12px 24px 28px", flex: 1 }}>
            {productsLoading ? (
              <div style={{ textAlign: "center", padding: "56px 0" }}>
                <Loader2 size={28} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite", display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>Carregando produtos...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 0", color: C.mid }}>
                <Package size={38} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, margin: 0 }}>
                  {search.length > 1 ? <>Nenhum produto encontrado para <strong>"{search}"</strong></> : "Nenhum produto cadastrado"}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 10 }}>
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} onAdd={addToCart} />)}
              </div>
            )}
          </div>
        </div>

        {/* ── Carrinho + Pagamento ── */}
        <div style={{ width: 360, flexShrink: 0, borderLeft: `1px solid ${C.border}`, background: C.surface, display: "flex", flexDirection: "column" }}>

          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingCart size={16} color={C.mid} strokeWidth={2} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.graphite }}>
                  {totalQty === 0 ? "Carrinho vazio" : `${totalQty} ${totalQty === 1 ? "item" : "itens"}`}
                </span>
              </div>
              {cart.length > 0 && (
                confirmingClear ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 11, color: C.mid }}>Limpar tudo?</span>
                    <button onClick={clearCart} style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Sim</button>
                    <button onClick={() => setConfirmingClear(false)} style={{ fontSize: 12, fontWeight: 600, color: C.mid, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Não</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmingClear(true)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#EF4444", fontFamily: "inherit" }}>
                    Limpar
                  </button>
                )
              )}
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: C.mid }}>
                <ShoppingCart size={40} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Nenhum item</p>
                <p style={{ fontSize: 12, margin: "4px 0 0" }}>Selecione produtos ao lado</p>
              </div>
            ) : (
              cart.map(item => <CartItem key={item.id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />)
            )}
          </div>

          <div style={{ padding: "16px 20px", borderTop: `2px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.graphite }}>Total</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: cart.length > 0 ? C.green : C.mid }}>
                {fmt(total)}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: C.mid, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Pagamento
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <PaymentBtn key={m.id} method={m} selected={selectedPayment?.id === m.id} onSelect={handleSelectPayment} />
                ))}
              </div>
              <hr style={{ border: 0, borderTop: `1px solid ${C.border}`, margin: "12px 0" }} />
              <button
                onClick={() => handleSelectPayment(selectedPayment?.id === "prazo" ? null : PRAZO_METHOD)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 10,
                  border: selectedPayment?.id === "prazo" ? `2px solid #B45309` : `1.5px solid ${C.border}`,
                  background: selectedPayment?.id === "prazo" ? C.amberPale : "transparent",
                  color: selectedPayment?.id === "prazo" ? "#B45309" : C.mid,
                  fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                <Clock size={13} strokeWidth={2} />
                A Prazo
              </button>
            </div>

            {selectedPayment?.id === "prazo" && (
              <div style={{ marginBottom: 14, position: "relative" }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: C.mid, margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Cliente
                </p>
                {selectedCustomer ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: C.amberPale, borderRadius: 9, border: "1px solid #D9770633" }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>{selectedCustomer.name}</span>
                    <button onClick={() => { setSelectedCustomer(null); setCustomerQuery(""); }} style={{ background: "none", border: "none", cursor: "pointer", padding: 2 }}>
                      <X size={13} color={C.mid} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      value={customerQuery}
                      onChange={e => { setCustomerQuery(e.target.value); setCustomerDropdownOpen(true); }}
                      onFocus={() => setCustomerDropdownOpen(true)}
                      placeholder="Buscar por nome ou CPF..."
                      style={{ width: "100%", padding: "8px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.graphite, background: C.surface, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                      onBlur={() => setTimeout(() => setCustomerDropdownOpen(false), 150)}
                    />
                    {customerDropdownOpen && customerQuery.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 20, maxHeight: 200, overflowY: "auto" }}>
                        {customerResults.map(c => (
                          <button key={c.id} onMouseDown={() => { setSelectedCustomer(c); setCustomerDropdownOpen(false); setCustomerQuery(""); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: C.graphite, fontFamily: "inherit" }}
                            onMouseEnter={e => e.currentTarget.style.background = C.gray}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}
                          >
                            {c.name}{c.cpf ? ` · ${c.cpf}` : ""}
                          </button>
                        ))}
                        <button onMouseDown={() => { setShowNewCustomerModal(true); setCustomerDropdownOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 6, width: "100%", textAlign: "left", padding: "9px 14px", background: "none", border: "none", borderTop: `1px solid ${C.border}`, cursor: "pointer", fontSize: 13, fontWeight: 600, color: C.blue, fontFamily: "inherit" }}
                          onMouseEnter={e => e.currentTarget.style.background = C.bluePale}
                          onMouseLeave={e => e.currentTarget.style.background = "none"}
                        >
                          <UserPlus size={13} strokeWidth={2} /> Cadastrar cliente
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            <button
              onClick={() => setShowModal(true)}
              disabled={!canFinalize}
              style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: canFinalize ? C.green : C.border,
                color: canFinalize ? "white" : C.mid,
                fontSize: 14, fontWeight: 800,
                cursor: canFinalize ? "pointer" : "not-allowed",
                fontFamily: "inherit", transition: "opacity 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
              onMouseEnter={e => { if (canFinalize) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
            >
              <Check size={17} strokeWidth={2.5} />
              Finalizar Venda
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <PaymentModal
          method={selectedPayment}
          total={total}
          selectedCustomer={selectedCustomer}
          onClose={() => setShowModal(false)}
          onSuccess={(execEntries) => {
            const items = cart.map(i => ({ product_id: i.id, quantity: i.qty }));
            const payments = (execEntries || []).map(e => ({
              method: e.methodId === "card" ? "credit" : e.methodId,
              amount: parseFloat(e.amount),
              ...(e.transactionId && { transaction_id: e.transactionId }),
            }));
            const saleInput = {
              items, payments, discount: 0, note: "",
              ...(selectedCustomer?.id && { customer_id: selectedCustomer.id }),
              ...(selectedCustomer?.name && { customer_name: selectedCustomer.name }),
            };
            registerSale(saleInput)
              .catch(() => toast.error("Venda paga mas não registrada. Verifique o histórico."));
            clearCart();
            setShowModal(false);
          }}
        />
      )}

      {showNewCustomerModal && (
        <div onClick={() => setShowNewCustomerModal(false)} style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div onClick={e => e.stopPropagation()} style={{ background: C.surface, borderRadius: 16, padding: 28, width: 360, boxShadow: "0 12px 48px rgba(0,0,0,0.18)", border: `1px solid ${C.border}`, boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.amberPale, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <UserPlus size={18} color="#B45309" strokeWidth={2} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>Novo Cliente</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 4 }}>Nome *</label>
                <input value={newCustName} onChange={e => setNewCustName(e.target.value)} placeholder="Nome completo" autoFocus style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 4 }}>CPF</label>
                <input value={newCustCPF} onChange={e => setNewCustCPF(e.target.value)} placeholder="000.000.000-00" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 4 }}>Telefone</label>
                <input value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} placeholder="(00) 00000-0000" style={{ width: "100%", padding: "9px 12px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
              <button onClick={() => { setShowNewCustomerModal(false); setNewCustName(""); setNewCustCPF(""); setNewCustPhone(""); }} style={{ flex: 1, padding: "10px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 700, color: C.mid, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
              <button onClick={handleSaveNewCustomer} disabled={!newCustName.trim() || savingCustomer} style={{ flex: 2, padding: "10px", borderRadius: 10, border: "none", background: newCustName.trim() ? "#B45309" : C.border, color: newCustName.trim() ? "white" : C.mid, fontSize: 13, fontWeight: 700, cursor: newCustName.trim() ? "pointer" : "not-allowed", fontFamily: "inherit" }}>
                {savingCustomer ? "Salvando..." : "Cadastrar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDVPage;
