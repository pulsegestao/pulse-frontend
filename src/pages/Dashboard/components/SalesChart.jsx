import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import C from "../../../theme/colors";
import { getRevenueChart } from "../../../services/api";
import { friendlyError } from "../../../utils/errorMessage";
import WidgetError from "../../../components/WidgetError";

const PERIODS = ["Semana", "Mês", "Ano"];
const PERIOD_KEY = { "Semana": "week", "Mês": "month", "Ano": "year" };

const VW = 560, VH = 180;
const PAD = { l: 48, r: 16, t: 16, b: 36 };
const IW = VW - PAD.l - PAD.r;
const IH = VH - PAD.t - PAD.b;
const BOTTOM = PAD.t + IH;

const cx = (i, len) => PAD.l + (i / Math.max(len - 1, 1)) * IW;

const smoothPath = (pts) => {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
    const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
    const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
    const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2[0].toFixed(2)} ${p2[1].toFixed(2)}`;
  }
  return d;
};

const fmtBRL = (n) =>
  `R$ ${Number(n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const SalesChart = () => {
  const [period, setPeriod]   = useState("Semana");
  const [hovered, setHovered] = useState(null);
  const [data, setData]       = useState([]);
  const [meta, setMeta]       = useState({ total: 0, changePct: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = (p) => {
    setLoading(true);
    setError("");
    setHovered(null);
    getRevenueChart(PERIOD_KEY[p])
      .then(chart => {
        setData((chart.data || []).map(d => ({ label: d.label, value: d.total })));
        setMeta({ total: chart.total || 0, changePct: chart.change_pct || 0 });
      })
      .catch(err => setError(friendlyError(err.message) || "Não foi possível carregar o gráfico."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(period); }, [period]);

  const maxVal = data.length > 0 ? Math.max(...data.map(d => d.value)) : 0;
  const MAX    = Math.max(Math.ceil(maxVal / 1000) * 1000, 1000);
  const STEP   = MAX / 5;
  const GRID_VALUES = [5, 4, 3, 2, 1].map(i => Math.round(i * STEP));

  const cy = (v) => PAD.t + IH - (v / MAX) * IH;

  const pts  = data.map((d, i) => [cx(i, data.length), cy(d.value)]);
  const line = smoothPath(pts);
  const area = pts.length > 1
    ? `${line} L ${pts[pts.length - 1][0].toFixed(2)} ${BOTTOM} L ${pts[0][0].toFixed(2)} ${BOTTOM} Z`
    : "";

  const changePctLabel = meta.changePct === 0
    ? "sem variação vs período anterior"
    : `${meta.changePct > 0 ? "+" : ""}${meta.changePct.toFixed(1).replace(".", ",")}% vs período anterior`;
  const changePctColor = meta.changePct > 0 ? C.green : meta.changePct < 0 ? "#EF4444" : C.mid;

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Faturamento</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: C.blue, margin: 0 }}>
            {loading ? "–" : fmtBRL(meta.total)}
          </p>
          {!loading && !error && (
            <p style={{ fontSize: 12, color: changePctColor, fontWeight: 600, margin: "4px 0 0" }}>
              {changePctLabel}
            </p>
          )}
        </div>

        <div style={{ display: "flex", background: C.gray, borderRadius: 10, padding: 3, gap: 2 }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 14px", borderRadius: 8, border: "none",
                background: period === p ? C.surface : "transparent",
                color: period === p ? C.blue : C.mid,
                fontSize: 12, fontWeight: period === p ? 700 : 500,
                cursor: "pointer",
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s", fontFamily: "inherit",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ height: VH, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Loader2 size={24} color={C.mid} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div style={{ height: VH, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <WidgetError message={error} onRetry={() => load(period)} />
        </div>
      ) : data.length === 0 || maxVal === 0 ? (
        <div style={{ height: VH, display: "flex", alignItems: "center", justifyContent: "center", color: C.mid, flexDirection: "column", gap: 8 }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Sem dados para este período</p>
          <p style={{ fontSize: 12, margin: 0 }}>As vendas registradas aparecerão aqui</p>
        </div>
      ) : (
        <svg viewBox={`0 0 ${VW} ${VH}`} style={{ width: "100%", height: "auto", overflow: "visible" }}>
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" style={{ stopColor: C.blue, stopOpacity: 0.15 }} />
              <stop offset="100%" style={{ stopColor: C.blue, stopOpacity: 0 }} />
            </linearGradient>
            <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" style={{ stopColor: C.blue }} />
              <stop offset="100%" style={{ stopColor: C.blueLight }} />
            </linearGradient>
          </defs>

          {GRID_VALUES.map(v => {
            const y = cy(v);
            return (
              <g key={v}>
                <line x1={PAD.l} y1={y} x2={VW - PAD.r} y2={y} style={{ stroke: C.border }} strokeWidth="1" strokeDasharray="4 4" />
                <text x={PAD.l - 6} y={y} textAnchor="end" dominantBaseline="middle" fontSize="10" style={{ fill: C.mid }} fontFamily="Plus Jakarta Sans, sans-serif">
                  {v >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}K` : v}
                </text>
              </g>
            );
          })}

          <path d={area} fill="url(#areaGrad)" />
          <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {data.map((d, i) => {
            const x = pts[i][0];
            const y = pts[i][1];
            const isHovered = hovered === i;
            return (
              <g key={`${d.label}-${i}`} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)} style={{ cursor: "default" }}>
                {isHovered && (
                  <line x1={x} y1={PAD.t} x2={x} y2={BOTTOM} style={{ stroke: C.blue }} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                )}
                <circle cx={x} cy={y} r={isHovered ? 6 : 4} strokeWidth="2.5" style={{ stroke: C.blue, fill: isHovered ? C.blue : C.surface, transition: "r 0.15s" }} />
                {isHovered && (
                  <g>
                    <rect x={x - 44} y={y - 34} width="88" height="24" rx="6" fill="#1F2937" />
                    <text x={x} y={y - 18} textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="700" fill="#F9FAFB" fontFamily="Plus Jakarta Sans, sans-serif">
                      {fmtBRL(d.value)}
                    </text>
                  </g>
                )}
                <text x={x} y={VH - 6} textAnchor="middle" fontSize="10" style={{ fill: C.mid }} fontFamily="Plus Jakarta Sans, sans-serif">
                  {d.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
};

export default SalesChart;
