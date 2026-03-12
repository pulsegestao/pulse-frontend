import { useState, useEffect } from "react";
import { Bell, LogOut, Moon, Settings, Sun } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import C from "../../../theme/colors";
import { getProfile, removeToken } from "../../../hooks/useAuth";
import { useTheme } from "../../../hooks/useTheme";

const getInitials = (name) =>
  name.split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

const roleLabel = (role) => {
  if (role === "owner") return "Proprietário";
  if (role === "manager") return "Gerente";
  return "Colaborador";
};

const IconBtn = ({ children, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 36, height: 36, borderRadius: 9,
      background: "transparent", border: "none", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "background 0.15s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = C.gray}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    {children}
  </button>
);

const DashboardHeader = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(getProfile);
  const userName = profile?.userName || "Usuário";
  const companyName = profile?.companyName || "Minha Empresa";
  const role = profile?.role || "employee";
  const { dark, toggle } = useTheme();

  const [confirmingLogout, setConfirmingLogout] = useState(false);

  useEffect(() => {
    const handler = () => setProfile(getProfile());
    window.addEventListener("pulse:profile-updated", handler);
    return () => window.removeEventListener("pulse:profile-updated", handler);
  }, []);

  const handleLogout = () => {
    removeToken();
    navigate("/login", { replace: true });
  };

  return (
    <>
    <style>{`@media (max-width: 640px) { .nav-label { display: none; } }`}</style>
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: C.surface,
      borderBottom: `1px solid ${C.border}`,
      boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
      height: 64,
      display: "flex", alignItems: "center",
      padding: "0 28px",
      justifyContent: "space-between",
      gap: 16,
    }}>
      {/* Left: logo + divider + company name */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
        <Link to="/dashboard" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 3px 10px ${C.blue}33`,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-8 4 16 3-8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="syne" style={{ fontSize: 17, fontWeight: 800, color: C.blue, letterSpacing: "-0.2px" }}>
            Pulse <span style={{ color: C.green }}>Gestão</span>
          </span>
        </Link>

        <div style={{ width: 1, height: 26, background: C.border }} />

        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: C.mid, margin: 0, letterSpacing: "0.3px", textTransform: "uppercase" }}>
            Empresa
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>
            {companyName}
          </p>
        </div>
      </div>

      {/* Right: actions */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <IconBtn onClick={() => navigate("/configuracoes")} title="Configurações">
          <Settings size={17} color={C.mid} strokeWidth={2} />
        </IconBtn>

        <IconBtn onClick={toggle} title={dark ? "Modo claro" : "Modo noturno"}>
          {dark
            ? <Sun  size={17} color={C.mid} strokeWidth={2} />
            : <Moon size={17} color={C.mid} strokeWidth={2} />
          }
        </IconBtn>

        <div style={{ position: "relative" }}>
          <IconBtn>
            <Bell size={17} color={C.mid} strokeWidth={2} />
          </IconBtn>
          <span style={{
            position: "absolute", top: 6, right: 6,
            width: 8, height: 8, borderRadius: "50%",
            background: "#EF4444", border: `2px solid ${C.surface}`,
            display: "block",
          }} />
        </div>

        <div style={{ width: 1, height: 26, background: C.border, margin: "0 4px" }} />

        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 10px", borderRadius: 12,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0,
          }}>
            {getInitials(userName)}
          </div>
          <div style={{ textAlign: "left" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: 0, lineHeight: 1.2 }}>{userName}</p>
            <p style={{ fontSize: 11, color: C.mid, margin: 0, lineHeight: 1.2 }}>{roleLabel(role)}</p>
          </div>
        </div>

        <button
          onClick={() => setConfirmingLogout(true)}
          title="Sair"
          style={{
            width: 36, height: 36, borderRadius: 9,
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "background 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.redPale}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <LogOut size={16} color="#EF4444" strokeWidth={2} />
        </button>
      </div>
    </header>

      {confirmingLogout && (
        <div
          onClick={() => setConfirmingLogout(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 200,
            background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: C.surface, borderRadius: 16, padding: "28px 28px 24px",
              width: 320, boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: C.redPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 16,
            }}>
              <LogOut size={20} color="#EF4444" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: "0 0 6px" }}>
              Sair da conta?
            </p>
            <p style={{ fontSize: 13, color: C.mid, margin: "0 0 24px", lineHeight: 1.5 }}>
              Você será redirecionado para a tela de login.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmingLogout(false)}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
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
                onClick={handleLogout}
                style={{
                  flex: 1, padding: "10px", borderRadius: 10,
                  border: "none", background: "#EF4444",
                  fontSize: 13, fontWeight: 700, color: "white",
                  cursor: "pointer", fontFamily: "inherit",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardHeader;
