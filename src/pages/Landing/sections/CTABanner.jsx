import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";

const CTABanner = () => {
  const [ref, visible] = useInView();

  return (
    <section style={{ padding: "80px 24px", background: C.gray }} ref={ref}>
      <div className={`fade-up ${visible ? "visible" : ""} cta-banner-inner`} style={{
        maxWidth: 880, margin: "0 auto",
        background: `linear-gradient(135deg, ${C.graphite}, #374151)`,
        borderRadius: 24,
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 250, height: 250, borderRadius: "50%", background: `${C.blue}20` }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 180, height: 180, borderRadius: "50%", background: `${C.blue}15` }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 className="syne" style={{ fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 800, color: "white", marginBottom: 16, letterSpacing: "-0.5px" }}>
            Seu estoque do jeito certo,<br />a partir de hoje.
          </h2>
          <p style={{ color: "#9CA3AF", fontSize: 17, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
            Comece grátis por 14 dias. Sem burocracia, sem cartão de crédito.
          </p>
          <a href="#" style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            color: "white", padding: "16px 40px", borderRadius: 14,
            fontSize: 17, fontWeight: 800,
            boxShadow: `0 12px 32px ${C.blue}44`,
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
            Criar conta gratuita →
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTABanner;
