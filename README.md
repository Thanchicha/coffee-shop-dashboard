# Atelier Crema — SME Business Intelligence Dashboard

แดชบอร์ดยอดขายร้านกาแฟและเบเกอรี่ หน้าเดียว (Single Page Dashboard)

**Stack:** Next.js (React) · Supabase (PostgreSQL) · Vercel

## สิ่งที่แสดงบนแดชบอร์ด
| โจทย์ | ที่มาของข้อมูล |
|---|---|
| Total Revenue | `v_dashboard_summary.total_revenue` (เฉพาะออเดอร์ `paid`) |
| Total Orders | `v_dashboard_summary.total_orders` |
| Total Customers | `v_dashboard_summary.total_customers` |
| Sales Analytics | `v_sales_daily` — ยอดขายรายวัน 30 วันล่าสุด |
| Top 5 Products | `v_top_products` — เรียงตามจำนวนที่ขายได้ |
| Recent Orders | `v_recent_orders` — 10 ออเดอร์ล่าสุด (ไม่รวมวันที่ในอนาคต) |

## ตั้งค่าฐานข้อมูล (Supabase → SQL Editor)
1. `sql/01_mock_data.sql` — ข้อมูลจำลองจากโจทย์ (ไม่ได้แก้ไข)
2. `sql/02_views.sql` — views สรุปข้อมูล + เปิด RLS ให้ anon key อ่านได้เฉพาะ views

## รันในเครื่อง
```bash
npm install
cp .env.example .env.local   # ใส่ Project URL และ anon/publishable key
npm run dev
```

ภาพถ่ายจาก [Unsplash](https://unsplash.com)
