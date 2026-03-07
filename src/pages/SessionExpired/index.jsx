import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, LogIn } from "lucide-react";
import C from "../../theme/colors";

const COUNTDOWN = 10;

const SessionExpiredPage = () => {
  const navigate = useNavigate();
  const [seconds, setSeconds] = useState(COUNTDOWN);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(interval);
          navigate("/login", { replace: true });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F8F9FB",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      <div style={{
        background: "white",
        borderRadius: 20,
        padding: "48px 40px",
        maxWidth: 420,
        width: "100%",
        boxShadow: "0 4px 32px rgba(0,0,0,0.08)",
        border: `1px solid ${C.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 0,
        textAlign: "center",
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: "#FEF9C3",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: 24,
        }}>
          <ShieldAlert size={30} color="#D97706" strokeWidth={1.5} />
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 800, color: C.graphite,
          margin: "0 0 10px", letterSpacing: "-0.3px",
        }}>
          Sessão expirada
        </h1>
        <p style={{
          fontSize: 14, color: C.mid, margin: "0 0 32px", lineHeight: 1.6,
        }}>
          Por segurança, sua sessão foi encerrada após um período de inatividade.
          Faça login novamente para continuar.
        </p>

        <button
          onClick={() => navigate("/login", { replace: true })}
          style={{
            width: "100%",
            padding: "13px",
            borderRadius: 12,
            border: "none",
            background: C.blue,
            color: "white",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 16,
          }}
          onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
          onMouseLeave={e => e.currentTarget.style.opacity = "1"}
        >
          <LogIn size={16} strokeWidth={2.5} />
          Voltar ao Login
        </button>

        <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
          Redirecionando automaticamente em{" "}
          <span style={{ fontWeight: 700, color: C.graphite }}>{seconds}s</span>
        </p>
      </div>
    </div>
  );
};

export default SessionExpiredPage;
