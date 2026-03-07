import { useEffect } from "react";
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

function SessionGuard({ children }) {
  const navigate = useNavigate();
  useEffect(() => {
    const handler = () => navigate("/sessao-expirada", { replace: true });
    window.addEventListener("pulse:session-expired", handler);
    return () => window.removeEventListener("pulse:session-expired", handler);
  }, [navigate]);
  return children;
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
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/estoque/entrada" element={<EstoqueEntradaPage />} />
          <Route path="/gerir-estoque" element={<GerirEstoquePage />} />
          <Route path="/sessao-expirada" element={<SessionExpiredPage />} />
        </Routes>
      </SessionGuard>
    </BrowserRouter>
  );
}
