import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import C from "../theme/colors";

let nextId = 0;

const TOAST_STYLES = {
  success: { bg: C.greenPale, color: C.green,   border: "#BBF7D0", Icon: CheckCircle },
  error:   { bg: C.redPale,   color: "#DC2626",  border: "#FECACA", Icon: XCircle    },
  warning: { bg: C.amberPale, color: "#D97706",  border: "#FDE68A", Icon: AlertTriangle },
  info:    { bg: C.bluePale,  color: C.blue,     border: "#BFDBFE", Icon: Info       },
};

const ToastItem = ({ toast, onClose }) => {
  const { bg, color, border, Icon } = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 14px", borderRadius: 10,
      background: bg, border: `1px solid ${border}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
      minWidth: 280, maxWidth: 360,
      animation: "toast-in 0.2s ease-out",
    }}>
      <Icon size={16} color={color} strokeWidth={2.5} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ flex: 1, fontSize: 13, fontWeight: 600, color, margin: 0, lineHeight: 1.5 }}>
        {toast.message}
      </p>
      <button
        onClick={() => onClose(toast.id)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", flexShrink: 0 }}
      >
        <X size={14} color={color} strokeWidth={2.5} />
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  useEffect(() => {
    const handler = (e) => {
      const { type, message } = e.detail;
      setToasts(prev => {
        const next = [...prev, { id: ++nextId, type, message }];
        return next.slice(-3); // máximo 3 simultâneos
      });
    };
    window.addEventListener("pulse:toast", handler);
    return () => window.removeEventListener("pulse:toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <>
      <div style={{
        position: "fixed", top: 76, right: 20, zIndex: 9999,
        display: "flex", flexDirection: "column", gap: 8,
        pointerEvents: "none",
      }}>
        {toasts.map(t => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <ToastItem toast={t} onClose={remove} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
};

export default ToastContainer;
