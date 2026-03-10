import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Search, X, Plus, Minus, Trash2, ShoppingCart,
  QrCode, CreditCard, Banknote, Wallet, Check, Package,
} from "lucide-react";
import C from "../../theme/colors";
import { isAuthenticated } from "../../hooks/useAuth";
import DashboardHeader from "../Dashboard/components/DashboardHeader";

const fmt = (n) => `R$ ${n.toFixed(2).replace(".", ",")}`;

// ── Mock data ──────────────────────────────────────────────────────────────────

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

const PAYMENT_METHODS = [
  { id: "pix",   label: "PIX",      icon: QrCode,     color: C.green,   bg: C.greenPale  },
  { id: "card",  label: "Cartão",   icon: CreditCard, color: C.blue,    bg: C.bluePale   },
  { id: "cash",  label: "Dinheiro", icon: Banknote,   color: "#D97706", bg: C.amberPale  },
  { id: "mixed", label: "Misto",    icon: Wallet,     color: "#7C3AED", bg: C.purplePale },
];

// ── Small components ───────────────────────────────────────────────────────────

const QtyBtn = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      width: 26, height: 26, borderRadius: 7,
      border: `1.5px solid ${C.border}`,
      background: C.surface, cursor: "pointer",
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
      display: "flex", flexDirection: "column", gap: 6,
      padding: "12px 14px", borderRadius: 12,
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
    <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: 0, lineHeight: 1.3 }}>
      {product.name}
    </p>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, fontWeight: 800, color: C.green }}>{fmt(product.price)}</span>
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
      <QtyBtn onClick={() => onUpdateQty(item.id, -1)}>
        <Minus size={12} strokeWidth={2.5} color={C.graphite} />
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
          width: 26, height: 26, borderRadius: 7, border: "none",
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
  const [cashReceived, setCashReceived] = useState("");
  const [cardAmount, setCardAmount] = useState("");
  const [success, setSuccess] = useState(false);
  const Icon = method?.icon;

  const received = parseFloat(String(cashReceived).replace(",", ".")) || 0;
  const change = received - total;

  const canConfirm = () => {
    if (!method) return false;
    if (method.id === "cash") return received >= total;
    return true;
  };

  const handleConfirm = () => {
    setSuccess(true);
    setTimeout(onSuccess, 2000);
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
          width: 400, boxShadow: "0 12px 48px rgba(0,0,0,0.18)",
          border: `1px solid ${C.border}`,
        }}
      >
        {success ? (
          /* Success state */
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{
              width: 60, height: 60, borderRadius: "50%", background: C.greenPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px",
            }}>
              <Check size={28} color={C.green} strokeWidth={2.5} />
            </div>
            <p style={{ fontSize: 20, fontWeight: 800, color: C.graphite, margin: "0 0 6px" }}>
              Venda registrada!
            </p>
            <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>
              {fmt(total)} via {method?.label}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 13,
                background: method?.bg,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {Icon && <Icon size={22} color={method.color} strokeWidth={2} />}
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>
                  Pagamento via {method?.label}
                </p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
                  Total:{" "}
                  <strong style={{ color: C.green }}>{fmt(total)}</strong>
                </p>
              </div>
            </div>

            {/* PIX */}
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

            {/* Cartão */}
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

            {/* Dinheiro */}
            {method?.id === "cash" && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 6 }}>
                  Valor recebido (R$)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0,00"
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
                    <span style={{ fontSize: 18, fontWeight: 800, color: C.green }}>{fmt(change)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Misto */}
            {method?.id === "mixed" && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontSize: 12, color: C.mid, margin: "0 0 14px" }}>
                  Divida {fmt(total)} entre as formas:
                </p>
                <div style={{ display: "flex", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 6 }}>
                      Cartão (R$)
                    </label>
                    <input
                      type="number" min="0" step="0.01" placeholder="0,00"
                      value={cardAmount}
                      onChange={e => setCardAmount(e.target.value)}
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 9,
                        border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 600,
                        color: C.graphite, background: C.surface, outline: "none",
                        fontFamily: "inherit", boxSizing: "border-box",
                      }}
                      onFocus={e => e.target.style.borderColor = C.blue}
                      onBlur={e => e.target.style.borderColor = C.border}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.graphite, display: "block", marginBottom: 6 }}>
                      Dinheiro (R$)
                    </label>
                    <input
                      type="number" min="0" step="0.01" placeholder="0,00"
                      value={cardAmount !== "" ? Math.max(0, total - (parseFloat(cardAmount) || 0)).toFixed(2) : ""}
                      readOnly
                      style={{
                        width: "100%", padding: "9px 12px", borderRadius: 9,
                        border: `1.5px solid ${C.border}`, fontSize: 15, fontWeight: 600,
                        color: C.mid, background: C.gray, outline: "none",
                        fontFamily: "inherit", boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
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
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [cart, setCart] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/login", { replace: true }); return; }
    inputRef.current?.focus();
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...product, qty: 1 }];
    });
    setSearch("");
    inputRef.current?.focus();
  };

  const updateQty = (id, delta) => {
    setCart(prev => {
      const item = prev.find(i => i.id === id);
      if (item && item.qty + delta < 1) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i);
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setSelectedPayment(null);
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  const canFinalize = cart.length > 0 && selectedPayment !== null;

  const filteredProducts = search.length > 1
    ? MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : MOCK_PRODUCTS.filter(p => activeCategory === "Todos" || p.category === activeCategory);

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />

      <div style={{ display: "flex", height: "calc(100vh - 64px)", marginTop: 64 }}>

        {/* ── Left: catalog ── */}
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>

          {/* Sticky top bar: back + search */}
          <div style={{
            padding: "14px 24px",
            borderBottom: `1px solid ${C.border}`,
            background: C.surface,
            display: "flex", alignItems: "center", gap: 14,
            position: "sticky", top: 0, zIndex: 10,
          }}>
            <Link to="/dashboard" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 9,
              background: C.surface, border: `1px solid ${C.border}`,
              textDecoration: "none", flexShrink: 0,
            }}>
              <ArrowLeft size={17} strokeWidth={2} color={C.mid} />
            </Link>

            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={16} color={C.mid} strokeWidth={2}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              />
              <input
                ref={inputRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar produto por nome ou código de barras..."
                style={{
                  width: "100%", padding: "10px 36px 10px 38px",
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

          {/* Category pills */}
          {!search && (
            <div style={{ padding: "14px 24px 2px", display: "flex", gap: 8, flexWrap: "wrap" }}>
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

          {/* Product grid */}
          <div style={{ padding: "14px 24px 28px", flex: 1 }}>
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
                gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))",
                gap: 10,
              }}>
                {filteredProducts.map(p => (
                  <ProductCard key={p.id} product={p} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: cart + payment ── */}
        <div style={{
          width: 360, flexShrink: 0,
          borderLeft: `1px solid ${C.border}`,
          background: C.surface,
          display: "flex", flexDirection: "column",
        }}>

          {/* Cart header */}
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShoppingCart size={16} color={C.mid} strokeWidth={2} />
                <span style={{ fontSize: 14, fontWeight: 700, color: C.graphite }}>
                  {totalQty === 0 ? "Carrinho vazio" : `${totalQty} ${totalQty === 1 ? "item" : "itens"}`}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 12, fontWeight: 600, color: "#EF4444", fontFamily: "inherit",
                  }}
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* Cart items */}
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

          {/* Total + payment methods + finalize */}
          <div style={{ padding: "16px 20px", borderTop: `2px solid ${C.border}` }}>

            {/* Total */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: C.graphite }}>Total</span>
              <span style={{ fontSize: 26, fontWeight: 800, color: cart.length > 0 ? C.green : C.mid }}>
                {fmt(total)}
              </span>
            </div>

            {/* Payment methods */}
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

            {/* Finalize */}
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
