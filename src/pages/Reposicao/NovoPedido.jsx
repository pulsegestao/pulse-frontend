import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Sparkles, Loader2, Search, X, Plus, Minus, MessageCircle, Mail, FileText,
} from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import { friendlyError } from "../../utils/errorMessage";
import { useToast } from "../../hooks/useToast";
import {
  getProducts, getSuppliers, suggestPurchaseOrder, createPurchaseOrder, sendPurchaseOrder,
} from "../../services/api";

const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  color: C.graphite, background: C.surface,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const CHANNEL_ICONS = {
  whatsapp: MessageCircle,
  email:    Mail,
  pdf:      FileText,
};

const CHANNEL_LABELS = {
  whatsapp: "WhatsApp",
  email:    "E-mail",
  pdf:      "PDF",
};

const NovoPedidoPage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [suggesting, setSuggesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getProducts().then(d => setProducts(d || [])).catch(() => {});
    getSuppliers().then(d => setSuppliers(d || [])).catch(() => {});
  }, []);

  const supplierMap = Object.fromEntries(suppliers.map(s => [s.id, s]));

  const addProduct = (product) => {
    if (items.find(i => i.product_id === product.id)) return;
    setItems(prev => [...prev, {
      product_id:   product.id,
      product_name: product.name,
      unit:         product.unit,
      supplier_id:  product.supplier_id || null,
      quantity:     1,
      unit_cost:    product.cost_price || 0,
      current_stock: product.inventory?.quantity ?? 0,
    }]);
    setSearch("");
  };

  const removeItem = (id) => setItems(prev => prev.filter(i => i.product_id !== id));

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(i => i.product_id === id ? { ...i, [field]: value } : i));
  };

  const handleSuggest = async () => {
    setSuggesting(true);
    try {
      const suggested = await suggestPurchaseOrder();
      if (!suggested || suggested.length === 0) {
        toast.info("Nenhum produto precisa de reposição no momento.");
        return;
      }
      const newItems = suggested.map(s => ({
        product_id:    s.product_id,
        product_name:  s.product_name,
        unit:          s.unit,
        supplier_id:   s.supplier_id || null,
        quantity:      s.suggested_qty,
        unit_cost:     s.unit_cost || 0,
        current_stock: s.current_stock,
      }));
      const existingIds = new Set(items.map(i => i.product_id));
      const toAdd = newItems.filter(i => !existingIds.has(i.product_id));
      setItems(prev => [...prev, ...toAdd]);
      if (toAdd.length === 0) toast.info("Todos os produtos sugeridos já estão na lista.");
      else toast.success(`${toAdd.length} produto${toAdd.length !== 1 ? "s" : ""} adicionado${toAdd.length !== 1 ? "s" : ""} pela IA.`);
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSuggesting(false);
    }
  };

  const handleSend = async (supplierID) => {
    if (items.length === 0) { toast.error("Adicione pelo menos um produto."); return; }
    setSaving(true);
    try {
      const groupItems = supplierID === null
        ? items.filter(i => !i.supplier_id)
        : items.filter(i => i.supplier_id === supplierID);

      const po = await createPurchaseOrder({
        supplier_id: supplierID,
        notes,
        items: groupItems.map(i => ({
          product_id:       i.product_id,
          quantity_ordered: i.quantity,
          unit_cost:        i.unit_cost,
        })),
      });

      const result = await sendPurchaseOrder(po.id);
      const msg = result?.messages?.[0];

      if (msg?.whatsapp_url && msg.preferred_channel === "whatsapp") {
        window.open(msg.whatsapp_url, "_blank");
      } else if (msg?.email_body && msg.preferred_channel === "email") {
        const sup = suppliers.find(s => s.id === supplierID);
        const mailto = `mailto:${sup?.email || ""}?subject=Pedido de compra&body=${encodeURIComponent(msg.email_body)}`;
        window.open(mailto, "_blank");
      }

      toast.success("Pedido enviado e registrado!");
      navigate("/reposicao");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (items.length === 0) { toast.error("Adicione pelo menos um produto."); return; }
    setSaving(true);
    try {
      await createPurchaseOrder({
        supplier_id: items[0]?.supplier_id || null,
        notes,
        items: items.map(i => ({
          product_id:       i.product_id,
          quantity_ordered: i.quantity,
          unit_cost:        i.unit_cost,
        })),
      });
      toast.success("Rascunho salvo.");
      navigate("/reposicao");
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = search.length >= 2
    ? products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        !items.find(i => i.product_id === p.id)
      ).slice(0, 8)
    : [];

  const groupedBySupplier = items.reduce((acc, item) => {
    const key = item.supplier_id || "__none__";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingTop: 8 }}>
          <Link to="/reposicao" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.mid, textDecoration: "none",
          }}>
            <ArrowLeft size={17} strokeWidth={2} color="currentColor" />
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: C.graphite, margin: 0 }}>Nova ordem de compra</h1>
        </div>

        {/* Add products */}
        <div style={{
          background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
          padding: 20, marginBottom: 16,
        }}>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} color={C.mid} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
              <input
                style={{ ...inputSt, paddingLeft: 32 }}
                placeholder="Buscar produto por nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {filteredProducts.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
                  background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8,
                  boxShadow: "0 8px 24px rgba(0,0,0,0.1)", marginTop: 4,
                }}>
                  {filteredProducts.map(p => (
                    <div
                      key={p.id}
                      onClick={() => addProduct(p)}
                      style={{
                        padding: "10px 14px", cursor: "pointer", fontSize: 13,
                        color: C.graphite, borderBottom: `1px solid ${C.border}`,
                        transition: "background 0.1s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = C.gray}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                      <span style={{ color: C.mid, marginLeft: 8 }}>
                        {p.inventory?.quantity ?? 0} {p.unit} em estoque
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleSuggest}
              disabled={suggesting}
              style={{
                display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                borderRadius: 8, border: `1.5px solid ${C.blue}`, background: C.bluePale,
                color: C.blue, fontSize: 13, fontWeight: 700, cursor: suggesting ? "not-allowed" : "pointer",
                fontFamily: "inherit", flexShrink: 0, whiteSpace: "nowrap",
              }}
            >
              {suggesting
                ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                : <Sparkles size={14} strokeWidth={2} />}
              Sugerir via IA
            </button>
          </div>

          {items.length === 0 ? (
            <p style={{ fontSize: 13, color: C.mid, textAlign: "center", padding: "24px 0" }}>
              Busque produtos acima ou use a sugestão da IA para começar.
            </p>
          ) : (
            <div>
              {items.map(item => (
                <div key={item.product_id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: 0 }}>{item.product_name}</p>
                    <p style={{ fontSize: 11, color: C.mid, margin: "2px 0 0" }}>
                      Estoque atual: {item.current_stock} {item.unit}
                      {item.supplier_id && supplierMap[item.supplier_id] && (
                        <span style={{ marginLeft: 8, color: C.blue }}>· {supplierMap[item.supplier_id].name}</span>
                      )}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
                    <button onClick={() => updateItem(item.product_id, "quantity", Math.max(1, item.quantity - 1))} style={{
                      width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                      background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Minus size={12} color={C.mid} strokeWidth={2} />
                    </button>
                    <input
                      type="number" min="1"
                      value={item.quantity}
                      onChange={e => updateItem(item.product_id, "quantity", Math.max(1, parseInt(e.target.value) || 1))}
                      style={{ ...inputSt, width: 56, textAlign: "center", padding: "6px 8px" }}
                    />
                    <button onClick={() => updateItem(item.product_id, "quantity", item.quantity + 1)} style={{
                      width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                      background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Plus size={12} color={C.mid} strokeWidth={2} />
                    </button>
                    <span style={{ fontSize: 12, color: C.mid, marginLeft: 4, minWidth: 24 }}>{item.unit}</span>
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <input
                      type="number" min="0" step="0.01"
                      value={item.unit_cost}
                      onChange={e => updateItem(item.product_id, "unit_cost", parseFloat(e.target.value) || 0)}
                      style={{ ...inputSt, width: 90, textAlign: "right", padding: "6px 8px" }}
                      placeholder="R$/un"
                    />
                  </div>
                  <button onClick={() => removeItem(item.product_id)} style={{
                    width: 28, height: 28, borderRadius: 6, border: `1px solid ${C.border}`,
                    background: C.surface, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <X size={13} color="#EF4444" strokeWidth={2} />
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 16 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.mid, marginBottom: 4 }}>
                  Observações (opcional)
                </label>
                <input
                  style={inputSt}
                  placeholder="Ex: Urgente, prioridade no produto X..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Grouped by supplier — send actions */}
        {items.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {Object.entries(groupedBySupplier).map(([supplierId, groupItems]) => {
              const sup = supplierId !== "__none__" ? supplierMap[supplierId] : null;
              const channel = sup?.preferred_channel || "whatsapp";
              const ChannelIcon = CHANNEL_ICONS[channel] || MessageCircle;
              return (
                <div key={supplierId} style={{
                  background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`,
                  padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                }}>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 700, color: C.graphite, margin: 0 }}>
                      {sup ? sup.name : "Sem fornecedor"}
                    </p>
                    <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>
                      {groupItems.length} produto{groupItems.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => handleSend(sup ? supplierId : null)}
                    disabled={saving}
                    style={{
                      display: "flex", alignItems: "center", gap: 6, padding: "9px 16px",
                      borderRadius: 8, border: "none",
                      background: sup ? C.blue : C.border,
                      color: sup ? "white" : C.mid,
                      fontSize: 13, fontWeight: 700,
                      cursor: saving || !sup ? "not-allowed" : "pointer",
                      fontFamily: "inherit", flexShrink: 0,
                    }}
                    title={!sup ? "Vincule um fornecedor ao produto para enviar" : `Enviar via ${CHANNEL_LABELS[channel]}`}
                  >
                    <ChannelIcon size={14} strokeWidth={2} />
                    {!sup ? "Sem fornecedor" : `Enviar via ${CHANNEL_LABELS[channel]}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => navigate("/reposicao")} style={{
            flex: 1, padding: "11px", borderRadius: 8, border: `1.5px solid ${C.border}`,
            background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite,
            cursor: "pointer", fontFamily: "inherit",
          }}>Cancelar</button>
          <button onClick={handleSaveDraft} disabled={saving || items.length === 0} style={{
            flex: 2, padding: "11px", borderRadius: 8, border: `1.5px solid ${C.blue}`,
            background: "transparent", fontSize: 13, fontWeight: 700, color: C.blue,
            cursor: saving || items.length === 0 ? "not-allowed" : "pointer", fontFamily: "inherit",
          }}>{saving ? "Salvando..." : "Salvar rascunho"}</button>
        </div>
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default NovoPedidoPage;
