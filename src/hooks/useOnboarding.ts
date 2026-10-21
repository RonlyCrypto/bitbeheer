import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import {
  DEFAULT_CONFIG,
  Deposit,
  JokerEvent,
  jokerStats,
  OnboardingAccount,
  OnboardingConfig,
  WalletRow,
} from '../lib/onboarding';

export interface PriceRow {
  price_eur: number | null;
  price_usd: number | null;
}

export interface AppointmentRow {
  date: string;
  start_time: string;
  status: string;
}

interface State {
  loading: boolean;
  account: OnboardingAccount | null;
  wallet: WalletRow | null;
  deposits: Deposit[];
  jokerEvents: JokerEvent[];
  config: OnboardingConfig;
  price: PriceRow | null;
  appointment: AppointmentRow | null;
}

const ACCOUNT_COLUMNS =
  'id,email,name,first_name,onboarding_stage,wallet_model,wallet_ordered_at,wallet_received_at,plan,monthly_active,monthly_day,remind_app,remind_mail,monthly_started_on,first_bitcoin_at,first_appointment_completed,account_approved';

export function useOnboarding(email: string | undefined) {
  const [state, setState] = useState<State>({
    loading: true,
    account: null,
    wallet: null,
    deposits: [],
    jokerEvents: [],
    config: DEFAULT_CONFIG,
    price: null,
    appointment: null,
  });
  const alive = useRef(true);

  const load = useCallback(async () => {
    if (!email) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    const [acc, wal, dep, jok, cfg, prc, apt] = await Promise.all([
      supabase.from('accounts').select(ACCOUNT_COLUMNS).eq('email', email).maybeSingle(),
      supabase.from('wallets').select('address,name,balance,total_received,total_investment,transaction_count').eq('email', email).maybeSingle(),
      supabase.from('monthly_deposits').select('month,source').eq('email', email).order('month', { ascending: false }),
      supabase.from('joker_events').select('kind,ref,year').eq('email', email),
      supabase.from('site_settings').select('value').eq('key', 'onboarding_config').maybeSingle(),
      supabase.from('bitcoin_price_data').select('price_eur,price_usd').not('price_eur', 'is', null).order('date', { ascending: false }).limit(1),
      supabase.from('appointments').select('date,start_time,status').eq('user_email', email).in('status', ['pending', 'confirmed']).order('date', { ascending: false }).limit(1),
    ]);
    if (!alive.current) return;
    setState({
      loading: false,
      account: (acc.data as OnboardingAccount) ?? null,
      wallet: (wal.data as WalletRow) ?? null,
      deposits: ((dep.data as Deposit[]) ?? []).map((d) => ({ month: d.month, source: d.source })),
      jokerEvents: (jok.data as JokerEvent[]) ?? [],
      config: { ...DEFAULT_CONFIG, ...((cfg.data?.value as Partial<OnboardingConfig>) ?? {}) },
      price: ((prc.data as PriceRow[]) ?? [])[0] ?? null,
      appointment: ((apt.data as AppointmentRow[]) ?? [])[0] ?? null,
    });
  }, [email]);

  useEffect(() => {
    alive.current = true;
    load();
    const onFocus = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onFocus);
    const t = setInterval(() => document.visibilityState === 'visible' && load(), 60000);
    return () => {
      alive.current = false;
      document.removeEventListener('visibilitychange', onFocus);
      clearInterval(t);
    };
  }, [load]);

  const rpc = useCallback(
    async (fn: string, args?: Record<string, unknown>) => {
      const { error } = await supabase.rpc(fn, args);
      if (error) throw new Error(error.message);
      await load();
    },
    [load]
  );

  const jokers = jokerStats(state.jokerEvents, state.deposits, !!state.account?.monthly_active);

  return {
    ...state,
    jokers,
    refresh: load,
    submitOrder: (model: string, orderedAt: string) => rpc('submit_wallet_order', { p_model: model, p_ordered_at: orderedAt }),
    confirmReceipt: (receivedAt: string, sealOk: boolean, address: string) =>
      rpc('confirm_wallet_receipt', { p_received_at: receivedAt, p_seal_ok: sealOk, p_address: address }),
    activateMonthly: (amount: number, day: number, app: boolean, mail: boolean) =>
      rpc('activate_monthly', { p_amount: amount, p_day: day, p_app: app, p_mail: mail }),
    pauseMonthly: () => rpc('pause_monthly'),
    spendJoker: () => rpc('use_joker'),
    updatePlan: (amount: number | null, years: number | null, goal: number | null) =>
      rpc('update_my_plan', { p_monthly_amount: amount, p_years: years, p_goal_btc: goal }),
  };
}
