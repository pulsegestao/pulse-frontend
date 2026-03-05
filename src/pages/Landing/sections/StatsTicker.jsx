import C from "../../../theme/colors";

const stats = [
  "📦 +2.400 negócios ativos",
  "💰 R$ 48M em vendas gerenciadas",
  "⚡ 99.8% de uptime",
  "🔔 +180k alertas enviados",
  "📉 67% menos produtos em falta",
  "⭐ 4.9 de satisfação",
  "🇧🇷 Feito para o Brasil",
  "🤖 IA treinada no varejo nacional",
];

const doubled = [...stats, ...stats];

const StatsTicker = () => (
  <div style={{ background: C.blue, padding: "18px 0", overflow: "hidden" }}>
    <div style={{ display: "flex", animation: "slide-x 30s linear infinite", width: "max-content" }}>
      {doubled.map((s, i) => (
        <span key={i} style={{ color: "white", fontSize: 14, fontWeight: 600, opacity: 0.9, whiteSpace: "nowrap", padding: "0 40px" }}>
          {s}
        </span>
      ))}
    </div>
  </div>
);

export default StatsTicker;
