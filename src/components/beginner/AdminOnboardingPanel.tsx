import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Deposit, Plan, STAGES, STAGE_LABELS, Stage, computeStreak, formatDateNl } from '../../lib/onboarding';

interface Row {
  id: string;
  onboarding_stage: Stage;
  wallet_model: string | null;
  wallet_ordered_at: string | null;
  wallet_received_at: string | null;
  first_bitcoin_at: string | null;
  plan: Plan | null;
  monthly_active: boolean;
  monthly_day: number | null;
}

const inputCls = 'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';

export default function AdminOnboardingPanel({ email }: { email: string }) {
  const [row, setRow] = useState<Row | null>(null);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [stage, setStage] = useState<Stage>('aangemeld');
  const [strategy, setStrategy] = useState('');
  const [amount, setAmount] = useState('');
  const [years, setYears] = useState('');
  const [goal, setGoal] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const [acc, dep] = await Promise.all([
      supabase
        .from('accounts')
        .select('id,onboarding_stage,wallet_model,wallet_ordered_at,wallet_received_at,first_bitcoin_at,plan,monthly_active,monthly_day')
        .eq('email', email)
        .maybeSingle(),
      supabase.from('monthly_deposits').select('month,source').eq('email', email),
    ]);
    const r = acc.data as Row | null;
    setRow(r);
    setDeposits(((dep.data as Deposit[]) ?? []));
    if (r) {
      setStage(r.onboarding_stage);
      setStrategy(r.plan?.strategy ?? '');
      setAmount(r.plan?.monthly_amount != null ? String(r.plan.monthly_amount) : '');
      setYears(r.plan?.years != null ? String(r.plan.years) : '');
      setGoal(r.plan?.goal_btc != null ? String(r.plan.goal_btc) : '');
    }
  }, [email]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (patch: Record<string, unknown>, ok: string) => {
    if (!row) return;
    setBusy(true);
    setMsg('');
    const { error } = await supabase.from('accounts').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', row.id);
    setBusy(false);
    if (error) setMsg(`Opslaan mislukt: ${error.message}`);
    else {
      setMsg(ok);
      await load();
    }
  };

  const savePlan = () =>
    save(
      {
        plan: {
          ...(row?.plan ?? {}),
          strategy: strategy.trim() || undefined,
          monthly_amount: amount ? Number(amount) : undefined,
          years: years ? Number(years) : undefined,
          goal_btc: goal ? Number(goal.replace(',', '.')) : undefined,
          set_by: strategy.trim() || amount || years || goal ? 'admin' : undefined,
        },
      },
      'Plan opgeslagen. De gebruiker ziet het zodra de eerste satoshi binnen is.'
    );

  if (!row) return <p className="text-sm text-gray-500">Account laden…</p>;

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="text-lg font-bold text-gray-900">Fase van de gebruiker</h4>
        <p className="mt-1 text-sm text-gray-500">
          De fase schuift normaal vanzelf door. Gebruik dit alleen om iets recht te zetten wanneer het blijft hangen.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <label htmlFor="adm-stage" className="mb-1 block text-xs font-bold text-gray-700">Huidige fase</label>
            <select id="adm-stage" className={inputCls} value={stage} onChange={(e) => setStage(e.target.value as Stage)}>
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <button
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-40"
            disabled={busy || stage === row.onboarding_stage}
            onClick={() => save({ onboarding_stage: stage }, 'Fase aangepast.')}
          >
            Fase opslaan
          </button>
        </div>
        <dl className="mt-5 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Wallet-model</dt><dd className="font-semibold">{row.wallet_model || '–'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Besteld op</dt><dd className="font-semibold">{formatDateNl(row.wallet_ordered_at) || '–'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Ontvangen op</dt><dd className="font-semibold">{formatDateNl(row.wallet_received_at) || '–'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Eerste satoshi</dt><dd className="font-semibold">{formatDateNl(row.first_bitcoin_at) || '–'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Maandelijkse storting</dt><dd className="font-semibold">{row.monthly_active ? `Aan, op de ${row.monthly_day}e` : 'Uit'}</dd></div>
          <div className="flex justify-between gap-3"><dt className="text-gray-500">Reeks</dt><dd className="font-semibold">{computeStreak(deposits)} maanden ({deposits.length} stortingen)</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h4 className="text-lg font-bold text-gray-900">Plan van de klant</h4>
        <p className="mt-1 text-sm text-gray-500">Vul dit in tijdens het eerste gesprek. De gebruiker ziet het pas zodra de eerste satoshi binnen is.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="adm-strategy" className="mb-1 block text-xs font-bold text-gray-700">Strategie</label>
            <input id="adm-strategy" className={inputCls} value={strategy} placeholder="Lange termijn DCA" onChange={(e) => setStrategy(e.target.value)} />
          </div>
          <div>
            <label htmlFor="adm-amount" className="mb-1 block text-xs font-bold text-gray-700">Maandbedrag (€)</label>
            <input id="adm-amount" className={inputCls} type="number" min={5} step={5} value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div>
            <label htmlFor="adm-years" className="mb-1 block text-xs font-bold text-gray-700">Looptijd (jaren)</label>
            <input id="adm-years" className={inputCls} type="number" min={1} max={40} value={years} onChange={(e) => setYears(e.target.value)} />
          </div>
          <div>
            <label htmlFor="adm-goal" className="mb-1 block text-xs font-bold text-gray-700">Doel (BTC)</label>
            <input id="adm-goal" className={inputCls} inputMode="decimal" value={goal} placeholder="0,05" onChange={(e) => setGoal(e.target.value)} />
          </div>
        </div>
        <button className="mt-4 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-40" disabled={busy} onClick={savePlan}>
          Plan opslaan
        </button>
      </section>

      {msg && <p role="status" className="text-sm font-medium text-gray-700">{msg}</p>}
    </div>
  );
}
