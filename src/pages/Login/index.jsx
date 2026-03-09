import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import C from "../../theme/colors";
import { loginUser } from "../../services/api";
import { saveToken, isAuthenticated } from "../../hooks/useAuth";

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

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: C.graphite,
  marginBottom: 6,
};

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={labelStyle}>{label}</label>
    {children}
    {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</p>}
  </div>
);

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) navigate("/dashboard", { replace: true });
  }, []);

  const validate = (e, p) => {
    const errs = {};
    if (!e.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errs.email = "Email inválido";
    if (!p) errs.password = "Senha obrigatória";
    return errs;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(email, password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(email, password);
    setErrors(errs);
    setTouched({ email: true, password: true });
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setApiError("");
    try {
      const data = await loginUser(email, password, rememberMe);
      saveToken(data.token, rememberMe);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
          Bem-vindo de volta
        </h2>
        <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
          Entre com sua conta para continuar.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <Field label="Email" error={touched.email && errors.email}>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              style={inputStyle(touched.email && errors.email)}
              onChange={(e) => { setEmail(e.target.value); setApiError(""); }}
              onBlur={() => handleBlur("email")}
              onFocus={(e) => (e.target.style.borderColor = C.blue)}
            />
          </Field>

          <Field label="Senha" error={touched.password && errors.password}>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Sua senha"
                value={password}
                style={{ ...inputStyle(touched.password && errors.password), paddingRight: 44 }}
                onChange={(e) => { setPassword(e.target.value); setApiError(""); }}
                onBlur={() => handleBlur("password")}
                onFocus={(e) => (e.target.style.borderColor = C.blue)}
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
                {showPassword
                  ? <EyeOff size={18} strokeWidth={2} />
                  : <Eye size={18} strokeWidth={2} />
                }
              </button>
            </div>
          </Field>

          <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 18 }}>
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 2, cursor: "pointer", accentColor: C.blue, flexShrink: 0 }}
            />
            <label htmlFor="remember-me" style={{ cursor: "pointer" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite, display: "block", lineHeight: 1.3 }}>
                Lembrar de mim
              </span>
              <span style={{ fontSize: 12, color: C.mid, display: "block", marginTop: 1 }}>
                Mantém você conectado por 30 dias neste dispositivo
              </span>
            </label>
          </div>

          {apiError && (
            <div style={{
              background: C.redPale,
              border: "1px solid #FECACA",
              borderRadius: 10,
              padding: "12px 14px",
              marginBottom: 18,
              fontSize: 13,
              color: "#DC2626",
              fontWeight: 500,
            }}>
              {apiError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading
                ? C.border
                : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
              color: loading ? C.mid : "white",
              border: "none",
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : `0 6px 20px ${C.blue}33`,
              transition: "transform 0.15s, box-shadow 0.15s, background 0.2s",
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
            {loading ? "Entrando..." : "Entrar"}
          </button>
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <Link to="/esqueci-senha" style={{ fontSize: 13, color: C.mid, textDecoration: "none", fontWeight: 500 }}>
              Esqueci minha senha
            </Link>
          </div>
        </form>
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: C.mid }}>
        Não tem conta?{" "}
        <Link to="/cadastro" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          Cadastre-se grátis
        </Link>
      </p>
    </div>
  );
}
