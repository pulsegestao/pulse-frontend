import { useEffect, useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";
import C from "../../../theme/colors";
import { getCompanySettings, updateCompanySettings } from "../../../services/api";

const COMPANY_TYPES = [
  { value: "mercado",     label: "Mercado / Supermercado" },
  { value: "farmacia",    label: "Farmácia" },
  { value: "petshop",     label: "Pet Shop" },
  { value: "papelaria",   label: "Papelaria" },
  { value: "roupas",      label: "Roupas / Vestuário" },
  { value: "eletronicos", label: "Eletrônicos" },
  { value: "restaurante", label: "Restaurante / Lanchonete" },
  { value: "outro",       label: "Outro" },
];

const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  color: C.graphite, background: C.surface,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const FieldLabel = ({ children }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.graphite, marginBottom: 4 }}>
    {children}
  </label>
);

const EmpresaTab = ({ role }) => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", type: "outro", cnpj: "" });
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const canEdit = role === "owner" || role === "manager";

  useEffect(() => {
    getCompanySettings()
      .then(data => {
        setCompany(data);
        setForm({
          name: data.name || "",
          type: data.type || "outro",
          cnpj: data.cnpj || "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Nome da empresa é obrigatório." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      const updated = await updateCompanySettings({
        name: form.name.trim(),
        type: form.type,
        cnpj: form.cnpj.trim() || undefined,
      });
      setCompany(updated);
      setStatus({ type: "success", message: "Dados da empresa atualizados." });
    } catch (e) {
      setStatus({ type: "error", message: e.message || "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "60px 0", color: C.mid, fontSize: 14 }}>
        <Loader2 size={18} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
        Carregando...
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surface, borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>Dados da empresa</p>
        <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>
          {canEdit ? "Edite as informações da sua empresa." : "Informações da empresa (somente leitura)."}
        </p>
      </div>
      <div style={{ padding: "20px 24px" }}>
        {status && (
          <div style={{
            padding: "10px 14px", borderRadius: 8, marginBottom: 16,
            background: status.type === "success" ? C.greenPale : C.redPale,
            color: status.type === "success" ? C.green : "#EF4444",
            fontSize: 13, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            {status.type === "success" && <CheckCircle size={14} strokeWidth={2.5} />}
            {status.message}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Nome da empresa *</FieldLabel>
          <input
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            style={canEdit ? inputSt : { ...inputSt, background: C.gray, color: C.mid, cursor: "not-allowed" }}
            readOnly={!canEdit}
            placeholder="Nome fantasia"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <FieldLabel>Ramo de atividade</FieldLabel>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
              disabled={!canEdit}
              style={{ ...inputSt, cursor: canEdit ? "pointer" : "not-allowed", background: canEdit ? C.surface : C.gray, color: canEdit ? C.graphite : C.mid }}
            >
              {COMPANY_TYPES.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel>CNPJ {role !== "owner" ? "(somente proprietário)" : ""}</FieldLabel>
            <input
              value={form.cnpj}
              onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))}
              style={role === "owner" ? inputSt : { ...inputSt, background: C.gray, color: C.mid, cursor: "not-allowed" }}
              readOnly={role !== "owner"}
              placeholder="00.000.000/0001-00"
            />
          </div>
        </div>

        {canEdit && (
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: saving ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
              color: saving ? C.mid : "white",
              fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmpresaTab;
