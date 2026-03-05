import C from "../../../theme/colors";

const PRODUCTS = [
  { name: "Coca-Cola 2L",        sold: 48, category: "Bebidas"    },
  { name: "Arroz 5kg",           sold: 35, category: "Mercearia"  },
  { name: "Feijão 1kg",          sold: 28, category: "Mercearia"  },
  { name: "Cerveja Long Neck",   sold: 24, category: "Bebidas"    },
  { name: "Pão de Forma",        sold: 21, category: "Padaria"    },
];

const MAX = PRODUCTS[0].sold;

const RANK_COLORS = [
  { bg: "#FFF7ED", color: "#D97706" },
  { bg: "#F0FDF4", color: C.green   },
  { bg: "#EFF4FF", color: C.blue    },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#FDF2F8", color: "#DB2777" },
];

const TopProducts = () => (
  <div style={{
    background: "white",
    borderRadius: 16,
    padding: "24px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
    border: `1px solid ${C.border}`,
  }}>
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Ranking do período</p>
      <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>Mais vendidos</p>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {PRODUCTS.map((p, i) => {
        const rank = RANK_COLORS[i];
        const pct = Math.round((p.sold / MAX) * 100);
        return (
          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Rank badge */}
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: rank.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 800, color: rank.color,
              flexShrink: 0,
            }}>
              {i + 1}
            </div>

            {/* Info + bar */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {p.name}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: C.mid, flexShrink: 0, marginLeft: 8 }}>
                  {p.sold} un.
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height: 5, background: C.border, borderRadius: 4 }}>
                <div style={{
                  height: "100%",
                  width: `${pct}%`,
                  borderRadius: 4,
                  background: rank.color,
                  opacity: 0.7,
                }} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default TopProducts;
