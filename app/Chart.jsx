"use client";
import { useEffect, useRef, useState } from "react";

const RANGES = [7, 30, 90];
const P = { l: 46, r: 14, t: 18, b: 28 };

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
  const [size, setSize] = useState({ w: 640, h: 240 });
  const [range, setRange] = useState(30);
  const [hi, setHi] = useState(null);

  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(box.current);
    return () => ro.disconnect();
  }, []);

  const rows = data.slice(-range);
  const total = rows.reduce((a, r) => a + r.revenue, 0);
  const prev = data.slice(-range * 2, -range).reduce((a, r) => a + r.revenue, 0);
  const growth = prev ? ((total - prev) / prev) * 100 : null;

  const { w: W, h: H } = size;
  const max = Math.max(...rows.map((d) => d.revenue)) * 1.12;
  const x = (i) => P.l + (i * (W - P.l - P.r)) / Math.max(1, rows.length - 1);
  const y = (v) => P.t + (1 - v / max) * (H - P.t - P.b);
  const line = smooth(rows.map((d, i) => [x(i), y(d.revenue)]));
  const area = `${line} L${x(rows.length - 1)},${H - P.b} L${x(0)},${H - P.b} Z`;
  const every = Math.ceil(rows.length / 6);
  const h = hi !== null && rows[hi] ? rows[hi] : null;

  return (
    <div className="chart">
      <div className="chart-head">
        <div>
          <p className="eyebrow">ยอดขายรายวัน · Sales</p>
          <p className="chart-total">
            <span className="num">{baht(total)}</span>
            {growth !== null && (
              <span className={"delta " + (growth >= 0 ? "up" : "down")}>
                {growth >= 0 ? "↑" : "↓"} {Math.abs(growth).toFixed(1)}%
                <em> เทียบ {range} วันก่อนหน้า</em>
              </span>
            )}
          </p>
        </div>
        <div className="seg" role="tablist" aria-label="ช่วงเวลา">
          {RANGES.map((r) => (
            <button key={r} role="tab" aria-selected={r === range} onClick={() => { setRange(r); setHi(null); }}>{r} วัน</button>
          ))}
        </div>
      </div>

      <div className="plot" ref={box}>
        <svg width={W} height={H} role="img" aria-label={`ยอดขายรายวัน ${range} วันล่าสุด`}
          onMouseLeave={() => setHi(null)}
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            const i = Math.round(((e.clientX - r.left - P.l) / (W - P.l - P.r)) * (rows.length - 1));
            setHi(Math.max(0, Math.min(rows.length - 1, i)));
          }}>
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d4b07a" stopOpacity=".38" />
              <stop offset=".7" stopColor="#d4b07a" stopOpacity=".05" />
              <stop offset="1" stopColor="#d4b07a" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 0.5, 1].map((t) => (
            <g key={t}>
              <line x1={P.l} x2={W - P.r} y1={y(t * max)} y2={y(t * max)} className="grid" />
              <text x={P.l - 10} y={y(t * max) + 4} textAnchor="end" className="ax">{t ? (t * max / 1000).toFixed(1) + "k" : "0"}</text>
            </g>
          ))}
          {rows.map((d, i) => (rows.length - 1 - i) % every === 0 && (
            <text key={d.day} x={x(i)} y={H - 6} textAnchor="middle" className="ax">{fmtDay(d.day)}</text>
          ))}
          <path d={area} fill="url(#gold)" />
          <path d={line} className="curve" key={range} />
          {h && (
            <g>
              <line x1={x(hi)} x2={x(hi)} y1={P.t} y2={H - P.b} className="cursor" />
              <circle cx={x(hi)} cy={y(h.revenue)} r="5" className="dot" />
            </g>
          )}
        </svg>
        {h && (
          <div className="tooltip" style={{ left: Math.min(Math.max(x(hi), 80), W - 80), top: y(h.revenue) - 14 }}>
            <span>{fmtDay(h.day, true)}</span>
            <b className="num">{baht(h.revenue)}</b>
            <span>{h.orders} ออเดอร์</span>
          </div>
        )}
      </div>
    </div>
  );
}
