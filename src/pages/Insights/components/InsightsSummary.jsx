import { useState, useEffect } from "react";
import { Bell, BellOff, AlertOctagon, Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getInsights, countUnreadInsights } from "../../../services/api";

const Card = ({ Icon, iconColor, iconBg, label, value, badge }) => (
  <div style={{
    background: C.surface,
    borderRadius: 16,
    border: `1px solid ${C.border}`,
    padding: "20px 22px",
    boxShadow: "0 1px 12px rgba(0,0,0,0.05)",
    display: "flex",
    alignItems: "center",
    gap: 16,
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 12,
      background: iconBg,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
      position: "relative",
    }}>
      <Icon size={20} color={iconColor} strokeWidth={2} />
      {badge > 0 && (
        <span style={{
          position: "absolute", top: -4, right: -4,
          minWidth: 16, height: 16, borderRadius: 8,
          background: "#DC2626", color: "white",
          fontSize: 10, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 3px",
        }}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </div>
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: 0 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 800, color: C.graphite, margin: "2px 0 0", lineHeight: 1 }}>
        {value}
      </p>
    </div>
  </div>
);

const InsightsSummary = ({ refreshKey }) => {
  const [total, setTotal]   = useState(null);
  const [unread, setUnread] = useState(null);
  const [urgent, setUrgent] = useState(null);

  useEffect(() => {
    Promise.allSettled([
      getInsights({ limit: 1 }),
      countUnreadInsights(),
      getInsights({ severity: "critical", limit: 1 }),
      getInsights({ severity: "high",     limit: 1 }),
    ]).then(([t, u, crit, high]) => {
      if (t.status === "fulfilled")    setTotal(t.value?.total ?? 0);
      if (u.status === "fulfilled")    setUnread(u.value?.unread_count ?? 0);
      const critN = crit.status === "fulfilled" ? (crit.value?.total ?? 0) : 0;
      const highN = high.status === "fulfilled" ? (high.value?.total ?? 0) : 0;
      setUrgent(critN + highN);
    });
  }, [refreshKey]);

  const loading = total === null || unread === null || urgent === null;

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
      <Loader2 size={22} color={C.mid} style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 16,
      marginBottom: 24,
    }} className="insights-summary-grid">
      <Card
        Icon={Bell}
        iconColor={C.blue}
        iconBg={C.bluePale}
        label="Total de pulsos"
        value={total}
      />
      <Card
        Icon={BellOff}
        iconColor="#D97706"
        iconBg={C.amberPale}
        label="Não lidos"
        value={unread}
        badge={unread}
      />
      <Card
        Icon={AlertOctagon}
        iconColor="#DC2626"
        iconBg={C.redPale}
        label="Precisam de atenção"
        value={urgent}
        badge={urgent > 0 ? urgent : 0}
      />
    </div>
  );
};

export default InsightsSummary;
