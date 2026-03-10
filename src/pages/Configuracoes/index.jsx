import { useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { User, Building2, Users, SlidersHorizontal, Shield, Plug, ArrowLeft } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import { getProfile, isAuthenticated } from "../../hooks/useAuth";
import PerfilTab from "./tabs/PerfilTab";
import EmpresaTab from "./tabs/EmpresaTab";
import EquipeTab from "./tabs/EquipeTab";
import PreferenciasTab from "./tabs/PreferenciasTab";
import SegurancaTab from "./tabs/SegurancaTab";
import IntegracoesTab from "./tabs/IntegracoesTab";

const ALL_TABS = [
  { id: "perfil",       label: "Perfil",        icon: User,              roles: ["owner", "manager", "employee"] },
  { id: "empresa",      label: "Empresa",        icon: Building2,         roles: ["owner", "manager"] },
  { id: "equipe",       label: "Equipe",         icon: Users,             roles: ["owner", "manager"] },
  { id: "preferencias", label: "Preferências",   icon: SlidersHorizontal, roles: ["owner", "manager", "employee"] },
  { id: "integracoes",  label: "Integrações",    icon: Plug,              roles: ["owner", "manager"] },
  { id: "seguranca",    label: "Segurança",      icon: Shield,            roles: ["owner", "manager", "employee"] },
];

const TAB_COMPONENTS = {
  perfil:       PerfilTab,
  empresa:      EmpresaTab,
  equipe:       EquipeTab,
  preferencias: PreferenciasTab,
  integracoes:  IntegracoesTab,
  seguranca:    SegurancaTab,
};

const ConfiguracoesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const profile = getProfile();
  const role = profile?.role || "employee";

  const visibleTabs = ALL_TABS.filter(t => t.roles.includes(role));
  const activeTabId = searchParams.get("tab") || visibleTabs[0]?.id || "perfil";
  const activeTab = visibleTabs.find(t => t.id === activeTabId) || visibleTabs[0];

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/", { replace: true }); return; }
    if (!searchParams.get("tab") && visibleTabs.length > 0) {
      setSearchParams({ tab: visibleTabs[0].id }, { replace: true });
    }
  }, []);

  const ActiveComponent = TAB_COMPONENTS[activeTab?.id] || PerfilTab;

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "80px 24px 48px" }}>
        <div style={{ paddingTop: 8, marginBottom: 28, display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.mid, textDecoration: "none",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.mid; }}
          >
            <ArrowLeft size={17} strokeWidth={2} color="currentColor" />
          </Link>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Conta
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
              Configurações
            </h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* Sidebar */}
          <nav style={{
            width: 220, flexShrink: 0,
            background: C.surface, borderRadius: 14,
            border: `1px solid ${C.border}`,
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
            padding: "8px 8px",
          }}>
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = tab.id === activeTab?.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSearchParams({ tab: tab.id })}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%", padding: "10px 12px",
                    borderRadius: 10, border: "none", cursor: "pointer",
                    background: isActive ? C.bluePale : "transparent",
                    color: isActive ? C.blue : C.mid,
                    fontSize: 13, fontWeight: isActive ? 700 : 500,
                    fontFamily: "inherit",
                    transition: "background 0.15s, color 0.15s",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = C.gray;
                      e.currentTarget.style.color = C.graphite;
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = C.mid;
                    }
                  }}
                >
                  <Icon size={16} strokeWidth={isActive ? 2.5 : 2} color="currentColor" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <ActiveComponent role={role} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ConfiguracoesPage;
