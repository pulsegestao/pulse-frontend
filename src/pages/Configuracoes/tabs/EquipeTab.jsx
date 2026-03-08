import { useEffect, useState } from "react";
import { Loader2, UserPlus, AlertCircle } from "lucide-react";
import C from "../../../theme/colors";
import { getCompanyMembers } from "../../../services/api";

const ROLE_CONFIG = {
  owner:    { label: "Proprietário", color: C.blue,   bg: C.bluePale },
  manager:  { label: "Gerente",      color: "#7C3AED", bg: C.purplePale },
  employee: { label: "Colaborador",  color: C.mid,    bg: C.gray },
};

const EquipeTab = ({ role }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCompanyMembers()
      .then(data => setMembers(data || []))
      .catch(e => setError(e.message || "Erro ao carregar membros."))
      .finally(() => setLoading(false));
  }, []);

  const getInitials = (name) =>
    (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div style={{
      background: C.surface, borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>Membros da equipe</p>
          <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>
            {members.length} {members.length === 1 ? "membro" : "membros"}
          </p>
        </div>
        {role === "owner" && (
          <button
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
              color: "white", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
              opacity: 0.5,
            }}
            title="Em breve"
            disabled
          >
            <UserPlus size={14} strokeWidth={2.5} />
            Convidar
          </button>
        )}
      </div>

      <div>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 24px", color: C.mid, fontSize: 14 }}>
            <Loader2 size={18} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
            Carregando...
          </div>
        ) : error ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "40px 24px", color: "#EF4444", fontSize: 14 }}>
            <AlertCircle size={18} strokeWidth={2} />
            {error}
          </div>
        ) : members.length === 0 ? (
          <p style={{ padding: "40px 24px", color: C.mid, fontSize: 14, margin: 0 }}>Nenhum membro encontrado.</p>
        ) : (
          members.map((member, i) => {
            const roleConf = ROLE_CONFIG[member.role] || ROLE_CONFIG.employee;
            return (
              <div
                key={member.id}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 24px",
                  borderBottom: i < members.length - 1 ? `1px solid ${C.border}` : "none",
                }}
              >
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0,
                }}>
                  {getInitials(member.user_name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>{member.user_name}</p>
                  <p style={{ fontSize: 12, color: C.mid, margin: "1px 0 0" }}>{member.user_email}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: roleConf.color, background: roleConf.bg,
                    borderRadius: 20, padding: "3px 10px",
                  }}>
                    {roleConf.label}
                  </span>
                  <span style={{ fontSize: 12, color: C.mid }}>
                    Desde {formatDate(member.created_at)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default EquipeTab;
