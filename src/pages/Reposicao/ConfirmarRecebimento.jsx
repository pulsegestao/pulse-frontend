import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2, PackageCheck } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import WidgetError from "../../components/WidgetError";
import { friendlyError } from "../../utils/errorMessage";
import { useToast } from "../../hooks/useToast";
import { getPurchaseOrder, confirmPurchaseOrderReceipt } from "../../services/api";

const inputSt = {
  width: "100%", padding: "8px 10px", borderRadius: 7,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  color: C.graphite, background: C.surface,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const ConfirmarRecebimentoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [receipts, setReceipts] = useState({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const po = await getPurchaseOrder(id);
      setOrder(po);
      const initial = {};
      (po.items || []).forEach(item => {
        const pending = item.quantity_ordered - item.quantity_received;
        initial[item.product_id] = { qty: pending > 0 ? pending : 0, unit_cost: item.unit_cost || 0 };
      });
      setReceipts(initial);
    } catch (e) {
      setError(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const updateReceipt = (productId, field, value) => {
    setReceipts(prev => ({ ...prev, [productId]: { ...prev[productId], [field]: value } }));
  };

  const handleConfirm = async () => {
    const items = Object.entries(receipts)
      .filter(([, v]) => v.qty > 0)
      .map(([product_id, v]) => ({
        product_id,
        quantity_received: parseInt(v.qty) || 0,
        unit_cost: parseFloat(v.unit_cost) || 0,
      }));

    if (items.length === 0) { toast.error("Informe a quantidade recebida de pelo menos um produto."); return; }

    setSaving(true);
    try {
      await confirmPurchaseOrderReceipt(id, items);
      toast.success("Recebimento confirmado! Estoque atualizado.");
      navigate("/reposicao");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />

      <main style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingTop: 8 }}>
          <Link to={`/reposicao`} style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.mid, textDecoration: "none",
          }}>
            <ArrowLeft size={17} strokeWidth={2} color="currentColor" />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.graphite, margin: 0 }}>Confirmar recebimento</h1>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={24} color={C.blue} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <WidgetError message={error} onRetry={load} />
        ) : (
          <>
            <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
              <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, background: C.gray }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: 0 }}>
                  {order.items?.length} produto{order.items?.length !== 1 ? "s" : ""} no pedido
                </p>
                <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>
                  Informe o que chegou e o preço pago. O estoque será atualizado automaticamente.
                </p>
              </div>

              {(order.items || []).map((item, i) => {
                const pending = item.quantity_ordered - item.quantity_received;
                const r = receipts[item.product_id] || { qty: 0, unit_cost: item.unit_cost || 0 };
                return (
                  <div key={item.product_id} style={{
                    padding: "14px 20px",
                    borderBottom: i < order.items.length - 1 ? `1px solid ${C.border}` : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>{item.product_name}</p>
                        <p style={{ fontSize: 12, color: C.mid, margin: "3px 0 0" }}>
                          Pedido: {item.quantity_ordered} {item.unit}
                          {item.quantity_received > 0 && (
                            <span style={{ color: "#16A34A", marginLeft: 8 }}>· já recebido: {item.quantity_received}</span>
                          )}
                          {pending > 0 && <span style={{ color: "#D97706", marginLeft: 8 }}>· pendente: {pending}</span>}
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <div>
                          <p style={{ fontSize: 11, color: C.mid, margin: "0 0 3px", fontWeight: 600 }}>Qtd recebida</p>
                          <input
                            type="number" min="0"
                            value={r.qty}
                            onChange={e => updateReceipt(item.product_id, "qty", e.target.value)}
                            style={{ ...inputSt, width: 80, textAlign: "center" }}
                          />
                        </div>
                        <div>
                          <p style={{ fontSize: 11, color: C.mid, margin: "0 0 3px", fontWeight: 600 }}>Preço/un (R$)</p>
                          <input
                            type="number" min="0" step="0.01"
                            value={r.unit_cost}
                            onChange={e => updateReceipt(item.product_id, "unit_cost", e.target.value)}
                            style={{ ...inputSt, width: 100 }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => navigate("/reposicao")} style={{
                flex: 1, padding: "11px", borderRadius: 8, border: `1.5px solid ${C.border}`,
                background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite,
                cursor: "pointer", fontFamily: "inherit",
              }}>Voltar</button>
              <button onClick={handleConfirm} disabled={saving} style={{
                flex: 2, padding: "11px", borderRadius: 8, border: "none",
                background: saving ? C.border : C.green, color: saving ? C.mid : "white",
                fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
                fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                {saving
                  ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Confirmando...</>
                  : <><PackageCheck size={15} strokeWidth={2} /> Confirmar entrada no estoque</>}
              </button>
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ConfirmarRecebimentoPage;
