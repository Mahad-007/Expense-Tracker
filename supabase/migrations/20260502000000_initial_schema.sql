-- ============================================
-- Expense Tracker for Cognitix - Initial Schema
-- ============================================

-- 1. ACCOUNTS TABLE
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('local', 'processing')),
  currency text not null default 'PKR' check (currency in ('PKR', 'USD')),
  initial_balance numeric(15,2) not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- 2. CATEGORIES TABLE
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  type text not null check (type in ('income', 'expense')),
  created_at timestamptz not null default now()
);

-- 3. TRANSACTIONS TABLE
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.accounts(id) on delete cascade,
  category_id uuid references public.categories(id),
  type text not null check (type in ('income', 'expense')),
  amount numeric(15,2) not null check (amount > 0),
  currency text not null default 'PKR',
  description text,
  recurrence text not null default 'one-time' check (recurrence in ('one-time', 'recurring')),
  date date not null default current_date,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- 4. TRANSFERS TABLE
create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  from_account_id uuid not null references public.accounts(id) on delete cascade,
  to_account_id uuid not null references public.accounts(id) on delete cascade,
  amount_from numeric(15,2) not null check (amount_from > 0),
  amount_to numeric(15,2) not null check (amount_to > 0),
  exchange_rate numeric(10,4),
  description text,
  date date not null default current_date,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

-- 5. ACCOUNT BALANCES VIEW
create or replace view public.account_balances as
select
  a.id,
  a.name,
  a.type,
  a.currency,
  a.initial_balance,
  a.created_at,
  a.created_by,
  a.initial_balance + coalesce(
    (select sum(case when t.type = 'income' then t.amount else -t.amount end)
     from public.transactions t where t.account_id = a.id),
    0
  ) as balance
from public.accounts a;

-- 6. TRANSFER TRIGGER FUNCTION
create or replace function public.handle_transfer()
returns trigger as $$
begin
  -- Deduct from source account
  insert into public.transactions (account_id, type, amount, currency, description, date, created_by)
  values (
    NEW.from_account_id,
    'expense',
    NEW.amount_from,
    (select currency from public.accounts where id = NEW.from_account_id),
    'Transfer out: ' || coalesce(NEW.description, ''),
    NEW.date,
    NEW.created_by
  );
  -- Add to destination account
  insert into public.transactions (account_id, type, amount, currency, description, date, created_by)
  values (
    NEW.to_account_id,
    'income',
    NEW.amount_to,
    (select currency from public.accounts where id = NEW.to_account_id),
    'Transfer in: ' || coalesce(NEW.description, ''),
    NEW.date,
    NEW.created_by
  );
  return NEW;
end;
$$ language plpgsql security definer;

create trigger on_transfer_created
  after insert on public.transfers
  for each row execute function public.handle_transfer();

-- 7. ROW LEVEL SECURITY
alter table public.accounts enable row level security;
create policy "Authenticated users full access on accounts"
  on public.accounts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table public.categories enable row level security;
create policy "Authenticated users full access on categories"
  on public.categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table public.transactions enable row level security;
create policy "Authenticated users full access on transactions"
  on public.transactions for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

alter table public.transfers enable row level security;
create policy "Authenticated users full access on transfers"
  on public.transfers for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 8. SEED CATEGORIES
insert into public.categories (name, type) values
  ('Salary', 'income'),
  ('Freelance', 'income'),
  ('Other Income', 'income'),
  ('Food', 'expense'),
  ('Transport', 'expense'),
  ('Rent', 'expense'),
  ('Utilities', 'expense'),
  ('Internet', 'expense'),
  ('Subscriptions', 'expense'),
  ('Office Supplies', 'expense'),
  ('Other Expense', 'expense');
