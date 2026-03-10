import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Plus, Minus, Trash2, ShoppingCart,
  QrCode, CreditCard, Banknote, Wallet, Check, Package, LogOut,
} from "lucide-react";
import C from "../../theme/colors";
import { isAuthenticated, getProfile } from "../../hooks/useAuth";

const fmt = (n) => `R$ ${n.toFixed(2).replace(".", ",")}`;

// ── Constants ──────────────────────────────────────────────────────────────────

const MOCK_PRODUCTS = [
  { id:  1, name: "Água Mineral 500ml",      price:  2.50, unit: "UN",  category: "Bebidas"    },
  { id:  2, name: "Refrigerante Lata 350ml", price:  4.00, unit: "UN",  category: "Bebidas"    },
  { id:  3, name: "Suco de Laranja 1L",      price:  7.90, unit: "UN",  category: "Bebidas"    },
  { id:  4, name: "Cerveja Lata 350ml",      price:  4.50, unit: "UN",  category: "Bebidas"    },
  { id:  5, name: "Pão Francês",             price:  0.80, unit: "UN",  category: "Padaria"    },
  { id:  6, name: "Croissant",               price:  4.50, unit: "UN",  category: "Padaria"    },
  { id:  7, name: "Bolo Fatia",              price:  6.00, unit: "UN",  category: "Padaria"    },
  { id:  8, name: "Leite Integral 1L",       price:  4.50, unit: "UN",  category: "Laticínios" },
  { id:  9, name: "Iogurte Natural 170g",    price:  3.20, unit: "UN",  category: "Laticínios" },
  { id: 10, name: "Queijo Mussarela 200g",   price:  9.90, unit: "PCT", category: "Laticínios" },
  { id: 11, name: "Arroz Branco 5kg",        price: 24.90, unit: "PCT", category: "Mercearia"  },
  { id: 12, name: "Feijão Carioca 1kg",      price:  8.90, unit: "PCT", category: "Mercearia"  },
  { id: 13, name: "Açúcar Cristal 1kg",      price:  3.90, unit: "PCT", category: "Mercearia"  },
  { id: 14, name: "Café Torrado 500g",       price: 15.90, unit: "PCT", category: "Mercearia"  },
  { id: 15, name: "Macarrão Espaguete 500g", price:  5.50, unit: "PCT", category: "Mercearia"  },
  { id: 16, name: "Óleo de Soja 900ml",      price:  6.90, unit: "UN",  category: "Mercearia"  },
  { id: 17, name: "Sabonete 90g",            price:  3.50, unit: "UN",  category: "Higiene"    },
  { id: 18, name: "Shampoo 200ml",           price: 12.90, unit: "UN",  category: "Higiene"    },
  { id: 19, name: "Papel Higiênico 4un",     price:  8.90, unit: "PCT", category: "Higiene"    },
  { id: 20, name: "Detergente 500ml",        price:  2.80, unit: "UN",  category: "Limpeza"    },
  { id: 21, name: "Desinfetante 750ml",      price:  4.90, unit: "UN",  category: "Limpeza"    },
  { id: 22, name: "Biscoito Recheado 130g",  price:  3.50, unit: "UN",  category: "Snacks"     },
  { id: 23, name: "Barra de Chocolate 80g",  price:  5.90, unit: "UN",  category: "Snacks"     },
  { id: 24, name: "Salgadinho 50g",          price:  2.90, unit: "UN",  category: "Snacks"     },
];

const CATEGORIES = ["Todos", "Bebidas", "Padaria", "Laticínios", "Mercearia", "Higiene", "Limpeza", "Snacks"];

// Métodos base: usados nos botões do painel e nas entradas do Misto
const PAYMENT_METHODS_BASE = [
  { id: "pix",  label: "PIX",     icon: QrCode,     color: C.green,   bg: C.greenPale },
  { id: "card", label: "Cartão",  icon: CreditCard, color: C.blue,    bg: C.bluePale  },
  { id: "cash", label: "Dinheiro",icon: Banknote,   color: "#D97706", bg: C.amberPale },
];

// Todos os métodos exibidos no painel direito
const PAYMENT_METHODS = [
  ...PAYMENT_METHODS_BASE,
  { id: "mixed", label: "Misto", icon: Wallet, color: "#7C3AED", bg: C.purplePale },
];

// ── PDV Header (mínimo, 52px) ──────────────────────────────────────────────────

const PDVHeader = ({ companyName, userName, onExit }) => (
  <header style={{
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    height: 52,
    background: C.surface, borderBottom: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    display: "flex", alignItems: "center",
    padding: "0 24px", justifyContent: "space-between",
  }}>
    {/* Esquerda: logo + empresa */}
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
      {companyName && (
        <span style={{ fontSize: 12, color: C.mid }}>· {companyName}</span>
      )}
    </div>

    {/* Direita: usuário + sair */}
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      {userName && (
        <span style={{ fontSize: 12, color: C.mid }}>{userName}</span>
      )}
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

const ProductCard = ({ product, onAdd }) => (
  <button
    onClick={() => onAdd(product)}
    style={{
      display: "flex", flexDirection: "column", gap: 8,
      padding: "14px 16px", borderRadius: 12,
      background: C.surface, border: `1.5px solid ${C.border}`,
      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
      transition: "all 0.15s", width: "100%", boxSizing: "border-box",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = C.blue + "55";
      e.currentTarget.style.background = C.bluePale;
      e.currentTarget.style.transform = "translateY(-1px)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.background = C.surface;
      e.currentTarget.style.transform = "none";
    }}
  >
    <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: 0, lineHeight: 1.35, flex: 1 }}>
      {product.name}
    </p>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 15, fontWeight: 800, color: C.green }}>{fmt(product.price)}</span>
      <span style={{
        padding: "2px 7px", borderRadius: 6,
        background: C.gray, fontSize: 10, fontWeight: 600, color: C.mid,
      }}>
        {product.unit}
      </span>
    </div>
  </button>
);

const CartItem = ({ item, onUpdateQty, onRemove }) => (
  <div style={{
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
  }}>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{
        fontSize: 13, fontWeight: 600, color: C.graphite,
        margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>
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
      <QtyBtn onClick={() => onUpdateQty(item.id, 1)}>
        <Plus size={12} strokeWidth={2.5} color={C.graphite} />
      </QtyBtn>
      <button
        onClick={() => onRemove(item.id)}
        style={{
          width: 28, height: 28, borderRadius: 7, border: "none",
          background: C.redPale, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", marginLeft: 4,
        }}
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

const PaymentModal = ({ method, total, onClose, onSuccess }) => {
  // Cash
  const [cashReceived, setCashReceived] = useState("");
  // Mixed: lista de entidades de pagamento
  const [paymentEntries, setPaymentEntries] = useState([{ id: 1, methodId: null, amount: "" }]);
  // Success
  const [success, setSuccess] = useState(false);
  const [successChange, setSuccessChange] = useState(0);

  const Icon = method?.icon;
  const received   = parseFloat(String(cashReceived).replace(",", ".")) || 0;
  const change     = received - total;

  // Mixed: cálculo corrente
  const mixedSum  = paymentEntries.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
  const mixedDiff = mixedSum - total;
  const mixedOk   = Math.abs(mixedDiff) < 0.01;
  const mixedStatus = mixedOk
    ? { text: "Total completo ✓", color: C.green }
    : mixedDiff < 0
      ? { text: `Faltam ${fmt(Math.abs(mixedDiff))}`, color: "#EF4444" }
      : { text: `Excede em ${fmt(Math.abs(mixedDiff))}`, color: "#D97706" };

  const mixedCanConfirm = mixedOk && paymentEntries.every(e => e.methodId && parseFloat(e.amount) > 0);

  // Entry management
  const addEntry    = () => setPaymentEntries(p => [...p, { id: Date.now(), methodId: null, amount: "" }]);
  const removeEntry = (id) => { if (paymentEntries.length > 1) setPaymentEntries(p => p.filter(e => e.id !== id)); };
  const updateEntry = (id, field, val) => setPaymentEntries(p => p.map(e => e.id === id ? { ...e, [field]: val } : e));

  const canConfirm = () => {
    if (!method) return false;
    if (method.id === "cash")  return received >= total;
    if (method.id === "mixed") return mixedCanConfirm;
    return true;
  };

  const handleConfirm = () => {
    const troco = method?.id === "cash" ? change : 0;
    setSuccessChange(troco);
    setSuccess(true);
    // Para dinheiro com troco: o caixa fecha manualmente após dar o troco.
    // Para outros métodos: fecha automático em 2,5s.
    if (method?.id !== "cash" || troco <= 0) {
      setTimeout(onSuccess, 2500);
    }
  };

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
          width: 420, maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
          border: `1px solid ${C.border}`,
          boxSizing: "border-box",
        }}
      >
        {success ? (
          /* ── Estado de sucesso ── */
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", background: C.greenPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Check size={28} color={C.green} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>
              Venda registrada!
            </p>
            <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>
              {fmt(total)} via {method?.label}
            </p>

            {/* Troco — visível apenas para Dinheiro com troco > 0 */}
            {method?.id === "cash" && successChange > 0 && (
              <div style={{
                marginTop: 20, padding: "16px 20px", borderRadius: 14,
                background: C.greenPale, border: `1px solid ${C.green}33`,
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.green }}>Troco a dar</span>
                <span style={{ fontSize: 28, fontWeight: 800, color: C.green }}>
                  {fmt(successChange)}
                </span>
              </div>
            )}

            <button
              onClick={onSuccess}
              style={{
                marginTop: 24, padding: "11px 32px", borderRadius: 10,
                background: C.green, color: "white",
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
            >
              {method?.id === "cash" && successChange > 0 ? "Troco entregue · Fechar" : "Fechar"}
            </button>
          </div>
        ) : (
          <>
            {/* ── Header do modal ── */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13, background: method?.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {Icon && <Icon size={22} color={method.color} strokeWidth={2} />}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>
                  Pagamento via {method?.label}
                </p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
                  Total: <strong style={{ color: C.green }}>{fmt(total)}</strong>
                </p>
              </div>
            </div>

            {/* ── PIX ── */}
            {method?.id === "pix" && (
              <div style={{
                background: C.gray, borderRadius: 12, padding: "24px",
                textAlign: "center", marginBottom: 20,
              }}>
                <QrCode size={80} color={C.mid} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 4px" }}>
                  QR Code de pagamento (simulado)
                </p>
                <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
                  Aguardando confirmação do banco...
                </p>
              </div>
            )}

            {/* ── Cartão ── */}
            {method?.id === "card" && (
              <div style={{
                background: C.gray, borderRadius: 12, padding: "24px",
                textAlign: "center", marginBottom: 20,
              }}>
                <CreditCard size={48} color={C.mid} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 4px" }}>
                  Aproxime ou insira o cartão
                </p>
                <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
                  Maquininha pronta para leitura (simulado)
                </p>
              </div>
            )}

            {/* ── Dinheiro ── */}
            {method?.id === "cash" && (
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
                    width: "100%", padding: "11px 14px",
                    borderRadius: 10, border: `1.5px solid ${C.border}`,
                    fontSize: 20, fontWeight: 700, color: C.graphite,
                    background: C.surface, outline: "none",
                    fontFamily: "inherit", boxSizing: "border-box",
                  }}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border}
                />
                {received >= total && (
                  <div style={{
                    marginTop: 12, padding: "11px 16px", borderRadius: 10,
                    background: C.greenPale, border: `1px solid ${C.green}33`,
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                  }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.green }}>Troco</span>
                    <span style={{ fontSize: 20, fontWeight: 800, color: C.green }}>{fmt(change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Misto: entidades de pagamento ── */}
            {method?.id === "mixed" && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: C.mid, margin: "0 0 12px" }}>
                  Adicione quantos pagamentos precisar. A soma deve cobrir{" "}
                  <strong style={{ color: C.graphite }}>{fmt(total)}</strong>.
                </p>

                {/* Lista de entradas */}
                <div style={{ maxHeight: 300, overflowY: "auto", marginBottom: 10 }}>
                  {paymentEntries.map((entry, idx) => {
                    const info = PAYMENT_METHODS_BASE.find(m => m.id === entry.methodId);
                    return (
                      <div
                        key={entry.id}
                        style={{
                          background: C.gray, borderRadius: 12, padding: "12px 14px",
                          marginBottom: 8, border: `1px solid ${info ? info.color + "33" : C.border}`,
                        }}
                      >
                        {/* Título + remover */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: C.graphite }}>
                            Pagamento {idx + 1}
                          </span>
                          {paymentEntries.length > 1 && (
                            <button
                              onClick={() => removeEntry(entry.id)}
                              style={{
                                width: 22, height: 22, borderRadius: 6, border: "none",
                                background: C.redPale, cursor: "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}
                            >
                              <X size={11} strokeWidth={2.5} color="#EF4444" />
                            </button>
                          )}
                        </div>

                        {/* Seletor de método */}
                        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                          {PAYMENT_METHODS_BASE.map(m => {
                            const sel = entry.methodId === m.id;
                            const MIcon = m.icon;
                            return (
                              <button
                                key={m.id}
                                onClick={() => updateEntry(entry.id, "methodId", m.id)}
                                style={{
                                  flex: 1, padding: "7px 4px",
                                  borderRadius: 9,
                                  border: `1.5px solid ${sel ? m.color : C.border}`,
                                  background: sel ? m.bg : C.surface,
                                  display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.12s",
                                }}
                              >
                                <MIcon size={14} color={sel ? m.color : C.mid} strokeWidth={2} />
                                <span style={{ fontSize: 11, fontWeight: 700, color: sel ? m.color : C.mid }}>
                                  {m.label}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* Campo de valor */}
                        <input
                          type="number" min="0" step="0.01" placeholder="0,00"
                          value={entry.amount}
                          onChange={e => updateEntry(entry.id, "amount", e.target.value)}
                          style={{
                            width: "100%", padding: "9px 12px",
                            borderRadius: 9, border: `1.5px solid ${C.border}`,
                            fontSize: 15, fontWeight: 700, color: C.graphite,
                            background: C.surface, outline: "none",
                            fontFamily: "inherit", boxSizing: "border-box",
                          }}
                          onFocus={e => e.target.style.borderColor = info?.color || C.blue}
                          onBlur={e => e.target.style.borderColor = C.border}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Botão adicionar entrada */}
                <button
                  onClick={addEntry}
                  style={{
                    width: "100%", padding: "9px",
                    borderRadius: 9, border: `1.5px dashed ${C.border}`,
                    background: "transparent",
                    fontSize: 12, fontWeight: 700, color: C.mid,
                    cursor: "pointer", fontFamily: "inherit", marginBottom: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                    transition: "all 0.12s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.color = C.blue; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.mid; }}
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Adicionar pagamento
                </button>

                {/* Status do total */}
                <div style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 14px", borderRadius: 10, background: C.gray,
                }}>
                  <span style={{ fontSize: 12, color: C.mid }}>
                    Informado: <strong style={{ color: C.graphite }}>{fmt(mixedSum)}</strong>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: mixedStatus.color }}>
                    {mixedStatus.text}
                  </span>
                </div>
              </div>
            )}

            {/* ── Ações ── */}
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, padding: "11px", borderRadius: 10,
                  border: `1.5px solid ${C.border}`, background: "transparent",
                  fontSize: 13, fontWeight: 700, color: C.graphite,
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={!canConfirm()}
                style={{
                  flex: 2, padding: "11px", borderRadius: 10, border: "none",
                  background: canConfirm() ? (method?.color || C.green) : C.border,
                  color: canConfirm() ? "white" : C.mid,
                  fontSize: 13, fontWeight: 700,
                  cursor: canConfirm() ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { if (canConfirm()) e.currentTarget.style.opacity = "0.88"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              >
                <Check size={15} strokeWidth={2.5} />
                Confirmar Pagamento
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────

const PDVPage = () => {
  const navigate  = useNavigate();
  const profile   = getProfile();
  const inputRef  = useRef(null);

  const [search,          setSearch         ] = useState("");
  const [activeCategory,  setActiveCategory ] = useState("Todos");
  const [cart,            setCart           ] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal,       setShowModal      ] = useState(false);
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login", { replace: true }); return; }
    inputRef.current?.focus();
  }, []);

  // ── Cart operations ──

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
    inputRef.current?.focus();
  };

  // Clica em − nunca remove — mantém qty em 1. Remoção explícita via lixeira.
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setSelectedPayment(null);
    setConfirmingClear(false);
  };

  // ── Busca + Enter para leitor de código de barras ──

  const filteredProducts = search.length > 1
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : MOCK_PRODUCTS.filter(p => activeCategory === "Todos" || p.category === activeCategory);

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && filteredProducts.length === 1) {
      addToCart(filteredProducts[0]);
    }
  };

  // ── Derived ──

  const total      = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty   = cart.reduce((sum, i) => sum + i.qty, 0);
  const canFinalize = cart.length > 0 && selectedPayment !== null;

  // ── Render ──

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <PDVHeader
        companyName={profile?.companyName || ""}
        userName={profile?.userName || ""}
        onExit={() => navigate("/dashboard")}
      />

      <div style={{ display: "flex", height: "calc(100vh - 52px)", marginTop: 52 }}>

        {/* ── Coluna esquerda: catálogo ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Barra de busca sticky */}
          <div style={{
            padding: "12px 24px",
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <div style={{ position: "relative" }}>
              <Search
                size={16} color={C.mid} strokeWidth={2}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
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
                <button
                  onClick={() => { setSearch(""); inputRef.current?.focus(); }}
                  style={{
                    position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <X size={14} color={C.mid} />
                </button>
              )}
            </div>
          </div>

          {/* Filtros de categoria */}
          {!search && (
            <div style={{ padding: "12px 24px 4px", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: "5px 14px", borderRadius: 20,
                    background: activeCategory === cat ? C.blue : C.surface,
                    color: activeCategory === cat ? "white" : C.mid,
                    border: `1.5px solid ${activeCategory === cat ? C.blue : C.border}`,
                    fontSize: 12, fontWeight: 600, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Grid de produtos */}
          <div style={{ padding: "12px 24px 28px", flex: 1 }}>
            {search.length > 1 && filteredProducts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "56px 0", color: C.mid }}>
                <Package size={38} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, margin: 0 }}>
                  Nenhum produto encontrado para <strong>"{search}"</strong>
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 10,
              }}>
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Coluna direita: carrinho + pagamento ── */}
        <div style={{
          width: 360, flexShrink: 0,
          borderLeft: `1px solid ${C.border}`,
          background: C.surface,
          display: "flex", flexDirection: "column",
        }}>

          {/* Header do carrinho com confirmação de limpar */}
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
                    <button
                      onClick={clearCart}
                      style={{ fontSize: 12, fontWeight: 700, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Sim
                    </button>
                    <button
                      onClick={() => setConfirmingClear(false)}
                      style={{ fontSize: 12, fontWeight: 600, color: C.mid, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Não
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingClear(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#EF4444", fontFamily: "inherit" }}
                  >
                    Limpar
                  </button>
                )
              )}
            </div>
          </div>

          {/* Itens do carrinho */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {cart.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 24px", color: C.mid }}>
                <ShoppingCart size={40} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Nenhum item</p>
                <p style={{ fontSize: 12, margin: "4px 0 0" }}>Selecione produtos ao lado</p>
              </div>
            ) : (
              cart.map(item => (
                <CartItem key={item.id} item={item} onUpdateQty={updateQty} onRemove={removeItem} />
              ))
            )}
          </div>

          {/* Total + forma de pagamento + finalizar */}
          <div style={{ padding: "16px 20px", borderTop: `2px solid ${C.border}` }}>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.graphite }}>Total</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: cart.length > 0 ? C.green : C.mid }}>
                {fmt(total)}
              </span>
            </div>

            <div style={{ marginBottom: 14 }}>
              <p style={{
                fontSize: 11, fontWeight: 600, color: C.mid,
                margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.5px",
              }}>
                Pagamento
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {PAYMENT_METHODS.map(m => (
                  <PaymentBtn
                    key={m.id}
                    method={m}
                    selected={selectedPayment?.id === m.id}
                    onSelect={setSelectedPayment}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowModal(true)}
              disabled={!canFinalize}
              style={{
                width: "100%", padding: "14px",
                borderRadius: 12, border: "none",
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
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            clearCart();
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
};

export default PDVPage;
