import { useState } from "react";
import C from "../../../theme/colors";

const PERIODS = ["Semana", "Mês", "Ano"];

const WEEK_DATA = [
  { label: "Seg", value: 2800 },
  { label: "Ter", value: 3200 },
  { label: "Qua", value: 2600 },
  { label: "Qui", value: 3800 },
  { label: "Sex", value: 4200 },
  { label: "Sáb", value: 3100 },
  { label: "Dom", value: 2400 },
];

const VW = 560, VH = 180;
const PAD = { l: 48, r: 16, t: 16, b: 36 };
const IW = VW - PAD.l - PAD.r;
const IH = VH - PAD.t - PAD.b;
const MAX = 5000;
const BOTTOM = PAD.t + IH;

const cx = (i, len) => PAD.l + (i / (len - 1)) * IW;
const cy = (v) => PAD.t + IH - (v / MAX) * IH;

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

const buildPaths = (data) => {
  const pts = data.map((d, i) => [cx(i, data.length), cy(d.value)]);
  const line = smoothPath(pts);
  const last = pts[pts.length - 1];
  const first = pts[0];
  const area = `${line} L ${last[0].toFixed(2)} ${BOTTOM} L ${first[0].toFixed(2)} ${BOTTOM} Z`;
  return { line, area, pts };
};

const GRID_VALUES = [5000, 4000, 3000, 2000, 1000];

const total = WEEK_DATA.reduce((s, d) => s + d.value, 0);

const SalesChart = () => {
  const [period, setPeriod] = useState("Semana");
  const [hovered, setHovered] = useState(null);

  const { line, area, pts } = buildPaths(WEEK_DATA);

  return (
    <div style={{
      background: C.surface,
      borderRadius: 16,
      padding: "24px",
      boxShadow: "0 1px 12px rgba(0,0,0,0.06)",
      border: `1px solid ${C.border}`,
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: C.mid, margin: "0 0 4px" }}>Faturamento</p>
          <p style={{ fontSize: 24, fontWeight: 800, color: C.graphite, margin: 0 }}>
            R$ {total.toLocaleString("pt-BR")}
          </p>
          <p style={{ fontSize: 12, color: C.green, fontWeight: 600, margin: "4px 0 0" }}>
            +8,3% vs semana anterior
          </p>
        </div>

        {/* Period tabs */}
        <div style={{
          display: "flex",
          background: C.gray,
          borderRadius: 10,
          padding: 3,
          gap: 2,
        }}>
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "5px 14px",
                borderRadius: 8,
                border: "none",
                background: period === p ? C.surface : "transparent",
                color: period === p ? C.graphite : C.mid,
                fontSize: 12,
                fontWeight: period === p ? 700 : 500,
                cursor: "pointer",
                boxShadow: period === p ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
                fontFamily: "inherit",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* SVG Chart */}
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        style={{ width: "100%", height: "auto", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={C.blue} stopOpacity="0.15" />
            <stop offset="100%" stopColor={C.blue} stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={C.blue} />
            <stop offset="100%" stopColor={C.blueLight} />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {GRID_VALUES.map(v => {
          const y = cy(v);
          return (
            <g key={v}>
              <line
                x1={PAD.l} y1={y} x2={VW - PAD.r} y2={y}
                stroke={C.border} strokeWidth="1" strokeDasharray="4 4"
              />
              <text
                x={PAD.l - 6} y={y} textAnchor="end" dominantBaseline="middle"
                fontSize="10" fill={C.mid} fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {v >= 1000 ? `${v / 1000}K` : v}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={area} fill="url(#areaGrad)" />

        {/* Line */}
        <path d={line} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + X labels */}
        {WEEK_DATA.map((d, i) => {
          const x = pts[i][0];
          const y = pts[i][1];
          const isHovered = hovered === i;
          return (
            <g key={d.label}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "default" }}
            >
              {isHovered && (
                <line x1={x} y1={PAD.t} x2={x} y2={BOTTOM} stroke={C.blue} strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              )}

              <circle
                cx={x} cy={y}
                r={isHovered ? 6 : 4}
                stroke={C.blue}
                strokeWidth="2.5"
                style={{ fill: isHovered ? C.blue : C.surface, transition: "r 0.15s" }}
              />

              {isHovered && (
                <g>
                  <rect
                    x={x - 36} y={y - 34}
                    width="72" height="24"
                    rx="6" fill={C.graphite}
                  />
                  <text
                    x={x} y={y - 18}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize="11" fontWeight="700" fill="white"
                    fontFamily="Plus Jakarta Sans, sans-serif"
                  >
                    R$ {d.value.toLocaleString("pt-BR")}
                  </text>
                </g>
              )}

              <text
                x={x} y={VH - 6}
                textAnchor="middle"
                fontSize="10" fill={i === new Date().getDay() - 1 ? C.blue : C.mid}
                fontWeight={i === new Date().getDay() - 1 ? "700" : "400"}
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SalesChart;
