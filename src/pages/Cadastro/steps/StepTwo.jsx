import { useState } from "react";
import { Info } from "lucide-react";
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
  appearance: "none",
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

const Field = ({ label, error, children }) => (
  <div style={{ marginBottom: 18 }}>
    <label style={labelStyle}>{label}</label>
    {children}
    {error && <p style={errorStyle}>{error}</p>}
  </div>
);

const TIPOS = [
  "Mercearia / Minimercado",
  "Farmácia",
  "Pet Shop",
  "Papelaria",
  "Loja de Roupas",
  "Eletrônicos",
  "Restaurante / Lanchonete",
  "Outro",
];

const StepTwo = ({ data, onChange, onBack, onFinish, loading = false, apiError = "" }) => {
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const validate = (fields) => {
    const e = {};
    if (!fields.negocio.trim()) e.negocio = "Nome do negócio obrigatório";
    if (!fields.tipoNegocio) e.tipoNegocio = "Selecione o tipo de negócio";
    if (fields.temCnpj === null || fields.temCnpj === undefined)
      e.temCnpj = "Selecione uma opção";
    if (fields.temCnpj === "sim" && !fields.cnpj.trim()) e.cnpj = "CNPJ obrigatório";
    return e;
  };

  const handleBlur = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors(validate(data));
  };

  const handleSubmit = () => {
    const e = validate(data);
    setErrors(e);
    setTouched({ negocio: true, tipoNegocio: true, temCnpj: true, cnpj: true });
    if (Object.keys(e).length === 0) onFinish();
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, marginBottom: 4 }}>
        Dados do negócio
      </h2>
      <p style={{ fontSize: 14, color: C.mid, marginBottom: 28 }}>
        Quase lá! Fale um pouco sobre sua empresa.
      </p>

      <Field label="Nome do negócio" error={touched.negocio && errors.negocio}>
        <input
          type="text"
          placeholder="Ex: Mercadinho do João"
          value={data.negocio}
          style={inputStyle(touched.negocio && errors.negocio)}
          onChange={(e) => onChange({ negocio: e.target.value })}
          onBlur={() => handleBlur("negocio")}
          onFocus={(e) => (e.target.style.borderColor = C.blue)}
        />
      </Field>

      <Field label="Tipo de negócio" error={touched.tipoNegocio && errors.tipoNegocio}>
        <div style={{ position: "relative" }}>
          <select
            value={data.tipoNegocio}
            style={{
              ...inputStyle(touched.tipoNegocio && errors.tipoNegocio),
              paddingRight: 40,
              cursor: "pointer",
            }}
            onChange={(e) => {
              onChange({ tipoNegocio: e.target.value });
              setTouched((t) => ({ ...t, tipoNegocio: true }));
              setErrors(validate({ ...data, tipoNegocio: e.target.value }));
            }}
            onFocus={(e) => (e.target.style.borderColor = C.blue)}
            onBlur={() => handleBlur("tipoNegocio")}
          >
            <option value="">Selecione...</option>
            {TIPOS.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <svg
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
            width="16" height="16" viewBox="0 0 24 24" fill="none"
          >
            <path d="M6 9l6 6 6-6" stroke={C.mid} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </Field>

      <Field label="Possui CNPJ?" error={touched.temCnpj && errors.temCnpj}>
        <div style={{ display: "flex", gap: 12 }}>
          {["sim", "nao"].map((opt) => {
            const active = data.temCnpj === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange({ temCnpj: opt, cnpj: opt === "nao" ? "" : data.cnpj });
                  setTouched((t) => ({ ...t, temCnpj: true }));
                  setErrors(validate({ ...data, temCnpj: opt }));
                }}
                style={{
                  flex: 1,
                  padding: "11px",
                  borderRadius: 10,
                  border: `1.5px solid ${active ? C.blue : C.border}`,
                  background: active ? C.bluePale : "white",
                  color: active ? C.blue : C.mid,
                  fontSize: 14,
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.15s",
                }}
              >
                {opt === "sim" ? "Sim" : "Não"}
              </button>
            );
          })}
        </div>
      </Field>

      {data.temCnpj === "sim" && (
        <Field label="CNPJ" error={touched.cnpj && errors.cnpj}>
          <input
            type="text"
            placeholder="00.000.000/0000-00"
            value={data.cnpj}
            style={inputStyle(touched.cnpj && errors.cnpj)}
            onChange={(e) => onChange({ cnpj: e.target.value })}
            onBlur={() => handleBlur("cnpj")}
            onFocus={(e) => (e.target.style.borderColor = C.blue)}
          />
        </Field>
      )}

      {data.temCnpj === "nao" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 10,
          background: C.bluePale,
          border: `1px solid ${C.blue}22`,
          borderRadius: 10,
          padding: "12px 14px",
          marginBottom: 18,
        }}>
          <Info size={16} color={C.blue} strokeWidth={2} style={{ marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: 13, color: C.blue, margin: 0, lineHeight: 1.5 }}>
            Sem problema! Você pode usar o Pulse Gestão normalmente sem CNPJ.
            Caso regularize futuramente, basta atualizar nas configurações da conta.
          </p>
        </div>
      )}

      {apiError && (
        <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 12, textAlign: "center" }}>
          {apiError}
        </p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          onClick={onBack}
          disabled={loading}
          style={{
            flex: 1,
            padding: "14px",
            background: "white",
            color: C.graphite,
            border: `1.5px solid ${C.border}`,
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => { if (!loading) e.currentTarget.style.borderColor = C.blue; }}
          onMouseLeave={(e) => { if (!loading) e.currentTarget.style.borderColor = C.border; }}
        >
          ← Voltar
        </button>

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            flex: 2,
            padding: "14px",
            background: loading ? C.mid : `linear-gradient(135deg, ${C.green}, ${C.greenLight})`,
            color: "white",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : `0 6px 20px ${C.green}33`,
            fontFamily: "inherit",
            transition: "transform 0.15s, box-shadow 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 10px 28px ${C.green}44`;
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = `0 6px 20px ${C.green}33`;
            }
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                border: "2px solid rgba(255,255,255,0.4)",
                borderTopColor: "white",
                animation: "spin 0.7s linear infinite",
              }} />
              Criando conta...
            </>
          ) : "Finalizar cadastro ✓"}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default StepTwo;
