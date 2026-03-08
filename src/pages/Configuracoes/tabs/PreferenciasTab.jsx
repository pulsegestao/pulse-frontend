import { useState } from "react";
import { Moon, Sun, Bell, Package } from "lucide-react";
import C from "../../../theme/colors";
import { useTheme } from "../../../hooks/useTheme";

const SectionCard = ({ title, subtitle, children }) => (
  <div style={{
    background: C.surface, borderRadius: 14,
    border: `1px solid ${C.border}`,
    boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
    marginBottom: 16,
  }}>
    <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}` }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: C.graphite, margin: 0 }}>{title}</p>
      {subtitle && <p style={{ fontSize: 13, color: C.mid, margin: "2px 0 0" }}>{subtitle}</p>}
    </div>
    <div style={{ padding: "20px 24px" }}>
      {children}
    </div>
  </div>
);

const Toggle = ({ checked, onChange, id }) => (
  <label htmlFor={id} style={{ position: "relative", display: "inline-flex", alignItems: "center", cursor: "pointer" }}>
    <input id={id} type="checkbox" checked={checked} onChange={onChange} style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: checked ? C.blue : C.border,
      transition: "background 0.2s",
      position: "relative",
    }}>
      <div style={{
        position: "absolute",
        top: 3, left: checked ? 23 : 3,
        width: 18, height: 18, borderRadius: "50%",
        background: "white",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </div>
  </label>
);

const PreferenceRow = ({ icon: Icon, label, description, right }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: `1px solid ${C.border}`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: C.gray,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        <Icon size={16} color={C.mid} strokeWidth={2} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: 0 }}>{label}</p>
        <p style={{ fontSize: 12, color: C.mid, margin: "1px 0 0" }}>{description}</p>
      </div>
    </div>
    <div style={{ flexShrink: 0, marginLeft: 16 }}>{right}</div>
  </div>
);

const PreferenciasTab = () => {
  const { dark, toggle } = useTheme();
  const [lowStockAlerts, setLowStockAlerts] = useState(
    () => localStorage.getItem("pulse_low_stock_alerts") !== "false"
  );
  const [defaultMinStock, setDefaultMinStock] = useState(
    () => localStorage.getItem("pulse_default_min_stock") || "5"
  );

  const handleLowStockToggle = () => {
    const next = !lowStockAlerts;
    setLowStockAlerts(next);
    localStorage.setItem("pulse_low_stock_alerts", String(next));
  };

  const handleMinStockChange = (e) => {
    const val = e.target.value;
    setDefaultMinStock(val);
    localStorage.setItem("pulse_default_min_stock", val);
  };

  return (
    <>
      <SectionCard title="Aparência" subtitle="Escolha o tema da interface.">
        <div style={{ borderBottom: "none" }}>
          <PreferenceRow
            icon={dark ? Moon : Sun}
            label="Modo noturno"
            description={dark ? "Interface em tema escuro" : "Interface em tema claro"}
            right={<Toggle checked={dark} onChange={toggle} id="dark-mode-toggle" />}
          />
        </div>
      </SectionCard>

      <SectionCard title="Notificações" subtitle="Controle os alertas do sistema.">
        <PreferenceRow
          icon={Bell}
          label="Alertas de estoque baixo"
          description="Receber avisos quando produtos atingirem o estoque mínimo"
          right={<Toggle checked={lowStockAlerts} onChange={handleLowStockToggle} id="low-stock-toggle" />}
        />
        <div style={{ paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: C.gray,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <Package size={16} color={C.mid} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.graphite, margin: "0 0 2px" }}>
                Estoque mínimo padrão
              </p>
              <p style={{ fontSize: 12, color: C.mid, margin: 0 }}>
                Valor pré-preenchido ao criar novos produtos
              </p>
            </div>
            <input
              type="number"
              min="0"
              value={defaultMinStock}
              onChange={handleMinStockChange}
              style={{
                width: 72, padding: "7px 10px", borderRadius: 8,
                border: `1.5px solid ${C.border}`, fontSize: 13,
                color: C.graphite, background: C.surface,
                outline: "none", fontFamily: "inherit",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </SectionCard>
    </>
  );
};

export default PreferenciasTab;
