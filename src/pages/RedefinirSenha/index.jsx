import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import C from "../../theme/colors";
import { resetPassword } from "../../services/api";

const inputStyle = (hasError) => ({
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1.5px solid ${hasError ? "#EF4444" : C.border}`,
  fontSize: 15,
  color: C.graphite,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  background: C.surface,
});

function isStrongPassword(p) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p);
}

export default function RedefinirSenhaPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const errs = {};
    if (!isStrongPassword(password)) {
      errs.password = "Mínimo 8 caracteres, com maiúscula, minúscula e número";
    }
    if (password !== confirm) {
      errs.confirm = "As senhas não coincidem";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError("");
    try {
      await resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const tokenMissing = !token;

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.bluePale} 0%, ${C.gray} 60%, white 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36, textDecoration: "none" }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: `0 4px 14px ${C.blue}33`,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 12h4l3-8 4 16 3-8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span className="syne" style={{ fontSize: 21, fontWeight: 800, color: C.blue, letterSpacing: "-0.3px" }}>
          Pulse <span style={{ color: C.green }}>Gestão</span>
        </span>
      </Link>

      <div style={{
        background: C.surface,
        borderRadius: 22,
        boxShadow: "0 10px 48px rgba(0,0,0,0.09)",
        padding: "40px 44px",
        width: "100%",
        maxWidth: 460,
      }}>
        {success ? (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: C.greenPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke={C.green} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.graphite, marginBottom: 12 }}>
              Senha redefinida!
            </h2>
            <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 28 }}>
              Sua senha foi alterada com sucesso. Agora você pode entrar com a nova senha.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                width: "100%",
                padding: "14px",
                background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
                color: "white",
                border: "none",
                borderRadius: 12,
                fontSize: 15,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 6px 20px ${C.blue}33`,
                fontFamily: "inherit",
              }}
            >
              Ir para o login
            </button>
          </>
        ) : tokenMissing ? (
          <>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.graphite, marginBottom: 12 }}>
              Link inválido
            </h2>
            <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 20 }}>
              Este link de redefinição é inválido ou está incompleto.
            </p>
            <Link
              to="/esqueci-senha"
              style={{
                display: "inline-block",
                fontSize: 14,
                color: C.blue,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Solicitar novo link →
            </Link>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
              Criar nova senha
            </h2>
            <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
              Escolha uma senha forte com pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.
            </p>

            {apiError && (
              <div style={{
                background: C.redPale,
                border: "1px solid #FECACA",
                borderRadius: 10,
                padding: "12px 14px",
                marginBottom: 20,
                fontSize: 13,
                color: "#DC2626",
                fontWeight: 500,
              }}>
                <p style={{ margin: "0 0 8px" }}>{apiError}</p>
                <Link to="/esqueci-senha" style={{ color: "#DC2626", fontWeight: 700, fontSize: 12 }}>
                  Solicitar novo link →
                </Link>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.graphite, marginBottom: 6 }}>
                  Nova senha
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                    onChange={(e) => { setPassword(e.target.value); setErrors((er) => ({ ...er, password: "" })); }}
                    onFocus={(e) => (e.target.style.borderColor = C.blue)}
                    onBlur={(e) => (e.target.style.borderColor = errors.password ? "#EF4444" : C.border)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      padding: 0, color: C.mid, display: "flex",
                    }}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
                {errors.password && (
                  <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.password}</p>
                )}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.graphite, marginBottom: 6 }}>
                  Confirmar senha
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="Repita a nova senha"
                    value={confirm}
                    style={{ ...inputStyle(errors.confirm), paddingRight: 44 }}
                    onChange={(e) => { setConfirm(e.target.value); setErrors((er) => ({ ...er, confirm: "" })); }}
                    onFocus={(e) => (e.target.style.borderColor = C.blue)}
                    onBlur={(e) => (e.target.style.borderColor = errors.confirm ? "#EF4444" : C.border)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      padding: 0, color: C.mid, display: "flex",
                    }}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
                  </button>
                </div>
                {errors.confirm && (
                  <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{errors.confirm}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: loading ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
                  color: loading ? C.mid : "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : `0 6px 20px ${C.blue}33`,
                  transition: "transform 0.15s, box-shadow 0.15s",
                  fontFamily: "inherit",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = `0 10px 28px ${C.blue}44`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = `0 6px 20px ${C.blue}33`;
                  }
                }}
              >
                {loading ? "Salvando..." : "Salvar nova senha"}
              </button>
            </form>
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: C.mid }}>
        <Link to="/login" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          ← Voltar para o login
        </Link>
      </p>
    </div>
  );
}
