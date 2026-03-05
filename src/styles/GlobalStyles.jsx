import C from "../theme/colors";

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #FFFFFF;
      color: ${C.graphite};
      line-height: 1.6;
      overflow-x: hidden;
    }

    .syne { font-family: 'Syne', sans-serif; }

    .fade-up {
      opacity: 0;
      transform: translateY(28px);
      transition: opacity 0.65s ease, transform 0.65s ease;
    }
    .fade-up.visible {
      opacity: 1;
      transform: translateY(0);
    }
    .fade-up.d1 { transition-delay: 0.05s; }
    .fade-up.d2 { transition-delay: 0.15s; }
    .fade-up.d3 { transition-delay: 0.25s; }
    .fade-up.d4 { transition-delay: 0.35s; }
    .fade-up.d5 { transition-delay: 0.45s; }
    .fade-up.d6 { transition-delay: 0.55s; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #f1f1f1; }
    ::-webkit-scrollbar-thumb { background: #c5c5c5; border-radius: 3px; }

    a { text-decoration: none; color: inherit; }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.9); opacity: 0.6; }
      100% { transform: scale(1.6); opacity: 0; }
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    @keyframes slide-x {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
  `}</style>
);

export default GlobalStyles;
