import { useEffect, useState } from "react";
import { Loader2, AlertCircle, Plus, Pencil, Trash2, X } from "lucide-react";
import C from "../../../theme/colors";
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import { useToast } from "../../../hooks/useToast";

const CHANNELS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email",    label: "E-mail" },
  { value: "pdf",      label: "PDF / Impresso" },
];

const inputSt = {
  width: "100%", padding: "10px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, background: C.surface,
  fontSize: 13, color: C.graphite, fontFamily: "inherit",
  boxSizing: "border-box", outline: "none",
};

const EMPTY = { name: "", contact_name: "", phone: "", email: "", preferred_channel: "whatsapp" };

const SupplierModal = ({ supplier, onClose, onSaved }) => {
  const toast = useToast();
  const isEdit = !!supplier?.id;
  const [form, setForm] = useState(supplier ? {
    name: supplier.name,
    contact_name: supplier.contact_name || "",
    phone: supplier.phone || "",
    email: supplier.email || "",
    preferred_channel: supplier.preferred_channel || "whatsapp",
  } : { ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      const saved = isEdit
        ? await updateSupplier(supplier.id, form)
        : await createSupplier(form);
      toast.success(isEdit ? "Fornecedor atualizado" : "Fornecedor criado");
      onSaved(saved, isEdit);
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={onClose}>
      <div style={{
        background: C.surface, borderRadius: 16, padding: 24, width: "100%", maxWidth: 480,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>
            {isEdit ? "Editar fornecedor" : "Novo fornecedor"}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: C.mid }}>
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Nome *</p>
            <input style={inputSt} value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Distribuidora Silva" autoFocus />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Contato (representante)</p>
            <input style={inputSt} value={form.contact_name} onChange={e => set("contact_name", e.target.value)} placeholder="Ex: João Silva" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Telefone / WhatsApp</p>
            <input style={inputSt} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>E-mail</p>
            <input style={inputSt} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="pedido@distribuidora.com" />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Canal preferido para pedidos</p>
            <select style={inputSt} value={form.preferred_channel} onChange={e => set("preferred_channel", e.target.value)}>
              {CHANNELS.map(ch => <option key={ch.value} value={ch.value}>{ch.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${C.border}`,
            background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit",
          }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={saving} style={{
            flex: 2, padding: "10px", borderRadius: 8, border: "none",
            background: saving ? C.border : C.blue, color: saving ? C.mid : "white",
            fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>{saving ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar fornecedor"}</button>
        </div>
      </div>
    </div>
  );
};

const FornecedoresTab = () => {
  const toast = useToast();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSuppliers();
      setSuppliers(data || []);
    } catch (e) {
      setError(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setSuppliers(s => s.map(x => x.id === saved.id ? saved : x));
    } else {
      setSuppliers(s => [...s, saved]);
    }
    setModal(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteSupplier(id);
      setSuppliers(s => s.filter(x => x.id !== id));
      toast.success("Fornecedor removido");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setDeleting(null);
    }
  };

  const channelLabel = (ch) => CHANNELS.find(c => c.value === ch)?.label || ch || "—";

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <Loader2 size={22} color={C.blue} style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );

  if (error) return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: 20, background: "#FEF2F2", borderRadius: 12, border: "1px solid #FECACA" }}>
      <AlertCircle size={18} color="#EF4444" />
      <p style={{ fontSize: 14, color: "#EF4444", margin: 0 }}>{error}</p>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Fornecedores</h2>
          <p style={{ fontSize: 13, color: C.mid, margin: "4px 0 0" }}>
            {suppliers.length} fornecedor{suppliers.length !== 1 ? "es" : ""} cadastrado{suppliers.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setModal({})} style={{
          display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
          borderRadius: 8, border: "none", background: C.blue, color: "white",
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
        }}>
          <Plus size={15} strokeWidth={2.5} />
          Novo fornecedor
        </button>
      </div>

      {suppliers.length === 0 ? (
        <div style={{
          background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: "48px 24px", textAlign: "center",
        }}>
          <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>Nenhum fornecedor cadastrado ainda.</p>
          <p style={{ fontSize: 13, color: C.mid, margin: "6px 0 0" }}>Cadastre fornecedores para agilizar seus pedidos de reposição.</p>
        </div>
      ) : (
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          {suppliers.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
              borderBottom: i < suppliers.length - 1 ? `1px solid ${C.border}` : "none",
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>{s.name}</p>
                {s.contact_name && <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>{s.contact_name}</p>}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, flexShrink: 0 }}>
                {s.phone && <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>{s.phone}</p>}
                <span style={{
                  fontSize: 11, fontWeight: 600, color: C.blue, background: C.bluePale,
                  borderRadius: 6, padding: "2px 8px",
                }}>{channelLabel(s.preferred_channel)}</span>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => setModal(s)} style={{
                  width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Pencil size={14} color={C.blue} strokeWidth={2} />
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={deleting === s.id} style={{
                  width: 32, height: 32, borderRadius: 8, border: `1px solid ${C.border}`,
                  background: C.surface, cursor: deleting === s.id ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {deleting === s.id
                    ? <Loader2 size={14} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
                    : <Trash2 size={14} color="#EF4444" strokeWidth={2} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal !== null && (
        <SupplierModal
          supplier={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default FornecedoresTab;
