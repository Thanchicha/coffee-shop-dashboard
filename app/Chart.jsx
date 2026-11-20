"use client";
import { useEffect, useRef, useState } from "react";

const P = { l: 52, r: 16, t: 18, b: 30 };

function smooth(pts) {
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
  }
  return d;
}
const baht = (n) => "฿" + Math.round(n).toLocaleString("th-TH");
const fmtDay = (s, long) => new Date(s).toLocaleDateString("th-TH", long ? { weekday: "short", day: "numeric", month: "short" } : { day: "numeric", month: "short" });

export default function Chart({ data }) {
  const box = useRef(null);
  const [size, setSize] = useState(null); // measured before first draw, so the chart never paints at a wrong width
  const [hi, setHi] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const total = data.reduce((a, r) => a + r.revenue, 0);
  const { w: W, h: H } = size || { w: 0, h: 0 };
  const max = Math.max(...data.map((d) => d.revenue)) * 1.12;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / Math.max(1, data.length - 1);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const line = smooth(data.map((d, i) => [x(i), y(d.revenue)]));
  const area = `${line} L${x(data.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const every = Math.ceil(data.length / Math.max(2, Math.min(6, Math.floor(W / 80)))); // ~80px per date label
  const h = hi !== null && data[hi] ? data[hi] : null;

  return (
    <div className="chart">
      <div className="panel-head">
        <h2>ยอดขายรายวัน <span>30 วันล่าสุด</span></h2>
        <p className="chart-total">รวม <b>{baht(total)}</b></p>
      </div>

      <div className="plot" ref={box}>
        {size && <svg width={W} height={H} role="img" aria-label="กราฟยอดขายรายวัน 30 วันล่าสุด"
          onMouseLeave={() => setHi(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.round(((e.clientX - r.left - P.l) / (W - P.l - P.r)) * (data.length - 1));
            setHi(Math.max(0, Math.min(data.length - 1, i)));
          }}>
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#e0bd85" stopOpacity=".35" />
              <stop offset="1" stopColor="#e0bd85" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y(t * max)} y2={y(t * max)} className="grid" />
              <text x={P.l - 10} y={y(t * max) + 4} textAnchor="end" className="ax">{t ? (t * max / 1000).toFixed(1) + "k" : "0"}</text>
            </g>
          ))}
          {data.map((d, i) => (data.length - 1 - i) % every === 0 && (
            <text key={d.day} x={x(i)} y={H - 6} textAnchor="middle" className="ax">{fmtDay(d.day)}</text>
          ))}
          <path d={area} fill="url(#gold)" />
          <path d={line} className="curve" />
          {h && (
            <g>
              <line x1={x(hi)} x2={x(hi)} y1={P.t} y2={H - P.b} className="cursor" />
              <circle cx={x(hi)} cy={y(h.revenue)} r="5" className="dot" />
            </g>
          )}
        </svg>}
        {h && (
          <div className="tooltip" style={{ left: Math.min(Math.max(x(hi), 80), W - 80), top: y(h.revenue) - 14 }}>
            <span>{fmtDay(h.day, true)}</span>
            <b>{baht(h.revenue)}</b>
            <span>{h.orders} ออเดอร์</span>
          </div>
        )}
      </div>
    </div>
  );
}
