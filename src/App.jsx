import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import LandingPage from "./pages/Landing";
import CadastroPage from "./pages/Cadastro";
import LoginPage from "./pages/Login";
import DashboardPage from "./pages/Dashboard";
import VerifyEmailPage from "./pages/VerifyEmail";
import EstoqueEntradaPage from "./pages/EstoqueEntrada";
import GerirEstoquePage from "./pages/GerirEstoque";
import SessionExpiredPage from "./pages/SessionExpired";
import ConfiguracoesPage from "./pages/Configuracoes";

function SessionGuard({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate("/sessao-expirada", { replace: true });
    window.addEventListener("pulse:session-expired", handler);
    return () => window.removeEventListener("pulse:session-expired", handler);
  }, [navigate]);
  return children;
}

function AuthShell({ children }) {
  const [dark, setDark] = useState(
    () => localStorage.getItem("pulse_theme") === "dark"
  );

  useEffect(() => {
    const handler = (e) => setDark(e.detail);
    window.addEventListener("pulse:theme-changed", handler);
    return () => window.removeEventListener("pulse:theme-changed", handler);
  }, []);

  return (
    <div data-theme={dark ? "dark" : "light"}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <SessionGuard>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/dashboard" element={<AuthShell><DashboardPage /></AuthShell>} />
          <Route path="/estoque/entrada" element={<AuthShell><EstoqueEntradaPage /></AuthShell>} />
          <Route path="/gerir-estoque" element={<AuthShell><GerirEstoquePage /></AuthShell>} />
          <Route path="/sessao-expirada" element={<AuthShell><SessionExpiredPage /></AuthShell>} />
          <Route path="/configuracoes" element={<AuthShell><ConfiguracoesPage /></AuthShell>} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  );
}
