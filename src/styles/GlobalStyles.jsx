const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=Space+Grotesk:wght@500;600;700&display=swap');

    :root {
      --c-blue:        #0F766E;
      --c-blue-light:  #0D9488;
      --c-blue-pale:   #F0FDFA;
      --c-green:       #16A34A;
      --c-green-light: #22C55E;
      --c-green-pale:  #F0FDF4;
      --c-white:       #FFFFFF;
      --c-gray:        #F3F4F6;
      --c-graphite:    #1F2937;
      --c-mid:         #6B7280;
      --c-border:      #E5E7EB;
      --c-surface:     #FFFFFF;
      --c-page-bg:     #F8F9FB;
      --c-purple-pale: #F5F3FF;
      --c-amber-pale:  #FFFBEB;
      --c-red-pale:    #FEE2E2;
      --c-yellow-pale: #FEF9C3;
      --c-orange-pale: #FFF7ED;
      --c-pink-pale:   #FDF2F8;
    }

    [data-theme="dark"] {
      --c-blue-pale:   #042F2E;
      --c-green-pale:  #0E2318;
      --c-white:       #374151;
      --c-gray:        #1F2937;
      --c-graphite:    #F9FAFB;
      --c-mid:         #9CA3AF;
      --c-border:      #374151;
      --c-surface:     #1F2937;
      --c-page-bg:     #111827;
      --c-purple-pale: #1E1040;
      --c-amber-pale:  #2D1A00;
      --c-red-pale:    #2D0000;
      --c-yellow-pale: #2D2400;
      --c-orange-pale: #2D1200;
      --c-pink-pale:   #2D0020;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #FFFFFF;
      color: #1F2937;
      line-height: 1.6;
      overflow-x: hidden;
    }

    .syne { font-family: 'Syne', sans-serif; }

    .landing-page { font-family: 'DM Sans', sans-serif; }
    .landing-page .syne { font-family: 'Space Grotesk', sans-serif; }

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
    ::-webkit-scrollbar-track { background: var(--c-gray); }
    ::-webkit-scrollbar-thumb { background: var(--c-border); border-radius: 3px; }

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
