import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const insights = [
  { emoji: "📈", text: "Refrigerante 2L: aumento de 42% nas vendas nesta semana. Reabasteça antes do fim de semana." },
  { emoji: "⚠️", text: "Arroz 5kg está a 2 dias de esgotar com o ritmo atual de vendas." },
  { emoji: "💡", text: "Biscoito Recheado vende 3x mais às sextas. Considere promoção no início da semana." },
  { emoji: "🔁", text: "Cerveja Long Neck tem ciclo de reposição de 8 dias. Próximo pedido: em 3 dias." },
];

const checkItems = [
  "Aprende com o padrão de vendas do seu negócio",
  "Avisa quando é hora de repor antes do produto acabar",
  "Sugere quanto comprar com base na demanda real",
  "Identifica quais produtos estão parados e gerando custo",
];

const AISection = () => {
  const [ref, visible] = useInView();

  return (
    <section id="ia" style={{ padding: "100px 24px", background: C.white, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -150, top: "50%", transform: "translateY(-50%)", width: 500, height: 500, borderRadius: "50%", background: `${C.blue}06`, zIndex: 0 }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }} ref={ref}>
        <div style={{ display: "flex", alignItems: "center", gap: 80, flexWrap: "wrap" }}>
          {/* Left – AI card feed */}
          <div className={`fade-up ${visible ? "visible" : ""}`} style={{ flex: "1 1 400px" }}>
            <div style={{ position: "relative", display: "inline-flex", alignItems: "center", marginBottom: 24 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: C.green, position: "relative" }}>
                <div style={{ position: "absolute", inset: -4, borderRadius: "50%", background: C.green, animation: "pulse-ring 2s ease-out infinite" }} />
              </div>
              <span style={{ marginLeft: 10, fontSize: 13, fontWeight: 600, color: C.green }}>IA ativa agora</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {insights.map((ins, i) => (
                <div key={i} className={`fade-up d${i + 1} ${visible ? "visible" : ""}`}
                  style={{ background: "white", border: `1px solid ${C.border}`, borderRadius: 16, padding: "18px 20px", display: "flex", gap: 16, alignItems: "flex-start", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{ins.emoji}</span>
                  <p style={{ fontSize: 14, color: C.graphite, lineHeight: 1.6, fontWeight: 500 }}>{ins.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right – explanation */}
          <div className={`fade-up d2 ${visible ? "visible" : ""}`} style={{ flex: "1 1 380px" }}>
            <div style={{ display: "inline-block", background: `linear-gradient(135deg, ${C.blue}15, ${C.green}15)`, color: C.blue, borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
              Inteligência Artificial
            </div>
            <h2 className="syne" style={{ fontSize: "clamp(26px, 3.5vw, 42px)", fontWeight: 800, color: C.graphite, marginBottom: 20, letterSpacing: "-0.5px" }}>
              Não é mágica.<br />
              É seu estoque<br />
              <span style={{ color: C.blue }}>mais inteligente.</span>
            </h2>
            <p style={{ fontSize: 16, color: C.mid, lineHeight: 1.75, marginBottom: 24 }}>
              A IA do Pulse analisa o histórico de vendas do seu negócio e gera alertas e sugestões no momento certo. Sem jargão técnico, sem configuração complexa.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {checkItems.map((t, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: C.greenPale, border: `1.5px solid ${C.green}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke={C.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <span style={{ fontSize: 15, color: C.graphite }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AISection;
