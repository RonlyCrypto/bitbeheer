import { useEffect, useState } from 'react';
import { Lock } from 'lucide-react';
import {
  BADGES,
  Deposit,
  OnboardingAccount,
  Plan,
  WalletRow,
  buildTiles,
  computeStreak,
  fearGreedLabel,
  hasDepositThisMonth,
  levelFor,
} from '../../lib/onboarding';
import type { PriceRow } from '../../hooks/useOnboarding';

const cardCls = 'rounded-2xl border border-gray-200 bg-white p-4 sm:p-5';
const h4Cls = 'mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500';
const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';
const ctaCls =
  'rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40';
const linkCls = 'text-sm font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700';

const eur = (n: number) => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: n < 100 ? 2 : 0 }).format(n);
const btc = (n: number) => n.toLocaleString('nl-NL', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
const short = (a: string) => (a.length > 16 ? `${a.slice(0, 8)}…${a.slice(-6)}` : a);

function Progress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full border border-gray-200 bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700" style={{ width: `${Math.max(2, pct)}%` }} />
    </div>
  );
}

export function BitcoinCard({ wallet, price, waiting }: { wallet: WalletRow | null; price: PriceRow | null; waiting?: boolean }) {
  const balance = Number(wallet?.balance ?? 0);
  const received = Number(wallet?.total_received ?? 0);
  const value = price?.price_eur ? balance * Number(price.price_eur) : null;
  return (
    <section className={cardCls}>
      <h3 className={h4Cls}>Jouw Bitcoin</h3>
      <div className="text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight text-gray-900">{value !== null ? eur(value) : '–'}</div>
      <p className="mt-1 text-sm text-gray-600">
        {waiting ? 'Je wallet is gekoppeld. Er staat nog geen Bitcoin op.' : `${btc(balance)} BTC in je eigen wallet`}
      </p>
      <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3 border-t border-gray-100 pt-4">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-gray-400">Saldo (BTC)</dt>
          <dd className="text-[15px] font-bold tabular-nums">{btc(balance)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-gray-400">Totaal ontvangen</dt>
          <dd className="text-[15px] font-bold tabular-nums">{btc(received)}</dd>
        </div>
      </dl>
      {wallet && (
        <p className="mt-4 border-t border-gray-100 pt-4 text-[13px] text-gray-600">
          Wallet: <b className="font-mono text-xs text-gray-900">{wallet.name || 'Ledger'}</b>
          <span className="mx-2 text-gray-300">|</span>
          Adres: <b className="font-mono text-xs text-gray-900">{short(wallet.address)}</b>
        </p>
      )}
      <p className="mt-4 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2.5 text-xs text-gray-600">
        <Lock className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
        Je seed code is van jou alleen. Deel hem nooit met iemand, ook niet met ons.
      </p>
    </section>
  );
}

export function MarketCard() {
  const [value, setValue] = useState<number | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('https://api.alternative.me/fng/?limit=1')
      .then((r) => r.json())
      .then((d) => alive && d?.data?.[0] && setValue(parseInt(d.data[0].value, 10)))
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);
  const label = value === null ? '' : fearGreedLabel(value);
  const sentence =
    value === null
      ? 'De marktstemming kan even niet worden opgehaald.'
      : value >= 56
      ? 'De markt is optimistisch. Geen reden voor haast: kleine, vaste bedragen werken beter dan inspringen op hype.'
      : value <= 44
      ? 'De markt is zenuwachtig. Dat hoort erbij. Een vast bedrag op een vast moment blijft het rustigste plan.'
      : 'De markt is rustig. Een goed moment om gewoon bij je plan te blijven.';
  return (
    <section className={cardCls}>
      <h3 className={h4Cls}>Markt vandaag</h3>
      <div className="mb-2 flex items-baseline gap-2">
        <b className="text-2xl tabular-nums">{value ?? '–'}</b>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className="relative my-2 h-2 rounded-full bg-gradient-to-r from-red-500 via-amber-400 to-green-500">
        {value !== null && <i className="absolute -top-1 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-gray-900 bg-white" style={{ left: `${value}%` }} />}
      </div>
      <div className="flex justify-between text-[11px] text-gray-400">
        <span>Angst</span>
        <span>Hebzucht</span>
      </div>
      <p className="mt-3 text-sm text-gray-600">{sentence}</p>
      <p className="mt-2 text-xs text-gray-400">Geen financieel advies.</p>
    </section>
  );
}

export function PlanCard({
  account,
  wallet,
  readOnly,
  onSave,
}: {
  account: OnboardingAccount;
  wallet: WalletRow | null;
  readOnly: boolean;
  onSave: (amount: number | null, years: number | null, goal: number | null) => Promise<void>;
}) {
  const plan: Plan = account.plan ?? {};
  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState(String(plan.monthly_amount ?? ''));
  const [years, setYears] = useState(String(plan.years ?? ''));
  const [goal, setGoal] = useState(String(plan.goal_btc ?? ''));
  const [error, setError] = useState('');
  const balance = Number(wallet?.balance ?? 0);
  const pct = plan.goal_btc ? Math.min(100, Math.round((balance / plan.goal_btc) * 100)) : null;

  const save = async () => {
    setError('');
    try {
      await onSave(amount ? Number(amount) : null, years ? Number(years) : null, goal ? Number(goal.replace(',', '.')) : null);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || 'Opslaan lukte niet.');
    }
  };

  const rows: [string, string][] = [
    ['Strategie', plan.strategy || 'Lange termijn DCA'],
    ['Maandbedrag', plan.monthly_amount ? `€${plan.monthly_amount}` : 'Nog niet ingevuld'],
    ['Looptijd', plan.years ? `${plan.years} jaar` : 'Nog niet ingevuld'],
    ['Doel', plan.goal_btc ? `${plan.goal_btc.toLocaleString('nl-NL')} BTC` : 'Nog niet ingevuld'],
  ];

  return (
    <section className={cardCls}>
      <h3 className={h4Cls}>
        Mijn plan <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] normal-case tracking-normal text-gray-500">Ingevuld in je kennismakingsgesprek</span>
      </h3>
      {pct !== null && (
        <>
          <Progress pct={pct} label="Voortgang naar je doel" />
          <div className="mt-1.5 flex justify-between gap-2 text-xs text-gray-600">
            <span>{btc(balance)} van {plan.goal_btc?.toLocaleString('nl-NL')} BTC</span>
            <b>{pct}%</b>
          </div>
        </>
      )}
      {!editing ? (
        <>
          <dl className="mt-4 grid gap-x-8 gap-y-2.5 text-sm sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3">
                <dt className="text-gray-500">{k}</dt>
                <dd className="font-bold text-gray-900">{v}</dd>
              </div>
            ))}
          </dl>
          {!readOnly && (
            <button className={`${linkCls} mt-4`} onClick={() => setEditing(true)}>Mijn plan aanpassen</button>
          )}
        </>
      ) : (
        <div className="mt-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="plan-amount" className="mb-1 block text-xs font-bold text-gray-900">Maandbedrag (€)</label>
              <input id="plan-amount" className={inputCls} type="number" min={5} step={5} value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
            <div>
              <label htmlFor="plan-years" className="mb-1 block text-xs font-bold text-gray-900">Looptijd (jaren)</label>
              <input id="plan-years" className={inputCls} type="number" min={1} max={40} value={years} onChange={(e) => setYears(e.target.value)} />
            </div>
            <div>
              <label htmlFor="plan-goal" className="mb-1 block text-xs font-bold text-gray-900">Doel (BTC)</label>
              <input id="plan-goal" className={inputCls} inputMode="decimal" value={goal} onChange={(e) => setGoal(e.target.value)} />
            </div>
          </div>
          {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
          <div className="mt-4 flex items-center gap-5">
            <button className={ctaCls} onClick={save}>Opslaan</button>
            <button className={linkCls} onClick={() => setEditing(false)}>Annuleren</button>
          </div>
        </div>
      )}
    </section>
  );
}

export function ActivateMonthlyCard({
  account,
  readOnly,
  onActivate,
  pushSlot,
}: {
  account: OnboardingAccount;
  readOnly: boolean;
  onActivate: (amount: number, day: number, app: boolean, mail: boolean) => Promise<void>;
  pushSlot?: React.ReactNode;
}) {
  const [amount, setAmount] = useState(String(account.plan?.monthly_amount ?? 50));
  const [day, setDay] = useState(account.monthly_day ?? 1);
  const [app, setApp] = useState(true);
  const [mail, setMail] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const amountNum = Number(amount);

  const go = async () => {
    setBusy(true);
    setError('');
    try {
      await onActivate(amountNum, day, app, mail);
    } catch (e: any) {
      setError(e.message || 'Activeren lukte niet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cardCls}>
      <h3 className={h4Cls}>🔥 Maandelijkse storting</h3>
      <p className="text-sm text-gray-600">
        Elke maand een vast bedrag bouwt rustig op. Zet herinneringen aan en bouw een reeks op: dat houdt het leuk én vol te houden.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="m-amount" className="mb-1 block text-xs font-bold text-gray-900">Bedrag per maand (€)</label>
          <input id="m-amount" className={inputCls} type="number" min={5} step={5} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <div>
          <label htmlFor="m-day" className="mb-1 block text-xs font-bold text-gray-900">Wanneer herinneren?</label>
          <select id="m-day" className={inputCls} value={day} onChange={(e) => setDay(Number(e.target.value))}>
            {[1, 5, 10, 15, 20, 25].map((d) => (
              <option key={d} value={d}>Op de {d}e</option>
            ))}
          </select>
        </div>
      </div>
      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-orange-600" checked={app} onChange={(e) => setApp(e.target.checked)} /> Herinner me in de app</label>
      <label className="mt-2 flex cursor-pointer items-center gap-2.5 text-sm"><input type="checkbox" className="h-4 w-4 accent-orange-600" checked={mail} onChange={(e) => setMail(e.target.checked)} /> Stuur ook een e-mail</label>
      {pushSlot}
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[['🔥', 'Reeks'], ['🏅', 'Badges'], ['🆙', 'Niveaus'], ['🃏', '1 joker per jaar']].map(([e, t]) => (
          <div key={t} className="rounded-xl bg-gray-50 p-2.5 text-center text-xs text-gray-600">
            <b className="block text-xl">{e}</b>
            {t}
          </div>
        ))}
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-red-600">{error}</p>}
      <div className="mt-4">
        <button className={ctaCls} disabled={readOnly || busy || !(amountNum >= 5)} onClick={go}>
          {busy ? 'Bezig…' : 'Activeer en start mijn reeks'}
        </button>
      </div>
    </section>
  );
}

export function StreakCard({
  account,
  deposits,
  readOnly,
  onJoker,
  onPause,
  pushSlot,
}: {
  account: OnboardingAccount;
  deposits: Deposit[];
  readOnly: boolean;
  onJoker: () => Promise<void>;
  onPause: () => Promise<void>;
  pushSlot?: React.ReactNode;
}) {
  const streak = computeStreak(deposits);
  const level = levelFor(streak);
  const tiles = buildTiles(deposits, account.monthly_started_on);
  const thisYear = new Date().getFullYear();
  const jokerUsed = deposits.some((d) => d.source === 'joker' && d.month.startsWith(String(thisYear)));
  const doneThisMonth = hasDepositThisMonth(deposits);
  const pct = level.to ? Math.round(((streak - level.from) / (level.to - level.from)) * 100) : 100;
  const toNext = level.to ? level.to - streak : 0;
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const joker = async () => {
    setBusy(true);
    setError('');
    try {
      await onJoker();
    } catch (e: any) {
      setError(e.message || 'Joker inzetten lukte niet.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={cardCls}>
      <h3 className={h4Cls}>Jouw reeks</h3>
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="grid h-16 w-16 flex-shrink-0 place-items-center rounded-full border-2 border-orange-300 bg-gradient-to-b from-amber-50 to-orange-50 text-center leading-none sm:h-20 sm:w-20">
          <div>
            <b className="block text-2xl tabular-nums sm:text-3xl">{streak}</b>
            <small className="text-[10px] text-gray-500">maanden</small>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-base font-extrabold sm:text-lg">Niveau: {level.name}</div>
          <p className="mb-2 text-sm text-gray-600">{level.next ? `Nog ${toNext} ${toNext === 1 ? 'maand' : 'maanden'} tot ${level.next}` : 'Hoogste niveau bereikt'}</p>
          <Progress pct={pct} label="Voortgang naar het volgende niveau" />
        </div>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-1 sm:mt-4 sm:grid-cols-12 sm:gap-1.5" aria-label="Jouw eerste twaalf maanden">
        {tiles.map((t, i) => (
          <div
            key={i}
            title={t.joker ? 'Joker ingezet' : undefined}
            className={`grid aspect-[5/4] place-items-center rounded-lg border text-[10px] leading-tight sm:aspect-square sm:text-[11px] ${
              t.state === 'done'
                ? 'border-green-300 bg-green-50 font-bold text-green-700'
                : t.state === 'now'
                ? 'border-2 border-orange-500 font-bold text-orange-600'
                : 'border-gray-200 bg-gray-50 text-gray-400'
            }`}
          >
            {t.state === 'done' ? (t.joker ? '🃏' : '✓') : t.label}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-1.5 sm:mt-4 sm:gap-2">
        {BADGES.map((b) => {
          const on = b.id === 'first' ? true : streak >= b.need;
          return (
            <div key={b.id} className={`rounded-xl border p-2 text-center text-xs sm:p-2.5 ${on ? 'border-amber-300 bg-amber-50 text-amber-700' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
              <b className={`block text-xl sm:text-2xl ${on ? '' : 'opacity-40 grayscale'}`}>{b.emoji}</b>
              <span className={`block text-[10.5px] font-bold leading-tight sm:text-[12.5px] ${on ? 'text-gray-900' : 'text-gray-500'}`}>{b.label}</span>
              <span className="hidden sm:block">{on ? 'Behaald' : 'Nog niet'}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600 sm:mt-4 sm:py-2.5 sm:text-[13px]">
        🃏 <b>{jokerUsed ? 'Joker voor dit jaar gebruikt.' : 'Joker beschikbaar.'}</b>{' '}
        {jokerUsed ? 'Volgend jaar krijg je er weer één.' : <><span className="sm:hidden">Sla één maand per jaar over zonder je reeks te verliezen.</span><span className="hidden sm:inline">Sla één maand per jaar over zonder je reeks te verliezen. Geen reden om jezelf onder druk te zetten.</span></>}
        {!jokerUsed && !doneThisMonth && !readOnly && (
          <button className={`${linkCls} ml-2`} onClick={joker} disabled={busy}>Nu inzetten</button>
        )}
        {error && <span role="alert" className="ml-2 font-medium text-red-600">{error}</span>}
      </div>
      {pushSlot}
      {account.monthly_active && !readOnly && (
        <button className="mt-3 text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600" onClick={onPause}>Herinneringen uitzetten</button>
      )}
    </section>
  );
}
