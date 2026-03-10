import { WifiOff } from "lucide-react";
import C from "../theme/colors";

/**
 * Estado de erro para cards e widgets que buscam dados no mount.
 * Usa ícone neutro (não vermelho alarme) + mensagem amigável + retry.
 */
const WidgetError = ({ message = "Não foi possível carregar os dados.", onRetry }) => (
  <div style={{
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: 8, padding: "32px 16px",
    textAlign: "center",
  }}>
    <WifiOff size={22} color={C.mid} strokeWidth={1.5} />
    <p style={{ fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.5 }}>
      {message}
    </p>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          marginTop: 4,
          fontSize: 12, fontWeight: 600,
          color: C.blue,
          border: `1px solid ${C.blue}`,
          borderRadius: 8, padding: "5px 14px",
          background: "none", cursor: "pointer",
          fontFamily: "inherit",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => e.currentTarget.style.background = C.bluePale}
        onMouseLeave={e => e.currentTarget.style.background = "none"}
      >
        Tentar novamente
      </button>
    )}
  </div>
);

export default WidgetError;
