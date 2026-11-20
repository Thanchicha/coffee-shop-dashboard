-- Run AFTER 01_mock_data.sql. Revenue counts only 'paid' orders.
create or replace view v_dashboard_summary as
select
  (select coalesce(sum(oi.quantity * oi.unit_price),0)
     from order_items oi join orders o on o.id = oi.order_id
     where o.status = 'paid')                       as total_revenue,
  (select count(*) from orders)                      as total_orders,
  (select count(*) from orders where status='paid')  as paid_orders,
  (select count(*) from customers)                   as total_customers;

create or replace view v_sales_daily as
select (o.ordered_at at time zone 'Asia/Bangkok')::date as day,
       sum(oi.quantity * oi.unit_price)::numeric        as revenue,
       count(distinct o.id)                             as orders
from orders o join order_items oi on oi.order_id = o.id
where o.status = 'paid' and o.ordered_at <= now()
group by 1 order by 1;

create or replace view v_top_products as
select p.id, p.name, p.category,
       sum(oi.quantity)::int                      as units_sold,
       sum(oi.quantity * oi.unit_price)::numeric  as revenue
from order_items oi
join orders o   on o.id = oi.order_id and o.status = 'paid'
join products p on p.id = oi.product_id
group by p.id, p.name, p.category
order by units_sold desc
limit 5;

create or replace view v_recent_orders as
select o.id, o.order_no, c.full_name as customer, o.status, o.ordered_at,
       sum(oi.quantity * oi.unit_price)::numeric as total
from orders o
join customers c   on c.id = o.customer_id
join order_items oi on oi.order_id = o.id
where o.ordered_at <= now()   -- seed contains a few future-dated orders
group by o.id, o.order_no, c.full_name, o.status, o.ordered_at
order by o.ordered_at desc
limit 10;

-- Let the public anon key read ONLY the views (base tables stay locked by RLS).
alter table customers   enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
grant select on v_dashboard_summary, v_sales_daily, v_top_products, v_recent_orders to anon;
