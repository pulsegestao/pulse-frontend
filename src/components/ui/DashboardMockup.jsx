import C from "../../theme/colors";
import MiniChart from "./MiniChart";

const kpis = [
  { label: "Vendas hoje", value: "R$ 3.840", icon: "💰", delta: "+12%", good: true },
  { label: "Itens em estoque", value: "1.247", icon: "📦", delta: "-3 itens", good: false },
  { label: "Alertas", value: "2", icon: "🔔", delta: "Reposição", good: null },
];

const DashboardMockup = () => (
  <div style={{
    background: "white", borderRadius: 20, overflow: "hidden",
    boxShadow: "0 32px 80px rgba(30,58,138,0.18), 0 8px 24px rgba(0,0,0,0.08)",
    border: `1px solid ${C.border}`,
    animation: "float 5s ease-in-out infinite",
    maxWidth: 520,
  }}>
    {/* Title bar */}
    <div style={{ background: C.blue, padding: "14px 20px", display: "flex", alignItems: "center", gap: 8 }}>
      {["#FF5F57", "#FFBD2E", "#28C840"].map(c => (
        <div key={c} style={{ width: 12, height: 12, borderRadius: "50%", background: c }} />
      ))}
      <span style={{ color: "white", fontSize: 13, fontWeight: 600, marginLeft: 8, opacity: 0.9 }}>Pulse Gestão – Dashboard</span>
    </div>

    <div style={{ padding: 20 }}>
      {/* KPI row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: C.gray, borderRadius: 12, padding: "14px 12px" }}>
            <div style={{ fontSize: 20, marginBottom: 6 }}>{k.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.graphite, lineHeight: 1 }}>{k.value}</div>
            <div style={{ fontSize: 11, color: C.mid, marginTop: 4 }}>{k.label}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: k.good === true ? C.green : k.good === false ? "#EF4444" : C.blue, marginTop: 3 }}>{k.delta}</div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: C.gray, borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.graphite }}>Vendas – últimos 7 dias</span>
          <span style={{ fontSize: 11, color: C.mid }}>Semana atual</span>
        </div>
        <MiniChart />
      </div>

      {/* AI tip */}
      <div style={{ background: `linear-gradient(135deg, ${C.blue}0F, ${C.green}0A)`, border: `1px solid ${C.blue}22`, borderRadius: 12, padding: 14, display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 16 }}>✨</span>
        </div>
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 3 }}>Sugestão da IA</div>
          <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.5 }}>Refrigerante 2L teve alta de 40% nos últimos 3 dias. Considere reabastecer antes do fim de semana.</div>
        </div>
      </div>
    </div>
  </div>
);

export default DashboardMockup;
