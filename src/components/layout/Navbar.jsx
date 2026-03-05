import { useState, useEffect } from "react";
import C from "../../theme/colors";

const links = ["Funcionalidades", "IA", "Preços", "Depoimentos"];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? "rgba(255,255,255,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      borderBottom: scrolled ? `1px solid ${C.border}` : "1px solid transparent",
      transition: "all 0.3s ease",
      padding: "0 24px",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 12px ${C.blue}33`,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M3 12h4l3-8 4 16 3-8h4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span className="syne" style={{ fontSize: 20, fontWeight: 800, color: C.blue, letterSpacing: "-0.3px" }}>
            Pulse <span style={{ color: C.green }}>Gestão</span>
          </span>
        </div>

        {/* Desktop links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36, fontSize: 15, fontWeight: 500 }} className="nav-links">
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: C.graphite, transition: "color 0.2s" }}
              onMouseEnter={e => e.target.style.color = C.blue}
              onMouseLeave={e => e.target.style.color = C.graphite}>
              {l}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a href="#preços" style={{ fontSize: 14, fontWeight: 600, color: C.blue }}>Entrar</a>
          <a href="#preços" style={{
            background: C.blue, color: "white",
            padding: "10px 22px", borderRadius: 10,
            fontSize: 14, fontWeight: 600,
            boxShadow: `0 4px 14px ${C.blue}33`,
            transition: "transform 0.2s, box-shadow 0.2s",
            display: "block",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 8px 20px ${C.blue}44`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 14px ${C.blue}33`; }}>
            Teste grátis
          </a>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
