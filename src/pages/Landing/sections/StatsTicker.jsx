import { Package, DollarSign, Zap, Bell, TrendingDown, Star, Globe, Bot } from "lucide-react";
import C from "../../../theme/colors";

const stats = [
  { icon: <Package size={14} strokeWidth={2} />, text: "+2.400 negócios ativos" },
  { icon: <DollarSign size={14} strokeWidth={2} />, text: "R$ 48M em vendas gerenciadas" },
  { icon: <Zap size={14} strokeWidth={2} />, text: "99.8% de uptime" },
  { icon: <Bell size={14} strokeWidth={2} />, text: "+180k alertas enviados" },
  { icon: <TrendingDown size={14} strokeWidth={2} />, text: "67% menos produtos em falta" },
  { icon: <Star size={14} strokeWidth={2} />, text: "4.9 de satisfação" },
  { icon: <Globe size={14} strokeWidth={2} />, text: "Feito para o Brasil" },
  { icon: <Bot size={14} strokeWidth={2} />, text: "IA treinada no varejo nacional" },
];

const doubled = [...stats, ...stats];

const StatsTicker = () => (
  <div style={{ background: C.blue, padding: "18px 0", overflow: "hidden" }}>
    <div style={{ display: "flex", animation: "slide-x 30s linear infinite", width: "max-content" }}>
      {doubled.map((s, i) => (
        <span key={i} style={{ color: "white", fontSize: 14, fontWeight: 600, opacity: 0.9, whiteSpace: "nowrap", padding: "0 40px", display: "inline-flex", alignItems: "center", gap: 8 }}>
          {s.icon}
          {s.text}
        </span>
      ))}
    </div>
  </div>
);

export default StatsTicker;
