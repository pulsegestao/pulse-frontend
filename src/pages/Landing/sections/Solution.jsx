import { Package, Receipt, Bell, Sparkles } from "lucide-react";
import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const steps = [
  { n: "01", title: "Cadastre seus produtos", desc: "Rápido e simples. Importe por planilha ou cadastre um por um.", badgeIcon: <Package size={14} strokeWidth={2} />, badgeText: "Estoque atualizado" },
  { n: "02", title: "Registre suas vendas no PDV", desc: "Toque e venda. Integrado ao estoque em tempo real.", badgeIcon: <Receipt size={14} strokeWidth={2} />, badgeText: "Venda registrada" },
  { n: "03", title: "Receba alertas automáticos", desc: "Produto baixo? O Pulse avisa antes de acabar.", badgeIcon: <Bell size={14} strokeWidth={2} />, badgeText: "Alerta enviado" },
  { n: "04", title: "A IA analisa e sugere", desc: "Sugestões de compra baseadas no seu histórico de vendas.", badgeIcon: <Sparkles size={14} strokeWidth={2} />, badgeText: "Sugestão gerada" },
];

const Solution = () => {
  const [ref, visible] = useInView();

  return (
    <section id="solução" style={{ background: C.white, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }} ref={ref}>
        <div className={`fade-up ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 72 }}>
          <div style={{ display: "inline-block", background: C.greenPale, color: C.green, borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            A solução
          </div>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: C.graphite, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Do caos ao controle<br />
            <span style={{ color: C.blue }}>em 4 passos simples.</span>
          </h2>
          <p style={{ color: C.mid, fontSize: 17, maxWidth: 480, margin: "0 auto" }}>
            Pulse Gestão foi feito para funcionar no seu ritmo. Sem treinamento longo, sem complicação.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {steps.map((s, i) => (
            <div key={i} className={`fade-up d${i + 1} ${visible ? "visible" : ""}`}
              style={{
                display: "flex", alignItems: "flex-start", gap: 32,
                padding: "32px 0",
                borderBottom: i < steps.length - 1 ? `1px solid ${C.border}` : "none",
              }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                background: i < 2 ? `linear-gradient(135deg, ${C.blue}, ${C.blueLight})` : `linear-gradient(135deg, ${C.green}, ${C.greenLight})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 8px 20px ${i < 2 ? C.blue : C.green}30`,
              }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif" }}>{s.n}</span>
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.graphite, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ fontSize: 16, color: C.mid, lineHeight: 1.65 }}>{s.desc}</p>
              </div>
              <div style={{
                flex: 1, height: 56, background: C.gray, borderRadius: 12, maxWidth: 400,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                color: C.mid, fontSize: 13, border: `1px solid ${C.border}`,
              }}>
                {s.badgeIcon}
                {s.badgeText}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
