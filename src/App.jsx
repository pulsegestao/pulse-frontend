import { BrowserRouter, Routes, Route } from "react-router-dom";
import GlobalStyles from "./styles/GlobalStyles";
import LandingPage from "./pages/Landing";
import CadastroPage from "./pages/Cadastro";
import DashboardPage from "./pages/Dashboard";
import VerifyEmailPage from "./pages/VerifyEmail";
import EstoqueEntradaPage from "./pages/EstoqueEntrada";

export default function App() {
  return (
    <BrowserRouter>
      <GlobalStyles />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/cadastro" element={<CadastroPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/estoque/entrada" element={<EstoqueEntradaPage />} />
      </Routes>
    </BrowserRouter>
  );
}
