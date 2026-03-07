import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import C from "../../theme/colors";
import { verifyEmail } from "../../services/api";
import { saveToken } from "../../hooks/useAuth";

const Logo = () => (
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
);

const LoadingState = () => (
  <div style={{ textAlign: "center", padding: "16px 0" }}>
    <div style={{
      width: 56, height: 56, borderRadius: "50%",
      border: `3px solid ${C.bluePale}`,
      borderTopColor: C.blue,
      margin: "0 auto 24px",
      animation: "spin 0.8s linear infinite",
    }} />
    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.graphite, marginBottom: 8 }}>
      Verificando sua conta...
    </h2>
    <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>
      Aguarde um momento.
    </p>
  </div>
);

const SuccessState = () => (
  <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: C.greenPale,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M5 13l4 4L19 7" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 8 }}>
      Conta ativada!
    </h2>
    <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 28 }}>
      Email verificado com sucesso.<br />
      Redirecionando para o dashboard...
    </p>
    <div style={{
      height: 3,
      background: C.border,
      borderRadius: 4,
      overflow: "hidden",
    }}>
      <div style={{
        height: "100%",
        background: `linear-gradient(90deg, ${C.green}, ${C.greenLight})`,
        animation: "progress 1.8s linear forwards",
      }} />
    </div>
  </div>
);

const errorMessages = {
  "código de verificação expirado": {
    title: "Link expirado",
    body: "Este link de ativação expirou. Refaça o cadastro para receber um novo email.",
  },
  "código de verificação já utilizado": {
    title: "Link já utilizado",
    body: "Esta conta já foi ativada. Faça login para continuar.",
  },
  "código de verificação inválido": {
    title: "Link inválido",
    body: "Este link de ativação não é válido. Verifique se o link está completo.",
  },
  "recurso já existe": {
    title: "Conta já ativada",
    body: "Esta conta já foi verificada anteriormente. Faça login para continuar.",
  },
};

const ErrorState = ({ message }) => {
  const info = errorMessages[message] || {
    title: "Algo deu errado",
    body: "Não foi possível verificar seu email. Tente novamente ou entre em contato.",
  };

  return (
    <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: C.redPale,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 8 }}>
        {info.title}
      </h2>
      <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 24 }}>
        {info.body}
      </p>
      <Link to="/cadastro" style={{
        display: "inline-block",
        padding: "12px 28px",
        background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
        color: "white",
        borderRadius: 12,
        fontSize: 14,
        fontWeight: 700,
        textDecoration: "none",
        boxShadow: `0 4px 14px ${C.blue}33`,
      }}>
        Fazer novo cadastro
      </Link>
    </div>
  );
};

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const token = searchParams.get("token");
    if (!token) {
      setErrorMsg("código de verificação inválido");
      setStatus("error");
      return;
    }

    verifyEmail(token)
      .then((data) => {
        saveToken(data.token);
        navigate("/dashboard", { replace: true });
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setStatus("error");
      });
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${C.bluePale} 0%, ${C.gray} 60%, ${C.surface} 100%)`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
    }}>
      <Logo />

      <div style={{
        background: C.surface,
        borderRadius: 22,
        boxShadow: "0 10px 48px rgba(0,0,0,0.09)",
        padding: "40px 44px",
        width: "100%",
        maxWidth: 460,
      }}>
        {status === "loading" && <LoadingState />}
        {status === "success" && <SuccessState />}
        {status === "error" && <ErrorState message={errorMsg} />}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmailPage;
