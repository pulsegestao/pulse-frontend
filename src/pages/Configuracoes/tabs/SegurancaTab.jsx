import { Clock, Construction } from "lucide-react";
import C from "../../../theme/colors";

const SegurancaTab = () => (
  <div style={{
    background: C.surface, borderRadius: 14,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    padding: "60px 24px",
    textAlign: "center",
  }}>
    <div style={{
      width: 56, height: 56, borderRadius: 16,
      background: C.amberPale,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 16px",
    }}>
      <Construction size={24} color="#D97706" strokeWidth={2} />
    </div>
    <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: "0 0 6px" }}>
      Em breve
    </p>
    <p style={{ fontSize: 13, color: C.mid, margin: 0, lineHeight: 1.6 }}>
      O histórico de sessões e gerenciamento de segurança<br />
      estarão disponíveis em breve.
    </p>
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      gap: 6, marginTop: 20,
      fontSize: 12, color: C.mid,
    }}>
      <Clock size={13} strokeWidth={2} />
      Próximas atualizações
    </div>
  </div>
);

export default SegurancaTab;
