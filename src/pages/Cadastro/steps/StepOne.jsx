import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import C from "../../../theme/colors";
import { checkEmail } from "../../../services/api";

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

const RequiredDot = () => (
  <span style={{
    display: "inline-block",
    width: 6, height: 6,
    borderRadius: "50%",
    background: "#EF4444",
    marginLeft: 5,
    verticalAlign: "middle",
    marginBottom: 2,
  }} />
);

const Field = ({ label, required, error, hint, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.graphite, marginBottom: 6 }}>
      {label}
      {required && <RequiredDot />}
    </label>
    {children}
    {error && <p style={{ fontSize: 12, color: "#EF4444", marginTop: 4 }}>{error}</p>}
    {hint && !error && <p style={{ fontSize: 12, color: C.mid, marginTop: 4 }}>{hint}</p>}
  </div>
);

const PASSWORD_RULES = [
  { key: "length",  label: "Mínimo 6 caracteres",             test: (p) => p.length >= 6 },
  { key: "letter",  label: "Pelo menos uma letra",             test: (p) => /[a-zA-Z]/.test(p) },
  { key: "number",  label: "Pelo menos um número",             test: (p) => /[0-9]/.test(p) },
  { key: "special", label: "Pelo menos um caractere especial", test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

function formatCPF(value) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
}

const StepOne = ({ data, onChange, onNext }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [emailCheck, setEmailCheck] = useState(""); // "" | "checking" | "taken"

  const validate = (fields, emailTaken = emailCheck === "taken") => {
    const e = {};
    if (!fields.nome.trim()) e.nome = "Nome obrigatório";
    else if (fields.nome.trim().length < 2) e.nome = "Nome muito curto";
    if (!fields.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Email inválido";
    else if (emailTaken) e.email = "Este email já está cadastrado";
    if (!PASSWORD_RULES.every(({ test }) => test(fields.senha))) e.senha = "A senha não atende aos requisitos";
    if (fields.senha !== fields.confirmarSenha) e.confirmarSenha = "Senhas não conferem";
    return e;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(data));
  };

  const handleEmailBlur = async () => {
    setTouched((t) => ({ ...t, email: true }));
    const isValidFormat = data.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    if (!isValidFormat) {
      setErrors(validate(data));
      return;
    }
    setEmailCheck("checking");
    try {
      const result = await checkEmail(data.email);
      const taken = !result.available;
      setEmailCheck(taken ? "taken" : "");
      setErrors(validate(data, taken));
    } catch {
      setEmailCheck("");
      setErrors(validate(data));
    }
  };

  const handleSubmit = () => {
    if (emailCheck === "checking") return;
    const e = validate(data);
    setErrors(e);
    setTouched({ nome: true, email: true, senha: true, confirmarSenha: true });
    if (Object.keys(e).length === 0) onNext();
  };

  const onFocusBlue = (e) => (e.target.style.borderColor = C.blue);
  const onBlurBorder = (e) => (e.target.style.borderColor = C.border);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
        Crie sua conta
      </h2>
      <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
        Preencha seus dados para começar.
      </p>

      <Field label="Nome completo" required error={touched.nome && errors.nome}>
        <input
          type="text"
          placeholder="Seu nome"
          value={data.nome}
          maxLength={80}
          style={inputStyle(touched.nome && errors.nome)}
          onChange={(e) => onChange({ nome: e.target.value })}
          onBlur={() => handleBlur("nome")}
          onFocus={onFocusBlue}
        />
      </Field>

      <Field
        label="Email"
        required
        error={touched.email && errors.email}
        hint={emailCheck === "checking" ? "Verificando disponibilidade..." : ""}
      >
        <input
          type="email"
          placeholder="seu@email.com"
          value={data.email}
          maxLength={150}
          style={inputStyle(touched.email && errors.email)}
          onChange={(e) => { onChange({ email: e.target.value }); setEmailCheck(""); }}
          onBlur={handleEmailBlur}
          onFocus={onFocusBlue}
        />
      </Field>

      <Field label="Senha" required error={touched.senha && errors.senha}>
        <div style={{ position: "relative" }}>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Crie sua senha"
            value={data.senha}
            maxLength={72}
            style={{ ...inputStyle(touched.senha && errors.senha), paddingRight: 44 }}
            onChange={(e) => onChange({ senha: e.target.value })}
            onBlur={() => handleBlur("senha")}
            onFocus={onFocusBlue}
          />
          <button type="button" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 0, color: C.mid, display: "flex",
          }}>
            {showPassword ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
        {data.senha.length > 0 && (
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
            {PASSWORD_RULES.map(({ key, label, test }) => {
              const ok = test(data.senha);
              return (
                <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: "50%",
                    background: ok ? C.green : C.border,
                    transition: "background 0.2s",
                    flexShrink: 0,
                  }} />
                  <span style={{ fontSize: 12, color: ok ? C.green : C.mid, transition: "color 0.2s" }}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Field>

      <Field label="Confirmar senha" required error={touched.confirmarSenha && errors.confirmarSenha}>
        <div style={{ position: "relative" }}>
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Repita a senha"
            value={data.confirmarSenha}
            maxLength={72}
            style={{ ...inputStyle(touched.confirmarSenha && errors.confirmarSenha), paddingRight: 44 }}
            onChange={(e) => onChange({ confirmarSenha: e.target.value })}
            onBlur={() => handleBlur("confirmarSenha")}
            onFocus={onFocusBlue}
          />
          <button type="button" onClick={() => setShowConfirm((v) => !v)} tabIndex={-1} style={{
            position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
            background: "none", border: "none", cursor: "pointer", padding: 0, color: C.mid, display: "flex",
          }}>
            {showConfirm ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
          </button>
        </div>
      </Field>

      <Field label="CPF" error={touched.cpf && errors.cpf}>
        <input
          type="text"
          inputMode="numeric"
          placeholder="000.000.000-00"
          value={data.cpf}
          maxLength={14}
          style={inputStyle(false)}
          onChange={(e) => onChange({ cpf: formatCPF(e.target.value) })}
          onFocus={onFocusBlue}
          onBlur={onBlurBorder}
        />
      </Field>

      <button
        onClick={handleSubmit}
        disabled={emailCheck === "checking"}
        style={{
          width: "100%",
          padding: "14px",
          background: emailCheck === "checking"
            ? C.border
            : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
          color: emailCheck === "checking" ? C.mid : "white",
          border: "none",
          borderRadius: 12,
          fontSize: 15,
          fontWeight: 700,
          cursor: emailCheck === "checking" ? "not-allowed" : "pointer",
          boxShadow: emailCheck === "checking" ? "none" : `0 6px 20px ${C.blue}33`,
          transition: "transform 0.15s, box-shadow 0.15s",
          fontFamily: "inherit",
        }}
        onMouseEnter={(e) => {
          if (emailCheck !== "checking") {
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = `0 10px 28px ${C.blue}44`;
          }
        }}
        onMouseLeave={(e) => {
          if (emailCheck !== "checking") {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = `0 6px 20px ${C.blue}33`;
          }
        }}
      >
        {emailCheck === "checking" ? "Verificando..." : "Continuar →"}
      </button>
    </div>
  );
};

export default StepOne;
