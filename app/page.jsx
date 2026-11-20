import { getDashboard, isDemo } from "@/lib/data";
import Chart from "./Chart";
import CountUp from "./CountUp";

export const revalidate = 60;

const img = (id, w = 1600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
const PHOTOS = {
  hero: "1716078062319-0141d3323aa2",
  rosetta: "1738597966728-349bf6247848",
  pour: "1747712222828-d361033fd4de",
  croissant: "1769138886449-de3cb1c482a7",
  tray: "1763208387697-fe0a913bfed9",
};

const baht = (n) => "฿" + Math.round(Number(n)).toLocaleString("th-TH");
const num = (n) => Number(n).toLocaleString("th-TH");
const STATUS = {
  paid: { label: "ชำระแล้ว", icon: "✓" },
  pending: { label: "รอชำระ", icon: "◔" },
  cancelled: { label: "ยกเลิก", icon: "✕" },
};
const CAT_EN = { "กาแฟ": "Coffee", "ชา": "Tea", "เครื่องดื่ม": "Beverages", "เบเกอรี่": "Pâtisserie", "อาหาร": "Kitchen" };

function ago(iso) {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  if (m < 1) return "เมื่อสักครู่";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  if (m < 1440) return `${Math.round(m / 60)} ชม.ที่แล้ว`;
  return new Date(iso).toLocaleDateString("th-TH", { day: "numeric", month: "short" });
}
function greeting() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "Asia/Bangkok" }));
  return h < 12 ? "อรุณสวัสดิ์" : h < 17 ? "สวัสดีตอนบ่าย" : "สวัสดีตอนเย็น";
}

const Icon = {
  revenue: <path d="M4 17V7m5 10V4m5 13v-6m5 6V9" />,
  orders: <path d="M6 3h12l-1 18H7L6 3Zm3 5h6M9 12h6" />,
  guests: <path d="M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 0a3 3 0 1 0 0-6M3 20c0-3 2.5-5 5-5s5 2 5 5m3-5c2.5 0 5 2 5 5" />,
};

export default async function Page() {
  let d, error = null;
  try { d = await getDashboard(); } catch (e) { error = e.message; }

  if (error) return (
    <main className="err"><h1>เชื่อมต่อฐานข้อมูลไม่ได้</h1><p>{error}</p>
      <p>ตรวจว่ารัน sql/02_views.sql แล้ว และตั้งค่า .env.local ถูกต้อง</p></main>
  );

  const { summary: s, daily, top, recent, menu } = d;
  const maxUnits = Math.max(...top.map((t) => t.units_sold));
  const avgTicket = s.paid_orders ? s.total_revenue / s.paid_orders : 0;
  const today = new Date().toLocaleDateString("th-TH", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bangkok" });
  const cats = [...new Set(menu.map((m) => m.category))];

  const kpis = [
    { key: "revenue", label: "ยอดขายรวม", en: "Total Revenue", value: s.total_revenue, prefix: "฿", sub: <>เฉลี่ย <b>{baht(avgTicket)}</b> ต่อบิล</> },
    { key: "orders", label: "ออเดอร์ทั้งหมด", en: "Total Orders", value: s.total_orders, sub: <>ชำระแล้ว <b>{num(s.paid_orders)}</b> บิล</> },
    { key: "guests", label: "ลูกค้าทั้งหมด", en: "Total Customers", value: s.total_customers, sub: <>สมาชิกที่ลงทะเบียน</> },
  ];

  return (
    <>
      {/* ============ ONE-SCREEN DASHBOARD ============ */}
      <section className="screen" id="dashboard">
        <aside className="hero" style={{ "--hero": `url(${img(PHOTOS.hero, 1200)})` }}>
          <div className="hero-top">
            <p className="mark">Atelier <i>Crema</i></p>
            <p className="mark-th">โรงคั่วและบ้านกาแฟ · ก่อตั้ง ๒๕๖๘</p>
          </div>
          <nav className="hero-nav" aria-label="หัวข้อในหน้า">
            <a href="#dashboard" aria-current="true">แดชบอร์ด</a>
            <a href="#story">เรื่องราว</a>
            <a href="#menu">เมนู</a>
          </nav>
          <blockquote>
            “ทุกแก้วคือ<br />ช่วงเวลาที่ตั้งใจ”
            <cite>Every cup, a considered moment.</cite>
          </blockquote>
          <p className="live"><span className="pulse" />{isDemo ? "โหมดตัวอย่าง · ยังไม่เชื่อม Supabase" : "ข้อมูลสดจาก Supabase · อัปเดตทุก 60 วิ"}</p>
        </aside>

        <main className="board">
          <header className="topbar">
            <div>
              <p className="eyebrow">{greeting()} · {today}</p>
              <h1>ภาพรวมร้าน<span className="en"> Overview</span></h1>
            </div>
          </header>

          <section className="kpis" aria-label="ตัวเลขสำคัญ">
            {kpis.map((k, i) => (
              <article key={k.key} className={"kpi" + (i === 0 ? " kpi-hero" : "")}>
                <div className="kpi-head">
                  <svg viewBox="0 0 24 24" aria-hidden>{Icon[k.key]}</svg>
                  <span>{k.label}</span><em>{k.en}</em>
                </div>
                <p className="kpi-val num"><CountUp value={k.value} prefix={k.prefix} /></p>
                <p className="kpi-sub">{k.sub}</p>
              </article>
            ))}
          </section>

          <section className="panel p-chart"><Chart data={daily} /></section>

          <section className="panel p-top">
            <div className="panel-head">
              <p className="eyebrow">ขายดี 5 อันดับ · Top Products</p>
              <span className="hint">จำนวนแก้ว/ชิ้น ที่ขายได้</span>
            </div>
            <ol className="top">
              {top.map((t, i) => (
                <li key={t.name}>
                  <span className="rank num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-name">{t.name}<small>{t.category}</small></span>
                  <span className="t-bar"><i style={{ "--w": (t.units_sold / maxUnits) * 100 + "%" }} /></span>
                  <span className="t-val num">{num(t.units_sold)}</span>
                  <span className="t-rev num">{baht(t.revenue)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="panel p-recent">
            <div className="panel-head">
              <p className="eyebrow">ออเดอร์ล่าสุด · Recent</p>
              <span className="hint">{recent.length} รายการ</span>
            </div>
            <ul className="orders">
              {recent.map((r) => (
                <li key={r.id}>
                  <span className="o-av" aria-hidden>{r.customer.slice(0, 1)}</span>
                  <span className="o-who">{r.customer}<small className="num">{r.order_no} · {ago(r.ordered_at)}</small></span>
                  <span className="o-amt">
                    <b className="num">{baht(r.total)}</b>
                    <span className={"st " + r.status}><i aria-hidden>{STATUS[r.status].icon}</i>{STATUS[r.status].label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <a className="cue" href="#story">เลื่อนลงเพื่อรู้จักร้าน <span aria-hidden>↓</span></a>
        </main>
      </section>

      {/* ============ BELOW THE FOLD: THE HOUSE ============ */}
      <section className="story" id="story">
        <div className="story-text">
          <p className="eyebrow">เรื่องราวของเรา · The House</p>
          <h2>จากเมล็ด<br /><i>สู่ถ้วยของคุณ</i></h2>
          <p>เราคั่วเมล็ดเองทุกเช้าในล็อตเล็ก ๆ เพื่อให้ได้กลิ่นหอมที่สดที่สุด ทุกแก้วถูกชงด้วยมือของบาริสต้าที่ใส่ใจรายละเอียด ตั้งแต่อุณหภูมิน้ำไปจนถึงลายฟองนมบนผิวกาแฟ</p>
          <dl className="facts">
            <div><dt className="num">{cats.length}</dt><dd>หมวดเมนู</dd></div>
            <div><dt className="num">{menu.length}</dt><dd>รายการในเมนู</dd></div>
            <div><dt className="num">07–21</dt><dd>เปิดทุกวัน</dd></div>
          </dl>
        </div>
        <div className="mosaic">
          <figure className="m1"><img src={img(PHOTOS.rosetta, 900)} alt="ลาเต้อาร์ตลายใบไม้ในถ้วยเซรามิก" loading="lazy" /></figure>
          <figure className="m2"><img src={img(PHOTOS.pour, 700)} alt="เทกาแฟลงในนมเย็น" loading="lazy" /></figure>
          <figure className="m3"><img src={img(PHOTOS.croissant, 700)} alt="ครัวซองต์คู่กับกาแฟ" loading="lazy" /></figure>
        </div>
      </section>

      {/* ============ BELOW THE FOLD: MENU ============ */}
      <section className="menu" id="menu">
        <header>
          <p className="eyebrow">รายการทั้งหมด · Carte</p>
          <h2>เมนู<i> de la Maison</i></h2>
        </header>
        <div className="menu-cols">
          {cats.map((c) => (
            <div key={c} className="menu-cat">
              <h3>{c}<em>{CAT_EN[c] || ""}</em></h3>
              <ul>
                {menu.filter((m) => m.category === c).map((m) => (
                  <li key={m.name}><span>{m.name}</span><span className="dots" aria-hidden /><span className="num">{Math.round(m.unit_price)}</span></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="foot">
        <p className="mark">Atelier <i>Crema</i></p>
        <p>เปิดทุกวัน 07:00 – 21:00 · ภาพถ่ายจาก Unsplash</p>
      </footer>
    </>
  );
}
