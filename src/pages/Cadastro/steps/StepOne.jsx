import { useState } from "react";
import C from "../../../theme/colors";

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
  background: "white",
});

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: C.graphite,
  marginBottom: 6,
};

const errorStyle = {
  fontSize: 12,
  color: "#EF4444",
  marginTop: 4,
};

const Field = ({ label, optional, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={labelStyle}>
      {label}
      {optional && <span style={{ fontWeight: 400, color: C.mid, marginLeft: 6 }}>(opcional)</span>}
    </label>
    {children}
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

const StepOne = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fields) => {
    const e = {};
    if (!fields.nome.trim()) e.nome = "Nome obrigatório";
    if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email inválido";
    if (fields.senha.length < 6) e.senha = "Mínimo 6 caracteres";
    if (fields.senha !== fields.confirmarSenha) e.confirmarSenha = "Senhas não conferem";
    return e;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    const e = validate(data);
    setErrors(e);
  };

  const handleSubmit = () => {
    const e = validate(data);
    setErrors(e);
    setTouched({ nome: true, email: true, senha: true, confirmarSenha: true });
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
        Crie sua conta
      </h2>
      <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
        Preencha seus dados para começar.
      </p>

      <Field label="Nome completo" error={touched.nome && errors.nome}>
        <input
          type="text"
          placeholder="Seu nome"
          value={data.nome}
          style={inputStyle(touched.nome && errors.nome)}
          onChange={(e) => onChange({ nome: e.target.value })}
          onBlur={() => handleBlur("nome")}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
        />
      </Field>

      <Field label="Email" error={touched.email && errors.email}>
        <input
          type="email"
          placeholder="seu@email.com"
          value={data.email}
          style={inputStyle(touched.email && errors.email)}
          onChange={(e) => onChange({ email: e.target.value })}
          onBlur={() => handleBlur("email")}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
        />
      </Field>

      <Field label="Senha" error={touched.senha && errors.senha}>
        <input
          type="password"
          placeholder="Mínimo 6 caracteres"
          value={data.senha}
          style={inputStyle(touched.senha && errors.senha)}
          onChange={(e) => onChange({ senha: e.target.value })}
          onBlur={() => handleBlur("senha")}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
        />
      </Field>

      <Field label="Confirmar senha" error={touched.confirmarSenha && errors.confirmarSenha}>
        <input
          type="password"
          placeholder="Repita a senha"
          value={data.confirmarSenha}
          style={inputStyle(touched.confirmarSenha && errors.confirmarSenha)}
          onChange={(e) => onChange({ confirmarSenha: e.target.value })}
          onBlur={() => handleBlur("confirmarSenha")}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
        />
      </Field>

      <Field label="CPF" optional>
        <input
          type="text"
          placeholder="000.000.000-00"
          value={data.cpf}
          style={inputStyle(false)}
          onChange={(e) => onChange({ cpf: e.target.value })}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
          onBlur={(e) => (e.target.style.borderColor = C.border)}
        />
      </Field>

      <button
        onClick={handleSubmit}
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
          transition: "transform 0.15s, box-shadow 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = `0 10px 28px ${C.blue}44`;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = `0 6px 20px ${C.blue}33`;
        }}
      >
        Continuar →
      </button>
    </div>
  );
};

export default StepOne;
