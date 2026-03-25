import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, Plus, Loader2, AlertCircle, X, ArrowLeft } from "lucide-react";
import { friendlyError } from "../../utils/errorMessage";
import WidgetError from "../../components/WidgetError";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import MetricCards from "./components/MetricCards";
import ProductTable from "./components/ProductTable";
import { isAuthenticated } from "../../hooks/useAuth";
import { getProducts, updateProduct, updateStock, getNCMCategories, getSuppliers } from "../../services/api";
import QuickActionsBar from "../../components/layout/QuickActionsBar";

const UNITS = ["UN", "KG", "L", "CX", "PCT", "DZ", "M", "G"];

const inputSt = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: `1.5px solid ${C.border}`, fontSize: 13,
  color: C.graphite, background: C.surface,
  boxSizing: "border-box", outline: "none", fontFamily: "inherit",
};

const ModalOverlay = ({ onClose, children }) => (
  <div
    onClick={onClose}
    style={{
      position: "fixed", inset: 0, zIndex: 200,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24,
    }}
  >
    <div onClick={e => e.stopPropagation()} style={{
      background: C.surface, borderRadius: 16,
      width: "100%", maxWidth: 480,
      boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
    }}>
      {children}
    </div>
  </div>
);

const ModalHeader = ({ title, onClose }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`,
  }}>
    <p style={{ fontSize: 16, fontWeight: 800, color: C.graphite, margin: 0 }}>{title}</p>
    <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex" }}>
      <X size={18} color={C.mid} strokeWidth={2} />
    </button>
  </div>
);

const FieldLabel = ({ children }) => (
  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.graphite, marginBottom: 4 }}>
    {children}
  </label>
);

const EditModal = ({ product, categories, suppliers, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    name: product.name || "",
    unit: product.unit || "UN",
    sale_price: product.sale_price || "",
    cost_price: product.cost_price || "",
    barcode: product.barcode || "",
    min_quantity: product.inventory?.min_quantity ?? 0,
    ncm_code: product.ncm_code || "",
    supplier_id: product.supplier_id || "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.name.trim()) { setError("Nome é obrigatório."); return; }
    setSaving(true);
    setError("");
    try {
      await updateProduct(product.id, {
        name: form.name.trim(),
        unit: form.unit,
        sale_price: parseFloat(form.sale_price) || 0,
        cost_price: parseFloat(form.cost_price) || 0,
        barcode: form.barcode.trim(),
        min_quantity: parseInt(form.min_quantity) || 0,
        ncm_code: form.ncm_code,
        supplier_id: form.supplier_id || null,
      });
      onSuccess();
    } catch (e) {
      setError(friendlyError(e.message) || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Editar produto" onClose={onClose} />
      <div style={{ padding: "20px 24px" }}>
        <div style={{ marginBottom: 12 }}>
          <FieldLabel>Nome</FieldLabel>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputSt} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <FieldLabel>Preço de venda (R$)</FieldLabel>
            <input type="number" min="0" step="0.01" value={form.sale_price} onChange={e => setForm(f => ({ ...f, sale_price: e.target.value }))} style={inputSt} />
          </div>
          <div>
            <FieldLabel>Preço de custo (R$)</FieldLabel>
            <input type="number" min="0" step="0.01" value={form.cost_price} onChange={e => setForm(f => ({ ...f, cost_price: e.target.value }))} style={inputSt} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div>
            <FieldLabel>Unidade</FieldLabel>
            <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} style={{ ...inputSt, cursor: "pointer", appearance: "none" }}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <FieldLabel>Código de barras</FieldLabel>
            <input value={form.barcode} onChange={e => setForm(f => ({ ...f, barcode: e.target.value }))} style={inputSt} placeholder="EAN-13" />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <FieldLabel>Estoque mínimo</FieldLabel>
            <input type="number" min="0" value={form.min_quantity} onChange={e => setForm(f => ({ ...f, min_quantity: e.target.value }))} style={inputSt} />
          </div>
          <div>
            <FieldLabel>Categoria</FieldLabel>
            <select value={form.ncm_code} onChange={e => setForm(f => ({ ...f, ncm_code: e.target.value }))} style={{ ...inputSt, cursor: "pointer", appearance: "none" }}>
              <option value="">Sem categoria</option>
              {(categories || []).map(c => (
                <option key={c.prefix} value={c.prefix}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Fornecedor</FieldLabel>
          <select value={form.supplier_id} onChange={e => setForm(f => ({ ...f, supplier_id: e.target.value }))} style={{ ...inputSt, cursor: "pointer", appearance: "none" }}>
            <option value="">Sem fornecedor</option>
            {(suppliers || []).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        {error && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: saving ? C.border : `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, color: saving ? C.mid : "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Salvando..." : "Salvar alterações"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const AddStockModal = ({ product, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState(String(product.cost_price || ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const currentQty = product.inventory?.quantity ?? 0;
  const currentCost = product.cost_price || 0;
  const qty = parseInt(quantity) || 0;
  const cost = parseFloat(unitCost) || 0;
  const showAvg = cost !== currentCost && currentQty > 0 && qty > 0;
  const avgCost = showAvg
    ? ((currentQty * currentCost + qty * cost) / (currentQty + qty)).toFixed(2).replace(".", ",")
    : null;

  const handleSubmit = async () => {
    if (!qty || qty < 1) { setError("Quantidade deve ser pelo menos 1."); return; }
    setSaving(true);
    setError("");
    try {
      await updateStock(product.id, { type: "in", quantity: qty, reason: "Adição manual", unit_cost: cost });
      onSuccess();
    } catch (e) {
      setError(friendlyError(e.message) || "Erro ao adicionar estoque.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Adicionar estoque" onClose={onClose} />
      <div style={{ padding: "20px 24px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>{product.name}</p>
        <p style={{ fontSize: 13, color: C.mid, margin: "0 0 20px" }}>
          Estoque atual: <strong style={{ color: C.graphite }}>{currentQty}</strong> {product.unit}
          {currentCost > 0 && (
            <span style={{ marginLeft: 8 }}>
              · Custo atual: <strong style={{ color: C.graphite }}>
                R${currentCost.toFixed(2).replace(".", ",")}
              </strong>
            </span>
          )}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <FieldLabel>Quantidade a adicionar</FieldLabel>
            <input
              type="number" min="1" value={quantity} autoFocus
              onChange={e => setQuantity(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputSt}
              placeholder="Ex: 24"
            />
          </div>
          <div>
            <FieldLabel>Preço de custo (R$)</FieldLabel>
            <input
              type="number" min="0" step="0.01" value={unitCost}
              onChange={e => setUnitCost(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              style={inputSt}
              placeholder="0,00"
            />
          </div>
        </div>
        {avgCost && (
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.bluePale, borderRadius: 8, padding: "10px 14px", marginBottom: 16,
          }}>
            <span style={{ fontSize: 12, color: C.blue, fontWeight: 600 }}>Novo custo médio</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: C.blue }}>R${avgCost}</span>
          </div>
        )}
        {error && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: saving ? C.border : C.green, color: saving ? C.mid : "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Confirmando..." : "Confirmar adição"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const AdjustStockModal = ({ product, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState(String(product.inventory?.quantity ?? 0));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    const qty = parseInt(quantity);
    if (isNaN(qty) || qty < 0) { setError("Informe uma quantidade válida (mínimo 0)."); return; }
    setSaving(true);
    setError("");
    try {
      await updateStock(product.id, { type: "adjustment", quantity: qty, reason: "Ajuste manual" });
      onSuccess();
    } catch (e) {
      setError(friendlyError(e.message) || "Erro ao ajustar estoque.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalOverlay onClose={onClose}>
      <ModalHeader title="Ajustar estoque" onClose={onClose} />
      <div style={{ padding: "20px 24px" }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>{product.name}</p>
        <p style={{ fontSize: 13, color: C.mid, margin: "0 0 20px" }}>
          Estoque atual: <strong style={{ color: C.graphite }}>{product.inventory?.quantity ?? 0}</strong> {product.unit}
        </p>
        <div style={{ marginBottom: 16 }}>
          <FieldLabel>Nova quantidade em estoque</FieldLabel>
          <input
            type="number" min="0" value={quantity} autoFocus
            onChange={e => setQuantity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
            style={inputSt}
          />
          <p style={{ fontSize: 12, color: C.mid, margin: "4px 0 0" }}>
            O estoque será definido exatamente para este valor.
          </p>
        </div>
        {error && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 12 }}>{error}</p>}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 13, fontWeight: 600, color: C.graphite, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
          <button onClick={handleSubmit} disabled={saving} style={{ flex: 2, padding: "10px", borderRadius: 8, border: "none", background: saving ? C.border : "#7C3AED", color: saving ? C.mid : "white", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Ajustando..." : "Confirmar ajuste"}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
};

const GerirEstoquePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState({ type: null, product: null });

  const fetchProducts = () => {
    setLoading(true);
    setError("");
    getProducts()
      .then(data => setProducts(data || []))
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar os produtos."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/", { replace: true }); return; }
    fetchProducts();
    getNCMCategories().then(setCategories).catch(() => {});
    getSuppliers().then(data => setSuppliers(data || [])).catch(() => {});
  }, []);

  const closeModal = () => setModal({ type: null, product: null });
  const handleSuccess = () => { closeModal(); fetchProducts(); };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "124px 24px 48px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 28, paddingTop: 8, gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/dashboard" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: C.surface, border: `1px solid ${C.border}`,
              color: C.mid, textDecoration: "none",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
              onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.mid; }}
            >
              <ArrowLeft size={17} strokeWidth={2} color="currentColor" />
            </Link>
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
                Estoque
              </p>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
                Gerir Estoque
              </h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
            <button
              onClick={() => navigate("/reposicao")}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "11px 18px",
                background: C.surface, color: C.graphite,
                border: `1.5px solid ${C.border}`, borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Reposição
            </button>
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
        </div>

        {/* Metric cards */}
        <MetricCards products={products} />

        {/* Search bar */}
        <div style={{
          background: C.surface, borderRadius: 14,
          border: `1px solid ${C.border}`,
          boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          padding: "16px 20px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <Search size={17} color={C.mid} strokeWidth={2} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Buscar produto pelo nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, border: "none", outline: "none", fontSize: 14, color: C.graphite, fontFamily: "inherit", background: "transparent" }}
          />
          {search && (
            <span style={{ fontSize: 12, color: C.mid, flexShrink: 0 }}>
              {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Product table */}
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "60px 0", color: C.mid, fontSize: 14 }}>
            <Loader2 size={20} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
            Carregando produtos...
          </div>
        ) : error ? (
          <WidgetError message={error} onRetry={fetchProducts} />
        ) : (
          <ProductTable products={filtered} categories={categories} onAction={(type, product) => setModal({ type, product })} />
        )}
      </main>

      {/* Modais */}
      {modal.type === "edit"   && <EditModal      product={modal.product} categories={categories} suppliers={suppliers} onClose={closeModal} onSuccess={handleSuccess} />}
      {modal.type === "add"    && <AddStockModal  product={modal.product} onClose={closeModal} onSuccess={handleSuccess} />}
      {modal.type === "adjust" && <AdjustStockModal product={modal.product} onClose={closeModal} onSuccess={handleSuccess} />}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
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
