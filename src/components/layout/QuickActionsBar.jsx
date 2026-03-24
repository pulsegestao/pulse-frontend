import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Package, BarChart2, Activity, Tag } from "lucide-react";
import C from "../../theme/colors";
import { getProfile } from "../../hooks/useAuth";

const ITEMS = [
  { label: "Dashboard",       Icon: LayoutDashboard, href: "/dashboard",     roles: ["owner", "manager"] },
  { label: "Registrar venda", Icon: ShoppingCart,    href: "/pdv",           roles: ["owner", "manager", "employee"] },
  { label: "Gerir estoque",   Icon: Package,         href: "/gerir-estoque", roles: ["owner", "manager", "employee"] },
  { label: "Relatórios",      Icon: BarChart2,       href: "/relatorios",    roles: ["owner", "manager"] },
  { label: "Promoções",       Icon: Tag,             href: "/promocoes",     roles: ["owner", "manager"] },
  { label: "Pulso",           Icon: Activity,        href: "/insights",      roles: ["owner", "manager"] },
];

const QuickActionsBar = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const role = getProfile()?.role ?? "";
  const visibleItems = ITEMS.filter(item => item.roles.includes(role));

  return (
    <div style={{
      position: "fixed",
      top: 64,
      left: 0,
      right: 0,
      zIndex: 99,
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      height: 44,
      display: "flex",
      alignItems: "center",
      padding: "0 24px",
    }}>
      <div style={{
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}>
        {visibleItems.map(({ label, Icon, href }) => {
          const active = pathname === href;
          return (
            <button
              key={href}
              onClick={() => navigate(href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "0 14px",
                height: 44,
                background: "none",
                border: "none",
                borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                color: active ? C.blue : C.mid,
                fontFamily: "inherit",
                transition: "color 0.15s",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = C.graphite; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.mid; } }}
            >
              <Icon size={14} strokeWidth={2} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsBar;
