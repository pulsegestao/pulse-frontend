import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, XCircle } from "lucide-react";
import C from "../theme/colors";
import { getCompanySettings } from "../services/api";
import { getProfile } from "../hooks/useAuth";

const BANNER_CONFIG = {
  trial_expiring: {
    bg: "#FEF3C7",
    border: "#F59E0B",
    color: "#92400E",
    icon: Clock,
    cta: "Ver planos",
  },
  inactive: {
    bg: "#FEE2E2",
    border: "#EF4444",
    color: "#991B1B",
    icon: XCircle,
    cta: "Assinar agora",
  },
  past_due: {
    bg: "#FFF7ED",
    border: "#F97316",
    color: "#9A3412",
    icon: AlertTriangle,
    cta: "Atualizar pagamento",
  },
};

const SubscriptionBanner = () => {
  const navigate = useNavigate();
  const profile = getProfile();
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    if (!profile) return;

    (async () => {
      try {
        const company = await getCompanySettings();
        if (!company?.subscription) return;

        const { status, expires_at } = company.subscription;

        if (status === "trial" && expires_at) {
          const daysLeft = Math.ceil((new Date(expires_at) - Date.now()) / (1000 * 60 * 60 * 24));
          if (daysLeft <= 3 && daysLeft > 0) {
            setBanner({
              type: "trial_expiring",
              message: `Seu teste grátis expira em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}. Assine para não perder acesso.`,
            });
          }
        } else if (status === "inactive") {
          setBanner({
            type: "inactive",
            message: "Sua assinatura está inativa. Assine um plano para acessar todos os recursos.",
          });
        } else if (status === "past_due") {
          setBanner({
            type: "past_due",
            message: "Seu pagamento está pendente. Atualize seus dados para manter o acesso.",
          });
        }
      } catch {
        // silent
      }
    })();
  }, []);

  if (!banner) return null;

  const config = BANNER_CONFIG[banner.type];
  const Icon = config.icon;

  return (
    <div style={{
      position: "fixed", top: 64, left: 0, right: 0, zIndex: 900,
      background: config.bg, borderBottom: `2px solid ${config.border}`,
      padding: "10px 24px",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
    }}>
      <Icon size={16} color={config.color} strokeWidth={2} />
      <span style={{ fontSize: 13, fontWeight: 600, color: config.color }}>
        {banner.message}
      </span>
      <button
        onClick={() => navigate("/planos")}
        style={{
          padding: "5px 16px", borderRadius: 8, border: "none",
          background: config.border, color: "white",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
          fontFamily: "inherit", marginLeft: 4,
        }}
      >
        {config.cta}
      </button>
    </div>
  );
};

export default SubscriptionBanner;
