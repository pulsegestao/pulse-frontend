import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Package, Lightbulb, Loader2, BellOff, CheckCheck } from "lucide-react";
import C from "../../../theme/colors";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../../../services/api";

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
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const NotificationDropdown = ({ onClose, onUpdate }) => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications({ limit: 8 })
      .then((res) => setItems(res?.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleClick = async (n) => {
    if (!n.read) {
      try { await markNotificationRead(n.id); } catch {}
      onUpdate();
    }
    onClose();
    if (n.link) navigate(n.link);
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems(prev => prev.map(n => ({ ...n, read: true })));
      onUpdate();
      window.dispatchEvent(new Event("pulse:notifications-updated"));
    } catch {}
  };

  return (
    <div ref={ref} style={{
      position: "absolute", top: "calc(100% + 8px)", right: 0,
      width: 370, maxHeight: 440, overflowY: "auto",
      background: C.surface, borderRadius: 16,
      border: `1px solid ${C.border}`,
      boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
      zIndex: 300,
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 18px 10px", borderBottom: `1px solid ${C.border}`,
      }}>
        <span style={{ fontSize: 14, fontWeight: 800, color: C.graphite }}>Notificações</span>
        <button
          onClick={handleMarkAll}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 12, fontWeight: 600, color: C.blue,
            display: "flex", alignItems: "center", gap: 4,
            fontFamily: "inherit",
          }}
        >
          <CheckCheck size={14} /> Marcar todas
        </button>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Loader2 size={22} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 18px", color: C.mid }}>
          <BellOff size={28} color={C.mid} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: 13, margin: 0 }}>Nenhuma notificação</p>
        </div>
      ) : (
        <>
          {items.map((n) => {
            const Icon = TYPE_ICON[n.type] || Package;
            const sevColor = SEVERITY_COLORS[n.severity] || C.blue;
            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                style={{
                  display: "flex", gap: 12, padding: "12px 18px",
                  cursor: "pointer", transition: "background 0.15s",
                  background: n.read ? "transparent" : C.bluePale,
                  borderBottom: `1px solid ${C.border}`,
                }}
                onMouseEnter={e => e.currentTarget.style.background = C.gray}
                onMouseLeave={e => e.currentTarget.style.background = n.read ? "transparent" : C.bluePale}
              >
                {!n.read && (
                  <div style={{
                    width: 8, height: 8, borderRadius: "50%",
                    background: C.blue, flexShrink: 0, marginTop: 6,
                  }} />
                )}
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  background: `${sevColor}18`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={16} style={{ color: sevColor }} strokeWidth={2} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, color: C.graphite,
                    margin: 0, lineHeight: 1.3,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{n.title}</p>
                  <p style={{
                    fontSize: 12, color: C.mid, margin: "2px 0 0",
                    lineHeight: 1.4,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>{n.message}</p>
                  <p style={{ fontSize: 11, color: C.mid, margin: "4px 0 0", opacity: 0.7 }}>
                    {timeAgo(n.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
          <div
            onClick={() => { onClose(); navigate("/notificacoes"); }}
            style={{
              textAlign: "center", padding: "12px",
              cursor: "pointer", fontSize: 13, fontWeight: 700,
              color: C.blue, transition: "background 0.15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background = C.gray}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            Ver todas as notificações
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
