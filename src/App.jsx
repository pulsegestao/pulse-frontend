import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import LandingPage from "./pages/Landing";
import CadastroPage from "./pages/Cadastro";
import LoginPage from "./pages/Login";
import EsqueciSenhaPage from "./pages/EsqueciSenha";
import RedefinirSenhaPage from "./pages/RedefinirSenha";
import DashboardPage from "./pages/Dashboard";
import VerifyEmailPage from "./pages/VerifyEmail";
import EstoqueEntradaPage from "./pages/EstoqueEntrada";
import GerirEstoquePage from "./pages/GerirEstoque";
import SessionExpiredPage from "./pages/SessionExpired";
import ConfiguracoesPage from "./pages/Configuracoes";
import PDVPage from "./pages/PDV";
import RelatoriosPage from "./pages/Relatorios";
import InsightsPage from "./pages/Insights";
import VendasPrazoPage from "./pages/VendasPrazo";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/Toast";

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
      <ToastContainer />
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
          <Route path="/esqueci-senha" element={<EsqueciSenhaPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
          <Route path="/dashboard" element={<AuthShell><ErrorBoundary><DashboardPage /></ErrorBoundary></AuthShell>} />
          <Route path="/estoque/entrada" element={<AuthShell><ErrorBoundary><EstoqueEntradaPage /></ErrorBoundary></AuthShell>} />
          <Route path="/gerir-estoque" element={<AuthShell><ErrorBoundary><GerirEstoquePage /></ErrorBoundary></AuthShell>} />
          <Route path="/sessao-expirada" element={<AuthShell><ErrorBoundary><SessionExpiredPage /></ErrorBoundary></AuthShell>} />
          <Route path="/configuracoes" element={<AuthShell><ErrorBoundary><ConfiguracoesPage /></ErrorBoundary></AuthShell>} />
          <Route path="/pdv" element={<AuthShell><ErrorBoundary><PDVPage /></ErrorBoundary></AuthShell>} />
          <Route path="/relatorios" element={<AuthShell><ErrorBoundary><RelatoriosPage /></ErrorBoundary></AuthShell>} />
          <Route path="/insights" element={<AuthShell><ErrorBoundary><InsightsPage /></ErrorBoundary></AuthShell>} />
          <Route path="/relatorios/prazo" element={<AuthShell><ErrorBoundary><VendasPrazoPage /></ErrorBoundary></AuthShell>} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  );
}
