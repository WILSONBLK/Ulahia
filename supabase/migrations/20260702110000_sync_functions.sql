-- Phase B: server-side function backing sync.js's pushState(). One atomic
-- call instead of ~12 sequential REST calls — matters for users on slow/
-- expensive mobile data, and avoids leaving the cloud copy half-updated if
-- the connection drops mid-sync. "Delete then reinsert" mirrors the old
-- JSONB-blob's whole-state-overwrite semantics exactly.
--
-- No pull-side function is needed — pullByCode() reads via plain anon-role
-- selects (RLS is already fully open, see 20260702100000) and reassembles
-- the shape in JS, which is simpler to get right than nested jsonb_agg SQL.

create or replace function public.sync_push_state(
  p_shop_id uuid,
  p_recovery_code text,
  p_shop jsonb,
  p_products jsonb,
  p_customers jsonb,
  p_sales jsonb,
  p_expenses jsonb,
  p_withdrawals jsonb
)
returns void
language plpgsql
as $$
begin
  insert into public.shops (id, name, owner, phone, recovery_code, updated_at)
  values (
    p_shop_id,
    coalesce(p_shop ->> 'name', ''),
    coalesce(p_shop ->> 'owner', ''),
    coalesce(p_shop ->> 'phone', ''),
    p_recovery_code,
    now()
  )
  on conflict (id) do update set
    name = excluded.name,
    owner = excluded.owner,
    phone = excluded.phone,
    recovery_code = excluded.recovery_code,
    updated_at = now();

  delete from public.sale_items where sale_id in (select id from public.sales where shop_id = p_shop_id);
  delete from public.sales where shop_id = p_shop_id;
  delete from public.payments where customer_id in (select id from public.customers where shop_id = p_shop_id);
  delete from public.customers where shop_id = p_shop_id;
  delete from public.products where shop_id = p_shop_id;
  delete from public.expenses where shop_id = p_shop_id;
  delete from public.withdrawals where shop_id = p_shop_id;

  insert into public.products (id, shop_id, type, name, cost, price, qty, low, barcode, invested)
  select
    (p ->> 'id')::uuid, p_shop_id, p ->> 'type', p ->> 'name',
    (p ->> 'cost')::numeric, (p ->> 'price')::numeric,
    (p ->> 'qty')::integer, (p ->> 'low')::integer,
    p ->> 'barcode', (p ->> 'invested')::numeric
  from jsonb_array_elements(coalesce(p_products, '[]'::jsonb)) as p;

  insert into public.customers (id, shop_id, name, phone)
  select (c ->> 'id')::uuid, p_shop_id, c ->> 'name', coalesce(c ->> 'phone', '')
  from jsonb_array_elements(coalesce(p_customers, '[]'::jsonb)) as c;

  insert into public.payments (id, customer_id, amount, time, note)
  select
    (pay ->> 'id')::uuid, (c ->> 'id')::uuid, (pay ->> 'amount')::numeric,
    (pay ->> 'time')::timestamptz, coalesce(pay ->> 'note', '')
  from jsonb_array_elements(coalesce(p_customers, '[]'::jsonb)) as c,
       jsonb_array_elements(coalesce(c -> 'payments', '[]'::jsonb)) as pay;

  insert into public.sales (
    id, shop_id, time, total, profit, mode, customer_id, customer_name, customer_phone, amount_paid, balance
  )
  select
    (s ->> 'id')::uuid, p_shop_id, (s ->> 'time')::timestamptz, (s ->> 'total')::numeric,
    (s ->> 'profit')::numeric, s ->> 'mode', nullif(s ->> 'customerId', '')::uuid,
    coalesce(s ->> 'customerName', ''), coalesce(s ->> 'customerPhone', ''),
    (s ->> 'amountPaid')::numeric, coalesce((s ->> 'balance')::numeric, 0)
  from jsonb_array_elements(coalesce(p_sales, '[]'::jsonb)) as s;

  insert into public.sale_items (sale_id, type, product_id, name, price, cost, qty, subtotal)
  select
    (s ->> 'id')::uuid, i ->> 'type', nullif(i ->> 'productId', '')::uuid, i ->> 'name',
    (i ->> 'price')::numeric, (i ->> 'cost')::numeric, (i ->> 'qty')::numeric, (i ->> 'subtotal')::numeric
  from jsonb_array_elements(coalesce(p_sales, '[]'::jsonb)) as s,
       jsonb_array_elements(coalesce(s -> 'items', '[]'::jsonb)) as i;

  insert into public.expenses (id, shop_id, time, category, amount, note)
  select
    (e ->> 'id')::uuid, p_shop_id, (e ->> 'time')::timestamptz, e ->> 'category',
    (e ->> 'amount')::numeric, coalesce(e ->> 'note', '')
  from jsonb_array_elements(coalesce(p_expenses, '[]'::jsonb)) as e;

  insert into public.withdrawals (id, shop_id, time, amount, note)
  select
    (w ->> 'id')::uuid, p_shop_id, (w ->> 'time')::timestamptz,
    (w ->> 'amount')::numeric, coalesce(w ->> 'note', '')
  from jsonb_array_elements(coalesce(p_withdrawals, '[]'::jsonb)) as w;
end;
$$;

grant execute on function public.sync_push_state(uuid, text, jsonb, jsonb, jsonb, jsonb, jsonb, jsonb) to anon;
