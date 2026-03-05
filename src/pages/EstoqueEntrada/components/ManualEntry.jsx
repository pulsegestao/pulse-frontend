import { useState } from "react";
import { Search, Plus, Trash2 } from "lucide-react";
import C from "../../../theme/colors";

const ManualEntry = ({ products }) => {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const filtered = search.length > 1
    ? (products || []).filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.barcode && p.barcode.includes(search))
      )
    : [];

  const addItem = (product) => {
    setSearch("");
    if (items.find((i) => i.product_id === product.id)) return;
    setItems((prev) => [...prev, {
      product_id: product.id,
      name: product.name,
      quantity: 1,
      unit_cost: product.cost_price || 0,
    }]);
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const removeItem = (idx) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleConfirm = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const { updateStock } = await import("../../../services/api");
      for (const item of items) {
        await updateStock(item.product_id, {
          type: "in",
          quantity: Number(item.quantity),
          reason: "Entrada manual",
        });
      }
      setSuccess(true);
      setItems([]);
    } catch (err) {
      setError(err.message);
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
            fontSize: 14, color: C.graphite, background: "white",
            boxSizing: "border-box", outline: "none",
          }}
        />
        {filtered.length > 0 && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
            background: "white", border: `1px solid ${C.border}`, borderRadius: 10,
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)", marginTop: 4,
            maxHeight: 220, overflowY: "auto",
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
          </div>
        )}
      </div>

      {/* Items list */}
      {items.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
          {items.map((item, idx) => (
            <div key={idx} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px", borderRadius: 10,
              border: `1px solid ${C.border}`, background: "white",
            }}>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: C.graphite }}>
                {item.name}
              </span>
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

      {items.length === 0 && (
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
    </div>
  );
};

export default ManualEntry;
