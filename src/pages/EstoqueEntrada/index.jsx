import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, FileText, PenLine, Loader2 } from "lucide-react";
import C from "../../theme/colors";
import { friendlyError } from "../../utils/errorMessage";
import { isAuthenticated } from "../../hooks/useAuth";
import { getProducts, getCompanySettings, previewNFe, confirmNFe, getNCMCategories } from "../../services/api";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import NFeUpload from "./components/NFeUpload";
import NFePreviewTable from "./components/NFePreviewTable";
import ManualEntry from "./components/ManualEntry";
import QuickActionsBar from "../../components/layout/QuickActionsBar";

const TAB_NFE = "nfe";
const TAB_MANUAL = "manual";

export default function EstoqueEntradaPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(TAB_MANUAL);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [defaultMinStock, setDefaultMinStock] = useState(0);
  const [nfeFile, setNfeFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewItems, setPreviewItems] = useState([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedCount, setConfirmedCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/", { replace: true }); return; }
    getProducts().then(setProducts).catch(() => {});
    getCompanySettings().then(d => setDefaultMinStock(d.default_min_stock || 0)).catch(() => {});
    getNCMCategories().then(setCategories).catch(() => {});
  }, []);

  const handleFile = async (file) => {
    setNfeFile(file);
    setPreview(null);
    setPreviewItems([]);
    setPreviewError("");
    setConfirmed(false);

    if (!file) return;

    setLoadingPreview(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const data = await previewNFe(formData);
      setPreview(data);
    } catch (err) {
      setPreviewError(friendlyError(err.message));
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirmNFe = async () => {
    if (previewItems.length === 0) return;
    setLoadingConfirm(true);
    setConfirmError("");
    try {
      const data = await confirmNFe(previewItems);
      setConfirmedCount(data.updated);
      setConfirmed(true);
    } catch (err) {
      setConfirmError(friendlyError(err.message));
    } finally {
      setLoadingConfirm(false);
    }
  };

  const handleReset = () => {
    setNfeFile(null);
    setPreview(null);
    setPreviewItems([]);
    setPreviewError("");
    setConfirmError("");
    setConfirmed(false);
    setConfirmedCount(0);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 960, margin: "0 auto", padding: "124px 24px 48px" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28, paddingTop: 8 }}>
          <Link to="/dashboard" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 9,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.mid, textDecoration: "none",
            transition: "all 0.15s",
          }}>
            <ArrowLeft size={17} strokeWidth={2} />
          </Link>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: "0 0 2px", letterSpacing: "-0.3px" }}>
              Entrada de Estoque
            </h1>
            <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
              Registre a entrada de produtos manualmente ou via NF-e XML
            </p>
          </div>
        </div>

        {/* Card */}
        <div style={{
          background: C.surface, borderRadius: 18,
          border: `1px solid ${C.border}`,
          boxShadow: "0 2px 16px rgba(0,0,0,0.04)",
          overflow: "hidden",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex", borderBottom: `1px solid ${C.border}`,
            padding: "0 24px",
          }}>
            {[
              { id: TAB_MANUAL, label: "Entrada Manual", icon: <PenLine size={15} strokeWidth={2} /> },
              { id: TAB_NFE, label: "Via NF-e XML", icon: <FileText size={15} strokeWidth={2} /> },
            ].map((t) => (
              <button key={t.id} onClick={() => { setTab(t.id); handleReset(); }} style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "16px 20px 14px",
                background: "none", border: "none", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                color: tab === t.id ? C.blue : C.mid,
                borderBottom: tab === t.id ? `2px solid ${C.blue}` : "2px solid transparent",
                marginBottom: -1,
                transition: "all 0.15s",
              }}>
                {t.icon}
                {t.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 28 }}>
            {/* ── Tab NF-e ── */}
            {tab === TAB_NFE && (
              <div>
                {confirmed ? (
                  <SuccessState count={confirmedCount} onReset={handleReset} />
                ) : (
                  <>
                    <NFeUpload onFile={handleFile} loading={loadingPreview || loadingConfirm} />

                    {loadingPreview && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 0", color: C.mid, fontSize: 14 }}>
                        <Loader2 size={18} color={C.blue} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                        Lendo arquivo e cruzando com catálogo...
                      </div>
                    )}

                    {previewError && !loadingPreview && (
                      <p style={{ color: "#EF4444", fontSize: 13, marginTop: 14 }}>{previewError}</p>
                    )}

                    {preview && !loadingPreview && (
                      <div style={{ marginTop: 24 }}>
                        <NFePreviewTable
                          preview={preview}
                          products={products}
                          categories={categories}
                          onItemsChange={setPreviewItems}
                          defaultMinStock={defaultMinStock}
                        />

                        {confirmError && (
                          <p style={{ color: "#EF4444", fontSize: 13, marginTop: 14 }}>{confirmError}</p>
                        )}

                        <div style={{ marginTop: 24, display: "flex", justifyContent: "flex-end" }}>
                          <button
                            onClick={handleConfirmNFe}
                            disabled={previewItems.length === 0 || loadingConfirm}
                            style={{
                              padding: "13px 28px", borderRadius: 10,
                              background: previewItems.length === 0 || loadingConfirm ? C.border : C.green,
                              color: previewItems.length === 0 || loadingConfirm ? C.mid : "white",
                              border: "none", fontSize: 14, fontWeight: 700,
                              cursor: previewItems.length === 0 || loadingConfirm ? "not-allowed" : "pointer",
                              transition: "all 0.2s",
                              display: "flex", alignItems: "center", gap: 8,
                            }}
                          >
                            {loadingConfirm && (
                              <Loader2 size={16} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
                            )}
                            {loadingConfirm
                              ? "Confirmando..."
                              : `Confirmar entrada (${previewItems.length} ${previewItems.length === 1 ? "item" : "itens"})`}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Tab Manual ── */}
            {tab === TAB_MANUAL && (
              <ManualEntry products={products} categories={categories} onProductCreated={(p) => setProducts(prev => [...prev, p])} defaultMinStock={defaultMinStock} />
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

const SuccessState = ({ count, onReset }) => (
  <div style={{ textAlign: "center", padding: "48px 24px" }}>
    <div style={{
      width: 64, height: 64, borderRadius: "50%",
      background: C.greenPale,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
    <h2 style={{ fontSize: 20, fontWeight: 800, color: C.graphite, margin: "0 0 8px" }}>
      Estoque atualizado!
    </h2>
    <p style={{ fontSize: 14, color: C.mid, margin: "0 0 28px" }}>
      {count} {count === 1 ? "produto atualizado" : "produtos atualizados"} com sucesso.
    </p>
    <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
      <Link to="/dashboard" style={{
        padding: "11px 24px", borderRadius: 9,
        background: C.blue, color: "white",
        textDecoration: "none", fontSize: 14, fontWeight: 700,
      }}>
        Ir para o Dashboard
      </Link>
      <button onClick={onReset} style={{
        padding: "11px 24px", borderRadius: 9,
        background: C.surface, color: C.graphite,
        border: `1.5px solid ${C.border}`,
        fontSize: 14, fontWeight: 700, cursor: "pointer",
      }}>
        Nova entrada
      </button>
    </div>
  </div>
);
