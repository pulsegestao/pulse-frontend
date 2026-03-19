import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, ArrowRight, Inbox, TrendingDown, TrendingUp, PackageX, Zap, AlertTriangle, DollarSign, Activity, Star, Users, AlertOctagon, Lightbulb, CalendarRange, PieChart } from "lucide-react";
import C from "../../../theme/colors";
import { getInsights, markInsightRead } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import { useToast } from "../../../hooks/useToast";
import WidgetError from "../../../components/WidgetError";

const TYPE_CONFIG = {
  sales_drop:             { label: "Queda de vendas",     Icon: TrendingDown,  color: "#DC2626", bg: C.redPale    },
  sales_spike:            { label: "Pico de vendas",      Icon: TrendingUp,    color: "#16A34A", bg: C.greenPale  },
  dead_stock:             { label: "Estoque parado",      Icon: PackageX,      color: "#EA580C", bg: C.orangePale },
  trending:               { label: "Em alta",             Icon: Zap,           color: "#16A34A", bg: C.greenPale  },
  low_stock:              { label: "Estoque baixo",       Icon: AlertTriangle, color: "#D97706", bg: C.amberPale  },
  abnormal_revenue:       { label: "Receita anormal",     Icon: DollarSign,    color: "#7C3AED", bg: C.purplePale },
  promo_high_performance: { label: "Promo em destaque",   Icon: Star,          color: "#16A34A", bg: C.greenPale  },
  promo_low_adoption:     { label: "Promo sem adesao",    Icon: Users,         color: "#EA580C", bg: C.orangePale },
  promo_stock_risk:       { label: "Risco de estoque",    Icon: AlertOctagon,  color: "#DC2626", bg: C.redPale    },
  promo_suggestion:       { label: "Sugestao de promo",   Icon: Lightbulb,     color: C.blue,    bg: C.bluePale   },
  period_comparison:      { label: "Comparativo semanal", Icon: CalendarRange, color: "#7C3AED", bg: C.purplePale },
  margin_compression:     { label: "Margem comprimida",   Icon: PieChart,      color: "#EA580C", bg: C.orangePale },
};

const SEV_CONFIG = {
  critical: { label: "Critico", color: "#DC2626", bg: C.redPale    },
  high:     { label: "Alto",    color: "#EA580C", bg: C.orangePale },
  medium:   { label: "Medio",   color: "#D97706", bg: C.amberPale  },
  low:      { label: "Baixo",   color: C.blue,    bg: C.bluePale   },
};

const MiniInsightCard = ({ insight, onRead }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [marking, setMarking] = useState(false);
  const [isRead, setIsRead] = useState(insight.read);

  const typeConf = TYPE_CONFIG[insight.type] || { label: insight.type, Icon: Activity, color: C.mid, bg: C.gray };
  const sevConf  = SEV_CONFIG[insight.severity] || { label: insight.severity, color: C.mid, bg: C.gray };
  const { Icon } = typeConf;

  const handleRead = async (e) => {
    e.stopPropagation();
    if (isRead || marking) return;
    setMarking(true);
    try {
      await markInsightRead(insight.id);
      setIsRead(true);
      onRead?.(insight.id);
    } catch (err) {
      toast.error(friendlyError(err.message) || "Falha ao marcar como lido.");
    } finally {
      setMarking(false);
    }
  };

  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
      padding: "12px 14px",
      borderRadius: 10,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${sevConf.color}`,
      background: C.surface,
      opacity: isRead ? 0.65 : 1,
      transition: "opacity 0.2s",
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 8,
        background: typeConf.bg,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, marginTop: 1,
      }}>
        <Icon size={14} color={typeConf.color} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
          <span style={{
            fontSize: 13, fontWeight: 700, color: C.graphite,
            flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {insight.title}
          </span>
          {!isRead && (
            <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.blue, flexShrink: 0 }} />
          )}
        </div>

        <p style={{
          fontSize: 12, color: C.mid, margin: 0, lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {insight.message}
        </p>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
          <span style={{
            display: "inline-block", padding: "2px 7px", borderRadius: 100,
            fontSize: 10, fontWeight: 700, background: typeConf.bg, color: typeConf.color,
            whiteSpace: "nowrap",
          }}>
            {typeConf.label}
          </span>

          {insight.action_link && insight.action_text && (
            <button
              onClick={(e) => { e.stopPropagation(); navigate(insight.action_link); }}
              style={{
                display: "flex", alignItems: "center", gap: 3,
                padding: "2px 8px", borderRadius: 6,
                border: "none", background: C.bluePale,
                color: C.blue, fontSize: 10, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {insight.action_text}
              <ArrowRight size={10} strokeWidth={2.5} />
            </button>
          )}

          {!isRead && (
            <button
              onClick={handleRead}
              disabled={marking}
              style={{
                padding: "2px 7px", borderRadius: 6,
                border: `1px solid ${C.border}`, background: "transparent",
                color: C.mid, fontSize: 10, fontWeight: 600,
                cursor: marking ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              {marking ? "..." : "Lido"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const InsightPreview = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    setError("");
    getInsights({ limit: 5 })
      .then(res => setItems(res.data ?? []))
      .catch(err => setError(friendlyError(err.message) || "Falha ao carregar pulsos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleRead = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, read: true } : i));
  };

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Inteligencia do negocio</p>
          <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Ultimos pulsos</p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180 }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={load} />
        </div>
      ) : items.length === 0 ? (
        <div style={{
          height: 180, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 8,
        }}>
          <Inbox size={32} color={C.mid} strokeWidth={1.5} />
          <p style={{ fontSize: 14, fontWeight: 600, color: C.mid, margin: 0 }}>Nenhum pulso ativo</p>
          <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>Seus insights aparecerão aqui.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
          {items.map(ins => (
            <MiniInsightCard key={ins.id} insight={ins} onRead={handleRead} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
        <button
          onClick={() => navigate("/insights")}
          style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            fontSize: 12, fontWeight: 600, color: C.blue,
            background: "none", border: "none", padding: 0,
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.color = C.blueLight}
          onMouseLeave={e => e.currentTarget.style.color = C.blue}
        >
          Ver todos os pulsos
          <ArrowRight size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
};

export default InsightPreview;
