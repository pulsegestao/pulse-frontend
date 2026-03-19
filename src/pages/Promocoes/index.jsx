import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag, Plus, Loader2, PackageX, Pencil, Trash2, Calendar, Zap,
  ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Activity,
  Search, X, Package,
} from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import { isAuthenticated } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion, getInsights,
  getActivePromotions, getProducts, getCategories, getPromotionStats,
} from "../../services/api";

const STATUS_LABELS = {
  active: "Ativa",
  inactive: "Inativa",
  expired: "Expirada",
};

const STATUS_COLORS = {
  active: C.green,
  inactive: C.mid,
  expired: "#EF4444",
};

const ACTION_LABELS = {
  percent_off: "Desconto %",
  fixed_off: "Desconto fixo",
  buy_x_pay_y: "Leve X Pague Y",
  combo_price: "Combo",
};

const RULE_LABELS = {
  product: "Produtos",
  category: "Categorias",
  min_quantity: "Qtd. min.",
  min_value: "Valor min.",
  schedule: "Agenda",
};

const TABS = [
  { key: "all", label: "Todas" },
  { key: "active", label: "Ativas" },
  { key: "inactive", label: "Inativas" },
  { key: "expired", label: "Expiradas" },
];

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

function describeAction(action) {
  if (!action) return "";
  switch (action.type) {
    case "percent_off": return `${action.value}% de desconto`;
    case "fixed_off": return `R$${action.value.toFixed(2)} de desconto`;
    case "buy_x_pay_y": return `Leve ${action.buy_x} Pague ${action.pay_y}`;
    case "combo_price": return `Combo por R$${action.value.toFixed(2)}`;
    default: return "";
  }
}

const PromocoesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, editing: null });
  const [deleting, setDeleting] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, totalDiscount: 0, totalUses: 0 });

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login", { replace: true });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const status = tab === "all" ? "" : tab;
      const data = await getPromotions(status);
      const list = Array.isArray(data) ? data : [];
      setPromotions(list);
      const activeCount = list.filter(p => p.status === "active").length;
      const totalDiscount = list.reduce((sum, p) => sum + (p.current_uses || 0), 0);
      setStats({ active: tab === "all" ? activeCount : stats.active, totalDiscount: 0, totalUses: totalDiscount });
    } catch {
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    (async () => {
      setInsightsLoading(true);
      try {
        const res = await getInsights({
          type: "promo_high_performance,promo_low_adoption,promo_stock_risk,promo_suggestion",
          limit: 10,
        });
        setInsights(res?.data || []);
      } catch {
        setInsights([]);
      } finally {
        setInsightsLoading(false);
      }
    })();
  }, [promotions.length]);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deletePromotion(id);
      toast.success("Promoção removida.");
      load();
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setDeleting(null);
    }
  };

  const activeCount = promotions.filter(p => p.status === "active").length;
  const totalUses = promotions.reduce((sum, p) => sum + (p.current_uses || 0), 0);

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "124px 24px 48px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: `1.5px solid ${C.border}`,
            borderRadius: 10, padding: "8px 14px",
            fontSize: 13, fontWeight: 600, color: C.mid,
            cursor: "pointer", marginBottom: 20, fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.mid; }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 24, flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: C.bluePale,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Tag size={20} color={C.blue} strokeWidth={2} />
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>
                Gerencie suas campanhas
              </p>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
                Promoções
              </h1>
            </div>
          </div>
          <button
            onClick={() => setModal({ open: true, editing: null })}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "10px 20px", borderRadius: 10,
              border: "none", background: C.blue, color: "white",
              fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <Plus size={16} strokeWidth={2.5} /> Nova Promoção
          </button>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24,
        }} className="promo-stats-grid">
          <StatCard icon={Tag} label="Promoções ativas" value={activeCount} color={C.blue} bg={C.bluePale} />
          <StatCard icon={ShoppingCart} label="Usos totais" value={totalUses} color={C.green} bg={C.greenPale} />
          <StatCard icon={TrendingUp} label="Campanhas criadas" value={promotions.length} color="#8B5CF6" bg={C.purplePale} />
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start",
        }} className="promo-grid">
          <div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    padding: "7px 16px", borderRadius: 8,
                    border: tab === t.key ? "none" : `1.5px solid ${C.border}`,
                    background: tab === t.key ? C.blue : C.surface,
                    color: tab === t.key ? "white" : C.mid,
                    fontSize: 13, fontWeight: 700, cursor: "pointer",
                    fontFamily: "inherit", transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Loader2 size={24} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : promotions.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "48px 24px",
                background: C.surface, borderRadius: 16,
                border: `1px solid ${C.border}`,
              }}>
                <PackageX size={36} color={C.mid} style={{ marginBottom: 12 }} />
                <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
                  Nenhuma promoção
                </p>
                <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
                  Crie sua primeira campanha para impulsionar suas vendas.
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {promotions.map(promo => (
                  <PromoCard
                    key={promo.id}
                    promo={promo}
                    onEdit={() => setModal({ open: true, editing: promo })}
                    onDelete={() => handleDelete(promo.id)}
                    deleting={deleting === promo.id}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`, padding: "18px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <Activity size={16} color={C.blue} strokeWidth={2} />
              <span style={{ fontSize: 14, fontWeight: 800, color: C.graphite }}>
                Pulsos das promoções
              </span>
            </div>
            {insightsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 24 }}>
                <Loader2 size={20} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
              </div>
            ) : insights.length === 0 ? (
              <p style={{ fontSize: 13, color: C.mid, margin: 0, textAlign: "center", padding: "16px 0" }}>
                Nenhum pulso relacionado às promoções ativas.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {insights.map(ins => (
                  <div key={ins.id} style={{
                    padding: "12px 14px", borderRadius: 10,
                    border: `1px solid ${C.border}`, background: C.pageBg,
                  }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: "0 0 4px", lineHeight: 1.3 }}>
                      {ins.title}
                    </p>
                    <p style={{ fontSize: 12, color: C.mid, margin: 0, lineHeight: 1.4 }}>
                      {ins.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {modal.open && (
        <PromoModal
          editing={modal.editing}
          onClose={() => setModal({ open: false, editing: null })}
          onSaved={() => { setModal({ open: false, editing: null }); load(); }}
          toast={toast}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @media (max-width: 1024px) {
          .promo-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 768px) {
          .promo-stats-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div style={{
    background: C.surface, borderRadius: 14, padding: "18px 20px",
    border: `1px solid ${C.border}`,
    display: "flex", alignItems: "center", gap: 14,
  }}>
    <div style={{
      width: 40, height: 40, borderRadius: 11,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={18} color={color} strokeWidth={2} />
    </div>
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, color: C.mid, margin: 0, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label}
      </p>
      <p style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0 }}>
        {value}
      </p>
    </div>
  </div>
);

const PromoCard = ({ promo, onEdit, onDelete, deleting }) => {
  const statusColor = STATUS_COLORS[promo.status] || C.mid;
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  const loadStats = async () => {
    if (stats) { setStatsOpen(v => !v); return; }
    setStatsLoading(true);
    setStatsOpen(true);
    try {
      const data = await getPromotionStats(promo.id);
      setStats(data);
    } catch {
      setStats(null);
      setStatsOpen(false);
    } finally {
      setStatsLoading(false);
    }
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 14, padding: "18px 20px",
      border: `1px solid ${C.border}`, transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.06)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: C.graphite, margin: 0 }}>
              {promo.name}
            </h3>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "2px 10px", borderRadius: 100,
              background: `${statusColor}18`, color: statusColor,
              fontSize: 11, fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
              {STATUS_LABELS[promo.status] || promo.status}
            </span>
          </div>
          {promo.description && (
            <p style={{ fontSize: 13, color: C.mid, margin: "0 0 8px", lineHeight: 1.4 }}>
              {promo.description}
            </p>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.mid }}>
              <Zap size={12} strokeWidth={2} /> {describeAction(promo.action)}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.mid }}>
              <Calendar size={12} strokeWidth={2} /> {formatDate(promo.start_date)} - {formatDate(promo.end_date)}
            </span>
            {promo.current_uses > 0 && (
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.mid }}>
                <ShoppingCart size={12} strokeWidth={2} /> {promo.current_uses} usos
              </span>
            )}
            {promo.current_uses > 0 && (
              <button
                onClick={loadStats}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 11, fontWeight: 600, color: C.blue,
                  background: "none", border: "none", cursor: "pointer",
                  padding: 0, fontFamily: "inherit",
                }}
              >
                <TrendingUp size={11} strokeWidth={2} />
                {statsLoading ? "carregando..." : statsOpen ? "ocultar impacto" : "ver impacto"}
              </button>
            )}
          </div>
          {statsOpen && stats && (
            <div style={{
              marginTop: 10, display: "flex", gap: 16, flexWrap: "wrap",
              padding: "8px 12px", borderRadius: 8,
              background: C.bluePale, border: `1px solid ${C.blue}22`,
            }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.graphite, fontWeight: 600 }}>
                <DollarSign size={12} color={C.green} strokeWidth={2} />
                Receita gerada: <strong style={{ color: C.green }}>R$ {stats.revenue_generated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.graphite, fontWeight: 600 }}>
                <Tag size={12} color="#EF4444" strokeWidth={2} />
                Desconto total: <strong style={{ color: "#EF4444" }}>R$ {stats.total_discount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.mid }}>
                <ShoppingCart size={12} strokeWidth={2} />
                {stats.sales_count} {stats.sales_count === 1 ? "venda" : "vendas"}
              </span>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          <button
            onClick={onEdit}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.surface,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray}
            onMouseLeave={e => e.currentTarget.style.background = C.surface}
          >
            <Pencil size={14} color={C.blue} strokeWidth={2} />
          </button>
          <button
            onClick={onDelete}
            disabled={deleting}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${C.border}`, background: C.surface,
              cursor: deleting ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
            onMouseEnter={e => { if (!deleting) e.currentTarget.style.background = C.redPale; }}
            onMouseLeave={e => e.currentTarget.style.background = C.surface}
          >
            {deleting
              ? <Loader2 size={14} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
              : <Trash2 size={14} color="#EF4444" strokeWidth={2} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

const INITIAL_FORM = {
  name: "", description: "",
  start_date: "", end_date: "",
  rule_type: "product", selected_products: [], selected_categories: [],
  min_quantity: "", min_value: "",
  days_of_week: [], time_start: "", time_end: "",
  action_type: "percent_off", action_value: "",
  buy_x: "", pay_y: "",
  max_uses: "", max_uses_per_customer: "",
};

const WIZARD_STEPS = [
  { n: 1, label: "A campanha" },
  { n: 2, label: "Quem participa" },
  { n: 3, label: "O desconto" },
  { n: 4, label: "Revisão" },
];

const WizardStepper = ({ current, total = 4 }) => {
  const pct = ((current - 1) / (total - 1)) * 100;
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ position: "relative", height: 4, background: C.border, borderRadius: 4, marginBottom: 14 }}>
        <div style={{
          position: "absolute", left: 0, top: 0, height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${C.blue}, ${C.green})`,
          borderRadius: 4,
          transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: `0 0 8px ${C.blue}44`,
        }} />
        {WIZARD_STEPS.map(({ n }) => {
          const pos = ((n - 1) / (total - 1)) * 100;
          const done = n < current;
          const active = n === current;
          return (
            <div key={n} style={{
              position: "absolute", top: "50%", left: `${pos}%`,
              transform: "translate(-50%, -50%)",
              width: done ? 16 : active ? 12 : 10,
              height: done ? 16 : active ? 12 : 10,
              borderRadius: "50%",
              background: done ? C.green : active ? C.blue : C.surface,
              border: `2px solid ${done ? C.green : active ? C.blue : C.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              zIndex: 1,
              boxShadow: done ? `0 0 0 3px ${C.green}22` : active ? `0 0 0 3px ${C.blue}22` : "none",
            }}>
              {done && (
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        {WIZARD_STEPS.map(({ n, label }) => (
          <span key={n} style={{
            fontSize: 11, fontWeight: 700,
            color: n === current ? C.graphite : n < current ? C.green : C.mid,
            transition: "color 0.3s",
            textAlign: n === 1 ? "left" : n === total ? "right" : "center",
            flex: 1,
          }}>
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: `1.5px solid ${C.border}`, background: C.surface,
  fontSize: 13, fontFamily: "inherit", color: C.graphite,
  outline: "none", boxSizing: "border-box",
};

const labelStyle = { fontSize: 12, fontWeight: 700, color: C.graphite, margin: "0 0 6px", display: "block" };

const hintStyle = { fontSize: 11, color: C.mid, margin: "4px 0 0", lineHeight: 1.4 };

const StepCampanha = ({ form, set }) => (
  <div>
    <div style={{ marginBottom: 6 }}>
      <p style={{ fontSize: 15, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>
        Identifique sua campanha
      </p>
      <p style={{ fontSize: 12, color: C.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
        Dê um nome, uma descrição e defina o período em que a promoção estará ativa.
      </p>
    </div>

    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>Nome da campanha <span style={{ color: "#EF4444" }}>*</span></label>
      <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Black Friday 2025" />
      <p style={hintStyle}>Esse nome será exibido no PDV quando o desconto for aplicado.</p>
    </div>

    <div style={{ marginBottom: 16 }}>
      <label style={labelStyle}>Descrição</label>
      <textarea
        style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
        value={form.description}
        onChange={e => set("description", e.target.value)}
        placeholder="Ex: Promoção de inverno para impulsionar vendas de bebidas quentes..."
      />
      <p style={hintStyle}>Opcional. Ajuda você a lembrar o objetivo da campanha.</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <div>
        <label style={labelStyle}>Data início <span style={{ color: "#EF4444" }}>*</span></label>
        <input type="date" style={inputStyle} value={form.start_date} onChange={e => set("start_date", e.target.value)} />
      </div>
      <div>
        <label style={labelStyle}>Data fim <span style={{ color: "#EF4444" }}>*</span></label>
        <input type="date" style={inputStyle} value={form.end_date} onChange={e => set("end_date", e.target.value)} />
      </div>
    </div>
    <p style={hintStyle}>A promoção será ativada automaticamente na data de início e desativada na data fim.</p>
  </div>
);

const StepRegras = ({ form, set, allProducts, allCategories }) => {
  const [productSearch, setProductSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const toggleProduct = (product) => {
    const exists = form.selected_products.some(p => p.id === product.id);
    set("selected_products", exists
      ? form.selected_products.filter(p => p.id !== product.id)
      : [...form.selected_products, product]);
  };

  const toggleCategory = (cat) => {
    const exists = form.selected_categories.some(c => c.id === cat.id);
    set("selected_categories", exists
      ? form.selected_categories.filter(c => c.id !== cat.id)
      : [...form.selected_categories, cat]);
  };

  const filteredProducts = productSearch
    ? allProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
    : allProducts;

  const filteredCategories = categorySearch
    ? allCategories.filter(c => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    : allCategories;

  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const toggleDay = (d) => {
    set("days_of_week",
      form.days_of_week.includes(d)
        ? form.days_of_week.filter(x => x !== d)
        : [...form.days_of_week, d]);
  };

  const RULE_DESCRIPTIONS = {
    product: "Selecione os produtos específicos que participam desta promoção.",
    category: "Aplique o desconto a todos os produtos de uma ou mais categorias.",
    min_quantity: "O desconto só é aplicado quando o cliente compra uma quantidade mínima.",
    min_value: "O desconto é ativado quando o valor total do carrinho atinge um mínimo.",
    schedule: "Restrinja a promoção a dias da semana e horários específicos (ex: happy hour).",
  };

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>
          Quem participa?
        </p>
        <p style={{ fontSize: 12, color: C.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
          Defina as condições para que um produto ou carrinho seja elegível para esta promoção.
        </p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={labelStyle}>Tipo de regra</label>
        <select style={inputStyle} value={form.rule_type} onChange={e => set("rule_type", e.target.value)}>
          {Object.entries(RULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <p style={hintStyle}>{RULE_DESCRIPTIONS[form.rule_type]}</p>
      </div>

      {form.rule_type === "product" && (
        <div>
          <label style={labelStyle}>Produtos selecionados</label>
          {form.selected_products.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {form.selected_products.map(p => (
                <span key={p.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  background: C.bluePale, border: `1px solid ${C.blue}33`,
                  fontSize: 12, fontWeight: 600, color: C.graphite,
                }}>
                  {p.name}
                  <button onClick={() => toggleProduct(p)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <X size={12} color={C.mid} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowProductPicker(!showProductPicker)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: `1.5px dashed ${C.border}`, background: "transparent",
              fontSize: 12, fontWeight: 700, color: C.mid, cursor: "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            {form.selected_products.length > 0 ? "Adicionar mais produtos" : "Selecionar produtos"}
          </button>
          {showProductPicker && (
            <div style={{
              marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 12,
              background: C.surface, overflow: "hidden",
            }}>
              <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
                <Search size={14} color={C.mid} strokeWidth={2} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  value={productSearch} onChange={e => setProductSearch(e.target.value)}
                  placeholder="Buscar produto..." autoFocus
                  style={{ ...inputStyle, paddingLeft: 32, border: "none", background: "transparent", margin: 0 }}
                />
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {filteredProducts.length === 0 ? (
                  <div style={{ padding: "20px 14px", textAlign: "center" }}>
                    <Package size={20} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 6px" }} />
                    <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Nenhum produto encontrado</p>
                  </div>
                ) : filteredProducts.map(p => {
                  const sel = form.selected_products.some(s => s.id === p.id);
                  return (
                    <button key={p.id} onClick={() => toggleProduct(p)} style={{
                      width: "100%", padding: "10px 14px", border: "none",
                      borderBottom: `1px solid ${C.border}`,
                      background: sel ? C.bluePale : "transparent",
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = C.gray; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: C.graphite }}>{p.name}</span>
                      {sel && <span style={{ fontSize: 11, fontWeight: 800, color: C.blue }}>&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {form.rule_type === "category" && (
        <div>
          <label style={labelStyle}>Categorias selecionadas</label>
          {form.selected_categories.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {form.selected_categories.map(c => (
                <span key={c.id} style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  padding: "5px 12px", borderRadius: 8,
                  background: C.greenPale, border: `1px solid ${C.green}33`,
                  fontSize: 12, fontWeight: 600, color: C.graphite,
                }}>
                  {c.name}
                  <button onClick={() => toggleCategory(c)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}>
                    <X size={12} color={C.mid} strokeWidth={2.5} />
                  </button>
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => setShowCategoryPicker(!showCategoryPicker)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: `1.5px dashed ${C.border}`, background: "transparent",
              fontSize: 12, fontWeight: 700, color: C.mid, cursor: "pointer",
              fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <Plus size={13} strokeWidth={2.5} />
            {form.selected_categories.length > 0 ? "Adicionar mais categorias" : "Selecionar categorias"}
          </button>
          {showCategoryPicker && (
            <div style={{
              marginTop: 8, border: `1px solid ${C.border}`, borderRadius: 12,
              background: C.surface, overflow: "hidden",
            }}>
              <div style={{ padding: "8px 10px", borderBottom: `1px solid ${C.border}`, position: "relative" }}>
                <Search size={14} color={C.mid} strokeWidth={2} style={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                <input
                  value={categorySearch} onChange={e => setCategorySearch(e.target.value)}
                  placeholder="Buscar categoria..." autoFocus
                  style={{ ...inputStyle, paddingLeft: 32, border: "none", background: "transparent", margin: 0 }}
                />
              </div>
              <div style={{ maxHeight: 220, overflowY: "auto" }}>
                {filteredCategories.length === 0 ? (
                  <div style={{ padding: "20px 14px", textAlign: "center" }}>
                    <Package size={20} color={C.border} strokeWidth={1.5} style={{ display: "block", margin: "0 auto 6px" }} />
                    <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Nenhuma categoria encontrada</p>
                  </div>
                ) : filteredCategories.map(c => {
                  const sel = form.selected_categories.some(s => s.id === c.id);
                  return (
                    <button key={c.id} onClick={() => toggleCategory(c)} style={{
                      width: "100%", padding: "10px 14px", border: "none",
                      borderBottom: `1px solid ${C.border}`,
                      background: sel ? C.greenPale : "transparent",
                      cursor: "pointer", fontFamily: "inherit",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      transition: "background 0.1s",
                    }}
                      onMouseEnter={e => { if (!sel) e.currentTarget.style.background = C.gray; }}
                      onMouseLeave={e => { if (!sel) e.currentTarget.style.background = "transparent"; }}
                    >
                      <span style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: C.graphite }}>{c.name}</span>
                      {sel && <span style={{ fontSize: 11, fontWeight: 800, color: C.green }}>&#10003;</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {form.rule_type === "min_quantity" && (
        <div>
          <label style={labelStyle}>Quantidade mínima</label>
          <input type="number" style={inputStyle} value={form.min_quantity} onChange={e => set("min_quantity", e.target.value)} placeholder="3" />
          <p style={hintStyle}>Ex: o cliente precisa comprar pelo menos 3 unidades do mesmo produto.</p>
        </div>
      )}

      {form.rule_type === "min_value" && (
        <div>
          <label style={labelStyle}>Valor mínimo do carrinho (R$)</label>
          <input type="number" step="0.01" style={inputStyle} value={form.min_value} onChange={e => set("min_value", e.target.value)} placeholder="100.00" />
          <p style={hintStyle}>Ex: o desconto só aplica se o total da compra for R$100 ou mais.</p>
        </div>
      )}

      {form.rule_type === "schedule" && (
        <>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Dias da semana</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DAYS.map((d, i) => (
                <button key={i} onClick={() => toggleDay(i)} style={{
                  padding: "7px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                  border: form.days_of_week.includes(i) ? "none" : `1.5px solid ${C.border}`,
                  background: form.days_of_week.includes(i) ? C.blue : C.surface,
                  color: form.days_of_week.includes(i) ? "white" : C.mid,
                  cursor: "pointer", fontFamily: "inherit",
                }}>
                  {d}
                </button>
              ))}
            </div>
            <p style={hintStyle}>Selecione os dias em que a promoção estará ativa.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Hora início</label>
              <input type="time" style={inputStyle} value={form.time_start} onChange={e => set("time_start", e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Hora fim</label>
              <input type="time" style={inputStyle} value={form.time_end} onChange={e => set("time_end", e.target.value)} />
            </div>
          </div>
          <p style={hintStyle}>Ex: das 17:00 às 19:00 para happy hour.</p>
        </>
      )}
    </div>
  );
};

const StepDesconto = ({ form, set }) => {
  const ACTION_DESCRIPTIONS = {
    percent_off: "Aplica um percentual de desconto sobre o preço original do produto.",
    fixed_off: "Reduz um valor fixo em reais do preço de cada unidade.",
    buy_x_pay_y: "O cliente leva mais unidades pagando menos. Ex: Leve 3, Pague 2.",
    combo_price: "Define um preço fixo para o conjunto de produtos selecionados.",
  };

  const ACTION_ICONS = {
    percent_off: "%",
    fixed_off: "R$",
    buy_x_pay_y: "X/Y",
    combo_price: "=",
  };

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>
          Qual o desconto?
        </p>
        <p style={{ fontSize: 12, color: C.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
          Escolha como o desconto será calculado e aplicado aos produtos elegíveis.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        {Object.entries(ACTION_LABELS).map(([k, v]) => {
          const active = form.action_type === k;
          return (
            <button key={k} onClick={() => set("action_type", k)} style={{
              padding: "14px 12px", borderRadius: 12,
              border: active ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`,
              background: active ? C.bluePale : C.surface,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = C.blue; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = C.border; }}
            >
              <span style={{
                width: 32, height: 32, borderRadius: 8,
                background: active ? C.blue : C.gray,
                color: active ? "white" : C.mid,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, transition: "all 0.15s",
              }}>
                {ACTION_ICONS[k]}
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: active ? C.graphite : C.mid }}>
                {v}
              </span>
            </button>
          );
        })}
      </div>

      <p style={{ ...hintStyle, marginBottom: 16 }}>{ACTION_DESCRIPTIONS[form.action_type]}</p>

      {form.action_type === "percent_off" && (
        <div>
          <label style={labelStyle}>Porcentagem de desconto</label>
          <div style={{ position: "relative" }}>
            <input type="number" style={{ ...inputStyle, paddingRight: 36 }} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="10" />
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: C.mid }}>%</span>
          </div>
          <p style={hintStyle}>Ex: 10 = cada produto elegível terá 10% de desconto.</p>
        </div>
      )}

      {form.action_type === "fixed_off" && (
        <div>
          <label style={labelStyle}>Valor do desconto por unidade</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: C.mid }}>R$</span>
            <input type="number" step="0.01" style={{ ...inputStyle, paddingLeft: 38 }} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="5.00" />
          </div>
          <p style={hintStyle}>Ex: 5.00 = cada unidade terá R$5 de desconto no preço.</p>
        </div>
      )}

      {form.action_type === "buy_x_pay_y" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 10, alignItems: "end" }}>
          <div>
            <label style={labelStyle}>Leve</label>
            <input type="number" style={inputStyle} value={form.buy_x} onChange={e => set("buy_x", e.target.value)} placeholder="3" />
          </div>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.mid, paddingBottom: 12 }}>por</span>
          <div>
            <label style={labelStyle}>Pague</label>
            <input type="number" style={inputStyle} value={form.pay_y} onChange={e => set("pay_y", e.target.value)} placeholder="2" />
          </div>
        </div>
      )}

      {form.action_type === "combo_price" && (
        <div>
          <label style={labelStyle}>Preço do combo</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 700, color: C.mid }}>R$</span>
            <input type="number" step="0.01" style={{ ...inputStyle, paddingLeft: 38 }} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="25.00" />
          </div>
          <p style={hintStyle}>Todos os produtos selecionados por esse preço fixo.</p>
        </div>
      )}
    </div>
  );
};

const StepRevisao = ({ form, editing }) => {
  const ruleLabel = RULE_LABELS[form.rule_type] || form.rule_type;
  let ruleDetail = "";
  if (form.rule_type === "product") ruleDetail = form.selected_products.map(p => p.name).join(", ") || "Nenhum selecionado";
  else if (form.rule_type === "category") ruleDetail = form.selected_categories.map(c => c.name).join(", ") || "Nenhuma selecionada";
  else if (form.rule_type === "min_quantity") ruleDetail = `${form.min_quantity || 0} unidades`;
  else if (form.rule_type === "min_value") ruleDetail = `R$${form.min_value || "0"}`;
  else if (form.rule_type === "schedule") {
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const days = (form.days_of_week || []).map(d => dayNames[d]).join(", ");
    ruleDetail = `${days || "Nenhum dia"} das ${form.time_start || "--"} às ${form.time_end || "--"}`;
  }

  let actionDetail = "";
  if (form.action_type === "percent_off") actionDetail = `${form.action_value || 0}% de desconto`;
  else if (form.action_type === "fixed_off") actionDetail = `R$${form.action_value || 0} de desconto por unidade`;
  else if (form.action_type === "buy_x_pay_y") actionDetail = `Leve ${form.buy_x || 0} Pague ${form.pay_y || 0}`;
  else if (form.action_type === "combo_price") actionDetail = `Combo por R$${form.action_value || 0}`;

  const SummaryRow = ({ label, value, color }) => (
    <div style={{
      display: "flex", justifyContent: "space-between", alignItems: "flex-start",
      padding: "10px 0",
      borderBottom: `1px solid ${C.border}`,
    }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.mid, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color || C.graphite, textAlign: "right", maxWidth: "60%", lineHeight: 1.4 }}>{value}</span>
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 6 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: C.graphite, margin: "0 0 4px" }}>
          Revisão e limites
        </p>
        <p style={{ fontSize: 12, color: C.mid, margin: "0 0 20px", lineHeight: 1.5 }}>
          Confira os detalhes da campanha e defina limites de uso antes de finalizar.
        </p>
      </div>

      <div style={{
        background: C.pageBg, borderRadius: 12, padding: "4px 16px", marginBottom: 20,
        border: `1px solid ${C.border}`,
      }}>
        <SummaryRow label="Nome" value={form.name || "—"} />
        <SummaryRow label="Período" value={
          form.start_date && form.end_date
            ? `${new Date(form.start_date).toLocaleDateString("pt-BR")} a ${new Date(form.end_date).toLocaleDateString("pt-BR")}`
            : "—"
        } />
        <SummaryRow label="Regra" value={`${ruleLabel}: ${ruleDetail}`} />
        <SummaryRow label="Desconto" value={actionDetail} color={C.green} />
        {form.description && <SummaryRow label="Descrição" value={form.description} />}
      </div>

      <p style={{ fontSize: 13, fontWeight: 800, color: C.graphite, margin: "0 0 12px" }}>
        Limites de uso
      </p>
      <p style={{ ...hintStyle, marginBottom: 14 }}>
        Defina quantas vezes esta promoção pode ser usada. Deixe 0 para uso ilimitado.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: editing ? 16 : 0 }}>
        <div>
          <label style={labelStyle}>Máximo total de usos</label>
          <input type="number" style={inputStyle} value={form.max_uses} onChange={e => set("max_uses", e.target.value)} placeholder="0" />
          <p style={hintStyle}>0 = ilimitado</p>
        </div>
        <div>
          <label style={labelStyle}>Máx. por cliente</label>
          <input type="number" style={inputStyle} value={form.max_uses_per_customer} onChange={e => set("max_uses_per_customer", e.target.value)} placeholder="0" />
          <p style={hintStyle}>0 = ilimitado</p>
        </div>
      </div>

      {editing && (
        <div>
          <label style={labelStyle}>Status</label>
          <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
            <option value="active">Ativa</option>
            <option value="inactive">Inativa</option>
          </select>
        </div>
      )}
    </div>
  );
};

const PromoModal = ({ editing, onClose, onSaved, toast }) => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => {
    if (editing) {
      const rule = editing.rules?.[0] || {};
      return {
        name: editing.name || "",
        description: editing.description || "",
        start_date: editing.start_date ? editing.start_date.slice(0, 10) : "",
        end_date: editing.end_date ? editing.end_date.slice(0, 10) : "",
        rule_type: rule.type || "product",
        selected_products: (rule.product_ids || []).map(id => ({ id, name: id })),
        selected_categories: (rule.category_ids || []).map(id => ({ id, name: id })),
        min_quantity: rule.min_quantity || "",
        min_value: rule.min_value || "",
        days_of_week: rule.days_of_week || [],
        time_start: rule.time_start || "",
        time_end: rule.time_end || "",
        action_type: editing.action?.type || "percent_off",
        action_value: editing.action?.value || "",
        buy_x: editing.action?.buy_x || "",
        pay_y: editing.action?.pay_y || "",
        max_uses: editing.max_uses || "",
        max_uses_per_customer: editing.max_uses_per_customer || "",
        status: editing.status || "active",
      };
    }
    return { ...INITIAL_FORM, selected_products: [], selected_categories: [] };
  });
  const [saving, setSaving] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      getProducts().catch(() => []),
      getCategories().catch(() => []),
    ]).then(([prodData, catData]) => {
      const prodList = (prodData || []).filter(p => p.active).map(p => ({ id: p.id, name: p.name }));
      setAllProducts(prodList);
      const catList = (catData || []).map(c => ({ id: c.id, name: c.name }));
      setAllCategories(catList);
      if (editing) {
        const rule = editing.rules?.[0] || {};
        const prodIds = rule.product_ids || [];
        if (prodIds.length) {
          const matched = prodIds.map(id => prodList.find(p => p.id === id) || { id, name: id });
          setForm(prev => ({ ...prev, selected_products: matched }));
        }
        const catIds = rule.category_ids || [];
        if (catIds.length) {
          const matched = catIds.map(id => catList.find(c => c.id === id) || { id, name: id });
          setForm(prev => ({ ...prev, selected_categories: matched }));
        }
      }
    });
  }, []);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.name.trim()) { toast.error("Dê um nome para a campanha."); return false; }
      if (!form.start_date || !form.end_date) { toast.error("Defina as datas da campanha."); return false; }
      if (form.start_date > form.end_date) { toast.error("A data fim deve ser depois da data início."); return false; }
    }
    return true;
  };

  const goNext = () => { if (validateStep(step)) setStep(s => Math.min(s + 1, 4)); };
  const goBack = () => setStep(s => Math.max(s - 1, 1));

  const buildPayload = () => {
    const rule = { type: form.rule_type };
    if (form.rule_type === "product") rule.product_ids = form.selected_products.map(p => p.id);
    if (form.rule_type === "category") rule.category_ids = form.selected_categories.map(c => c.id);
    if (form.rule_type === "min_quantity") rule.min_quantity = parseInt(form.min_quantity) || 0;
    if (form.rule_type === "min_value") rule.min_value = parseFloat(form.min_value) || 0;
    if (form.rule_type === "schedule") {
      rule.days_of_week = form.days_of_week;
      rule.time_start = form.time_start;
      rule.time_end = form.time_end;
    }

    const action = { type: form.action_type, value: parseFloat(form.action_value) || 0 };
    if (form.action_type === "buy_x_pay_y") {
      action.buy_x = parseInt(form.buy_x) || 0;
      action.pay_y = parseInt(form.pay_y) || 0;
    }

    return {
      name: form.name,
      description: form.description,
      rules: [rule],
      action,
      start_date: form.start_date ? new Date(form.start_date + "T00:00:00Z").toISOString() : "",
      end_date: form.end_date ? new Date(form.end_date + "T23:59:59Z").toISOString() : "",
      max_uses: parseInt(form.max_uses) || 0,
      max_uses_per_customer: parseInt(form.max_uses_per_customer) || 0,
      ...(editing ? { status: form.status } : {}),
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = buildPayload();
      if (editing) {
        await updatePromotion(editing.id, payload);
        toast.success("Promoção atualizada.");
      } else {
        await createPromotion(payload);
        toast.success("Promoção criada com sucesso!");
      }
      onSaved();
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };

  const isLastStep = step === 4;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.35)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: C.surface, borderRadius: 18, padding: "28px 28px 24px",
          width: "100%", maxWidth: 540, maxHeight: "85vh", overflowY: "auto",
          boxShadow: "0 8px 40px rgba(0,0,0,0.14)", border: `1px solid ${C.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>
            {editing ? "Editar Promoção" : "Nova Promoção"}
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: C.mid }}>
              Etapa {step} de 4
            </span>
            <button
              onClick={onClose}
              style={{
                background: "none", border: "none", cursor: "pointer", padding: 4,
                borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
                color: C.mid, transition: "color 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.color = C.graphite}
              onMouseLeave={e => e.currentTarget.style.color = C.mid}
            >
              <X size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        <WizardStepper current={step} />

        <div key={step} style={{ animation: "fadeSlideIn 0.25s ease", minHeight: 200 }}>
          {step === 1 && <StepCampanha form={form} set={set} />}
          {step === 2 && <StepRegras form={form} set={set} allProducts={allProducts} allCategories={allCategories} />}
          {step === 3 && <StepDesconto form={form} set={set} />}
          {step === 4 && <StepRevisao form={form} set={set} editing={editing} />}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button
            onClick={step === 1 ? onClose : goBack}
            style={{
              flex: 1, padding: "11px", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "transparent",
              fontSize: 13, fontWeight: 700, color: C.graphite,
              cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            {step === 1 ? "Cancelar" : "Voltar"}
          </button>
          <button
            onClick={isLastStep ? handleSave : goNext}
            disabled={saving}
            style={{
              flex: 1, padding: "11px", borderRadius: 10,
              border: "none",
              background: isLastStep ? C.green : C.blue,
              fontSize: 13, fontWeight: 700, color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: saving ? 0.7 : 1,
              transition: "background 0.15s",
            }}
          >
            {saving ? "Salvando..." : isLastStep ? (editing ? "Salvar" : "Criar Promoção") : "Continuar"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default PromocoesPage;
