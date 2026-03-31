import { useState } from "react";
import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const planFeatures = [
  "Controle de estoque ilimitado",
  "PDV integrado",
  "Alertas automáticos de reposição",
  "Sugestões de compra com IA",
  "Relatórios de vendas e estoque",
  "Acesso pelo celular, tablet e PC",
  "Suporte via WhatsApp",
  "Atualizações automáticas gratuitas",
  "Até 3 usuários incluídos",
];

const Pricing = () => {
  const [ref, visible] = useInView();
  const [annual, setAnnual] = useState(false);
  const price = annual ? 89 : 119;

  return (
    <section id="preços" style={{ padding: "100px 24px", background: C.white }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }} ref={ref}>
        <div className={`fade-up ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-block", background: C.bluePale, color: C.blue, borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            Preço simples e justo
          </div>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: C.graphite, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Um plano.<br />Sem surpresa no bolso.
          </h2>
          <p style={{ color: C.mid, fontSize: 17, maxWidth: 400, margin: "0 auto 32px" }}>
            Tudo incluído. Sem taxa de instalação, sem fidelidade, cancela quando quiser.
          </p>

          {/* Toggle */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.gray, borderRadius: 100, padding: "6px 10px" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: !annual ? C.blue : C.mid, cursor: "pointer", padding: "6px 18px", borderRadius: 100, background: !annual ? "white" : "transparent", boxShadow: !annual ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}
              onClick={() => setAnnual(false)}>Mensal</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: annual ? C.blue : C.mid, cursor: "pointer", padding: "6px 18px", borderRadius: 100, background: annual ? "white" : "transparent", boxShadow: annual ? "0 2px 8px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s" }}
              onClick={() => setAnnual(true)}>
              Anual <span style={{ background: C.blue, color: "white", borderRadius: 100, fontSize: 11, padding: "2px 8px", fontWeight: 700, marginLeft: 4 }}>-25%</span>
            </span>
          </div>
        </div>

        <div className={`fade-up d1 ${visible ? "visible" : ""}`} style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="pricing-card-inner" style={{
            background: `linear-gradient(145deg, ${C.blue}, ${C.blueLight})`,
            borderRadius: 24,
            boxShadow: `0 24px 60px ${C.blue}33`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
            <div style={{ position: "absolute", bottom: -60, left: -30, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "inline-block", background: "rgba(255,255,255,0.15)", borderRadius: 8, padding: "4px 14px", fontSize: 13, color: "white", fontWeight: 600, marginBottom: 24 }}>
                Plano Completo
              </div>

              <div style={{ marginBottom: 8 }}>
                <span style={{ fontSize: 56, fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                  R$ {price}
                </span>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>/mês</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 32 }}>
                {annual ? `Cobrado anualmente · R$ ${price * 12}` : "Cobrado mensalmente"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                {planFeatures.map((f, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="11" height="11" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15 }}>{f}</span>
                  </div>
                ))}
              </div>

              <a href="/cadastro" style={{
                display: "block", textAlign: "center",
                background: "white", color: C.blue,
                padding: "16px", borderRadius: 14,
                fontSize: 16, fontWeight: 800,
                boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                transition: "transform 0.2s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "none"}>
                Começar 14 dias grátis →
              </a>
              <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 14 }}>
                Sem cartão de crédito. Cancele quando quiser.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
