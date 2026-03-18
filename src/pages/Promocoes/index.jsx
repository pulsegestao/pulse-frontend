import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Tag, Plus, Loader2, PackageX, Pencil, Trash2, Calendar, Zap,
  ArrowLeft, TrendingUp, DollarSign, ShoppingCart, Activity,
} from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import { isAuthenticated } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";
import {
  getPromotions, createPromotion, updatePromotion, deletePromotion, getInsights,
  getActivePromotions,
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
        const active = await getActivePromotions();
        const activeList = Array.isArray(active) ? active : [];
        const productIds = new Set();
        for (const promo of activeList) {
          for (const rule of (promo.rules || [])) {
            if (rule.type === "product" && rule.product_ids) {
              rule.product_ids.forEach(id => productIds.add(id));
            }
          }
        }
        if (productIds.size > 0) {
          const res = await getInsights({ product_ids: [...productIds].join(","), limit: 5 });
          setInsights(res?.data || []);
        } else {
          setInsights([]);
        }
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
          </div>
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
  rule_type: "product", product_ids: "", category_ids: "",
  min_quantity: "", min_value: "",
  days_of_week: [], time_start: "", time_end: "",
  action_type: "percent_off", action_value: "",
  buy_x: "", pay_y: "",
  max_uses: "", max_uses_per_customer: "",
};

const PromoModal = ({ editing, onClose, onSaved, toast }) => {
  const [form, setForm] = useState(() => {
    if (editing) {
      const rule = editing.rules?.[0] || {};
      return {
        name: editing.name || "",
        description: editing.description || "",
        start_date: editing.start_date ? editing.start_date.slice(0, 10) : "",
        end_date: editing.end_date ? editing.end_date.slice(0, 10) : "",
        rule_type: rule.type || "product",
        product_ids: (rule.product_ids || []).join(", "),
        category_ids: (rule.category_ids || []).join(", "),
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
    return { ...INITIAL_FORM };
  });
  const [saving, setSaving] = useState(false);

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const buildPayload = () => {
    const rule = { type: form.rule_type };
    if (form.rule_type === "product") {
      rule.product_ids = form.product_ids.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (form.rule_type === "category") {
      rule.category_ids = form.category_ids.split(",").map(s => s.trim()).filter(Boolean);
    }
    if (form.rule_type === "min_quantity") {
      rule.min_quantity = parseInt(form.min_quantity) || 0;
    }
    if (form.rule_type === "min_value") {
      rule.min_value = parseFloat(form.min_value) || 0;
    }
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
    if (!form.name || !form.start_date || !form.end_date) {
      toast.error("Preencha nome e datas da campanha.");
      return;
    }
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

  const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const toggleDay = (d) => {
    set("days_of_week",
      form.days_of_week.includes(d)
        ? form.days_of_week.filter(x => x !== d)
        : [...form.days_of_week, d]
    );
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: 10,
    border: `1.5px solid ${C.border}`, background: C.surface,
    fontSize: 13, fontFamily: "inherit", color: C.graphite,
    outline: "none", boxSizing: "border-box",
  };

  const labelStyle = { fontSize: 12, fontWeight: 700, color: C.graphite, margin: "0 0 6px", display: "block" };

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
        <h2 style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: "0 0 20px" }}>
          {editing ? "Editar Promoção" : "Nova Promoção"}
        </h2>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Nome da campanha</label>
          <input style={inputStyle} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Black Friday 2025" />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle}>Descrição (opcional)</label>
          <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={form.description} onChange={e => set("description", e.target.value)} placeholder="Descreva a campanha..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>Data início</label>
            <input type="date" style={inputStyle} value={form.start_date} onChange={e => set("start_date", e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Data fim</label>
            <input type="date" style={inputStyle} value={form.end_date} onChange={e => set("end_date", e.target.value)} />
          </div>
        </div>

        <div style={{ padding: "16px", background: C.pageBg, borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.graphite, margin: "0 0 12px" }}>Regra</p>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Tipo de regra</label>
            <select style={inputStyle} value={form.rule_type} onChange={e => set("rule_type", e.target.value)}>
              {Object.entries(RULE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {form.rule_type === "product" && (
            <div>
              <label style={labelStyle}>IDs dos produtos (separados por vírgula)</label>
              <input style={inputStyle} value={form.product_ids} onChange={e => set("product_ids", e.target.value)} placeholder="id1, id2, id3" />
            </div>
          )}
          {form.rule_type === "category" && (
            <div>
              <label style={labelStyle}>IDs das categorias (separados por vírgula)</label>
              <input style={inputStyle} value={form.category_ids} onChange={e => set("category_ids", e.target.value)} placeholder="id1, id2" />
            </div>
          )}
          {form.rule_type === "min_quantity" && (
            <div>
              <label style={labelStyle}>Quantidade mínima</label>
              <input type="number" style={inputStyle} value={form.min_quantity} onChange={e => set("min_quantity", e.target.value)} placeholder="3" />
            </div>
          )}
          {form.rule_type === "min_value" && (
            <div>
              <label style={labelStyle}>Valor mínimo do carrinho (R$)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.min_value} onChange={e => set("min_value", e.target.value)} placeholder="100.00" />
            </div>
          )}
          {form.rule_type === "schedule" && (
            <>
              <div style={{ marginBottom: 10 }}>
                <label style={labelStyle}>Dias da semana</label>
                <div style={{ display: "flex", gap: 6 }}>
                  {DAYS.map((d, i) => (
                    <button key={i} onClick={() => toggleDay(i)} style={{
                      padding: "6px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                      border: form.days_of_week.includes(i) ? "none" : `1.5px solid ${C.border}`,
                      background: form.days_of_week.includes(i) ? C.blue : C.surface,
                      color: form.days_of_week.includes(i) ? "white" : C.mid,
                      cursor: "pointer", fontFamily: "inherit",
                    }}>
                      {d}
                    </button>
                  ))}
                </div>
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
            </>
          )}
        </div>

        <div style={{ padding: "16px", background: C.pageBg, borderRadius: 12, marginBottom: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 800, color: C.graphite, margin: "0 0 12px" }}>Ação</p>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Tipo de ação</label>
            <select style={inputStyle} value={form.action_type} onChange={e => set("action_type", e.target.value)}>
              {Object.entries(ACTION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>

          {form.action_type === "percent_off" && (
            <div>
              <label style={labelStyle}>Porcentagem de desconto (%)</label>
              <input type="number" style={inputStyle} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="10" />
            </div>
          )}
          {form.action_type === "fixed_off" && (
            <div>
              <label style={labelStyle}>Valor do desconto (R$)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="5.00" />
            </div>
          )}
          {form.action_type === "buy_x_pay_y" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={labelStyle}>Leve (quantidade)</label>
                <input type="number" style={inputStyle} value={form.buy_x} onChange={e => set("buy_x", e.target.value)} placeholder="3" />
              </div>
              <div>
                <label style={labelStyle}>Pague (quantidade)</label>
                <input type="number" style={inputStyle} value={form.pay_y} onChange={e => set("pay_y", e.target.value)} placeholder="2" />
              </div>
            </div>
          )}
          {form.action_type === "combo_price" && (
            <div>
              <label style={labelStyle}>Preço do combo (R$)</label>
              <input type="number" step="0.01" style={inputStyle} value={form.action_value} onChange={e => set("action_value", e.target.value)} placeholder="25.00" />
            </div>
          )}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
          <div>
            <label style={labelStyle}>Máximo de usos (0 = ilimitado)</label>
            <input type="number" style={inputStyle} value={form.max_uses} onChange={e => set("max_uses", e.target.value)} placeholder="0" />
          </div>
          <div>
            <label style={labelStyle}>Máx. por cliente (0 = ilimitado)</label>
            <input type="number" style={inputStyle} value={form.max_uses_per_customer} onChange={e => set("max_uses_per_customer", e.target.value)} placeholder="0" />
          </div>
        </div>

        {editing && (
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Status</label>
            <select style={inputStyle} value={form.status} onChange={e => set("status", e.target.value)}>
              <option value="active">Ativa</option>
              <option value="inactive">Inativa</option>
            </select>
          </div>
        )}

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
            onClick={handleSave}
            disabled={saving}
            style={{
              flex: 1, padding: "11px", borderRadius: 10,
              border: "none", background: C.blue,
              fontSize: 13, fontWeight: 700, color: "white",
              cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit", opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? "Salvando..." : editing ? "Salvar" : "Criar Promoção"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PromocoesPage;
