import { Pencil, PlusCircle, SlidersHorizontal } from "lucide-react";
import C from "../../../theme/colors";

const getStatus = (produto) => {
  const { estoque_atual, estoque_minimo } = produto;
  if (estoque_atual <= estoque_minimo / 2) return { label: "Crítico", color: "#DC2626", bg: "#FEF2F2", dot: "#DC2626" };
  if (estoque_atual <= estoque_minimo)     return { label: "Baixo",   color: "#D97706", bg: "#FFFBEB", dot: "#D97706" };
  return                                          { label: "OK",      color: C.green,   bg: C.greenPale, dot: C.green };
};

const ActionBtn = ({ icon: Icon, title, color }) => (
  <button
    title={title}
    style={{
      width: 32, height: 32, borderRadius: 8,
      border: `1px solid ${C.border}`,
      background: "white", cursor: "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      transition: "all 0.15s",
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = color + "12";
      e.currentTarget.style.borderColor = color + "44";
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = "white";
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
    background: "#FAFAFA",
    whiteSpace: "nowrap",
  }}>
    {children}
  </th>
);

const ProductTable = ({ products }) => {
  if (products.length === 0) {
    return (
      <div style={{
        background: "white", borderRadius: 14, border: `1px solid ${C.border}`,
        padding: "60px 24px", textAlign: "center",
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <p style={{ fontSize: 15, color: C.mid, margin: 0 }}>Nenhum produto encontrado.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: "white",
      borderRadius: 14,
      border: `1px solid ${C.border}`,
      boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      overflow: "hidden",
    }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 680 }}>
          <thead>
            <tr>
              <TH>Produto</TH>
              <TH>Categoria</TH>
              <TH align="center">Estoque Atual</TH>
              <TH align="center">Mínimo</TH>
              <TH align="center">Status</TH>
              <TH align="right">Preço de Venda</TH>
              <TH align="center">Ações</TH>
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const status = getStatus(p);
              return (
                <tr
                  key={p.id}
                  style={{ borderBottom: i < products.length - 1 ? `1px solid ${C.border}` : "none" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#FAFBFC"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>{p.nome}</p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, color: C.mid,
                      background: C.gray, borderRadius: 6, padding: "3px 9px",
                    }}>
                      {p.categoria}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{
                      fontSize: 15, fontWeight: 800, margin: 0,
                      color: p.estoque_atual <= p.estoque_minimo ? status.color : C.graphite,
                    }}>
                      {p.estoque_atual}
                    </p>
                  </td>
                  <td style={{ padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 14, color: C.mid, margin: 0 }}>{p.estoque_minimo}</p>
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
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>
                      {p.preco_venda.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                      <ActionBtn icon={Pencil} title="Editar produto" color={C.blue} />
                      <ActionBtn icon={PlusCircle} title="Adicionar estoque" color={C.green} />
                      <ActionBtn icon={SlidersHorizontal} title="Ajustar estoque" color="#7C3AED" />
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
