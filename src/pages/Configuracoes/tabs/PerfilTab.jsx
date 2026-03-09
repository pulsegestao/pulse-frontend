import { useEffect, useState } from "react";
import { Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import C from "../../../theme/colors";
import { getMe, updateMe } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";

const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  color: C.graphite, background: C.surface,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const SectionCard = ({ title, subtitle, children }) => (
  <div style={{
    background: C.surface, borderRadius: 14,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    marginBottom: 16,
  }}>
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
    <div style={{ padding: "20px 24px" }}>
      {children}
    </div>
  </div>
);

const FieldLabel = ({ children }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.graphite, marginBottom: 4 }}>
    {children}
  </label>
);

const StatusBanner = ({ type, message }) => (
  <div style={{
    padding: "10px 14px", borderRadius: 8, marginBottom: 16,
    background: type === "success" ? C.greenPale : C.redPale,
    color: type === "success" ? C.green : "#EF4444",
    fontSize: 13, fontWeight: 600,
    display: "flex", alignItems: "center", gap: 8,
  }}>
    {type === "success" && <CheckCircle size={14} strokeWidth={2.5} />}
    {message}
  </div>
);

const PerfilTab = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [nameStatus, setNameStatus] = useState(null);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ old: false, new: false });
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdStatus, setPwdStatus] = useState(null);

  useEffect(() => {
    getMe()
      .then(data => {
        setUser(data);
        setName(data.name || "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveName = async () => {
    if (!name.trim()) return;
    setSavingName(true);
    setNameStatus(null);
    try {
      const updated = await updateMe({ name: name.trim() });
      setUser(updated);
      setNameStatus({ type: "success", message: "Nome atualizado com sucesso." });
    } catch (e) {
      setNameStatus({ type: "error", message: friendlyError(e.message) || "Erro ao salvar." });
    } finally {
      setSavingName(false);
    }
  };

  const handleSavePassword = async () => {
    if (!passwords.old || !passwords.new || !passwords.confirm) {
      setPwdStatus({ type: "error", message: "Preencha todos os campos." });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPwdStatus({ type: "error", message: "As senhas não coincidem." });
      return;
    }
    setSavingPwd(true);
    setPwdStatus(null);
    try {
      await updateMe({ old_password: passwords.old, new_password: passwords.new });
      setPwdStatus({ type: "success", message: "Senha alterada com sucesso." });
      setPasswords({ old: "", new: "", confirm: "" });
      setShowPasswordForm(false);
    } catch (e) {
      setPwdStatus({ type: "error", message: friendlyError(e.message) || "Erro ao alterar senha." });
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "60px 0", color: C.mid, fontSize: 14 }}>
        <Loader2 size={18} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
        Carregando...
      </div>
    );
  }

  return (
    <>
      <SectionCard title="Informações pessoais" subtitle="Seu nome público na plataforma.">
        {nameStatus && <StatusBanner type={nameStatus.type} message={nameStatus.message} />}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <FieldLabel>Nome</FieldLabel>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              style={inputSt}
              placeholder="Seu nome"
            />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <input
              value={user?.email || ""}
              readOnly
              style={{ ...inputSt, background: C.gray, color: C.mid, cursor: "not-allowed" }}
            />
            <p style={{ fontSize: 11, color: C.mid, margin: "4px 0 0" }}>
              O email não pode ser alterado diretamente.
            </p>
          </div>
        </div>
        <button
          onClick={handleSaveName}
          disabled={savingName || !name.trim()}
          style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: savingName || !name.trim() ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            color: savingName || !name.trim() ? C.mid : "white",
            fontSize: 13, fontWeight: 700, cursor: savingName || !name.trim() ? "not-allowed" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {savingName ? "Salvando..." : "Salvar nome"}
        </button>
      </SectionCard>

      <SectionCard title="Segurança" subtitle="Altere sua senha de acesso.">
        {pwdStatus && <StatusBanner type={pwdStatus.type} message={pwdStatus.message} />}
        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            style={{
              padding: "10px 24px", borderRadius: 10,
              border: `1.5px solid ${C.border}`, background: "transparent",
              fontSize: 13, fontWeight: 600, color: C.graphite,
              cursor: "pointer", fontFamily: "inherit",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Alterar senha
          </button>
        ) : (
          <div>
            <div style={{ marginBottom: 12 }}>
              <FieldLabel>Senha atual</FieldLabel>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd.old ? "text" : "password"}
                  value={passwords.old}
                  onChange={e => setPasswords(p => ({ ...p, old: e.target.value }))}
                  style={{ ...inputSt, paddingRight: 40 }}
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowPwd(s => ({ ...s, old: !s.old }))}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                >
                  {showPwd.old ? <EyeOff size={15} color={C.mid} /> : <Eye size={15} color={C.mid} />}
                </button>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div>
                <FieldLabel>Nova senha</FieldLabel>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPwd.new ? "text" : "password"}
                    value={passwords.new}
                    onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
                    style={{ ...inputSt, paddingRight: 40 }}
                    placeholder="••••••••"
                  />
                  <button
                    onClick={() => setShowPwd(s => ({ ...s, new: !s.new }))}
                    style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                  >
                    {showPwd.new ? <EyeOff size={15} color={C.mid} /> : <Eye size={15} color={C.mid} />}
                  </button>
                </div>
              </div>
              <div>
                <FieldLabel>Confirmar nova senha</FieldLabel>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
                  style={inputSt}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => { setShowPasswordForm(false); setPwdStatus(null); setPasswords({ old: "", new: "", confirm: "" }); }}
                style={{ padding: "10px 20px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSavePassword}
                disabled={savingPwd}
                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: savingPwd ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, color: savingPwd ? C.mid : "white", fontSize: 13, fontWeight: 700, cursor: savingPwd ? "not-allowed" : "pointer", fontFamily: "inherit" }}
              >
                {savingPwd ? "Salvando..." : "Salvar senha"}
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default PerfilTab;
