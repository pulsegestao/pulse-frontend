import { ShoppingCart, Package, PackagePlus, BarChart2 } from "lucide-react";
import C from "../../../theme/colors";

const ACTIONS = [
  {
    label: "Registrar venda",
    description: "Abrir PDV",
    icon: ShoppingCart,
    color: C.blue,
    bg: C.bluePale,
    hoverBg: `${C.blue}18`,
  },
  {
    label: "Adicionar produto",
    description: "Novo cadastro",
    icon: Package,
    color: C.green,
    bg: C.greenPale,
    hoverBg: `${C.green}18`,
  },
  {
    label: "Entrada de estoque",
    description: "Registrar entrada",
    icon: PackagePlus,
    color: "#7C3AED",
    bg: "#F5F3FF",
    hoverBg: "#7C3AED18",
  },
  {
    label: "Ver relatórios",
    description: "Análises e dados",
    icon: BarChart2,
    color: "#D97706",
    bg: "#FFFBEB",
    hoverBg: "#D9770618",
  },
];

const ActionCard = ({ label, description, icon: Icon, color, bg, hoverBg }) => (
  <button
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "16px 18px",
      borderRadius: 14,
      border: `1.5px solid ${C.border}`,
      background: "white",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
      transition: "all 0.18s",
      width: "100%",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = bg;
      e.currentTarget.style.borderColor = color + "44";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = `0 4px 16px ${color}18`;
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "white";
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={20} color={color} strokeWidth={2} />
    </div>
    <div>
      <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0, lineHeight: 1.3 }}>{label}</p>
      <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>{description}</p>
    </div>
  </button>
);

const QuickActions = () => (
  <div style={{
    background: "white",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    border: `1px solid ${C.border}`,
  }}>
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Navegação rápida</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Ações rápidas</p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      {ACTIONS.map(a => <ActionCard key={a.label} {...a} />)}
    </div>
  </div>
);

export default QuickActions;
