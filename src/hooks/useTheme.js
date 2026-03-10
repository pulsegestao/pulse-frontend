import { useState } from "react";

export function useTheme() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("pulse_theme") === "dark"
  );

  const toggle = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem("pulse_theme", next ? "dark" : "light");
      window.dispatchEvent(new CustomEvent("pulse:theme-changed", { detail: next }));
      return next;
    });
  };

  return { dark, toggle };
}
