import { useNavigate } from "react-router-dom";
import { ShoppingCart, Sparkles, PackagePlus, Package } from "lucide-react";
import C from "../../../theme/colors";

const ACTIONS = [
  { label: "Registrar venda",    description: "Abrir PDV",            icon: ShoppingCart, href: "/pdv"             },
  { label: "Pulse Insights",     description: "Relatórios e análises", icon: Sparkles,     href: "/relatorios"      },
  { label: "Entrada de estoque", description: "Registrar entrada",     icon: PackagePlus,  href: "/estoque/entrada" },
  { label: "Gerir produtos",     description: "Catálogo e estoque",    icon: Package,      href: "/gerir-estoque"   },
];

const ActionCard = ({ label, description, icon: Icon, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      padding: "14px 16px",
      borderRadius: 12,
      border: "1.5px solid rgba(255,255,255,0.18)",
      background: "rgba(255,255,255,0.12)",
      cursor: "pointer",
      textAlign: "left",
      fontFamily: "inherit",
      transition: "all 0.18s",
      width: "100%",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = "rgba(255,255,255,0.22)";
      e.currentTarget.style.transform = "translateY(-1px)";
      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "rgba(255,255,255,0.12)";
      e.currentTarget.style.transform = "none";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div style={{
      width: 40, height: 40, borderRadius: 10,
      background: "rgba(255,255,255,0.18)",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={19} color="white" strokeWidth={2} />
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 700, color: "white", margin: 0, lineHeight: 1.3 }}>{label}</p>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: "2px 0 0" }}>{description}</p>
    </div>
  </button>
);

const QuickActions = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
      borderRadius: 16,
      padding: "24px",
      boxShadow: `0 4px 20px ${C.blue}44`,
    }}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", margin: "0 0 4px" }}>Navegação rápida</p>
        <p style={{ fontSize: 18, fontWeight: 800, color: "white", margin: 0 }}>Ações rápidas</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {ACTIONS.map(a => (
          <ActionCard
            key={a.label}
            {...a}
            onClick={a.href ? () => navigate(a.href) : undefined}
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
