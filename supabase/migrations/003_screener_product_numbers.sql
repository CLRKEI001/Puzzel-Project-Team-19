-- 003_screener_product_numbers.sql
--
-- Backs the "Product number" step of The Puzzle Box training.
-- Sponsor wireframe (TPB p6): to open the training a user needs their login
-- details PLUS the Product number assigned to each screener supplied.
-- Run this in Supabase Dashboard → SQL Editor (or via the Supabase CLI).
--
-- Design notes:
--   * `screener_products` is the list of valid Product numbers. Admins add one
--     row per screener supplied (Dashboard → Table Editor, or an INSERT).
--     RLS is ON with NO policies, so the browser (anon key) can never list or
--     read the numbers — it can only try one through redeem_product_number().
--   * `training_access` records which user has unlocked training and with
--     which number. Several people can use the same screener's number (e.g.
--     colleagues at one school); tighten that in the function below if each
--     number should only unlock a single account.
--   * The function is SECURITY DEFINER so it can read screener_products on the
--     caller's behalf. Like the rest of this project (see 002), users are
--     identified by their Firebase UID passed in from the client, not by
--     Supabase Auth — so this is a soft gate, not a hard security boundary.
--     Use long, random Product numbers so they can't be guessed.

create table if not exists screener_products (
  product_number text primary key,          -- stored upper-case, e.g. 'PB-7K3M-92QX'
  notes text,                               -- e.g. which school/kit it was issued to
  active boolean not null default true,     -- flip to false to revoke a number
  created_at timestamptz not null default now()
);

create table if not exists training_access (
  user_id text primary key,                 -- Firebase Auth UID (same as users.id)
  user_email text,
  product_number text not null references screener_products(product_number),
  redeemed_at timestamptz not null default now()
);

create index if not exists training_access_product_idx on training_access(product_number);

alter table screener_products enable row level security;   -- no policies: not readable from the browser
alter table training_access enable row level security;

-- The app checks "has this user already unlocked training?" with a plain select.
-- (Matches the permissive approach used for the other tables in this project.)
drop policy if exists "training_access read" on training_access;
create policy "training_access read" on training_access for select using (true);

create or replace function redeem_product_number(
  p_user_id text,
  p_email text,
  p_product_number text
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number text := upper(trim(p_product_number));
begin
  if coalesce(p_user_id, '') = '' or coalesce(v_number, '') = '' then
    return 'invalid';
  end if;

  if not exists (
    select 1 from screener_products where product_number = v_number and active
  ) then
    return 'invalid';
  end if;

  insert into training_access (user_id, user_email, product_number)
  values (p_user_id, p_email, v_number)
  on conflict (user_id) do update
    set product_number = excluded.product_number,
        user_email = excluded.user_email,
        redeemed_at = now();

  return 'ok';
end;
$$;

grant execute on function redeem_product_number(text, text, text) to anon, authenticated;
