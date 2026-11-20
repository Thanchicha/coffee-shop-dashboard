import { getDashboard } from "@/lib/data";
import Chart from "./Chart";

export const revalidate = 60;

const HERO = "https://images.unsplash.com/photo-1716078062319-0141d3323aa2?w=1200&q=80&auto=format&fit=crop";
const baht = (n) => "฿" + Math.round(Number(n)).toLocaleString("th-TH");
const num = (n) => Number(n).toLocaleString("th-TH");
const STATUS = {
  paid: { label: "ชำระแล้ว", icon: "✓" },
  pending: { label: "รอชำระ", icon: "◔" },
  cancelled: { label: "ยกเลิก", icon: "✕" },
};
const time = (iso) => new Date(iso).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Bangkok" });

export default async function Page() {
  let d, error = null;
  try { d = await getDashboard(); } catch (e) { error = e.message; }

  if (error) return (
    <main className="err"><h1>เชื่อมต่อฐานข้อมูลไม่ได้</h1><p>{error}</p>
      <p>ตรวจว่ารัน sql/02_views.sql แล้ว และตั้งค่า Environment Variables ถูกต้อง</p></main>
  );

  const { summary: s, daily, top, recent } = d;
  const maxUnits = Math.max(...top.map((t) => t.units_sold));
  const kpis = [
    { label: "ยอดขายรวม", value: baht(s.total_revenue), sub: "เฉพาะออเดอร์ที่ชำระแล้ว" },
    { label: "ออเดอร์ทั้งหมด", value: num(s.total_orders), sub: `ชำระแล้ว ${num(s.paid_orders)} ออเดอร์` },
    { label: "ลูกค้าทั้งหมด", value: num(s.total_customers), sub: "คน" },
  ];

  return (
    <div className="screen">
      <aside className="hero" style={{ "--hero": `url(${HERO})` }}>
        <p className="mark">Atelier <i>Crema</i></p>
        <p className="mark-th">แดชบอร์ดยอดขายร้าน</p>
        <p className="live"><span className="pulse" />ข้อมูลจาก Supabase</p>
      </aside>

      <main className="board">
        <h1 className="title">ภาพรวมร้าน</h1>

        <section className="kpis" aria-label="ตัวเลขสำคัญ">
          {kpis.map((k, i) => (
            <article key={k.label} className={"kpi" + (i === 0 ? " kpi-hero" : "")}>
              <h2>{k.label}</h2>
              <p className="kpi-val">{k.value}</p>
              <p className="kpi-sub">{k.sub}</p>
            </article>
          ))}
        </section>

        <section className="panel p-chart"><Chart data={daily} /></section>

        <section className="panel p-top">
          <div className="panel-head"><h2>สินค้าขายดี 5 อันดับ</h2><span className="hint">จำนวนที่ขายได้</span></div>
          <ol className="top">
            {top.map((t, i) => (
              <li key={t.name}>
                <span className="rank">{i + 1}</span>
                <span className="t-name">{t.name}</span>
                <span className="t-bar"><i style={{ width: (t.units_sold / maxUnits) * 100 + "%" }} /></span>
                <span className="t-val">{num(t.units_sold)}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="panel p-recent">
          <div className="panel-head"><h2>ออเดอร์ล่าสุด</h2><span className="hint">{recent.length} รายการ</span></div>
          <ul className="orders">
            {recent.map((r) => (
              <li key={r.id}>
                <span className="o-who">{r.customer}<small>{r.order_no} · {time(r.ordered_at)}</small></span>
                <span className="o-amt">
                  <b>{baht(r.total)}</b>
                  <span className={"st " + r.status}><i aria-hidden>{STATUS[r.status].icon}</i>{STATUS[r.status].label}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
