import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Loader2, BellOff, Package, Lightbulb, ArrowLeft, ChevronDown,
} from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import { isAuthenticated } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from "../../services/api";

const TABS = [
  { key: "all",     label: "Todas" },
  { key: "unread",  label: "Não lidas" },
  { key: "stock",   label: "Estoque" },
  { key: "insights", label: "Insights" },
];

const SEVERITY_COLORS = {
  critical: "#EF4444",
  warning:  "#F59E0B",
  info:     "var(--c-blue)",
};

const TYPE_ICON = {
  low_stock:      Package,
  critical_stock: Package,
  new_insights:   Lightbulb,
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "agora";
  if (mins < 60) return `${mins}m atrás`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d atrás`;
  return new Date(dateStr).toLocaleDateString("pt-BR");
}

const PAGE_SIZE = 10;

const NotificacoesPage = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState("all");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login", { replace: true });
  }, []);

  const buildFilter = useCallback(() => {
    const filter = { limit: PAGE_SIZE, offset: 0 };
    if (tab === "unread") filter.read = false;
    if (tab === "stock") filter.type = "stock";
    if (tab === "insights") filter.type = "new_insights";
    return filter;
  }, [tab]);

  useEffect(() => {
    setLoading(true);
    setOffset(0);
    const filter = buildFilter();
    getNotifications(filter)
      .then((res) => {
        const data = res?.data || [];
        setItems(data);
        setTotal(res?.total ?? data.length);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [tab, buildFilter]);

  const loadMore = async () => {
    const newOffset = offset + PAGE_SIZE;
    setLoadingMore(true);
    try {
      const filter = { ...buildFilter(), offset: newOffset };
      const res = await getNotifications(filter);
      const data = res?.data || [];
      if (data.length > 0) {
        setItems(prev => [...prev, ...data]);
        setOffset(newOffset);
        setTotal(res?.total ?? items.length + data.length);
      } else {
        setTotal(items.length);
      }
    } catch {}
    setLoadingMore(false);
  };

  const handleClick = async (n) => {
    if (!n.read) {
      try {
        await markNotificationRead(n.id);
        setItems(prev => prev.map(i => i.id === n.id ? { ...i, read: true } : i));
        window.dispatchEvent(new Event("pulse:notifications-updated"));
      } catch {}
    }
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    setMarking(true);
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      window.dispatchEvent(new Event("pulse:notifications-updated"));
      toast.success("Todas as notificações foram marcadas como lidas.");
    } catch {
      toast.error("Falha ao marcar todas como lidas.");
    } finally {
      setMarking(false);
    }
  };

  const hasMore = items.length > 0 && items.length < total;

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 760, margin: "0 auto", padding: "124px 24px 48px" }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "none", border: `1.5px solid ${C.border}`,
            borderRadius: 10, padding: "8px 14px",
            fontSize: 13, fontWeight: 600, color: C.mid,
            cursor: "pointer", marginBottom: 20, fontFamily: "inherit",
          }}
          onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
          onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = C.mid; }}
        >
          <ArrowLeft size={15} /> Voltar
        </button>

        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20, flexWrap: "wrap", gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12,
              background: C.bluePale,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bell size={20} color={C.blue} strokeWidth={2} />
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
              Notificações
            </h1>
          </div>

          <button
            onClick={handleMarkAll}
            disabled={marking}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 10,
              border: `1.5px solid ${C.border}`,
              background: C.surface, color: C.mid,
              fontSize: 13, fontWeight: 600,
              cursor: marking ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={e => { if (!marking) { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; } }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.mid; }}
          >
            {marking
              ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Marcando...</>
              : <><CheckCheck size={14} strokeWidth={2} /> Marcar todas como lidas</>
            }
          </button>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                padding: "7px 16px", borderRadius: 8,
                border: tab === t.key ? "none" : `1.5px solid ${C.border}`,
                background: tab === t.key ? C.blue : C.surface,
                color: tab === t.key ? "white" : C.mid,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit", transition: "all 0.15s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 size={24} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        ) : items.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "48px 24px",
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`,
          }}>
            <BellOff size={36} color={C.mid} style={{ marginBottom: 12 }} />
            <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: "0 0 4px" }}>
              Nenhuma notificação
            </p>
            <p style={{ fontSize: 13, color: C.mid, margin: 0 }}>
              {tab === "unread" ? "Todas as notificações foram lidas." : "Nenhuma notificação encontrada nesta categoria."}
            </p>
          </div>
        ) : (
          <div style={{
            background: C.surface, borderRadius: 16,
            border: `1px solid ${C.border}`, overflow: "hidden",
          }}>
            {items.map((n) => {
              const Icon = TYPE_ICON[n.type] || Package;
              const sevColor = SEVERITY_COLORS[n.severity] || C.blue;
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 14,
                    padding: "16px 20px", cursor: "pointer",
                    background: n.read ? "transparent" : C.bluePale,
                    borderBottom: `1px solid ${C.border}`,
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.gray}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : C.bluePale}
                >
                  {!n.read && (
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%",
                      background: C.blue, flexShrink: 0, marginTop: 8,
                    }} />
                  )}
                  <div style={{
                    width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                    background: `${sevColor}18`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={18} style={{ color: sevColor }} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 14, fontWeight: 700, color: C.graphite,
                      margin: 0, lineHeight: 1.3,
                    }}>{n.title}</p>
                    <p style={{
                      fontSize: 13, color: C.mid, margin: "4px 0 0", lineHeight: 1.5,
                    }}>{n.message}</p>
                    <p style={{ fontSize: 12, color: C.mid, margin: "6px 0 0", opacity: 0.6 }}>
                      {timeAgo(n.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div style={{ textAlign: "center", padding: 16 }}>
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "9px 20px", borderRadius: 10,
                    border: `1.5px solid ${C.border}`, background: C.surface,
                    fontSize: 13, fontWeight: 700, color: C.blue,
                    cursor: loadingMore ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  {loadingMore
                    ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    : <ChevronDown size={14} />
                  }
                  Carregar mais
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default NotificacoesPage;
