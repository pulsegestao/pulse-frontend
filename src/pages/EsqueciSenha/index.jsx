import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../../theme/colors";
import { forgotPassword } from "../../services/api";

const inputStyle = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1.5px solid ${C.border}`,
  fontSize: 15,
  color: C.graphite,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
  transition: "border-color 0.2s",
  background: C.surface,
};

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Email inválido");
      return;
    }
    setEmailError("");
    setLoading(true);
    try {
      await forgotPassword(email);
    } catch {
      // intentionally silent — always show confirmation
    } finally {
      setLoading(false);
      setSent(true);
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
        {sent ? (
          <>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: C.greenPale,
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2z" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M22 6l-10 7L2 6" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.graphite, marginBottom: 12 }}>
              Verifique seu email
            </h2>
            <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 0 }}>
              Se este email estiver cadastrado, você receberá as instruções de redefinição em breve. Verifique sua caixa de entrada e a pasta de spam.
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
              Esqueceu sua senha?
            </h2>
            <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
              Informe seu email e enviaremos um link para criar uma nova senha.
            </p>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.graphite, marginBottom: 6 }}>
                  Email
                </label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  style={{ ...inputStyle, borderColor: emailError ? "#EF4444" : C.border }}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
                  onFocus={(e) => (e.target.style.borderColor = C.blue)}
                  onBlur={(e) => (e.target.style.borderColor = emailError ? "#EF4444" : C.border)}
                />
                {emailError && (
                  <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{emailError}</p>
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
                {loading ? "Enviando..." : "Enviar link de redefinição"}
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
