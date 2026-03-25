import { Pencil, PlusCircle, SlidersHorizontal } from "lucide-react";
import C from "../../../theme/colors";

const getStatus = (produto) => {
  const qty = produto.inventory?.quantity ?? 0;
  const min = produto.inventory?.min_quantity ?? 0;
  if (qty <= min / 2) return { label: "Crítico", color: "#DC2626", bg: C.redPale, dot: "#DC2626" };
  if (qty <= min)     return { label: "Baixo",   color: "#D97706", bg: C.amberPale, dot: "#D97706" };
  return                     { label: "OK",      color: C.green,   bg: C.greenPale, dot: C.green };
};

const ActionBtn = ({ icon: Icon, title, color, onClick }) => (
  <button
    title={title}
    onClick={onClick}
    style={{
      width: 32, height: 32, borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: C.surface, cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = color + "12";
      e.currentTarget.style.borderColor = color + "44";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = C.surface;
      e.currentTarget.style.borderColor = C.border;
    }}
  >
    <Icon size={14} color={color} strokeWidth={2} />
  </button>
);

const TH = ({ children, align = "left" }) => (
  <th style={{
    padding: "11px 16px",
    fontSize: 11,
    fontWeight: 700,
    color: C.mid,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    textAlign: align,
    borderBottom: `1px solid ${C.border}`,
    background: C.gray,
    whiteSpace: "nowrap",
  }}>
    {children}
  </th>
);

const fmt = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const marginColor = (pct) => {
  if (pct >= 40) return C.green;
  if (pct >= 20) return "#D97706";
  return "#DC2626";
};

const ProductTable = ({ products, categories, suppliers, onAction }) => {
  const supplierName = (supplierID) => {
    if (!supplierID || !suppliers?.length) return null;
    return suppliers.find(s => s.id === supplierID)?.name || null;
  };
  const categoryName = (ncmCode) => {
    if (!ncmCode || !categories?.length) return null;
    const prefix = ncmCode.length >= 2 ? ncmCode.substring(0, 2) : ncmCode;
    return categories.find(c => c.prefix === prefix)?.name || null;
  };
  if (products.length === 0) {
    return (
      <div style={{
        background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`,
        padding: "60px 24px", textAlign: "center",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <p style={{ fontSize: 15, color: C.mid, margin: 0 }}>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: C.surface,
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
          <thead>
            <tr>
              <TH>Produto</TH>
              <TH>Categoria</TH>
              <TH>Fornecedor</TH>
              <TH align="center">Estoque Atual</TH>
              <TH align="center">Mínimo</TH>
              <TH align="center">Status</TH>
              <TH align="right">Custo Médio</TH>
              <TH align="right">Preço de Venda</TH>
              <TH align="right">Margem</TH>
              <TH align="center">Ações</TH>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const status = getStatus(p);
              const cost = p.cost_price ?? 0;
              const sale = p.sale_price ?? 0;
              const margin = sale > 0 ? ((sale - cost) / sale) * 100 : null;
              const supName = supplierName(p.supplier_id);
              return (
                <tr
                  key={p.id}
                  style={{ borderBottom: i < products.length - 1 ? `1px solid ${C.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.gray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>{p.name}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: C.mid,
                      background: C.gray, borderRadius: 6, padding: "3px 9px",
                    }}>
                      {categoryName(p.ncm_code) ?? "Sem categoria"}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    {supName ? (
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: C.blue,
                        background: C.bluePale, borderRadius: 6, padding: "3px 9px",
                      }}>
                        {supName}
                      </span>
                    ) : (
                      <span style={{
                        fontSize: 12, fontWeight: 600, color: "#D97706",
                        background: "#FEF3C7", borderRadius: 6, padding: "3px 9px",
                      }}>
                        Sem fornecedor
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{
                      fontSize: 15, fontWeight: 800, margin: 0,
                      color: p.inventory?.quantity <= p.inventory?.min_quantity ? status.color : C.graphite,
                    }}>
                      {p.inventory?.quantity ?? 0}
                    </p>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>{p.inventory?.min_quantity ?? 0}</p>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 700, color: status.color,
                      background: status.bg, borderRadius: 20, padding: "4px 10px",
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: status.dot, flexShrink: 0,
                      }} />
                      {status.label}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <p style={{ fontSize: 14, color: cost > 0 ? C.graphite : C.mid, margin: 0 }}>
                      {cost > 0 ? fmt(cost) : "—"}
                    </p>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>
                      {fmt(sale)}
                    </p>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "right" }}>
                    {margin !== null && cost > 0 ? (
                      <span style={{
                        fontSize: 12, fontWeight: 700,
                        color: marginColor(margin),
                        background: marginColor(margin) + "18",
                        borderRadius: 6, padding: "3px 8px",
                      }}>
                        {margin.toFixed(1)}%
                      </span>
                    ) : (
                      <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>—</p>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ActionBtn icon={Pencil} title="Editar produto" color={C.blue} onClick={() => onAction("edit", p)} />
                      <ActionBtn icon={PlusCircle} title="Adicionar estoque" color={C.blue} onClick={() => onAction("add", p)} />
                      <ActionBtn icon={SlidersHorizontal} title="Ajustar estoque" color={C.blueLight} onClick={() => onAction("adjust", p)} />
                    </div>
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

export default ProductTable;
