import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import MetricCards from "./components/MetricCards";
import ProductTable from "./components/ProductTable";
import mockProducts from "./data/mockProducts";
import { isAuthenticated } from "../../hooks/useAuth";

const GerirEstoquePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!isAuthenticated()) navigate("/", { replace: true });
  }, []);

  const filtered = mockProducts.filter(p =>
    p.nome.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#F8F9FB" }}>
      <DashboardHeader />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 24px 48px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, paddingTop: 8, gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Estoque
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
              Gerir Estoque
            </h1>
          </div>

          <button
            onClick={() => navigate("/estoque/entrada")}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "11px 20px",
              background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
              color: "white", border: "none", borderRadius: 12,
              fontSize: 14, fontWeight: 700, cursor: "pointer",
              boxShadow: `0 4px 14px ${C.blue}33`,
              fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-1px)";
              e.currentTarget.style.boxShadow = `0 8px 20px ${C.blue}44`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = `0 4px 14px ${C.blue}33`;
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Adicionar ao estoque
          </button>

        </div>

        {/* Metric cards */}
        <MetricCards products={mockProducts} />

        {/* Search bar */}
        <div style={{
          background: "white",
          borderRadius: 14,
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          padding: "16px 20px",
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <Search size={17} color={C.mid} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar produto pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: 14,
              color: C.graphite,
              fontFamily: "inherit",
              background: "transparent",
            }}
          />
          {search && (
            <span style={{ fontSize: 12, color: C.mid, flexShrink: 0 }}>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Product table */}
        <ProductTable products={filtered} />
      </main>

      <style>{`
        @media (max-width: 900px) {
          .estoque-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .estoque-metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default GerirEstoquePage;
