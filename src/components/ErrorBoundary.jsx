import React from "react";
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react";
import C from "../theme/colors";

const ErrorScreen = ({ onReset }) => (
  <div style={{
    minHeight: "100vh", background: C.pageBg,
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: 24,
  }}>
    <div style={{
      background: C.surface, borderRadius: 16, padding: "40px 36px",
      maxWidth: 400, width: "100%", textAlign: "center",
      border: `1px solid ${C.border}`,
      boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: C.amberPale,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <AlertTriangle size={24} color="#D97706" strokeWidth={2} />
      </div>

      <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: "0 0 8px", letterSpacing: "-0.2px" }}>
        Algo deu errado
      </p>
      <p style={{ fontSize: 13, color: C.mid, margin: "0 0 28px", lineHeight: 1.6 }}>
        Ocorreu um erro inesperado nesta página.
        Tente recarregar ou volte ao dashboard.
      </p>

      <div style={{ display: "flex", gap: 10 }}>
        <button
          onClick={() => window.location.reload()}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "11px", borderRadius: 10, border: "none",
            background: `linear-gradient(135deg, ${C.blue}, ${C.blueLight})`,
            color: "white", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "inherit",
          }}
        >
          <RefreshCw size={13} strokeWidth={2.5} />
          Recarregar
        </button>
        <button
          onClick={() => { onReset?.(); window.location.href = "/dashboard"; }}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            padding: "11px", borderRadius: 10,
            border: `1.5px solid ${C.border}`, background: "transparent",
            color: C.graphite, fontSize: 13, fontWeight: 600,
            cursor: "pointer", fontFamily: "inherit",
          }}
          onMouseEnter={e => e.currentTarget.style.background = C.gray}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          <LayoutDashboard size={13} strokeWidth={2} />
          Dashboard
        </button>
      </div>
    </div>
  </div>
);

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info?.componentStack);
  }

  reset = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return <ErrorScreen onReset={this.reset} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
