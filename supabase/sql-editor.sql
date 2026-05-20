-- =========================================================
-- KASIRKITA - SUPABASE SQL EDITOR
-- Tempel seluruh isi file ini ke Supabase SQL Editor, lalu Run.
-- Project URL: https://qahaxqczpucblwsurouj.supabase.co
-- =========================================================

-- Extensions
create extension if not exists pgcrypto;

-- =========================================================
-- 1) PRODUCTS / BARANG
-- =========================================================
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  code text unique,
  name text not null,
  description text,
  category text,
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table products add column if not exists code text;
alter table products add column if not exists description text;
alter table products add column if not exists category text;
alter table products add column if not exists image_url text;
alter table products add column if not exists is_active boolean not null default true;
alter table products add column if not exists created_at timestamptz not null default now();
alter table products add column if not exists updated_at timestamptz not null default now();

create unique index if not exists products_code_unique on products(code) where code is not null;
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_code on products(code);

-- =========================================================
-- 2) DAILY DISCOUNTS / DISKON HARIAN
-- =========================================================
create table if not exists daily_discounts (
  id uuid primary key default gen_random_uuid(),
  discount_date date not null,
  percent integer not null check (percent >= 0 and percent <= 100),
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (discount_date)
);

-- =========================================================
-- 3) TRANSACTIONS / RIWAYAT TRANSAKSI
-- =========================================================
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  trx_number text not null unique,
  created_at timestamptz not null default now(),
  created_by text,
  customer_name text,
  customer_phone text,
  payment_method text not null check (payment_method in ('tunai','transfer','qris')),
  payment_bank text,
  payment_status text not null default 'paid',
  payment_proof_url text,
  subtotal_amount integer not null default 0,
  manual_discount_amount integer not null default 0,
  auto_discount_amount integer not null default 0,
  ppn_amount integer not null default 0,
  total_amount integer not null default 0,
  notes text
);

create index if not exists idx_transactions_created_at on transactions(created_at desc);

-- =========================================================
-- 4) TRANSACTION ITEMS / ITEM PER TRANSAKSI
-- =========================================================
create table if not exists transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_code text,
  product_name text not null,
  product_category text,
  unit_price integer not null,
  quantity integer not null check (quantity > 0),
  line_subtotal integer not null default 0,
  created_at timestamptz not null default now()
);

alter table transaction_items add column if not exists product_code text;
create index if not exists idx_transaction_items_transaction on transaction_items(transaction_id);
create index if not exists idx_transaction_items_product on transaction_items(product_id);

-- =========================================================
-- 5) STOCK HISTORY / RIWAYAT STOK
-- =========================================================
create table if not exists stock_history (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_id uuid references products(id) on delete cascade,
  product_code text,
  product_name text,
  change_qty integer not null,
  reason text not null default 'transaction',
  ref_transaction_id uuid references transactions(id) on delete set null,
  notes text
);

alter table stock_history add column if not exists product_code text;
create index if not exists idx_stock_history_product on stock_history(product_id);
create index if not exists idx_stock_history_created_at on stock_history(created_at desc);

-- =========================================================
-- UPDATED_AT TRIGGERS
-- =========================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

drop trigger if exists trg_daily_discounts_updated_at on daily_discounts;
create trigger trg_daily_discounts_updated_at
before update on daily_discounts
for each row execute function set_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY
-- Demo mode: anon boleh read/write supaya app HTML/JS langsung jalan.
-- Untuk produksi, policy ini sebaiknya diperketat pakai Supabase Auth.
-- =========================================================
alter table products enable row level security;
alter table daily_discounts enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;
alter table stock_history enable row level security;

drop policy if exists p_products_read on products;
create policy p_products_read on products
for select using (true);

drop policy if exists p_products_write on products;
create policy p_products_write on products
for all using (true) with check (true);

drop policy if exists p_discounts_read on daily_discounts;
create policy p_discounts_read on daily_discounts
for select using (true);

drop policy if exists p_discounts_write on daily_discounts;
create policy p_discounts_write on daily_discounts
for all using (true) with check (true);

drop policy if exists p_transactions_read on transactions;
create policy p_transactions_read on transactions
for select using (true);

drop policy if exists p_transactions_write on transactions;
create policy p_transactions_write on transactions
for all using (true) with check (true);

drop policy if exists p_transaction_items_read on transaction_items;
create policy p_transaction_items_read on transaction_items
for select using (true);

drop policy if exists p_transaction_items_write on transaction_items;
create policy p_transaction_items_write on transaction_items
for all using (true) with check (true);

drop policy if exists p_stock_history_read on stock_history;
create policy p_stock_history_read on stock_history
for select using (true);

drop policy if exists p_stock_history_write on stock_history;
create policy p_stock_history_write on stock_history
for all using (true) with check (true);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on products to anon, authenticated;
grant select, insert, update, delete on daily_discounts to anon, authenticated;
grant select, insert, update, delete on transactions to anon, authenticated;
grant select, insert, update, delete on transaction_items to anon, authenticated;
grant select, insert, update, delete on stock_history to anon, authenticated;

-- =========================================================
-- SEED DATA / DATA AWAL
-- =========================================================
insert into products (code, name, description, category, price, stock, image_url, is_active)
values
  ('BRG-NASIGORENG-001', 'Nasi Goreng', 'Nasi goreng spesial', 'Makanan', 8000, 50, null, true),
  ('BRG-MIEGORENG-001', 'Mie Goreng', 'Mie goreng dengan bumbu', 'Makanan', 7000, 50, null, true),
  ('BRG-AYAMBAKAR-001', 'Ayam Bakar', 'Ayam bakar kantin', 'Makanan', 12000, 30, null, true),
  ('BRG-GADOGADO-001', 'Gado-Gado', 'Gado-gado segar', 'Makanan', 9000, 25, null, true),
  ('BRG-ESTEH-001', 'Es Teh', 'Es teh segar', 'Minuman', 3000, 80, null, true),
  ('BRG-AIRMINERAL-001', 'Air Mineral', 'Air mineral 330ml', 'Minuman', 2000, 120, null, true),
  ('BRG-JUSJERUK-001', 'Jus Jeruk', 'Jus jeruk segar', 'Minuman', 5000, 60, null, true),
  ('BRG-ESCAMPUR-001', 'Es Campur', 'Es campur kantin', 'Minuman', 6000, 45, null, true),
  ('BRG-KERIPIK-001', 'Keripik', 'Keripik pedas renyah', 'Snack', 2500, 60, null, true),
  ('BRG-ROTIBAKAR-001', 'Roti Bakar', 'Roti bakar manis', 'Snack', 4000, 35, null, true),
  ('BRG-PENA-001', 'Pena', 'ATK Pena', 'ATK', 3000, 40, null, true),
  ('BRG-PENGGARIS-001', 'Penggaris', 'ATK Penggaris', 'ATK', 5000, 70, null, true)
on conflict (code) do update
set name = excluded.name,
    description = excluded.description,
    category = excluded.category,
    price = excluded.price,
    stock = excluded.stock,
    image_url = excluded.image_url,
    is_active = excluded.is_active,
    updated_at = now();

insert into daily_discounts (discount_date, percent, is_active, notes)
values
  (current_date, 10, true, 'Diskon demo persen')
on conflict (discount_date) do update
set percent = excluded.percent,
    is_active = excluded.is_active,
    notes = excluded.notes,
    updated_at = now();

-- Selesai. Setelah Run, cek Table Editor:
-- products, daily_discounts, transactions, transaction_items, stock_history.
