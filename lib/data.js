import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isDemo = !url || !key;

const MENU = [
  ["อเมริกาโน่ร้อน", "กาแฟ", 55], ["อเมริกาโน่เย็น", "กาแฟ", 60], ["ลาเต้ร้อน", "กาแฟ", 70], ["ลาเต้เย็น", "กาแฟ", 75],
  ["คาปูชิโน่", "กาแฟ", 70], ["มอคค่า", "กาแฟ", 80], ["เอสเปรสโซ", "กาแฟ", 45], ["อเมริกาโน่ส้ม", "กาแฟ", 75],
  ["คาราเมลมัคคิอาโต", "กาแฟ", 85], ["เฟลตไวท์", "กาแฟ", 80],
  ["ชาไทย", "ชา", 50], ["ชาเขียวนม", "ชา", 55], ["ชามะนาว", "ชา", 45], ["ชาดำเย็น", "ชา", 40], ["มัทฉะลาเต้", "ชา", 85], ["ชาพีช", "ชา", 65],
  ["โกโก้", "เครื่องดื่ม", 60], ["นมสด", "เครื่องดื่ม", 40], ["น้ำส้มคั้น", "เครื่องดื่ม", 45], ["น้ำผึ้งมะนาว", "เครื่องดื่ม", 50],
  ["สมูทตี้มะม่วง", "เครื่องดื่ม", 75], ["โซดาลิ้นจี่", "เครื่องดื่ม", 55],
  ["ครัวซองต์เนย", "เบเกอรี่", 65], ["ครัวซองต์อัลมอนด์", "เบเกอรี่", 75], ["เค้กช็อกโกแลต", "เบเกอรี่", 95], ["ชีสเค้ก", "เบเกอรี่", 110],
  ["คุกกี้ช็อกชิป", "เบเกอรี่", 40], ["บราวนี่", "เบเกอรี่", 70], ["มาการอง", "เบเกอรี่", 45], ["บันเนยสด", "เบเกอรี่", 35],
  ["เค้กกล้วยหอม", "เบเกอรี่", 85], ["มัฟฟินบลูเบอร์รี่", "เบเกอรี่", 55],
  ["แซนด์วิชไก่", "อาหาร", 89], ["แซนด์วิชทูน่า", "อาหาร", 89], ["โทสต์หน้าแฮม", "อาหาร", 79], ["ข้าวผัดอเมริกัน", "อาหาร", 95], ["สลัดไก่ย่าง", "อาหาร", 120],
].map(([name, category, unit_price]) => ({ name, category, unit_price }));

// ---- demo fallback (only used when Supabase env vars are missing) ----
function demo() {
  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const today = new Date();
  const daily = Array.from({ length: 180 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (179 - i));
    const wk = [0, 6].includes(d.getDay()) ? 1.35 : 1;
    const trend = 1 + i / 800;
    return { day: d.toISOString().slice(0, 10), revenue: Math.round((2600 + rnd() * 1400) * wk * trend), orders: 12 + Math.floor(rnd() * 10) };
  });
  const names = ["สมชาย ใจดี", "สุดา ศรีสุข", "วิชัย ทองคำ", "มานี บุญมา", "ธนา แก้วใส"];
  return {
    summary: { total_revenue: 1243580, total_orders: 8000, paid_orders: 6400, total_customers: 500 },
    daily,
    top: [["ลาเต้เย็น", "กาแฟ", 4210], ["อเมริกาโน่เย็น", "กาแฟ", 3980], ["ชาไทย", "ชา", 3120], ["อเมริกาโน่ร้อน", "กาแฟ", 2890], ["ครัวซองต์เนย", "เบเกอรี่", 2510]]
      .map(([name, category, units_sold]) => ({ name, category, units_sold, revenue: units_sold * 62 })),
    recent: Array.from({ length: 10 }, (_, i) => ({
      id: i, order_no: "ORD-" + String(8000 - i).padStart(6, "0"), customer: names[i % 5],
      status: ["paid", "paid", "pending", "paid", "cancelled"][i % 5],
      ordered_at: new Date(Date.now() - i * 900000).toISOString(), total: 80 + ((i * 37) % 260),
    })),
    menu: MENU,
  };
}

export async function getDashboard() {
  if (isDemo) return demo();
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [a, b, c, d, m] = await Promise.all([
    sb.from("v_dashboard_summary").select("*").single(),
    sb.from("v_sales_daily").select("*").order("day", { ascending: false }).limit(180),
    sb.from("v_top_products").select("*"),
    sb.from("v_recent_orders").select("*"),
    sb.from("v_menu").select("*"),
  ]);
  const err = a.error || b.error || c.error || d.error;
  if (err) throw new Error(err.message);
  return {
    summary: a.data,
    daily: b.data.reverse().map((r) => ({ ...r, revenue: Number(r.revenue) })),
    top: c.data,
    recent: d.data,
    menu: m.error ? MENU : m.data, // menu is decorative: fall back if the view isn't created yet
  };
}
