import C from "../../theme/colors";

const footerColumns = [
  { title: "Produto", links: ["Funcionalidades", "Planos e Preços", "IA do Pulse", "Roadmap", "Novidades"] },
  { title: "Suporte", links: ["Central de Ajuda", "Tutoriais em Vídeo", "WhatsApp", "Status do Sistema"] },
  { title: "Empresa", links: ["Sobre nós", "Blog", "Parceiros", "Termos de Uso", "Privacidade"] },
];

const Footer = () => (
  <footer style={{ background: C.graphite, padding: "60px 24px 40px" }}>
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 48, flexWrap: "wrap", marginBottom: 48, paddingBottom: 48, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        {/* Brand */}
        <div style={{ flex: "1 1 220px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M3 12h4l3-8 4 16 3-8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="syne" style={{ fontSize: 18, fontWeight: 800, color: "white" }}>Pulse Gestão</span>
          </div>
          <p style={{ color: "#9CA3AF", fontSize: 14, lineHeight: 1.7, maxWidth: 220 }}>
            Estoque inteligente para pequenos negócios brasileiros.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            {["📱 WhatsApp", "💬 Chat", "📧 E-mail"].map(c => (
              <div key={c} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#9CA3AF", cursor: "pointer" }}>{c}</div>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {footerColumns.map(col => (
          <div key={col.title} style={{ flex: "1 1 140px" }}>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: 14, marginBottom: 16 }}>{col.title}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {col.links.map(l => (
                <a key={l} href="#" style={{ color: "#9CA3AF", fontSize: 14, transition: "color 0.2s" }}
                  onMouseEnter={e => e.target.style.color = "white"}
                  onMouseLeave={e => e.target.style.color = "#9CA3AF"}>{l}</a>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <p style={{ color: "#6B7280", fontSize: 13 }}>
          © 2026 Pulse Gestão. Feito com ❤️ para o pequeno negócio brasileiro.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#9CA3AF" }}>🔒 SSL Seguro</div>
          <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#9CA3AF" }}>🇧🇷 Dados no Brasil</div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
