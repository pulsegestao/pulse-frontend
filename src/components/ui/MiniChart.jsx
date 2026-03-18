import C from "../../theme/colors";

const data = [40, 65, 52, 78, 61, 90, 84];
const max = 100;
const w = 100 / (data.length - 1);

const points = data.map((v, i) => `${i * w},${100 - (v / max) * 80}`).join(" ");
const fill = data.map((v, i) => `${i * w},${100 - (v / max) * 80}`).join(" ") + ` ${(data.length - 1) * w},100 0,100`;

const MiniChart = () => (
  <svg viewBox="0 0 100 100" style={{ width: "100%", height: 80 }} preserveAspectRatio="none">
    <defs>
      <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" style={{ stopColor: C.blue, stopOpacity: 0.25 }} />
        <stop offset="100%" style={{ stopColor: C.blue, stopOpacity: 0 }} />
      </linearGradient>
    </defs>
    <polygon points={fill} fill="url(#chartGrad)" />
    <polyline points={points} fill="none" style={{ stroke: C.blue }} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {data.map((v, i) => (
      <circle key={i} cx={i * w} cy={100 - (v / max) * 80} r="2" style={{ fill: C.blue }} />
    ))}
  </svg>
);

export default MiniChart;
