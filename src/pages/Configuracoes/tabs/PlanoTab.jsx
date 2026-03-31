import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Loader2, CreditCard, Calendar, ShoppingCart, Users,
  CheckCircle, XCircle, AlertTriangle, Crown,
} from "lucide-react";
import C from "../../../theme/colors";
import { getBillingInfo, cancelSubscription, getProducts, getCompanySettings } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import { useToast } from "../../../hooks/useToast";

const STATUS_MAP = {
  active: { label: "Ativa", color: C.green, bg: C.greenPale },
  trial: { label: "Teste grátis", color: "#F59E0B", bg: "#FEF3C7" },
  inactive: { label: "Inativa", color: "#EF4444", bg: "#FEE2E2" },
  past_due: { label: "Pagamento pendente", color: "#F97316", bg: "#FFF7ED" },
  cancelled: { label: "Cancelada", color: C.mid, bg: C.gray },
};

const EVENT_LABELS = {
  subscription_created: "Assinatura criada",
  payment_completed: "Pagamento confirmado",
  payment_renewed: "Renovação confirmada",
  payment_failed: "Falha no pagamento",
  subscription_cancelled: "Assinatura cancelada",
  trial_expired: "Trial expirado",
  plan_changed: "Plano alterado",
  grace_period_started: "Período de carência",
  grace_period_expired: "Carência expirada",
};

const SectionCard = ({ title, children }) => (
  <div style={{
    background: C.surface, borderRadius: 14,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    marginBottom: 16,
  }}>
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>{title}</p>
    </div>
    <div style={{ padding: "20px 24px" }}>
      {children}
    </div>
  </div>
);

const ProgressBar = ({ label, used, max }) => {
  const pct = max === -1 ? 10 : Math.min((used / max) * 100, 100);
  const displayMax = max === -1 ? "Ilimitado" : max;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: C.graphite }}>{label}</span>
        <span style={{ fontSize: 12, color: C.mid }}>{used} / {displayMax}</span>
      </div>
      <div style={{ height: 6, background: C.gray, borderRadius: 3 }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${pct}%`,
          background: pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : C.blue,
          transition: "width 0.3s",
        }} />
      </div>
    </div>
  );
};

const PlanoTab = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [productCount, setProductCount] = useState(0);
  const [memberCount, setMemberCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [info, products, company] = await Promise.all([
          getBillingInfo(),
          getProducts().catch(() => []),
          getCompanySettings().catch(() => null),
        ]);
        setBilling(info);
        setProductCount(Array.isArray(products) ? products.length : 0);
        setMemberCount(company?.members_count || 1);
      } catch (e) {
        toast.error(friendlyError(e.message));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await cancelSubscription();
      toast.success("Assinatura cancelada.");
      setShowConfirm(false);
      const info = await getBillingInfo();
      setBilling(info);
    } catch (e) {
      toast.error(friendlyError(e.message));
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
        <Loader2 size={24} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!billing) return null;

  const { subscription, current_plan, recent_events, trial_days_left } = billing;
  const st = STATUS_MAP[subscription.status] || STATUS_MAP.inactive;
  const limits = current_plan.limits || {};

  return (
    <div>
      <SectionCard title="Plano atual">
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: st.bg, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Crown size={22} color={st.color} strokeWidth={2} />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: C.graphite, margin: 0 }}>
              {current_plan.display_name}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: st.color,
                background: st.bg, borderRadius: 100, padding: "2px 10px",
              }}>
                {st.label}
              </span>
              {subscription.status === "trial" && trial_days_left > 0 && (
                <span style={{ fontSize: 12, color: C.mid }}>
                  {trial_days_left} {trial_days_left === 1 ? "dia restante" : "dias restantes"}
                </span>
              )}
            </div>
          </div>
        </div>

        {current_plan.price_cents > 0 && (
          <p style={{ fontSize: 14, color: C.mid, margin: "0 0 16px" }}>
            <strong style={{ color: C.graphite, fontSize: 22 }}>
              R$ {(current_plan.price_cents / 100).toFixed(0)}
            </strong>
            <span>/mês</span>
          </p>
        )}

        {subscription.expires_at && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.mid, marginBottom: 12 }}>
            <Calendar size={13} strokeWidth={2} />
            {subscription.status === "trial" ? "Trial expira em" : "Próxima renovação em"}{" "}
            {new Date(subscription.expires_at).toLocaleDateString("pt-BR")}
          </div>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}>
          {(subscription.status === "trial" || subscription.status === "inactive" || subscription.status === "cancelled") && (
            <button
              onClick={() => navigate("/planos")}
              style={{
                padding: "10px 24px", borderRadius: 10,
                background: C.blue, color: "white", border: "none",
                fontSize: 14, fontWeight: 700, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Fazer upgrade
            </button>
          )}
          {subscription.status === "active" && (
            <button
              onClick={() => setShowConfirm(true)}
              style={{
                padding: "10px 20px", borderRadius: 10,
                background: "transparent", color: "#EF4444",
                border: `1.5px solid #EF4444`,
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Cancelar assinatura
            </button>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Uso do plano">
        <ProgressBar label="Produtos cadastrados" used={productCount} max={limits.max_products || 50} />
        <ProgressBar label="Usuários" used={memberCount} max={limits.max_users || 1} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
          {[
            { label: "Insights IA", enabled: limits.has_insights },
            { label: "Relatórios", enabled: limits.has_reports },
            { label: "Promoções", enabled: limits.has_promotions },
            { label: "Importação NF-e", enabled: limits.has_nfe },
          ].map(f => (
            <div key={f.label} style={{
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600,
              color: f.enabled ? C.green : C.mid,
            }}>
              {f.enabled
                ? <CheckCircle size={13} strokeWidth={2} />
                : <XCircle size={13} strokeWidth={2} />
              }
              {f.label}
            </div>
          ))}
        </div>
      </SectionCard>

      {recent_events && recent_events.length > 0 && (
        <SectionCard title="Histórico de cobrança">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent_events.slice(0, 10).map(ev => (
              <div key={ev.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 12px", borderRadius: 8,
                background: C.pageBg, border: `1px solid ${C.border}`,
              }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: 0 }}>
                    {EVENT_LABELS[ev.type] || ev.type}
                  </p>
                  <p style={{ fontSize: 11, color: C.mid, margin: "2px 0 0" }}>
                    {new Date(ev.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                {ev.amount_cents > 0 && (
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>
                    R$ {(ev.amount_cents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {showConfirm && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.45)", display: "flex",
          alignItems: "center", justifyContent: "center",
        }}>
          <div style={{
            background: C.surface, borderRadius: 16, padding: "32px 28px",
            maxWidth: 420, width: "90%",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <AlertTriangle size={22} color="#EF4444" strokeWidth={2} />
              <p style={{ fontSize: 16, fontWeight: 700, color: C.graphite, margin: 0 }}>
                Cancelar assinatura?
              </p>
            </div>
            <p style={{ fontSize: 13, color: C.mid, lineHeight: 1.5, margin: "0 0 24px" }}>
              Ao cancelar, você perderá acesso aos recursos premium (insights, promoções, relatórios avançados, NF-e) ao final do período atual.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  padding: "8px 20px", borderRadius: 8,
                  border: `1.5px solid ${C.border}`, background: C.surface,
                  fontSize: 13, fontWeight: 600, color: C.graphite,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Manter plano
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                style={{
                  padding: "8px 20px", borderRadius: 8,
                  border: "none", background: "#EF4444", color: "white",
                  fontSize: 13, fontWeight: 700,
                  cursor: cancelling ? "not-allowed" : "pointer",
                  fontFamily: "inherit", opacity: cancelling ? 0.6 : 1,
                }}
              >
                {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
};

export default PlanoTab;
