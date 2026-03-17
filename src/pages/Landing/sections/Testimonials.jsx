import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const testimonials = [
  {
    name: "Marcos Ferreira",
    role: "Dono do Mercadinho Boa Vista · Campinas, SP",
    avatar: "MF",
    avatarColor: C.blue,
    text: "Antes eu perdia venda toda semana por falta de produto. Hoje o Pulse me avisa antes de acabar. Economizei mais de R$ 2.000 no primeiro mês porque parei de comprar o que não vende.",
    stars: 5,
  },
  {
    name: "Renata Oliveira",
    role: "Proprietária da Adega Oliveira · São Paulo, SP",
    avatar: "RO",
    avatarColor: C.blueLight,
    text: "Sistema simples, sem complicação. Em menos de um dia já tava rodando na adega. A IA sugeriu eu repor uma cerveja que eu não tava dando atenção, e ela virou minha mais vendida da semana.",
    stars: 5,
  },
  {
    name: "Claudinho Santos",
    role: "Conveniência 24h · Fortaleza, CE",
    avatar: "CS",
    avatarColor: "#7C3AED",
    text: "Tentei de tudo antes: planilha, caderno, outro sistema. O Pulse é o único que funciona de verdade pra minha realidade. O PDV junto com estoque mudou tudo. Recomendo pra qualquer dono de comércio.",
    stars: 5,
  },
];

const Testimonials = () => {
  const [ref, visible] = useInView();

  return (
    <section id="depoimentos" style={{ background: C.gray, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }} ref={ref}>
        <div className={`fade-up ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", background: "#FEF3C7", color: "#D97706", borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            Quem usa, recomenda
          </div>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: C.graphite, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Negócios reais.<br />Resultados reais.
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {testimonials.map((t, i) => (
            <div key={i} className={`fade-up d${i + 1} ${visible ? "visible" : ""}`}
              style={{ background: "white", borderRadius: 20, padding: 32, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: 2, marginBottom: 20 }}>
                {[...Array(t.stars)].map((_, s) => <span key={s} style={{ color: "#F59E0B", fontSize: 18 }}>★</span>)}
              </div>
              <p style={{ fontSize: 15, color: C.graphite, lineHeight: 1.75, marginBottom: 24, fontStyle: "italic" }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: t.avatarColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontWeight: 800, fontSize: 14 }}>{t.avatar}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: C.graphite }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.mid }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
