import { useState } from "react";
import { Link } from "react-router-dom";
import C from "../../theme/colors";
import StepOne from "./steps/StepOne";
import StepTwo from "./steps/StepTwo";

const INITIAL = {
  nome: "", email: "", senha: "", confirmarSenha: "", cpf: "",
  negocio: "", tipoNegocio: "", temCnpj: null, cnpj: "",
};

const StepIndicator = ({ current }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 36 }}>
    {[
      { n: 1, label: "Sua conta" },
      { n: 2, label: "Seu negócio" },
    ].map(({ n, label }, i) => (
      <div key={n} style={{ display: "flex", alignItems: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
          <div style={{
            width: 34, height: 34, borderRadius: "50%",
            background: n <= current ? C.blue : C.border,
            color: n <= current ? "white" : C.mid,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700,
            transition: "background 0.3s",
          }}>
            {n < current ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : n}
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: n <= current ? C.blue : C.mid, transition: "color 0.3s" }}>
            {label}
          </span>
        </div>

        {i < 1 && (
          <div style={{
            width: 64, height: 2,
            background: current >= 2 ? C.blue : C.border,
            margin: "0 10px",
            marginBottom: 18,
            transition: "background 0.4s",
            borderRadius: 2,
          }} />
        )}
      </div>
    ))}
  </div>
);

const CadastroPage = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState(INITIAL);
  const [done, setDone] = useState(false);

  const update = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

  const handleFinish = () => {
    console.log("Dados do cadastro:", formData);
    setDone(true);
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
      {/* Logo */}
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

      {/* Card */}
      <div style={{
        background: "white",
        borderRadius: 22,
        boxShadow: "0 10px 48px rgba(0,0,0,0.09)",
        padding: "40px 44px",
        width: "100%",
        maxWidth: 460,
      }}>
        {done ? (
          <SuccessState />
        ) : (
          <>
            <StepIndicator current={step} />
            <div key={step} style={{ animation: "fadeSlideIn 0.25s ease" }}>
              {step === 1 && <StepOne data={formData} onChange={update} onNext={() => setStep(2)} />}
              {step === 2 && <StepTwo data={formData} onChange={update} onBack={() => setStep(1)} onFinish={handleFinish} />}
            </div>
          </>
        )}
      </div>

      <p style={{ marginTop: 20, fontSize: 13, color: C.mid }}>
        Já tem conta?{" "}
        <Link to="/" style={{ color: C.blue, fontWeight: 600, textDecoration: "none" }}>
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
      Cadastro realizado!
    </h2>
    <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.6 }}>
      Seus dados foram registrados com sucesso.<br />
      Em breve você receberá mais informações por email.
    </p>
  </div>
);

export default CadastroPage;
