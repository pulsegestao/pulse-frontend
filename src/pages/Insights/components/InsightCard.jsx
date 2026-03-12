import { useState } from "react";
import { TrendingDown, TrendingUp, PackageX, Zap, AlertTriangle, DollarSign, Sparkles, Check } from "lucide-react";
import C from "../../../theme/colors";
import { markInsightRead } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import { useToast } from "../../../hooks/useToast";

const TYPE_CONFIG = {
  sales_drop:       { label: "Queda de vendas",  Icon: TrendingDown,  color: "#DC2626", bg: C.redPale    },
  sales_spike:      { label: "Pico de vendas",   Icon: TrendingUp,    color: "#16A34A", bg: C.greenPale  },
  dead_stock:       { label: "Estoque parado",   Icon: PackageX,      color: "#EA580C", bg: C.orangePale },
  trending:         { label: "Em alta",           Icon: Zap,           color: "#16A34A", bg: C.greenPale  },
  low_stock:        { label: "Estoque baixo",     Icon: AlertTriangle, color: "#D97706", bg: C.amberPale  },
  abnormal_revenue: { label: "Receita anormal",   Icon: DollarSign,    color: "#7C3AED", bg: C.purplePale },
};

const SEV_CONFIG = {
  critical: { label: "Crítico", color: "#DC2626", bg: C.redPale    },
  high:     { label: "Alto",    color: "#EA580C", bg: C.orangePale },
  medium:   { label: "Médio",   color: "#D97706", bg: C.amberPale  },
  low:      { label: "Baixo",   color: "#1E3A8A", bg: C.bluePale   },
};

const MONTHS = ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez"];
const formatDate = (str) => {
  const d = new Date(str);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const Badge = ({ label, color, bg, small }) => (
  <span style={{
    display: "inline-block",
    padding: small ? "2px 7px" : "3px 9px",
    borderRadius: 100,
    fontSize: small ? 10 : 11,
    fontWeight: 700,
    background: bg,
    color,
    whiteSpace: "nowrap",
    letterSpacing: "0.2px",
  }}>
    {label}
  </span>
);

const InsightCard = ({ insight, onRead }) => {
  const toast = useToast();
  const [marking, setMarking] = useState(false);
  const [isRead, setIsRead] = useState(insight.read);

  const typeConf = TYPE_CONFIG[insight.type] || { label: insight.type, Icon: Sparkles, color: C.mid, bg: C.gray };
  const sevConf  = SEV_CONFIG[insight.severity]  || { label: insight.severity, color: C.mid, bg: C.gray };
  const { Icon } = typeConf;

  const handleRead = async () => {
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
      background: C.surface,
      borderRadius: 12,
      border: `1px solid ${C.border}`,
      borderLeft: `3px solid ${sevConf.color}`,
      padding: "16px 18px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
      opacity: isRead ? 0.72 : 1,
      transition: "opacity 0.2s",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: typeConf.bg,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          <Icon size={16} color={typeConf.color} strokeWidth={2} />
        </div>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.graphite, flex: 1, lineHeight: 1.3 }}>
          {insight.title}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
          <Badge label={sevConf.label} color={sevConf.color} bg={sevConf.bg} small />
          {!isRead && (
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626", flexShrink: 0 }} />
          )}
        </div>
      </div>

      {/* Message */}
      <p style={{
        fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.5,
        display: "-webkit-box", WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {insight.message}
      </p>

      {/* Footer */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Badge label={typeConf.label} color={typeConf.color} bg={typeConf.bg} small />
          <span style={{ fontSize: 11, color: C.mid }}>{formatDate(insight.created_at)}</span>
        </div>
        {!isRead && (
          <button
            onClick={handleRead}
            disabled={marking}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "4px 10px", borderRadius: 7,
              border: `1px solid ${C.border}`,
              background: "transparent",
              color: C.mid, fontSize: 11, fontWeight: 600,
              cursor: marking ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (!marking) { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; } }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.mid; }}
          >
            <Check size={11} strokeWidth={2.5} />
            {marking ? "Marcando..." : "Marcar como lido"}
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
