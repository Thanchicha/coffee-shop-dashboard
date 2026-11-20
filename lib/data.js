import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getDashboard() {
  if (!url || !key) throw new Error("ยังไม่ได้ตั้งค่า NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [a, b, c, d] = await Promise.all([
    sb.from("v_dashboard_summary").select("*").single(),
    sb.from("v_sales_daily").select("*").order("day", { ascending: false }).limit(30),
    sb.from("v_top_products").select("*"),
    sb.from("v_recent_orders").select("*"),
  ]);
  const err = a.error || b.error || c.error || d.error;
  if (err) throw new Error(err.message);
  return {
    summary: a.data,
    daily: b.data.reverse().map((r) => ({ ...r, revenue: Number(r.revenue) })),
    top: c.data,
    recent: d.data,
  };
}
