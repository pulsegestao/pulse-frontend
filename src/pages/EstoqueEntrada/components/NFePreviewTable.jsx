import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Plus } from "lucide-react";
import C from "../../../theme/colors";

const MODE_LINK = "link";
const MODE_NEW = "new";

const NFePreviewTable = ({ preview, products, categories, onItemsChange, defaultMinStock = 0 }) => {
  const [overrides, setOverrides] = useState({});
  const [newProducts, setNewProducts] = useState({});
  const [modes, setModes] = useState({});
  const [ignored, setIgnored] = useState({});

  useEffect(() => {
    onItemsChange(buildItems({}, {}, {}, {}, preview.items || []));
  }, []);

  const setMode = (idx, mode) => {
    const next = { ...modes, [idx]: mode };
    setModes(next);
    if (mode === MODE_LINK) {
      const np = { ...newProducts };
      delete np[idx];
      setNewProducts(np);
    } else if (mode === MODE_NEW) {
      const ov = { ...overrides };
      delete ov[idx];
      setOverrides(ov);
      const item = (preview.items || [])[idx];
      const ncmPrefix = item?.ncm && item.ncm.length >= 2 ? item.ncm.substring(0, 2) : "";
      const np = {
        ...newProducts,
        [idx]: {
          name: item?.name || "",
          sale_price: "",
          barcode: item?.ean && item.ean !== "SEM GTIN" ? item.ean : "",
          unit: item?.unit || "UN",
          cost_price: item?.unit_cost || 0,
          min_quantity: defaultMinStock > 0 ? defaultMinStock : 0,
          ncm_code: ncmPrefix,
        },
      };
      setNewProducts(np);
      onItemsChange(buildItems(ov, np, next, ignored, preview.items || []));
    }
  };

  const handleProductOverride = (idx, productId) => {
    const ov = { ...overrides, [idx]: productId };
    setOverrides(ov);
    onItemsChange(buildItems(ov, newProducts, modes, ignored, preview.items || []));
  };

  const handleNewProductField = (idx, field, value) => {
    const np = { ...newProducts, [idx]: { ...newProducts[idx], [field]: value } };
    setNewProducts(np);
    onItemsChange(buildItems(overrides, np, modes, ignored, preview.items || []));
  };

  const handleIgnore = (idx, value) => {
    const ig = { ...ignored, [idx]: value };
    setIgnored(ig);
    onItemsChange(buildItems(overrides, newProducts, modes, ig, preview.items || []));
  };

  const buildItems = (ov, np, md, ig, items) => {
    return items
      .map((item, idx) => {
        if (ig[idx]) return null;
        const mode = md[idx] || MODE_LINK;

        if (mode === MODE_NEW) {
          const npData = np[idx];
          if (!npData || !npData.name || !npData.sale_price) return null;
          return {
            product_id: "",
            new_product: {
              name: npData.name,
              barcode: npData.barcode || "",
              unit: npData.unit || "UN",
              ncm_code: npData.ncm_code || "",
              cost_price: Number(npData.cost_price) || item.unit_cost,
              sale_price: Number(npData.sale_price),
              min_quantity: Number(npData.min_quantity) || 0,
            },
            quantity: Math.round(item.quantity),
            unit_cost: item.unit_cost,
            note: `Entrada via NF-e — ${item.name}`,
          };
        }

        const productId = ov[idx] || item.matched_product_id;
        if (!productId) return null;
        return {
          product_id: productId,
          quantity: Math.round(item.quantity),
          unit_cost: item.unit_cost,
          note: `Entrada via NF-e — ${item.name}`,
        };
      })
      .filter(Boolean);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <Chip color={C.green} bg={C.greenPale}
          label={`${preview.matched_count} encontrados`}
          icon={<CheckCircle size={13} color={C.green} strokeWidth={2.5} />}
        />
        <Chip color="#EF4444" bg={C.redPale}
          label={`${preview.total_items - preview.matched_count} não encontrados`}
          icon={<AlertCircle size={13} color="#EF4444" strokeWidth={2.5} />}
        />
        {preview.supplier_name && (
          <Chip color={C.mid} bg={C.gray} label={`Fornecedor: ${preview.supplier_name}`} />
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ background: C.gray }}>
              {["Produto (NF-e)", "No sistema", "Qtd", "Custo unit.", ""].map((h) => (
                <th key={h} style={{
                  padding: "10px 14px", textAlign: "left",
                  fontWeight: 700, color: C.mid, fontSize: 12, whiteSpace: "nowrap",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(preview.items || []).map((item, idx) => {
              const matched = overrides[idx] || item.matched_product_id;
              const isIgnored = !!ignored[idx];
              const mode = modes[idx] || MODE_LINK;
              const np = newProducts[idx] || {};

              return (
                <tr key={idx} style={{
                  borderBottom: `1px solid ${C.border}`,
                  opacity: isIgnored ? 0.4 : 1,
                  background: C.surface,
                }}>
                  <td style={{ padding: "12px 14px", color: C.graphite, fontWeight: 600 }}>
                    {item.name}
                    <span style={{ display: "block", fontSize: 11, color: C.mid, fontWeight: 400 }}>
                      EAN: {item.ean || "—"}
                      {item.ncm && (
                        <span style={{ marginLeft: 8 }}>· NCM: {item.ncm}</span>
                      )}
                    </span>
                  </td>

                  <td style={{ padding: "12px 14px", minWidth: 220 }}>
                    {matched && mode === MODE_LINK ? (
                      <span style={{ color: C.green, fontWeight: 600 }}>
                        {overrides[idx]
                          ? (products || []).find((p) => p.id === overrides[idx])?.name
                          : item.matched_product_name}
                        {item.current_stock != null && (
                          <span style={{ display: "block", fontSize: 11, color: C.mid, fontWeight: 400 }}>
                            Estoque atual: {item.current_stock}
                          </span>
                        )}
                      </span>
                    ) : mode === MODE_NEW ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <input
                          value={np.name || ""}
                          onChange={(e) => handleNewProductField(idx, "name", e.target.value)}
                          placeholder="Nome do produto"
                          style={inputStyle}
                        />
                        <div style={{ display: "flex", gap: 6 }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ fontSize: 10, color: C.mid, display: "block", marginBottom: 2 }}>
                              Preço de venda *
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={np.sale_price || ""}
                              onChange={(e) => handleNewProductField(idx, "sale_price", e.target.value)}
                              placeholder="R$ 0,00"
                              style={inputStyle}
                            />
                          </div>
                        </div>
                        <div>
                          <label style={{ fontSize: 10, color: C.mid, display: "block", marginBottom: 2 }}>
                            Categoria
                          </label>
                          <select
                            value={np.ncm_code || ""}
                            onChange={(e) => handleNewProductField(idx, "ncm_code", e.target.value)}
                            style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
                          >
                            <option value="">Sem categoria</option>
                            {(categories || []).map(c => (
                              <option key={c.prefix} value={c.prefix}>{c.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => setMode(idx, MODE_LINK)}
                          style={{ fontSize: 11, color: C.mid, background: "none", border: "none", cursor: "pointer", textAlign: "left", padding: 0 }}
                        >
                          Vincular a produto existente
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <AlertCircle size={14} color="#EF4444" strokeWidth={2} />
                          <select
                            onChange={(e) => handleProductOverride(idx, e.target.value)}
                            defaultValue=""
                            style={{
                              fontSize: 12, padding: "4px 8px", borderRadius: 6,
                              border: `1px solid ${C.border}`, color: C.graphite,
                              background: C.surface, cursor: "pointer", flex: 1,
                            }}
                          >
                            <option value="" disabled>Vincular produto...</option>
                            {(products || []).map((p) => (
                              <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => setMode(idx, MODE_NEW)}
                          style={{
                            display: "flex", alignItems: "center", gap: 4,
                            fontSize: 12, color: C.blue, background: "none",
                            border: "none", cursor: "pointer", padding: 0, fontWeight: 600,
                          }}
                        >
                          <Plus size={13} strokeWidth={2.5} />
                          Cadastrar como novo produto
                        </button>
                      </div>
                    )}
                  </td>

                  <td style={{ padding: "12px 14px", color: C.graphite }}>
                    {item.quantity} {item.unit}
                  </td>
                  <td style={{ padding: "12px 14px", color: C.graphite }}>
                    {item.unit_cost.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </td>
                  <td style={{ padding: "12px 14px" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12, color: C.mid }}>
                      <input
                        type="checkbox"
                        checked={isIgnored}
                        onChange={(e) => handleIgnore(idx, e.target.checked)}
                      />
                      Ignorar
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%", padding: "5px 8px", borderRadius: 6,
  border: `1px solid ${C.border}`, fontSize: 12,
  color: C.graphite, background: C.surface, boxSizing: "border-box",
};

const Chip = ({ color, bg, label, icon }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "4px 12px", borderRadius: 20,
    background: bg, color, fontSize: 12, fontWeight: 600,
  }}>
    {icon}
    {label}
  </span>
);

export default NFePreviewTable;
