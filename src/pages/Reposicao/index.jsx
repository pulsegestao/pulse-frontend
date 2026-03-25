import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Plus, Loader2, ClipboardList } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import WidgetError from "../../components/WidgetError";
import { getPurchaseOrders } from "../../services/api";
import { friendlyError } from "../../utils/errorMessage";
import { isAuthenticated } from "../../hooks/useAuth";

const STATUS_CONFIG = {
  draft:     { label: "Rascunho",   color: C.mid,     bg: C.gray },
  sent:      { label: "Enviado",    color: C.blue,    bg: C.bluePale },
  partial:   { label: "Parcial",    color: "#D97706", bg: "#FEF3C7" },
  received:  { label: "Recebido",   color: "#16A34A", bg: "#DCFCE7" },
  cancelled: { label: "Cancelado",  color: "#EF4444", bg: "#FEF2F2" },
};

const fmt = (d) => new Date(d).toLocaleDateString("pt-BR");

const ReposicaoPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getPurchaseOrders(50);
      setOrders(data || []);
    } catch (e) {
      setError(friendlyError(e.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/", { replace: true }); return; }
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "124px 24px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, paddingTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <Link to="/gerir-estoque" style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: C.surface, border: `1px solid ${C.border}`,
              color: C.mid, textDecoration: "none", transition: "all 0.15s",
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
                Reposição
              </h1>
            </div>
          </div>
          <button
            onClick={() => navigate("/reposicao/novo")}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
              borderRadius: 10, border: "none",
              background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
              color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer",
              fontFamily: "inherit", boxShadow: `0 4px 14px ${C.blue}33`,
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            Nova ordem
          </button>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={24} color={C.blue} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : error ? (
          <WidgetError message={error} onRetry={load} />
        ) : orders.length === 0 ? (
          <div style={{
            background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`,
            padding: "64px 24px", textAlign: "center",
            boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
          }}>
            <ClipboardList size={36} color={C.border} strokeWidth={1.5} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 8px" }}>Nenhuma ordem ainda</p>
            <p style={{ fontSize: 14, color: C.mid, margin: "0 0 24px" }}>
              Crie sua primeira ordem de compra para rastrear reposições de estoque.
            </p>
            <button onClick={() => navigate("/reposicao/novo")} style={{
              padding: "10px 24px", borderRadius: 8, border: "none",
              background: C.blue, color: "white", fontSize: 13, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}>
              Nova ordem
            </button>
          </div>
        ) : (
          <div style={{ background: C.surface, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden" }}>
            {orders.map((order, i) => {
              const st = STATUS_CONFIG[order.status] || STATUS_CONFIG.draft;
              return (
                <div
                  key={order.id}
                  onClick={() => navigate(`/reposicao/${order.id}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16, padding: "16px 20px",
                    borderBottom: i < orders.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "pointer", transition: "background 0.12s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.gray}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.graphite, margin: 0 }}>
                      {order.items?.length || 0} produto{order.items?.length !== 1 ? "s" : ""}
                    </p>
                    <p style={{ fontSize: 12, color: C.mid, margin: "2px 0 0" }}>
                      Criado em {fmt(order.created_at)}
                      {order.notes && ` · ${order.notes}`}
                    </p>
                  </div>
                  <span style={{
                    fontSize: 12, fontWeight: 700, color: st.color, background: st.bg,
                    borderRadius: 20, padding: "4px 12px", flexShrink: 0,
                  }}>{st.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ReposicaoPage;
