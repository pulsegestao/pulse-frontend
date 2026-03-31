import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, CheckCircle2, Lock, User } from "lucide-react";
import C from "../../theme/colors";
import { getInviteInfo, acceptInvite } from "../../services/api";
import { saveToken } from "../../hooks/useAuth";
import { friendlyError } from "../../utils/errorMessage";

const ROLE_LABELS = {
  owner:    "Proprietário",
  manager:  "Gerente",
  employee: "Colaborador",
};

const ConvitePage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [info, setInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [infoError, setInfoError] = useState("");

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState("");

  useEffect(() => {
    if (!token) {
      setInfoError("Token de convite inválido.");
      setLoadingInfo(false);
      return;
    }
    getInviteInfo(token)
      .then(data => setInfo(data))
      .catch(e => setInfoError(friendlyError(e.message) || "Convite inválido ou expirado."))
      .finally(() => setLoadingInfo(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldError("");
    if (!name.trim()) { setFieldError("Informe seu nome."); return; }
    if (password.length < 8) { setFieldError("Senha deve ter ao menos 8 caracteres."); return; }
    setSubmitting(true);
    try {
      const result = await acceptInvite({ token, name: name.trim(), password });
      saveToken(result.token, false);
      navigate("/dashboard", { replace: true });
    } catch (e) {
      setFieldError(friendlyError(e.message) || "Não foi possível aceitar o convite.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(160deg, ${C.bluePale}, ${C.gray}, white)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: C.surface, borderRadius: 20, padding: 36, width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
        {loadingInfo ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "24px 0" }}>
            <Loader2 size={32} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
            <p style={{ color: C.mid, fontSize: 14, margin: 0 }}>Carregando convite...</p>
          </div>
        ) : infoError ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, textAlign: "center" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertCircle size={28} color="#EF4444" strokeWidth={2} />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: 0 }}>Convite inválido</p>
            <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>{infoError}</p>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 28, textAlign: "center" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: C.bluePale, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                <CheckCircle2 size={28} color={C.blue} strokeWidth={2} />
              </div>
              <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Você foi convidado!</p>
              <p style={{ fontSize: 14, color: C.mid, margin: "6px 0 0" }}>
                Para se juntar à <strong style={{ color: C.graphite }}>{info.company_name}</strong> como{" "}
                <strong style={{ color: C.blue }}>{ROLE_LABELS[info.role] || info.role}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>E-mail</label>
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.border}`, background: C.gray }}>
                  <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>{info.email}</p>
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>Seu nome</label>
                <div style={{ position: "relative" }}>
                  <User size={15} color={C.mid} strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Como quer ser chamado"
                    autoFocus
                    style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                  />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>Criar senha</label>
                <div style={{ position: "relative" }}>
                  <Lock size={15} color={C.mid} strokeWidth={2} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 14, color: C.graphite, background: C.surface, fontFamily: "inherit", boxSizing: "border-box", outline: "none" }}
                  />
                </div>
              </div>

              {fieldError && (
                <p style={{ fontSize: 13, color: "#EF4444", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
                  <AlertCircle size={13} strokeWidth={2} />
                  {fieldError}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 10, border: "none", background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, color: "white", fontSize: 14, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", marginTop: 4 }}
              >
                {submitting && <Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />}
                {submitting ? "Criando conta..." : "Criar conta e entrar"}
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ConvitePage;
