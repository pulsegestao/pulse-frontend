import { useState } from "react";
import { Search, Plus, Trash2, PackagePlus, X } from "lucide-react";
import C from "../../../theme/colors";

const UNITS = ["UN", "KG", "L", "CX", "PCT", "DZ", "M", "G"];

const inputSt = (error) => ({
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: `1.5px solid ${error ? "#EF4444" : C.border}`,
  fontSize: 13,
  color: C.graphite,
  background: C.surface,
  boxSizing: "border-box",
  outline: "none",
  fontFamily: "inherit",
});

const Label = ({ children, required }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.graphite, marginBottom: 4 }}>
    {children}
    {required && <span style={{ color: "#EF4444", marginLeft: 3 }}>*</span>}
  </label>
);

const emptyNew = (defaultMinStock = 0) => ({
  name: "", unit: "UN", sale_price: "", cost_price: "", barcode: "", quantity: "",
  min_quantity: defaultMinStock > 0 ? String(defaultMinStock) : "",
});

const ManualEntry = ({ products, onProductCreated, defaultMinStock = 0 }) => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [createMode, setCreateMode] = useState(false);
  const [newProduct, setNewProduct] = useState(() => emptyNew(defaultMinStock));
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [createApiError, setCreateApiError] = useState("");

  const filtered = search.length > 1
    ? (products || []).filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      )
    : [];

  const showNoResults = search.length > 1 && filtered.length === 0 && !createMode;

  const addItem = (product) => {
    setSearch("");
    if (items.find((i) => i.product_id === product.id)) return;
    setItems((prev) => [...prev, {
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_cost: product.cost_price || 0,
      isNew: false,
    }]);
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const openCreateMode = () => {
    setNewProduct({ ...emptyNew(defaultMinStock), name: search.trim() });
    setCreateErrors({});
    setCreateApiError("");
    setCreateMode(true);
    setSearch("");
  };

  const cancelCreate = () => {
    setCreateMode(false);
    setNewProduct(emptyNew(defaultMinStock));
    setCreateErrors({});
    setCreateApiError("");
  };

  const validateNew = () => {
    const e = {};
    if (!newProduct.name.trim()) e.name = "Obrigatório";
    if (!newProduct.sale_price || isNaN(parseFloat(newProduct.sale_price)) || parseFloat(newProduct.sale_price) <= 0)
      e.sale_price = "Obrigatório";
    if (!newProduct.quantity || isNaN(parseInt(newProduct.quantity)) || parseInt(newProduct.quantity) < 1)
      e.quantity = "Mínimo 1";
    return e;
  };

  const handleCreate = async () => {
    const e = validateNew();
    if (Object.keys(e).length > 0) { setCreateErrors(e); return; }
    setCreating(true);
    setCreateApiError("");
    try {
      const { createProduct } = await import("../../../services/api");
      const qty = parseInt(newProduct.quantity);
      const created = await createProduct({
        name: newProduct.name.trim(),
        unit: newProduct.unit,
        sale_price: parseFloat(newProduct.sale_price),
        cost_price: parseFloat(newProduct.cost_price) || 0,
        barcode: newProduct.barcode.trim(),
        quantity: qty,
        min_quantity: parseInt(newProduct.min_quantity) || 0,
        sku: "",
        description: "",
      });
      setItems((prev) => [...prev, {
        product_id: created.id,
        name: created.name,
        quantity: qty,
        unit_cost: parseFloat(newProduct.cost_price) || 0,
        isNew: true,
      }]);
      if (onProductCreated) onProductCreated(created);
      cancelCreate();
    } catch (err) {
      setCreateApiError(friendlyError(err.message) || "Erro ao criar produto.");
    } finally {
      setCreating(false);
    }
  };

  const handleConfirm = async () => {
    const toUpdate = items.filter((i) => !i.isNew);
    if (toUpdate.length === 0 && items.every((i) => i.isNew)) {
      setSuccess(true);
      setItems([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { updateStock } = await import("../../../services/api");
      for (const item of toUpdate) {
        await updateStock(item.product_id, {
          type: "in",
          quantity: Number(item.quantity),
          reason: "Entrada manual",
        });
      }
      setSuccess(true);
      setItems([]);
    } catch (err) {
      setError(friendlyError(err.message));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "48px 24px" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: C.greenPale,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 8px" }}>
          Estoque atualizado!
        </p>
        <p style={{ fontSize: 13, color: C.mid, margin: "0 0 20px" }}>
          Os itens foram adicionados ao estoque com sucesso.
        </p>
        <button onClick={() => setSuccess(false)} style={{
          padding: "10px 24px", borderRadius: 8,
          background: C.blue, color: "white", border: "none",
          fontSize: 13, fontWeight: 600, cursor: "pointer",
        }}>
          Nova entrada
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      {!createMode && (
        <div style={{ position: "relative", marginBottom: 16 }}>
          <Search size={16} color={C.mid} strokeWidth={2} style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
          }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produto por nome ou código de barras..."
            style={{
              width: "100%", padding: "11px 14px 11px 40px",
              borderRadius: 10, border: `1.5px solid ${C.border}`,
              fontSize: 14, color: C.graphite, background: C.surface,
              boxSizing: "border-box", outline: "none",
            }}
          />
          {(filtered.length > 0 || showNoResults) && (
            <div style={{
              position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)", marginTop: 4,
              maxHeight: 260, overflowY: "auto",
            }}>
              {filtered.map((p) => (
                <button key={p.id} onClick={() => addItem(p)} style={{
                  width: "100%", padding: "10px 16px", textAlign: "left",
                  background: "none", border: "none", cursor: "pointer",
                  borderBottom: `1px solid ${C.border}`,
                  fontSize: 14, color: C.graphite,
                }}
                  onMouseEnter={(e) => e.currentTarget.style.background = C.gray}
                  onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                >
                  <span style={{ fontWeight: 600 }}>{p.name}</span>
                  {p.barcode && (
                    <span style={{ display: "block", fontSize: 11, color: C.mid }}>
                      EAN: {p.barcode}
                    </span>
                  )}
                </button>
              ))}
              {showNoResults && (
                <div>
                  <p style={{ fontSize: 13, color: C.mid, padding: "10px 16px 6px", margin: 0 }}>
                    Nenhum produto encontrado.
                  </p>
                  <button
                    onClick={openCreateMode}
                    style={{
                      width: "100%", padding: "10px 16px", textAlign: "left",
                      background: "none", border: "none", borderTop: `1px solid ${C.border}`,
                      cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
                      fontSize: 13, fontWeight: 700, color: C.blue, fontFamily: "inherit",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.bluePale}
                    onMouseLeave={(e) => e.currentTarget.style.background = "none"}
                  >
                    <Plus size={14} color={C.blue} strokeWidth={2.5} />
                    Criar produto "{search.trim()}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create product mini-form */}
      {createMode && (
        <div style={{
          border: `1.5px solid ${C.blue}44`,
          borderRadius: 12,
          background: C.bluePale,
          padding: "18px 20px",
          marginBottom: 16,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PackagePlus size={16} color={C.blue} strokeWidth={2} />
              <p style={{ fontSize: 14, fontWeight: 700, color: C.blue, margin: 0 }}>Novo produto</p>
            </div>
            <button onClick={cancelCreate} style={{
              background: "none", border: "none", cursor: "pointer", padding: 2,
              display: "flex",
            }}>
              <X size={16} strokeWidth={2} color={C.mid} />
            </button>
          </div>

          <div style={{ marginBottom: 10 }}>
            <Label required>Nome do produto</Label>
            <input
              value={newProduct.name}
              onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
              style={inputSt(createErrors.name)}
              placeholder="Ex: Feijão Preto 1kg"
            />
            {createErrors.name && <p style={{ fontSize: 11, color: "#EF4444", margin: "3px 0 0" }}>{createErrors.name}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <Label required>Preço de venda (R$)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.sale_price}
                onChange={(e) => setNewProduct(p => ({ ...p, sale_price: e.target.value }))}
                style={inputSt(createErrors.sale_price)}
                placeholder="0,00"
              />
              {createErrors.sale_price && <p style={{ fontSize: 11, color: "#EF4444", margin: "3px 0 0" }}>{createErrors.sale_price}</p>}
            </div>
            <div>
              <Label required>Unidade</Label>
              <select
                value={newProduct.unit}
                onChange={(e) => setNewProduct(p => ({ ...p, unit: e.target.value }))}
                style={{ ...inputSt(false), cursor: "pointer", appearance: "none" }}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <Label required>Qtd. que está entrando</Label>
              <input
                type="number"
                min="1"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct(p => ({ ...p, quantity: e.target.value }))}
                style={inputSt(createErrors.quantity)}
                placeholder="0"
              />
              {createErrors.quantity && <p style={{ fontSize: 11, color: "#EF4444", margin: "3px 0 0" }}>{createErrors.quantity}</p>}
            </div>
            <div>
              <Label>Estoque mínimo</Label>
              <input
                type="number"
                min="0"
                value={newProduct.min_quantity}
                onChange={(e) => setNewProduct(p => ({ ...p, min_quantity: e.target.value }))}
                style={inputSt(false)}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            <div>
              <Label>Preço de custo (R$)</Label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={newProduct.cost_price}
                onChange={(e) => setNewProduct(p => ({ ...p, cost_price: e.target.value }))}
                style={inputSt(false)}
                placeholder="0,00"
              />
            </div>
            <div>
              <Label>Código de barras (EAN)</Label>
              <input
                value={newProduct.barcode}
                onChange={(e) => setNewProduct(p => ({ ...p, barcode: e.target.value }))}
                style={inputSt(false)}
                placeholder="0000000000000"
              />
            </div>
          </div>

          {createApiError && (
            <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 10, fontWeight: 600 }}>{createApiError}</p>
          )}

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={cancelCreate}
              style={{
                flex: 1, padding: "10px", borderRadius: 8,
                border: `1.5px solid ${C.border}`, background: C.surface,
                fontSize: 13, fontWeight: 600, color: C.graphite,
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreate}
              disabled={creating}
              style={{
                flex: 2, padding: "10px", borderRadius: 8,
                background: creating ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
                color: creating ? C.mid : "white",
                border: "none", fontSize: 13, fontWeight: 700,
                cursor: creating ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {creating ? "Criando..." : "Criar e adicionar"}
            </button>
          </div>
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10,
              border: `1px solid ${item.isNew ? C.green + "44" : C.border}`,
              background: item.isNew ? C.greenPale : C.surface,
            }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.graphite }}>
                {item.name}
              </span>
              {item.isNew ? (
                <span style={{
                  fontSize: 11, fontWeight: 700, color: C.green,
                  background: C.surface, border: `1px solid ${C.green}44`,
                  borderRadius: 20, padding: "3px 10px", flexShrink: 0,
                }}>
                  Produto criado · {item.quantity} {item.quantity === 1 ? "un." : "uns."}
                </span>
              ) : (
                <>
                  <label style={{ fontSize: 12, color: C.mid }}>Qtd</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                    style={{
                      width: 64, padding: "6px 8px", borderRadius: 6,
                      border: `1px solid ${C.border}`, fontSize: 13,
                      textAlign: "center", color: C.graphite,
                    }}
                  />
                </>
              )}
              <button onClick={() => removeItem(idx)} style={{
                background: "none", border: "none", cursor: "pointer",
                display: "flex", padding: 4,
              }}>
                <Trash2 size={15} color="#EF4444" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && !createMode && (
        <div style={{
          textAlign: "center", padding: "40px 24px",
          border: `2px dashed ${C.border}`, borderRadius: 12,
          color: C.mid, fontSize: 14, marginBottom: 20,
        }}>
          <Plus size={24} color={C.border} strokeWidth={2} style={{ display: "block", margin: "0 auto 8px" }} />
          Busque um produto acima para adicionar
        </div>
      )}

      {error && (
        <p style={{ fontSize: 13, color: "#EF4444", marginBottom: 12 }}>{error}</p>
      )}

      {!createMode && (
        <button
          onClick={handleConfirm}
          disabled={items.length === 0 || loading}
          style={{
            width: "100%", padding: "13px 24px", borderRadius: 10,
            background: items.length === 0 || loading ? C.border : C.green,
            color: items.length === 0 || loading ? C.mid : "white",
            border: "none", fontSize: 14, fontWeight: 700,
            cursor: items.length === 0 || loading ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {loading ? "Confirmando..." : `Confirmar entrada (${items.length} ${items.length === 1 ? "item" : "itens"})`}
        </button>
      )}
    </div>
  );
};

export default ManualEntry;
