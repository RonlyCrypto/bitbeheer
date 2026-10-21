-- Onboarding-fases, maandelijkse reeks, pushmeldingen en geplande taken.
-- Dit staat al op de database (toegepast via Supabase); hier bewaard als documentatie.
-- Geheimen (VAPID-sleutels, cron-geheim) staan in public.app_secrets en horen niet in git.

-- 1. Onboarding-velden op accounts
alter table public.accounts
  add column if not exists onboarding_stage text not null default 'aangemeld'
    check (onboarding_stage in ('aangemeld','gesprek_gehad','pending','wallet_gekoppeld','eerste_bitcoin','reeks_actief')),
  add column if not exists wallet_model text,
  add column if not exists wallet_ordered_at date,
  add column if not exists wallet_received_at date,
  add column if not exists wallet_seal_ok boolean,
  add column if not exists first_bitcoin_at timestamptz,
  add column if not exists plan jsonb,
  add column if not exists monthly_active boolean not null default false,
  add column if not exists monthly_day int check (monthly_day between 1 and 28),
  add column if not exists remind_app boolean not null default true,
  add column if not exists remind_mail boolean not null default true,
  add column if not exists monthly_started_on date,
  add column if not exists last_reminder_at timestamptz;

-- 2. Bestaande accounts naar de juiste fase zetten
update public.accounts a set onboarding_stage = case
  when a.is_admin then 'aangemeld'
  when exists (select 1 from public.wallets w where lower(w.email)=lower(a.email) and (w.transaction_count > 0 or w.total_received > 0)) then 'eerste_bitcoin'
  when exists (select 1 from public.wallets w where lower(w.email)=lower(a.email)) then 'wallet_gekoppeld'
  when a.first_appointment_completed then 'gesprek_gehad'
  else 'aangemeld' end;

-- 3. Eerste afspraak op akkoord => vanzelf naar stap 2
create or replace function public.accounts_stage_on_first_appointment() returns trigger
language plpgsql as $$
begin
  if new.first_appointment_completed and not coalesce(old.first_appointment_completed,false) and new.onboarding_stage = 'aangemeld' then
    new.onboarding_stage := 'gesprek_gehad';
  end if;
  return new;
end $$;
drop trigger if exists trg_accounts_stage_on_first_appointment on public.accounts;
create trigger trg_accounts_stage_on_first_appointment before update on public.accounts
  for each row execute function public.accounts_stage_on_first_appointment();

-- 4. Maandelijkse stortingen (reeks)
create table if not exists public.monthly_deposits (
  id uuid primary key default gen_random_uuid(),
  email varchar not null,
  month date not null,
  source text not null default 'auto' check (source in ('auto','joker')),
  txid text,
  amount_btc numeric,
  created_at timestamptz not null default now(),
  unique (email, month)
);
alter table public.monthly_deposits enable row level security;
create policy "Users read own deposits" on public.monthly_deposits for select
  using (lower(email) = lower(auth.jwt() ->> 'email') or (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl');

-- 5. Pushmeldingen
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email varchar not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;
create policy "Users manage own push subscriptions" on public.push_subscriptions for all
  using (lower(email) = lower(auth.jwt() ->> 'email'))
  with check (lower(email) = lower(auth.jwt() ->> 'email'));

-- 6. Geheimen voor de server-functies (geen policies = alleen service role)
create table if not exists public.app_secrets (key text primary key, value text not null);
alter table public.app_secrets enable row level security;

-- 7. Helper: eigen account
create or replace function public._my_account() returns public.accounts
language sql stable security definer set search_path = public as $$
  select * from public.accounts where lower(email) = lower(auth.jwt() ->> 'email') limit 1
$$;

-- 8. Stap 2 -> pending: model + besteldatum
create or replace function public.submit_wallet_order(p_model text, p_ordered_at date) returns void
language plpgsql security definer set search_path = public as $$
declare a public.accounts;
begin
  a := public._my_account();
  if a.id is null then raise exception 'Geen account gevonden'; end if;
  if a.onboarding_stage <> 'gesprek_gehad' then raise exception 'Deze stap is al gedaan'; end if;
  if p_model is null or length(trim(p_model)) not between 2 and 60 then raise exception 'Kies een model'; end if;
  if p_ordered_at is null or p_ordered_at > current_date or p_ordered_at < current_date - 120 then raise exception 'Controleer de besteldatum'; end if;
  update public.accounts set wallet_model = trim(p_model), wallet_ordered_at = p_ordered_at,
    onboarding_stage = 'pending', updated_at = now() where id = a.id;
  insert into public.support_messages (email, body, from_admin, user_name)
  values (a.email, '🛒 ' || coalesce(a.first_name, a.name, a.email) || ' heeft een ' || trim(p_model) || ' besteld op ' || to_char(p_ordered_at, 'DD-MM-YYYY') || '.', false, coalesce(a.name, a.email));
end $$;

-- 9. Pending -> wallet gekoppeld: ontvangst + adres
create or replace function public.confirm_wallet_receipt(p_received_at date, p_seal_ok boolean, p_address text) returns void
language plpgsql security definer set search_path = public as $$
declare a public.accounts; addr text;
begin
  a := public._my_account();
  if a.id is null then raise exception 'Geen account gevonden'; end if;
  if a.onboarding_stage <> 'pending' then raise exception 'Deze stap is al gedaan'; end if;
  if p_seal_ok is distinct from true then raise exception 'Gebruik de wallet niet en neem contact met ons op'; end if;
  if p_received_at is null or p_received_at > current_date then raise exception 'Controleer de ontvangstdatum'; end if;
  addr := trim(coalesce(p_address, ''));
  if addr !~ '^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$' then raise exception 'Dit is geen geldig Bitcoin-adres'; end if;
  if exists (select 1 from public.wallets where lower(email) = lower(a.email)) then
    update public.wallets set address = addr, name = coalesce(a.wallet_model, 'Ledger'), updated_at = now() where lower(email) = lower(a.email);
  else
    insert into public.wallets (email, address, name, type) values (a.email, addr, coalesce(a.wallet_model, 'Ledger'), 'bitcoin');
  end if;
  update public.accounts set wallet_received_at = p_received_at, wallet_seal_ok = true,
    onboarding_stage = 'wallet_gekoppeld', updated_at = now() where id = a.id;
  insert into public.support_messages (email, body, from_admin, user_name)
  values (a.email, '📦 ' || coalesce(a.first_name, a.name, a.email) || ' heeft de wallet ontvangen (' || to_char(p_received_at, 'DD-MM-YYYY') || ', verpakking ok) en het adres gekoppeld.', false, coalesce(a.name, a.email));
end $$;

-- 10. Maandelijkse storting aan/uit
create or replace function public.activate_monthly(p_amount numeric, p_day int, p_app boolean, p_mail boolean) returns void
language plpgsql security definer set search_path = public as $$
declare a public.accounts;
begin
  a := public._my_account();
  if a.id is null then raise exception 'Geen account gevonden'; end if;
  if a.onboarding_stage not in ('eerste_bitcoin','reeks_actief') then raise exception 'Nog niet beschikbaar'; end if;
  if p_amount is null or p_amount < 5 or p_amount > 100000 then raise exception 'Controleer het bedrag'; end if;
  if p_day is null or p_day not between 1 and 28 then raise exception 'Kies een dag tussen 1 en 28'; end if;
  update public.accounts set monthly_active = true, monthly_day = p_day, remind_app = coalesce(p_app, true), remind_mail = coalesce(p_mail, true),
    monthly_started_on = coalesce(monthly_started_on, current_date), onboarding_stage = 'reeks_actief',
    plan = coalesce(plan, '{}'::jsonb) || jsonb_build_object('monthly_amount', p_amount), updated_at = now()
  where id = a.id;
end $$;

create or replace function public.pause_monthly() returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.accounts set monthly_active = false, updated_at = now() where lower(email) = lower(auth.jwt() ->> 'email') and onboarding_stage = 'reeks_actief';
end $$;

-- 11. Plan aanpassen door de gebruiker
create or replace function public.update_my_plan(p_monthly_amount numeric, p_years int, p_goal_btc numeric) returns void
language plpgsql security definer set search_path = public as $$
declare a public.accounts;
begin
  a := public._my_account();
  if a.id is null or a.onboarding_stage not in ('eerste_bitcoin','reeks_actief') then raise exception 'Nog niet beschikbaar'; end if;
  update public.accounts set plan = coalesce(plan, '{}'::jsonb) || jsonb_strip_nulls(jsonb_build_object(
      'monthly_amount', p_monthly_amount, 'years', p_years, 'goal_btc', p_goal_btc)), updated_at = now() where id = a.id;
end $$;

-- 12. Joker: een maand overslaan (1 per kalenderjaar)
create or replace function public.use_joker() returns void
language plpgsql security definer set search_path = public as $$
declare a public.accounts; m date := date_trunc('month', current_date)::date;
begin
  a := public._my_account();
  if a.id is null or a.onboarding_stage <> 'reeks_actief' then raise exception 'Nog niet beschikbaar'; end if;
  if exists (select 1 from public.monthly_deposits where lower(email) = lower(a.email) and source = 'joker' and date_trunc('year', month) = date_trunc('year', current_date)) then
    raise exception 'Je joker voor dit jaar is al gebruikt';
  end if;
  insert into public.monthly_deposits (email, month, source) values (a.email, m, 'joker') on conflict (email, month) do nothing;
end $$;

grant execute on function public.submit_wallet_order(text, date), public.confirm_wallet_receipt(date, boolean, text),
  public.activate_monthly(numeric, int, boolean, boolean), public.pause_monthly(), public.update_my_plan(numeric, int, numeric), public.use_joker() to authenticated;
revoke execute on function public._my_account() from anon, authenticated, public;

-- 13. Configuratie voor de stap 'wallet bestellen' (door admin aan te passen)
insert into public.site_settings (key, value) values ('onboarding_config', jsonb_build_object(
  'ledger_url', 'https://shop.ledger.com/pages/referral-program?referral_code=K8AM3R24JY4FH',
  'models', jsonb_build_array(
    jsonb_build_object('id','Ledger Nano S Plus','note','Het basismodel'),
    jsonb_build_object('id','Ledger Nano X','note','Met Bluetooth, ook handig op je telefoon'),
    jsonb_build_object('id','Ledger Flex','note','Met groot touchscreen'),
    jsonb_build_object('id','Ledger Stax','note','Premium model met groot scherm'))))
on conflict (key) do nothing;

-- 14. Geplande taken (functie: supabase/functions/onboarding-cron)
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule('onboarding-wallets', '7 * * * *', $$
  select net.http_post(
    url := 'https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/onboarding-cron?task=wallets',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select value from public.app_secrets where key = 'cron_secret')),
    body := '{}'::jsonb, timeout_milliseconds := 60000) $$);

select cron.schedule('onboarding-reminders', '0 16 * * *', $$
  select net.http_post(
    url := 'https://clqbnkvnydlxtimiazqf.supabase.co/functions/v1/onboarding-cron?task=reminders',
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron-secret', (select value from public.app_secrets where key = 'cron_secret')),
    body := '{}'::jsonb, timeout_milliseconds := 60000) $$);
