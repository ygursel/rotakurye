-- RotaKurye veritabanı şeması
-- Supabase > SQL Editor > New query: bu dosyanın tamamını yapıştırıp "Run" deyin.

create extension if not exists pgcrypto;

-- Restoran (ileride her müşteri işletme ayrı bir satır olur)
create table if not exists public.restaurants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  lat         double precision,
  lng         double precision,
  created_at  timestamptz not null default now()
);

-- Kullanıcı profili: yönetici (admin) veya kurye (courier)
create table if not exists public.profiles (
  id             uuid primary key references auth.users(id) on delete cascade,
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  full_name      text not null,
  role           text not null check (role in ('admin','courier')),
  phone          text,
  created_at     timestamptz not null default now()
);

-- Siparişler
create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  customer_name  text,
  customer_phone text,
  address_text   text,
  lat            double precision not null,
  lng            double precision not null,
  note           text,
  amount         numeric(10,3),
  priority       text not null default 'normal' check (priority in ('normal','urgent')),
  status         text not null default 'new'
                 check (status in ('new','ready','assigned','on_way','delivered','cancelled')),
  courier_id     uuid references public.profiles(id) on delete set null,
  seq            int,
  created_at     timestamptz not null default now(),
  ready_at       timestamptz,
  assigned_at    timestamptz,
  picked_at      timestamptz,
  delivered_at   timestamptz
);
create index if not exists orders_rest_created on public.orders (restaurant_id, created_at desc);
create index if not exists orders_courier_status on public.orders (courier_id, status);

-- Kuryelerin son konumu (her kurye için tek satır)
create table if not exists public.courier_locations (
  courier_id     uuid primary key references public.profiles(id) on delete cascade,
  restaurant_id  uuid not null references public.restaurants(id) on delete cascade,
  lat            double precision not null,
  lng            double precision not null,
  accuracy       double precision,
  updated_at     timestamptz not null default now()
);

-- Yardımcı fonksiyonlar (RLS içinde kullanılır)
create or replace function public.my_restaurant() returns uuid
language sql stable security definer set search_path = public as
$$ select restaurant_id from public.profiles where id = auth.uid() $$;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = public as
$$ select role from public.profiles where id = auth.uid() $$;

-- Satır bazlı güvenlik: herkes yalnızca kendi restoranının verisini görür
alter table public.restaurants       enable row level security;
alter table public.profiles          enable row level security;
alter table public.orders            enable row level security;
alter table public.courier_locations enable row level security;

drop policy if exists rest_select on public.restaurants;
create policy rest_select on public.restaurants for select
  using (id = public.my_restaurant());
drop policy if exists rest_update on public.restaurants;
create policy rest_update on public.restaurants for update
  using (id = public.my_restaurant() and public.my_role() = 'admin');

drop policy if exists prof_select on public.profiles;
create policy prof_select on public.profiles for select
  using (restaurant_id = public.my_restaurant());

-- Yönetici: restoranındaki tüm siparişler. Kurye: yalnızca kendisine atananlar.
drop policy if exists ord_select on public.orders;
create policy ord_select on public.orders for select
  using (restaurant_id = public.my_restaurant()
         and (public.my_role() = 'admin' or courier_id = auth.uid()));
drop policy if exists ord_insert on public.orders;
create policy ord_insert on public.orders for insert
  with check (restaurant_id = public.my_restaurant() and public.my_role() = 'admin');
drop policy if exists ord_update_admin on public.orders;
create policy ord_update_admin on public.orders for update
  using (restaurant_id = public.my_restaurant() and public.my_role() = 'admin');
drop policy if exists ord_update_courier on public.orders;
create policy ord_update_courier on public.orders for update
  using (courier_id = auth.uid())
  with check (courier_id = auth.uid());

drop policy if exists loc_select on public.courier_locations;
create policy loc_select on public.courier_locations for select
  using (restaurant_id = public.my_restaurant());
drop policy if exists loc_insert on public.courier_locations;
create policy loc_insert on public.courier_locations for insert
  with check (courier_id = auth.uid() and restaurant_id = public.my_restaurant());
drop policy if exists loc_update on public.courier_locations;
create policy loc_update on public.courier_locations for update
  using (courier_id = auth.uid());

-- Canlı güncelleme (yeni sipariş, kurye konumu anında ekrana düşsün)
do $$ begin
  begin alter publication supabase_realtime add table public.orders; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.courier_locations; exception when duplicate_object then null; end;
end $$;
