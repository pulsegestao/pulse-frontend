import { User } from "lucide-react";
import { Link } from "react-router-dom";
import C from "../../../theme/colors";
import useInView from "../../../hooks/useInView";
import DashboardMockup from "../../../components/ui/DashboardMockup";

const Hero = () => {
  const [ref, visible] = useInView(0.1);

  return (
    <section ref={ref} style={{
      minHeight: "100vh",
      background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${C.blue}12 0%, transparent 70%), #FFFFFF`,
      display: "flex", flexDirection: "column", justifyContent: "center",
      paddingTop: 100, paddingBottom: 80,
      position: "relative", overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        backgroundImage: `linear-gradient(${C.blue}08 1px, transparent 1px), linear-gradient(90deg, ${C.blue}08 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }} />

      {/* Decorative blob */}
      <div style={{
        position: "absolute", right: -200, top: "20%",
        width: 600, height: 600, borderRadius: "50%",
        background: `radial-gradient(circle, ${C.blue}0A, transparent 70%)`,
        zIndex: 0,
      }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 80, flexWrap: "wrap" }}>

          {/* Left – copy */}
          <div style={{ flex: "1 1 480px", minWidth: 300 }}>
            <div className={`fade-up ${visible ? "visible" : ""}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, background: C.bluePale, border: `1px solid ${C.blue}22`, borderRadius: 100, padding: "6px 16px", marginBottom: 28 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block", animation: "blink 2s infinite" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>Novo: Sugestões de compra com IA</span>
            </div>

            <h1 className={`syne fade-up d1 ${visible ? "visible" : ""}`} style={{
              fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 800, lineHeight: 1.1,
              color: C.graphite, marginBottom: 24, letterSpacing: "-1px",
            }}>
              Seu estoque<br />
              <span style={{ color: C.blue }}>trabalhando</span><br />
              <span style={{ color: C.blueLight }}>para você.</span>
            </h1>

            <p className={`fade-up d2 ${visible ? "visible" : ""}`} style={{
              fontSize: 18, color: C.mid, lineHeight: 1.7, maxWidth: 460, marginBottom: 40,
            }}>
              Controle de estoque, PDV integrado e inteligência artificial para pequenos negócios. Simples, rápido e feito para o Brasil.
            </p>

            <div className={`fade-up d3 ${visible ? "visible" : ""}`} style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <Link to="/cadastro" style={{
                background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
                color: "white", padding: "15px 32px", borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                boxShadow: `0 8px 24px ${C.blue}33`,
                transition: "transform 0.2s, box-shadow 0.2s",
                display: "inline-block",
                textDecoration: "none",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}>
                Começar grátis →
              </Link>
              <a href="#funcionalidades" style={{
                background: "white", color: C.graphite, padding: "15px 32px", borderRadius: 12,
                fontSize: 16, fontWeight: 600, border: `1.5px solid ${C.border}`,
                transition: "border-color 0.2s", display: "inline-block",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.blue}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
                Ver demo
              </a>
            </div>

            {/* Social proof */}
            <div className={`fade-up d4 ${visible ? "visible" : ""}`} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
              <div style={{ display: "flex" }}>
                {[C.blue, C.blueLight, "#7C3AED", "#DB2777", "#D97706"].map((color, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: color,
                    border: "2px solid white", marginLeft: i > 0 ? -10 : 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <User size={16} color="white" strokeWidth={2} />
                  </div>
                ))}
              </div>
              <div>
                <div style={{ display: "flex", gap: 2, marginBottom: 2 }}>
                  {[1, 2, 3, 4, 5].map(s => <span key={s} style={{ color: "#F59E0B", fontSize: 14 }}>★</span>)}
                </div>
                <span style={{ fontSize: 13, color: C.mid }}>+2.400 negócios já usam o Pulse</span>
              </div>
            </div>
          </div>

          {/* Right – Dashboard Mockup */}
          <div className={`fade-up d2 ${visible ? "visible" : ""}`} style={{ flex: "1 1 420px", minWidth: 300 }}>
            <DashboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
