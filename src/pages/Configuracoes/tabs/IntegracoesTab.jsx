import { useEffect, useState } from "react";
import { Plug, QrCode, CheckCircle, AlertCircle, Loader2, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import C from "../../../theme/colors";
import {
  getPaymentIntegrations,
  savePaymentIntegration,
  deletePaymentIntegration,
  testPaymentIntegration,
  getCompanySettings,
  updateCompanySettings,
} from "../../../services/api";
import { useToast } from "../../../hooks/useToast";

const SectionCard = ({ title, subtitle, children }) => (
  <div style={{
    background: C.surface, borderRadius: 14,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    marginBottom: 16,
  }}>
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
    <div style={{ padding: "20px 24px" }}>
      {children}
    </div>
  </div>
);

const StatusBadge = ({ active }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
    background: active ? C.greenPale : C.gray,
    color: active ? C.green : C.mid,
  }}>
    {active
      ? <><CheckCircle size={11} strokeWidth={2.5} /> Configurada</>
      : <><AlertCircle size={11} strokeWidth={2.5} /> Não configurada</>
    }
  </span>
);

const MercadoPagoCard = ({ integration, onSaved, onDeleted }) => {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const configured = !!integration;

  const handleSave = async () => {
    if (!apiKey.trim() || !deviceId.trim()) {
      toast.error("Preencha API Key e Device ID.");
      return;
    }
    setSaving(true);
    try {
      await savePaymentIntegration({ provider: "mercadopago", api_key: apiKey, device_id: deviceId });
      toast.success("Integração salva com sucesso.");
      setOpen(false);
      setApiKey("");
      setDeviceId("");
      onSaved();
    } catch (e) {
      toast.error(e.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await testPaymentIntegration("mercadopago");
      toast.success("Conexão com Mercado Pago OK.");
    } catch (e) {
      toast.error("Credenciais inválidas ou device offline.");
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deletePaymentIntegration("mercadopago");
      toast.success("Integração removida.");
      setConfirmDelete(false);
      onDeleted();
    } catch (e) {
      toast.error(e.message || "Erro ao remover.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{
      border: `1.5px solid ${C.border}`, borderRadius: 12,
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11,
            background: C.bluePale,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Plug size={18} color={C.blue} strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>Mercado Pago Point</p>
            <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>
              {configured ? `Device: ${integration.device_id}` : "Maquininha física via API"}
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <StatusBadge active={configured} />
          {configured && (
            <button
              onClick={() => setConfirmDelete(true)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: "transparent", border: `1px solid ${C.border}`,
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = C.redPale; e.currentTarget.style.borderColor = "#EF444444"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = C.border; }}
            >
              <Trash2 size={14} color="#EF4444" strokeWidth={2} />
            </button>
          )}
          <button
            onClick={() => setOpen(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 14px", borderRadius: 8,
              border: `1.5px solid ${configured ? C.border : C.blue}`,
              background: configured ? "transparent" : C.blue,
              color: configured ? C.graphite : "white",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", transition: "all 0.15s",
            }}
          >
            {configured ? "Editar" : "Conectar"}
            {open ? <ChevronUp size={14} strokeWidth={2.5} /> : <ChevronDown size={14} strokeWidth={2.5} />}
          </button>
        </div>
      </div>

      {open && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 20px", background: C.pageBg }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>
                API Key (Access Token)
              </label>
              <input
                type="password"
                placeholder="APP_USR-..."
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "9px 12px", borderRadius: 8,
                  border: `1.5px solid ${C.border}`, fontSize: 13,
                  color: C.graphite, background: C.surface,
                  outline: "none", fontFamily: "inherit",
                }}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: C.mid, display: "block", marginBottom: 6 }}>
                Device ID
              </label>
              <input
                type="text"
                placeholder="PAX_A910__SMARTPOS..."
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "9px 12px", borderRadius: 8,
                  border: `1.5px solid ${C.border}`, fontSize: 13,
                  color: C.graphite, background: C.surface,
                  outline: "none", fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              {configured && (
                <button
                  onClick={handleTest}
                  disabled={testing}
                  style={{
                    padding: "8px 16px", borderRadius: 8,
                    border: `1.5px solid ${C.border}`, background: "transparent",
                    fontSize: 13, fontWeight: 600, color: C.graphite,
                    cursor: testing ? "not-allowed" : "pointer", fontFamily: "inherit",
                    display: "flex", alignItems: "center", gap: 6,
                  }}
                >
                  {testing && <Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />}
                  Testar conexão
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "8px 20px", borderRadius: 8,
                  border: "none", background: saving ? C.border : C.blue,
                  fontSize: 13, fontWeight: 600, color: saving ? C.mid : "white",
                  cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
                  display: "flex", alignItems: "center", gap: 6,
                }}
              >
                {saving && <Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />}
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div style={{ borderTop: `1px solid ${C.border}`, padding: "14px 20px", background: C.redPale, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <p style={{ fontSize: 13, color: "#EF4444", fontWeight: 600, margin: 0 }}>Remover integração com Mercado Pago?</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setConfirmDelete(false)} style={{ padding: "6px 14px", borderRadius: 7, border: `1px solid ${C.border}`, background: C.surface, fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
            <button onClick={handleDelete} disabled={deleting} style={{ padding: "6px 14px", borderRadius: 7, border: "none", background: "#EF4444", fontSize: 13, fontWeight: 600, color: "white", cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
              {deleting && <Loader2 size={12} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />}
              Remover
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PixKeySection = ({ pixKey: initialPixKey }) => {
  const toast = useToast();
  const [pixKey, setPixKey] = useState(initialPixKey || "");
  const [saving, setSaving] = useState(false);

  useEffect(() => { setPixKey(initialPixKey || ""); }, [initialPixKey]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCompanySettings({ pix_key: pixKey.trim() });
      toast.success("Chave PIX salva.");
    } catch (e) {
      toast.error(e.message || "Erro ao salvar chave PIX.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ width: 42, height: 42, borderRadius: 11, background: C.greenPale, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <QrCode size={18} color={C.green} strokeWidth={2} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>Chave PIX manual</p>
          <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>Exibida no caixa para confirmação manual de pagamentos</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input
          type="text"
          placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
          value={pixKey}
          onChange={e => setPixKey(e.target.value)}
          style={{
            flex: 1, padding: "9px 12px", borderRadius: 8,
            border: `1.5px solid ${C.border}`, fontSize: 13,
            color: C.graphite, background: C.surface,
            outline: "none", fontFamily: "inherit",
          }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "9px 20px", borderRadius: 8,
            border: "none", background: saving ? C.border : C.blue,
            fontSize: 13, fontWeight: 600, color: saving ? C.mid : "white",
            cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, flexShrink: 0,
          }}
        >
          {saving && <Loader2 size={13} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />}
          {saving ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
};

const IntegracoesTab = () => {
  const [integrations, setIntegrations] = useState([]);
  const [pixKey, setPixKey] = useState("");
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      getPaymentIntegrations().catch(() => []),
      getCompanySettings().catch(() => ({})),
    ]).then(([intList, company]) => {
      setIntegrations(intList || []);
      setPixKey(company.pix_key || "");
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const mpIntegration = integrations.find(i => i.provider === "mercadopago") || null;

  return (
    <>
      <SectionCard title="Maquininha" subtitle="Conecte sua maquininha para processar pagamentos automáticos no PDV.">
        {loading
          ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.mid, fontSize: 13 }}><Loader2 size={14} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Carregando...</div>
          : <MercadoPagoCard integration={mpIntegration} onSaved={load} onDeleted={load} />
        }
      </SectionCard>

      <SectionCard title="PIX" subtitle="Configure sua chave PIX para pagamentos manuais.">
        {loading
          ? <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.mid, fontSize: 13 }}><Loader2 size={14} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} /> Carregando...</div>
          : <PixKeySection pixKey={pixKey} />
        }
      </SectionCard>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

export default IntegracoesTab;
