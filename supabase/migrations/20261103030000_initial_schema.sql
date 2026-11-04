create extension if not exists "pgcrypto";

create type public.user_role as enum ('customer', 'admin');

create type public.order_status as enum (
  'pending',
  'payment_pending',
  'paid',
  'failed',
  'cancelled',
  'completed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  image_url text,
  platform text not null default 'PC',
  category text,
  steam_app_id bigint unique,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'BRL' check (currency ~ '^[A-Z]{3}$'),
  active boolean not null default true,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.cart_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  status public.order_status not null default 'pending',
  total_cents integer not null check (total_cents >= 0),
  payment_method text not null check (length(trim(payment_method)) > 0),
  asaas_payment_id text,
  idempotency_key text not null check (length(trim(idempotency_key)) > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create index cart_items_user_id_idx on public.cart_items(user_id);
create index favorites_user_id_idx on public.favorites(user_id);
create index orders_user_id_created_at_idx on public.orders(user_id, created_at desc);
create index order_items_order_id_idx on public.order_items(order_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger cart_items_set_updated_at
before update on public.cart_items
for each row execute function public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function public.create_order(
  p_user_id uuid,
  p_idempotency_key text,
  p_items jsonb,
  p_method text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_order_id uuid;
  v_item_count integer;
  v_distinct_item_count integer;
  v_valid_item_count integer;
  v_total_cents bigint;
begin
  if p_user_id is null
    or (
      (select auth.uid()) is distinct from p_user_id
      and coalesce((select auth.role()), '') <> 'service_role'
      and not public.is_admin()
    )
  then
    raise exception using
      errcode = '42501',
      message = 'The authenticated user cannot create this order';
  end if;

  if p_idempotency_key is null or length(trim(p_idempotency_key)) = 0 then
    raise exception using
      errcode = '22023',
      message = 'Idempotency key is required';
  end if;

  if p_method is null or length(trim(p_method)) = 0 then
    raise exception using
      errcode = '22023',
      message = 'Payment method is required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception using
      errcode = '22023',
      message = 'At least one order item is required';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
    where item.product_id is null or item.quantity is null or item.quantity <= 0
  ) then
    raise exception using
      errcode = '22023',
      message = 'Order items must contain a product_id and a positive quantity';
  end if;

  select
    count(*)::integer,
    count(distinct item.product_id)::integer,
    count(product.id)::integer,
    coalesce(sum(product.price_cents::bigint * item.quantity), 0)
  into
    v_item_count,
    v_distinct_item_count,
    v_valid_item_count,
    v_total_cents
  from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
  left join public.products as product
    on product.id = item.product_id
   and product.active;

  if v_item_count <> v_distinct_item_count or v_item_count <> v_valid_item_count then
    raise exception using
      errcode = '22023',
      message = 'All order products must be active and unique';
  end if;

  if v_total_cents > 2147483647 then
    raise exception using
      errcode = '22003',
      message = 'Order total exceeds the supported limit';
  end if;

  insert into public.orders (
    user_id,
    total_cents,
    payment_method,
    idempotency_key
  )
  values (
    p_user_id,
    v_total_cents::integer,
    trim(p_method),
    trim(p_idempotency_key)
  )
  on conflict (user_id, idempotency_key) do nothing
  returning id into v_order_id;

  if v_order_id is null then
    select id
    into v_order_id
    from public.orders
    where user_id = p_user_id
      and idempotency_key = trim(p_idempotency_key);

    return v_order_id;
  end if;

  insert into public.order_items (
    order_id,
    product_id,
    product_name,
    unit_price_cents,
    quantity
  )
  select
    v_order_id,
    product.id,
    product.name,
    product.price_cents,
    item.quantity
  from jsonb_to_recordset(p_items) as item(product_id uuid, quantity integer)
  join public.products as product
    on product.id = item.product_id
   and product.active;

  return v_order_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.cart_items enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "users can read own profile"
on public.profiles for select
using ((select auth.uid()) = id or public.is_admin());

create policy "users can update own profile"
on public.profiles for update
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "anyone can read active products"
on public.products for select
using (active = true or public.is_admin());

create policy "admins can manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "users can manage own cart"
on public.cart_items for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can manage own favorites"
on public.favorites for all
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "users can read own orders"
on public.orders for select
using ((select auth.uid()) = user_id or public.is_admin());

create policy "admins can update orders"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create policy "users can read own order items"
on public.order_items for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = (select auth.uid()) or public.is_admin())
  )
);

revoke all on table
  public.profiles,
  public.products,
  public.cart_items,
  public.favorites,
  public.orders,
  public.order_items
from public, anon, authenticated;

grant all on table
  public.profiles,
  public.products,
  public.cart_items,
  public.favorites,
  public.orders,
  public.order_items
to service_role;

grant usage on schema public to anon, authenticated;

grant select on table public.products to anon, authenticated;
grant select on table public.profiles to authenticated;
grant select, insert, update, delete on table public.cart_items to authenticated;
grant select, insert, delete on table public.favorites to authenticated;
grant select on table public.orders to authenticated;
grant select on table public.order_items to authenticated;

revoke all on function public.set_updated_at() from public;
revoke all on function public.handle_new_user() from public;
revoke all on function public.is_admin() from public;
revoke all on function public.create_order(uuid, text, jsonb, text) from public;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.create_order(uuid, text, jsonb, text) to authenticated, service_role;
