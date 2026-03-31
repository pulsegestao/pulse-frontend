import { useEffect, useState, useRef } from "react";
import {
  Loader2, UserPlus, AlertCircle, Trash2, ChevronDown,
  Clock, X, Mail, ShieldCheck, Activity, ChevronRight,
} from "lucide-react";
import C from "../../../theme/colors";
import {
  getCompanyMembers, inviteMember, getPendingInvites, cancelInvite,
  removeMember, changeMemberRole, getAuditLog, getBillingInfo,
} from "../../../services/api";
import { getProfile } from "../../../hooks/useAuth";
import { friendlyError } from "../../../utils/errorMessage";
import { useToast } from "../../../hooks/useToast";

const ROLE_CONFIG = {
  owner:    { label: "Proprietário", color: C.blue,    bg: C.bluePale },
  manager:  { label: "Gerente",      color: "#7C3AED", bg: C.purplePale },
  employee: { label: "Colaborador",  color: C.mid,     bg: C.gray },
};

const AUDIT_ICONS = {
  "member.invited":   { icon: UserPlus,    color: C.blue },
  "invite.accepted":  { icon: ShieldCheck, color: "#16A34A" },
  "invite.cancelled": { icon: X,           color: C.mid },
  "member.removed":   { icon: Trash2,      color: "#EF4444" },
  "role.changed":     { icon: ShieldCheck, color: "#7C3AED" },
};

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
  return `${Math.floor(diff / 86400)}d atrás`;
}

function daysUntil(dateStr) {
  const diff = (new Date(dateStr) - Date.now()) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(diff));
}

const EquipeTab = ({ role }) => {
  const toast = useToast();
  const profile = getProfile();
  const myUserId = profile?.userId ?? "";

  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [maxUsers, setMaxUsers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("employee");
  const [inviting, setInviting] = useState(false);

  const [removingId, setRemovingId] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [roleDropdownId, setRoleDropdownId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [auditOffset, setAuditOffset] = useState(0);
  const [loadingMoreAudit, setLoadingMoreAudit] = useState(false);
  const [hasMoreAudit, setHasMoreAudit] = useState(true);
  const dropdownRef = useRef(null);

  const isOwner = role === "owner";

  useEffect(() => {
    Promise.all([
      getCompanyMembers(),
      isOwner ? getPendingInvites() : Promise.resolve([]),
      isOwner ? getAuditLog(20, 0) : Promise.resolve([]),
      isOwner ? getBillingInfo() : Promise.resolve(null),
    ])
      .then(([m, inv, logs, billing]) => {
        setMembers(m || []);
        setInvites(inv || []);
        setAuditLogs(logs || []);
        if (billing?.current_plan?.limits?.max_users) {
          setMaxUsers(billing.current_plan.limits.max_users);
        }
        if ((logs || []).length < 20) setHasMoreAudit(false);
      })
      .catch(e => setError(friendlyError(e.message) || "Não foi possível carregar a equipe."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setRoleDropdownId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const getInitials = (name) =>
    (name || "?").split(" ").filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const inv = await inviteMember({ email: inviteEmail.trim(), role: inviteRole });
      setInvites(prev => [inv, ...prev]);
      setShowInviteModal(false);
      setInviteEmail("");
      setInviteRole("employee");
      toast.success("Convite enviado com sucesso!");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setInviting(false);
    }
  };

  const handleCancelInvite = async (id) => {
    setCancellingId(id);
    try {
      await cancelInvite(id);
      setInvites(prev => prev.filter(inv => inv.id !== id));
      toast.success("Convite cancelado.");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setCancellingId(null);
    }
  };

  const handleRemove = async (userId) => {
    setConfirmRemove(null);
    setRemovingId(userId);
    try {
      await removeMember(userId);
      setMembers(prev => prev.filter(m => m.user_id !== userId));
      toast.success("Membro removido.");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setRemovingId(null);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    setRoleDropdownId(null);
    try {
      await changeMemberRole(userId, newRole);
      setMembers(prev => prev.map(m => m.user_id === userId ? { ...m, role: newRole } : m));
      toast.success("Cargo atualizado.");
    } catch (e) {
      toast.error(friendlyError(e.message));
    }
  };

  const handleLoadMoreAudit = async () => {
    const newOffset = auditOffset + 20;
    setLoadingMoreAudit(true);
    try {
      const more = await getAuditLog(20, newOffset);
      setAuditLogs(prev => [...prev, ...(more || [])]);
      setAuditOffset(newOffset);
      if ((more || []).length < 20) setHasMoreAudit(false);
    } catch {
    } finally {
      setLoadingMoreAudit(false);
    }
  };

  const canInvite = isOwner && (maxUsers === null || (members.length + invites.length) < maxUsers);
  const atLimit = isOwner && maxUsers !== null && (members.length + invites.length) >= maxUsers;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Members Card */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>Membros da equipe</p>
              <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>
                {members.length}{maxUsers ? ` / ${maxUsers}` : ""} {members.length === 1 ? "membro" : "membros"}
              </p>
            </div>
            {isOwner && (
              <button
                onClick={() => canInvite && setShowInviteModal(true)}
                disabled={!canInvite}
                title={atLimit ? "Limite de usuários atingido. Faça upgrade para adicionar mais." : "Convidar membro"}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "9px 16px", borderRadius: 10, border: "none",
                  background: canInvite ? `linear-gradient(135deg, ${C.blue}, ${C.blueLight})` : C.gray,
                  color: canInvite ? "white" : C.mid,
                  fontSize: 13, fontWeight: 700, cursor: canInvite ? "pointer" : "not-allowed",
                  fontFamily: "inherit", transition: "opacity 0.15s",
                }}
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
                const isMe = member.user_id === myUserId;
                const isOwnerMember = member.role === "owner";
                return (
                  <div key={member.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 24px", borderBottom: i < members.length - 1 ? `1px solid ${C.border}` : "none" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>
                      {getInitials(member.user_name)}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>
                        {member.user_name}{isMe ? " (você)" : ""}
                      </p>
                      <p style={{ fontSize: 12, color: C.mid, margin: "1px 0 0" }}>{member.user_email}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      {isOwner && !isOwnerMember ? (
                        <div style={{ position: "relative" }} ref={roleDropdownId === member.user_id ? dropdownRef : null}>
                          <button
                            onClick={() => setRoleDropdownId(roleDropdownId === member.user_id ? null : member.user_id)}
                            style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 20, border: `1px solid ${C.border}`, background: roleConf.bg, color: roleConf.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
                          >
                            {roleConf.label}
                            <ChevronDown size={11} strokeWidth={2.5} />
                          </button>
                          {roleDropdownId === member.user_id && (
                            <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.1)", zIndex: 100, minWidth: 140, overflow: "hidden" }}>
                              {["manager", "employee"].map(r => (
                                <button
                                  key={r}
                                  onClick={() => handleChangeRole(member.user_id, r)}
                                  style={{ display: "block", width: "100%", padding: "10px 14px", border: "none", background: member.role === r ? C.bluePale : "transparent", color: member.role === r ? C.blue : C.graphite, fontSize: 13, fontWeight: member.role === r ? 700 : 500, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}
                                >
                                  {ROLE_CONFIG[r].label}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, fontWeight: 700, color: roleConf.color, background: roleConf.bg, borderRadius: 20, padding: "3px 10px" }}>
                          {roleConf.label}
                        </span>
                      )}
                      <span style={{ fontSize: 12, color: C.mid }}>Desde {formatDate(member.created_at)}</span>
                      {isOwner && !isOwnerMember && (
                        removingId === member.user_id ? (
                          <Loader2 size={16} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                        ) : (
                          <button
                            onClick={() => setConfirmRemove(member)}
                            style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: "#EF4444", cursor: "pointer" }}
                          >
                            <Trash2 size={14} strokeWidth={2} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Pending Invites */}
        {isOwner && invites.length > 0 && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "16px 24px 14px", borderBottom: `1px solid ${C.border}` }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>Convites pendentes</p>
            </div>
            {invites.map((inv, i) => (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 24px", borderBottom: i < invites.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <Mail size={16} color={C.mid} strokeWidth={2} style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, color: C.graphite, fontWeight: 600, margin: 0 }}>{inv.email}</p>
                  <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0", display: "flex", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: ROLE_CONFIG[inv.role]?.color, background: ROLE_CONFIG[inv.role]?.bg, borderRadius: 20, padding: "1px 8px" }}>
                      {ROLE_CONFIG[inv.role]?.label}
                    </span>
                    <Clock size={11} strokeWidth={2} />
                    Expira em {daysUntil(inv.expires_at)}d
                  </p>
                </div>
                {cancellingId === inv.id ? (
                  <Loader2 size={16} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                ) : (
                  <button
                    onClick={() => handleCancelInvite(inv.id)}
                    style={{ width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", color: C.mid, cursor: "pointer" }}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Audit Log */}
        {isOwner && !loading && (
          <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ padding: "16px 24px 14px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <Activity size={15} color={C.mid} strokeWidth={2} />
              <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>Atividade recente</p>
            </div>
            {auditLogs.length === 0 ? (
              <p style={{ padding: "24px", color: C.mid, fontSize: 13, margin: 0 }}>Nenhuma atividade registrada.</p>
            ) : (
              <>
                {auditLogs.map((log, i) => {
                  const conf = AUDIT_ICONS[log.action] || { icon: Activity, color: C.mid };
                  const Icon = conf.icon;
                  return (
                    <div key={log.id || i} style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 24px", borderBottom: i < auditLogs.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.gray, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon size={14} color={conf.color} strokeWidth={2} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 13, color: C.graphite, margin: 0 }}>
                          <span style={{ fontWeight: 700 }}>{log.actor_name || "Sistema"}</span>
                          {" "}{auditActionLabel(log.action, log.new_value || log.old_value)}
                        </p>
                        <p style={{ fontSize: 11, color: C.mid, margin: "2px 0 0" }}>{timeAgo(log.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
                {hasMoreAudit && (
                  <div style={{ padding: "12px 24px" }}>
                    <button
                      onClick={handleLoadMoreAudit}
                      disabled={loadingMoreAudit}
                      style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: C.blue, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
                    >
                      {loadingMoreAudit ? <Loader2 size={14} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> : <ChevronRight size={14} strokeWidth={2.5} />}
                      Ver mais
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
          onClick={e => { if (e.target === e.currentTarget) setShowInviteModal(false); }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: 0 }}>Convidar membro</p>
              <button onClick={() => setShowInviteModal(false)} style={{ width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", cursor: "pointer", color: C.mid }}>
                <X size={16} strokeWidth={2} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>E-mail</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleInvite()}
                  placeholder="funcionario@email.com"
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>Cargo</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, fontFamily: "inherit", cursor: "pointer", outline: "none" }}
                >
                  <option value="employee">Colaborador — usa PDV e estoque</option>
                  <option value="manager">Gerente — acesso total exceto financeiro</option>
                </select>
              </div>
              <button
                onClick={handleInvite}
                disabled={inviting || !inviteEmail.trim()}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px", borderRadius: 10, border: "none", background: inviteEmail.trim() ? `linear-gradient(135deg, ${C.blue}, ${C.blueLight})` : C.gray, color: inviteEmail.trim() ? "white" : C.mid, fontSize: 14, fontWeight: 700, cursor: inviteEmail.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", marginTop: 4 }}
              >
                {inviting ? <Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> : <UserPlus size={16} strokeWidth={2.5} />}
                {inviting ? "Enviando..." : "Enviar convite"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: C.surface, borderRadius: 16, padding: 28, width: "100%", maxWidth: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 8px" }}>Remover membro?</p>
            <p style={{ fontSize: 14, color: C.mid, margin: "0 0 24px" }}>
              <strong>{confirmRemove.user_name}</strong> perderá acesso imediatamente.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setConfirmRemove(null)} style={{ flex: 1, padding: "11px", borderRadius: 10, border: `1px solid ${C.border}`, background: "transparent", color: C.graphite, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Cancelar
              </button>
              <button
                onClick={() => handleRemove(confirmRemove.user_id)}
                style={{ flex: 1, padding: "11px", borderRadius: 10, border: "none", background: "#EF4444", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

function auditActionLabel(action, detail) {
  const map = {
    "member.invited":   `convidou ${detail || ""}`,
    "invite.accepted":  "aceitou o convite",
    "invite.cancelled": `cancelou convite para ${detail || ""}`,
    "member.removed":   `removeu ${detail || "membro"}`,
    "role.changed":     `alterou cargo para ${ROLE_CONFIG[detail]?.label || detail}`,
  };
  return map[action] || action;
}

export default EquipeTab;
