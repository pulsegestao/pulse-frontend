import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const features = [
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 8h14M5 8a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 01-2 2M5 8l2 13h10l2-13" stroke="#1E3A8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Controle de Estoque",
    desc: "Saiba exatamente quantas unidades você tem de cada produto. Histórico completo de entradas e saídas.",
    color: C.blue, bg: C.bluePale,
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><rect x="2" y="4" width="20" height="16" rx="3" stroke="#16A34A" strokeWidth="1.8"/><path d="M8 4v16M2 9h6M2 15h6" stroke="#16A34A" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    title: "PDV Integrado",
    desc: "Ponto de venda direto no sistema. Registre vendas com rapidez e o estoque atualiza sozinho.",
    color: C.green, bg: C.greenPale,
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="#7C3AED" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Alertas Automáticos",
    desc: "Defina o estoque mínimo de cada produto e receba avisos antes de acabar. Nunca mais seja pego de surpresa.",
    color: "#7C3AED", bg: "#F5F3FF",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="#D97706" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "IA Inteligente",
    desc: "A IA analisa o histórico de vendas e sugere o que você deve comprar, quando e quanto. Sem achismo.",
    color: "#D97706", bg: "#FFFBEB",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#DB2777" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Relatórios Simples",
    desc: "Veja o desempenho do seu negócio de forma visual e clara. Quais produtos mais vendem, qual dia foi melhor.",
    color: "#DB2777", bg: "#FDF2F8",
  },
  {
    icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="#1E3A8A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>,
    title: "Acesso pelo celular",
    desc: "Use no computador, tablet ou smartphone. Funciona em qualquer dispositivo, sem instalar nada.",
    color: C.blue, bg: C.bluePale,
  },
];

const Features = () => {
  const [ref, visible] = useInView();

  return (
    <section id="funcionalidades" style={{ background: C.gray, padding: "100px 24px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }} ref={ref}>
        <div className={`fade-up ${visible ? "visible" : ""}`} style={{ textAlign: "center", marginBottom: 64 }}>
          <div style={{ display: "inline-block", background: C.bluePale, color: C.blue, borderRadius: 100, padding: "6px 18px", fontSize: 13, fontWeight: 600, marginBottom: 20 }}>
            Funcionalidades
          </div>
          <h2 className="syne" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 800, color: C.graphite, marginBottom: 16, letterSpacing: "-0.5px" }}>
            Tudo que seu negócio<br />precisa em um só lugar.
          </h2>
          <p style={{ color: C.mid, fontSize: 17, maxWidth: 440, margin: "0 auto" }}>
            Ferramentas pensadas para o dia a dia do pequeno empreendedor brasileiro.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} className={`fade-up d${Math.min(i + 1, 6)} ${visible ? "visible" : ""}`}
              style={{ background: "white", borderRadius: 18, padding: "28px 28px 32px", border: `1px solid ${C.border}`, transition: "transform 0.2s, box-shadow 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.10)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                {f.icon}
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: C.graphite, marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: C.mid, lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
