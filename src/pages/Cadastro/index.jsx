import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../../theme/colors";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";
import { registerUser } from "../../services/api";

const INITIAL = {
  nome: "", email: "", senha: "", confirmarSenha: "", cpf: "",
  negocio: "", tipoNegocio: "", temCnpj: null, cnpj: "",
};

const STEPS = [
  { n: 1, label: "Sua conta" },
  { n: 2, label: "Seu negócio" },
];

const StepIndicator = ({ current }) => (
  <div style={{ marginBottom: 36 }}>
    <div style={{ position: "relative", height: 4, background: C.border, borderRadius: 4, marginBottom: 14 }}>
      <div style={{
        position: "absolute", left: 0, top: 0, height: "100%",
        width: current >= 2 ? "100%" : "50%",
        background: `linear-gradient(90deg, ${C.blue}, ${C.blueLight})`,
        borderRadius: 4,
        transition: "width 0.45s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: `0 0 8px ${C.blue}44`,
      }} />
      {STEPS.map(({ n }) => (
        <div key={n} style={{
          position: "absolute",
          top: "50%",
          left: n === 1 ? "25%" : "75%",
          transform: "translate(-50%, -50%)",
          width: n < current ? 14 : 10,
          height: n < current ? 14 : 10,
          borderRadius: "50%",
          background: n <= current ? (n < current ? C.green : C.blue) : "white",
          border: `2px solid ${n <= current ? (n < current ? C.green : C.blue) : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          zIndex: 1,
          boxShadow: n <= current ? `0 0 0 3px ${n < current ? C.green : C.blue}22` : "none",
        }}>
          {n < current && (
            <svg width="7" height="7" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      ))}
    </div>

    <div style={{ display: "flex", justifyContent: "space-between" }}>
      {STEPS.map(({ n, label }) => {
        const active = n === current;
        const done = n < current;
        return (
          <span key={n} style={{
            fontSize: 13, fontWeight: 600,
            color: active ? C.graphite : done ? C.green : C.mid,
            transition: "color 0.3s",
          }}>
            {label}
          </span>
        );
      })}
    </div>
  </div>
);

const EmailSentState = ({ email }) => (
  <div style={{ textAlign: "center", padding: "16px 0 8px" }}>
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: C.bluePale,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          stroke={C.blue} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 8 }}>
      Verifique seu email
    </h2>
    <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6, marginBottom: 4 }}>
      Enviamos um link de ativação para
    </p>
    <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, marginBottom: 16 }}>
      {email}
    </p>
    <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.6 }}>
      Clique no botão do email para ativar sua conta e acessar o dashboard.
      Verifique também a pasta de spam.
    </p>
  </div>
);

const CadastroPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const update = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

  const handleFinish = async () => {
    setLoading(true);
    setApiError("");
    try {
      await registerUser(
        formData.nome,
        formData.email,
        formData.senha,
        formData.negocio,
        formData.tipoNegocio,
        formData.temCnpj === "sim" ? formData.cnpj : "",
      );
      setEmailSent(true);
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
        background: "white",
        borderRadius: 22,
        boxShadow: "0 10px 48px rgba(0,0,0,0.09)",
        padding: "40px 44px",
        width: "100%",
        maxWidth: 460,
      }}>
        {emailSent ? (
          <EmailSentState email={formData.email} />
        ) : (
          <>
            <StepIndicator current={step} />
            <div key={step} style={{ animation: "fadeSlideIn 0.25s ease" }}>
              {step === 1 && <StepOne data={formData} onChange={update} onNext={() => setStep(2)} />}
              {step === 2 && (
                <StepTwo
                  data={formData}
                  onChange={update}
                  onBack={() => setStep(1)}
                  onFinish={handleFinish}
                  loading={loading}
                  apiError={apiError}
                />
              )}
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: C.mid }}>
        Já tem conta?{" "}
        <Link to="/login" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>
          Entrar
        </Link>
      </p>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @media (max-width: 520px) {
          .cadastro-card { padding: 28px 20px !important; }
        }
      `}</style>
    </div>
  );
};

export default CadastroPage;
