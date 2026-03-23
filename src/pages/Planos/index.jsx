import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Crown } from "lucide-react";
import C from "../../theme/colors";
import DashboardHeader from "../Dashboard/components/DashboardHeader";
import QuickActionsBar from "../../components/layout/QuickActionsBar";
import { getPlans, createSubscription } from "../../services/api";
import { getProfile, isAuthenticated } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { friendlyError } from "../../utils/errorMessage";

const PlanosPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const profile = getProfile();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [annual, setAnnual] = useState(false);

  const paymentStatus = searchParams.get("payment");

  useEffect(() => {
    if (!isAuthenticated()) { navigate("/", { replace: true }); return; }
    if (paymentStatus === "success") {
      toast.success("Pagamento confirmado! Bem-vindo ao Plano Completo.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const data = await getPlans();
        setPlans(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(friendlyError(e.message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const completePlan = plans.find(p => p.plan === "complete");

  const handleSubscribe = async () => {
    if (!completePlan) return;
    setSubscribing(true);
    try {
      const result = await createSubscription({
        plan: "complete",
        annual,
        name: profile?.userName || "",
        email: profile?.email || "",
        tax_id: "",
      });
      if (result?.checkout_url) {
        window.location.href = result.checkout_url;
      } else {
        toast.error("Não foi possível gerar o link de pagamento.");
      }
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setSubscribing(false);
    }
  };

  const price = completePlan
    ? annual
      ? (completePlan.annual_price_cents / 100)
      : (completePlan.price_cents / 100)
    : annual ? 89 : 119;

  const features = completePlan?.features || [
    "Produtos ilimitados",
    "Até 3 usuários",
    "Insights com IA",
    "Relatórios avançados",
    "Promoções",
    "Importação NF-e",
    "Suporte prioritário",
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg }}>
      <DashboardHeader />
      <QuickActionsBar />

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "124px 24px 48px" }}>
        <div style={{ paddingTop: 8, marginBottom: 32, display: "flex", alignItems: "center", gap: 14 }}>
          <Link to="/configuracoes?tab=plano" style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: 36, height: 36, borderRadius: 9, flexShrink: 0,
            background: C.surface, border: `1px solid ${C.border}`,
            color: C.mid, textDecoration: "none",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = C.gray; e.currentTarget.style.color = C.graphite; }}
            onMouseLeave={e => { e.currentTarget.style.background = C.surface; e.currentTarget.style.color = C.mid; }}
          >
            <ArrowLeft size={17} strokeWidth={2} color="currentColor" />
          </Link>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.3px" }}>
              Assinatura
            </p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: C.graphite, margin: 0, letterSpacing: "-0.3px" }}>
              Escolha seu plano
            </h1>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <Loader2 size={24} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: C.gray, borderRadius: 100, padding: "6px 10px" }}>
                <span
                  onClick={() => setAnnual(false)}
                  style={{
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    padding: "6px 18px", borderRadius: 100,
                    color: !annual ? C.blue : C.mid,
                    background: !annual ? C.surface : "transparent",
                    boxShadow: !annual ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Mensal
                </span>
                <span
                  onClick={() => setAnnual(true)}
                  style={{
                    fontSize: 14, fontWeight: 600, cursor: "pointer",
                    padding: "6px 18px", borderRadius: 100,
                    color: annual ? C.blue : C.mid,
                    background: annual ? C.surface : "transparent",
                    boxShadow: annual ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  Anual{" "}
                  <span style={{
                    background: C.blue, color: "white", borderRadius: 100,
                    fontSize: 11, padding: "2px 8px", fontWeight: 700, marginLeft: 4,
                  }}>
                    -25%
                  </span>
                </span>
              </div>
            </div>

            <div style={{
              background: `linear-gradient(145deg, ${C.blue}, ${C.blueLight})`,
              borderRadius: 24, padding: "40px 40px 36px",
              boxShadow: `0 24px 60px ${C.blue}33`,
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.06)" }} />
              <div style={{ position: "absolute", bottom: -60, left: -30, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
                  <Crown size={20} color="white" strokeWidth={2} />
                  <span style={{
                    background: "rgba(255,255,255,0.15)", borderRadius: 8,
                    padding: "4px 14px", fontSize: 13, color: "white", fontWeight: 600,
                  }}>
                    Plano Completo
                  </span>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 56, fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif", lineHeight: 1 }}>
                    R$ {price.toFixed(0)}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 16 }}>/mês</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 32 }}>
                  {annual ? `Cobrado anualmente · R$ ${(price * 12).toFixed(0)}` : "Cobrado mensalmente"}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 36 }}>
                  {features.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 20, height: 20, borderRadius: "50%",
                        background: "rgba(255,255,255,0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <Check size={11} color="white" strokeWidth={3} />
                      </div>
                      <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 15 }}>{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSubscribe}
                  disabled={subscribing}
                  style={{
                    display: "block", width: "100%", textAlign: "center",
                    background: "white", color: C.blue,
                    padding: "16px", borderRadius: 14, border: "none",
                    fontSize: 16, fontWeight: 800, fontFamily: "inherit",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    cursor: subscribing ? "not-allowed" : "pointer",
                    opacity: subscribing ? 0.7 : 1,
                    transition: "transform 0.2s",
                  }}
                  onMouseEnter={e => { if (!subscribing) e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; }}
                >
                  {subscribing ? (
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                      Redirecionando...
                    </span>
                  ) : (
                    "Assinar agora"
                  )}
                </button>
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 14 }}>
                  Sem fidelidade. Cancele quando quiser.
                </p>
              </div>
            </div>
          </>
        )}
      </main>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default PlanosPage;
