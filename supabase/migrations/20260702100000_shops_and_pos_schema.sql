-- Relational schema mirroring the app's actual local state shape
-- (src/store.jsx), as forward-looking infrastructure. NOT wired into the
-- app yet — sync.js/store.jsx are untouched by this migration. See
-- docs/backend/01-schema-design.md for the full rationale.
--
-- SECURITY NOTE: there is no real Supabase Auth in this app today (access
-- is "whoever has the shop_id/recovery_code", identical to the app's
-- existing trust model). RLS is enabled on every table below with a
-- permissive placeholder policy so a future swap to real auth-based
-- policies is a clean ALTER/DROP+CREATE POLICY, not a disruptive
-- first-time RLS rollout. Until that swap happens, these tables offer
-- no security beyond obscurity of the shop_id UUID — same as today.

create table public.shops (
  id uuid primary key,
  name text not null default '',
  owner text not null default '',
  phone text not null default '',
  recovery_code char(6) not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key,
  shop_id uuid not null references public.shops (id) on delete cascade,
  type text not null check (type in ('fixed', 'flexible')),
  name text not null,
  cost numeric(12, 2),
  price numeric(12, 2),
  qty integer,
  low integer,
  barcode text,
  invested numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_fields_match_type check (
    (
      type = 'fixed'
      and cost is not null and price is not null and qty is not null and low is not null
      and invested is null
    ) or (
      type = 'flexible'
      and invested is not null
      and cost is null and price is null and qty is null and low is null
    )
  )
);

create index products_shop_id_idx on public.products (shop_id);
create index products_low_stock_idx on public.products (shop_id, qty, low) where type = 'fixed';
create index products_barcode_idx on public.products (shop_id, barcode) where barcode is not null;

create table public.customers (
  id uuid primary key,
  shop_id uuid not null references public.shops (id) on delete cascade,
  name text not null,
  phone text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_shop_id_idx on public.customers (shop_id);

create table public.payments (
  id uuid primary key,
  customer_id uuid not null references public.customers (id) on delete cascade,
  amount numeric(12, 2) not null,
  time timestamptz not null default now(),
  note text not null default ''
);

create index payments_customer_id_idx on public.payments (customer_id);

create table public.sales (
  id uuid primary key,
  shop_id uuid not null references public.shops (id) on delete cascade,
  time timestamptz not null default now(),
  total numeric(12, 2) not null,
  profit numeric(12, 2) not null,
  mode text not null check (mode in ('cash', 'debt', 'transfer')),
  customer_id uuid references public.customers (id) on delete set null,
  customer_name text not null default '',
  customer_phone text not null default '',
  amount_paid numeric(12, 2) not null,
  balance numeric(12, 2) not null default 0
);

create index sales_shop_id_time_idx on public.sales (shop_id, time desc);
create index sales_customer_id_idx on public.sales (customer_id);

create table public.sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales (id) on delete cascade,
  type text not null check (type in ('fixed', 'flexible')),
  product_id uuid references public.products (id) on delete set null,
  name text not null,
  price numeric(12, 2) not null,
  cost numeric(12, 2) not null,
  qty numeric(12, 2) not null,
  subtotal numeric(12, 2) not null
);

create index sale_items_sale_id_idx on public.sale_items (sale_id);
create index sale_items_product_id_idx on public.sale_items (product_id);

create table public.expenses (
  id uuid primary key,
  shop_id uuid not null references public.shops (id) on delete cascade,
  time timestamptz not null default now(),
  category text not null check (category in ('transport', 'fuel', 'rent', 'utilities', 'salary', 'other')),
  amount numeric(12, 2) not null,
  note text not null default ''
);

create index expenses_shop_id_time_idx on public.expenses (shop_id, time desc);

create table public.withdrawals (
  id uuid primary key,
  shop_id uuid not null references public.shops (id) on delete cascade,
  time timestamptz not null default now(),
  amount numeric(12, 2) not null,
  note text not null default ''
);

create index withdrawals_shop_id_time_idx on public.withdrawals (shop_id, time desc);

-- ---------------------------------------------------------------------------
-- RLS: enabled everywhere, permissive placeholder policy on every table.
-- See security note at top of this file.
-- ---------------------------------------------------------------------------
alter table public.shops enable row level security;
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.payments enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.expenses enable row level security;
alter table public.withdrawals enable row level security;

create policy "shops: open (pre-auth placeholder)" on public.shops
  for all to anon using (true) with check (true);
create policy "products: open (pre-auth placeholder)" on public.products
  for all to anon using (true) with check (true);
create policy "customers: open (pre-auth placeholder)" on public.customers
  for all to anon using (true) with check (true);
create policy "payments: open (pre-auth placeholder)" on public.payments
  for all to anon using (true) with check (true);
create policy "sales: open (pre-auth placeholder)" on public.sales
  for all to anon using (true) with check (true);
create policy "sale_items: open (pre-auth placeholder)" on public.sale_items
  for all to anon using (true) with check (true);
create policy "expenses: open (pre-auth placeholder)" on public.expenses
  for all to anon using (true) with check (true);
create policy "withdrawals: open (pre-auth placeholder)" on public.withdrawals
  for all to anon using (true) with check (true);
