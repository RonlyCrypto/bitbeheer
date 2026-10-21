import { useState } from 'react';
import { AlertTriangle, Check, Copy, ExternalLink } from 'lucide-react';
import {
  Stage,
  daysLeftInMonth,
  formatDateNl,
  hasDepositThisMonth,
  isBtcAddress,
  stageIndex,
  toDateInput,
} from '../../lib/onboarding';
import type { useOnboarding } from '../../hooks/useOnboarding';

type Ob = ReturnType<typeof useOnboarding>;

interface Props {
  ob: Ob;
  readOnly: boolean;
  currencySymbol: string;
  onPlanAppointment: () => void;
  onOpenChat: () => void;
}

const STEPS = ['Gesprek', 'Wallet', 'Eerste Bitcoin'];
const STEP_OF_STAGE: Record<Stage, number> = {
  aangemeld: 0,
  gesprek_gehad: 1,
  pending: 1,
  wallet_gekoppeld: 2,
  eerste_bitcoin: 3,
  reeks_actief: 3,
};

const inputCls =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200';
const ctaCls =
  'rounded-xl bg-orange-600 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40';
const linkCls = 'text-sm font-semibold text-orange-600 underline underline-offset-2 hover:text-orange-700';

function Stepper({ stage }: { stage: Stage }) {
  const current = STEP_OF_STAGE[stage];
  const allDone = stageIndex(stage) >= stageIndex('eerste_bitcoin');
  return (
    <ol className="mb-4 flex items-center" aria-label="Voortgang">
      {STEPS.map((label, i) => {
        const done = allDone || i < current;
        const now = !allDone && i === current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <span className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border-2 text-xs font-bold ${
                  done ? 'border-green-600 bg-green-600 text-white' : now ? 'border-orange-600 text-orange-600' : 'border-gray-200 bg-white text-gray-400'
                }`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span className={`text-xs font-semibold ${done ? 'text-green-700' : now ? 'text-gray-900' : 'text-gray-400'} ${now ? '' : 'hidden sm:inline'}`}>
                {label}
              </span>
            </span>
            {i < STEPS.length - 1 && <span className={`mx-3 h-0.5 flex-1 ${done ? 'bg-green-600' : 'bg-gray-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}

function ErrorLine({ text }: { text: string }) {
  return text ? <p role="alert" className="mt-3 text-sm font-medium text-red-600">{text}</p> : null;
}

function Warning({ children, strong }: { children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={`mt-4 flex gap-2.5 rounded-xl border p-3 text-sm ${strong ? 'border-orange-400 bg-orange-50 text-orange-900' : 'border-amber-300 bg-amber-50 text-amber-900'}`}>
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function OrderForm({ ob, readOnly }: { ob: Ob; readOnly: boolean }) {
  const [model, setModel] = useState('');
  const [date, setDate] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const options = [...ob.config.models, { id: 'else', note: 'Neem dan eerst contact met ons op' }];
  const ok = model && model !== 'else' && date && !readOnly;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await ob.submitOrder(model, date);
    } catch (e: any) {
      setError(e.message || 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-6">
      <h4 className="text-sm font-bold text-gray-900">Heb je besteld? Welk model?</h4>
      <div className="mt-3 grid gap-2" role="radiogroup" aria-label="Welk model heb je besteld?">
        {options.map((o) => (
          <label
            key={o.id}
            className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm ${model === o.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-300'}`}
          >
            <input type="radio" name="model" className="mt-1 accent-orange-600" checked={model === o.id} onChange={() => setModel(o.id)} />
            <span>
              <span className="font-semibold text-gray-900">{o.id === 'else' ? 'Een ander merk of model' : o.id}</span>
              {o.note && <span className="block text-xs text-gray-500">{o.note}</span>}
            </span>
          </label>
        ))}
      </div>
      {model === 'else' && (
        <Warning strong>
          <b>Gebruik deze wallet nog niet.</b> Stuur ons eerst een bericht in de chat, dan kijken we of hij veilig is.
        </Warning>
      )}
      <div className="mt-4 max-w-xs">
        <label htmlFor="order-date" className="mb-1 block text-xs font-bold text-gray-900">Op welke datum heb je besteld?</label>
        <input id="order-date" type="date" className={inputCls} max={toDateInput()} value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <ErrorLine text={error} />
      <div className="mt-4">
        <button className={ctaCls} disabled={!ok || busy} onClick={submit}>
          {busy ? 'Bezig…' : 'Bestelling doorgeven'}
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">Na het doorgeven gaat dit scherm vanzelf naar de volgende stap. Wij krijgen een bericht.</p>
    </div>
  );
}

function ReceiptForm({ ob, readOnly }: { ob: Ob; readOnly: boolean }) {
  const [date, setDate] = useState('');
  const [seal, setSeal] = useState('');
  const [address, setAddress] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const valid = isBtcAddress(address);
  const ok = date && seal === 'ok' && valid && !readOnly;

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await ob.confirmReceipt(date, true, address.trim());
    } catch (e: any) {
      setError(e.message || 'Er ging iets mis. Probeer het opnieuw.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="recv-date" className="mb-1 block text-xs font-bold text-gray-900">Op welke datum heb je hem ontvangen?</label>
          <input id="recv-date" type="date" className={inputCls} max={toDateInput()} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label htmlFor="recv-seal" className="mb-1 block text-xs font-bold text-gray-900">Hoe was de verpakking?</label>
          <select id="recv-seal" className={inputCls} value={seal} onChange={(e) => setSeal(e.target.value)}>
            <option value="">Kies…</option>
            <option value="ok">Verzegeld en ongeopend</option>
            <option value="bad">Geopend of beschadigd</option>
          </select>
        </div>
      </div>
      {seal === 'bad' && (
        <Warning strong>
          <b>Gebruik deze wallet niet.</b> Neem direct contact met ons op via de chat.
        </Warning>
      )}
      <div className="mt-3">
        <label htmlFor="recv-addr" className="mb-1 block text-xs font-bold text-gray-900">Je ontvangstadres</label>
        <input
          id="recv-addr"
          type="text"
          className={`${inputCls} font-mono text-[13px]`}
          placeholder="bc1q…"
          autoComplete="off"
          spellCheck={false}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <p className={`mt-1.5 text-xs ${valid ? 'font-semibold text-green-700' : 'text-gray-500'}`}>
          {!address.trim() ? 'Je adres begint met bc1, 1 of 3.' : valid ? 'Adres ziet er goed uit.' : 'Dit lijkt nog geen geldig Bitcoin-adres. Plak het volledige adres.'}
        </p>
      </div>
      <ErrorLine text={error} />
      <div className="mt-4">
        <button className={ctaCls} disabled={!ok || busy} onClick={submit}>
          {busy ? 'Bezig…' : 'Ontvangst bevestigen en wallet koppelen'}
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Een ontvangstadres is openbaar en kan alleen Bitcoin ontvangen. Niemand kan er iets mee opnemen. Controleer het adres altijd op het scherm van je wallet zelf.
      </p>
    </div>
  );
}

function HowToDeposit({ address, amount, symbol }: { address?: string; amount?: number; symbol: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* klembord niet beschikbaar */
    }
  };
  return (
    <ol className="mt-3 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
      <li className="rounded-xl border border-gray-200 bg-white p-3"><b className="text-orange-600">1</b> Open je beurs-app, bijvoorbeeld Coinbase.</li>
      <li className="rounded-xl border border-gray-200 bg-white p-3"><b className="text-orange-600">2</b> Koop voor {amount ? `${symbol}${amount}` : 'je maandbedrag'} aan Bitcoin.</li>
      <li className="rounded-xl border border-gray-200 bg-white p-3">
        <b className="text-orange-600">3</b> Stuur hem naar je eigen wallet-adres.
        {address && (
          <button onClick={copy} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-orange-600">
            <Copy className="h-3.5 w-3.5" /> {copied ? 'Gekopieerd' : 'Kopieer mijn adres'}
          </button>
        )}
      </li>
    </ol>
  );
}

export default function StageHero({ ob, readOnly, currencySymbol, onPlanAppointment, onOpenChat }: Props) {
  const account = ob.account;
  const [showHow, setShowHow] = useState(false);
  if (!account) return null;
  const stage = account.onboarding_stage;
  const apt = ob.appointment;
  const aptText = apt ? `${formatDateNl(apt.date)}, ${apt.start_time.slice(0, 5)}` : '';
  const showStepper = stageIndex(stage) < stageIndex('eerste_bitcoin');
  const done = stage === 'eerste_bitcoin';
  const amount = account.plan?.monthly_amount ?? 50;
  const depositDone = hasDepositThisMonth(ob.deposits);

  let body: React.ReactNode = null;

  if (stage === 'aangemeld') {
    const pending = apt && apt.status === 'pending';
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Stap 1 van 3 · Kennismaken</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">{pending ? 'Je aanvraag is verstuurd' : 'Plan je kennismakingsgesprek'}</h3>
        <p className="mt-1.5 max-w-prose text-sm text-gray-600">
          {pending
            ? `We bevestigen je gesprek van ${aptText} zo snel mogelijk.`
            : 'In 20 minuten leggen we uit hoe Bitcoin kopen en bewaren werkt en beantwoorden we al je vragen. Vrijblijvend.'}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          {!pending && <button className={ctaCls} onClick={onPlanAppointment} disabled={readOnly}>Plan een gesprek</button>}
          <button className={linkCls} onClick={onOpenChat}>{pending ? 'Vragen? Chat met ons' : 'Of stel eerst een vraag in de chat'}</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Zodra we je afspraak bevestigen, gaat dit scherm vanzelf door naar de volgende stap.</p>
      </>
    );
  } else if (stage === 'gesprek_gehad') {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Stap 2 van 3 · Wallet bestellen</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Schaf je Ledger aan</h3>
        <p className="mt-1.5 max-w-prose text-sm text-gray-600">
          {apt ? <>Je gesprek is bevestigd voor <b>{aptText}</b>. </> : null}
          Een hardware wallet bewaart je Bitcoin offline en onder jouw eigen beheer. Wij raden alleen Ledger aan.
        </p>
        <ol className="mt-4 grid gap-2 text-sm text-gray-700 sm:grid-cols-3">
          <li className="rounded-xl border border-gray-200 bg-white p-3"><b className="text-orange-600">1</b> Ga naar Ledger.com via onze knop hieronder.</li>
          <li className="rounded-xl border border-gray-200 bg-white p-3"><b className="text-orange-600">2</b> Kies een model en bestel.</li>
          <li className="rounded-xl border border-gray-200 bg-white p-3"><b className="text-orange-600">3</b> Geef hier door welk model en wanneer je hebt besteld.</li>
        </ol>
        <Warning>
          <b>Bestel alleen via Ledger.com, met onze link.</b> Een wallet van een andere site of tweedehands kan gemanipuleerd zijn en je Bitcoin kosten.
        </Warning>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <a className={`${ctaCls} inline-flex items-center gap-2`} href={ob.config.ledger_url} target="_blank" rel="noopener noreferrer">
            Naar Ledger.com <ExternalLink className="h-4 w-4" />
          </a>
          <button className={linkCls} onClick={onOpenChat}>Twijfel je over het model? Chat met ons</button>
        </div>
        <OrderForm ob={ob} readOnly={readOnly} />
      </>
    );
  } else if (stage === 'pending') {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Stap 2 van 3 · Onderweg</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Je wallet is onderweg</h3>
        <div className="mt-3 rounded-xl border border-green-300 bg-white px-3 py-2 text-sm text-gray-600">
          ✓ <b className="text-gray-900">{account.wallet_model}</b> besteld op <b className="text-gray-900">{formatDateNl(account.wallet_ordered_at)}</b> bij Ledger.com
        </div>
        <p className="mt-3 max-w-prose text-sm text-gray-600">
          Zodra hij is bezorgd, bevestig je hieronder de ontvangst en plak je je ontvangstadres. Daarna gaan we samen verder met je eerste Bitcoin.
        </p>
        <ReceiptForm ob={ob} readOnly={readOnly} />
      </>
    );
  } else if (stage === 'wallet_gekoppeld') {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Stap 3 van 3 · Eerste Bitcoin</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Koop je eerste Bitcoin, met onze hulp</h3>
        <p className="mt-1.5 text-sm text-gray-600">Begin klein. We lopen deze drie dingen samen met je door, in jouw tempo.</p>
        <ul className="mt-4 grid gap-2 text-sm">
          {[
            ['Account maken bij een beurs', 'bijv. Coinbase'],
            ['Je eerste kleine aankoop doen', 'bijv. €25'],
            ['De Bitcoin naar je eigen wallet sturen', 'wij kijken mee'],
          ].map(([t, s], i) => (
            <li key={t} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
              <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">{i + 1}</span>
              <span className="flex-1 text-gray-900">{t}</span>
              <span className="text-xs text-gray-400">{s}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button className={ctaCls} onClick={onPlanAppointment} disabled={readOnly}>Plan een begeleid koopmoment</button>
          <button className={linkCls} onClick={onOpenChat}>Vragen? Chat met ons</button>
        </div>
        <p className="mt-3 text-xs text-gray-500">Zodra je eerste Bitcoin op je wallet staat, zien we dat vanzelf. Dan speel je de rest van je dashboard vrij.</p>
      </>
    );
  } else if (stage === 'eerste_bitcoin') {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-green-700">Gefeliciteerd</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Je eerste Bitcoin is binnen 🎉</h3>
        <p className="mt-1.5 max-w-prose text-sm text-gray-600">We zagen je aankoop op je wallet verschijnen. Je Bitcoin staat veilig in eigen beheer, en dit is vrijgespeeld:</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {['📈 Jouw resultaat', '🧭 Mijn plan', '🔥 Maandelijkse storting', '🌡 Markt vandaag'].map((t) => (
            <span key={t} className="rounded-full border border-green-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900">{t}</span>
          ))}
        </div>
      </>
    );
  } else if (!account.monthly_active) {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Maandelijkse storting</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Je herinneringen staan uit</h3>
        <p className="mt-1.5 text-sm text-gray-600">Je reeks wacht op je. Zet de maandelijkse storting weer aan wanneer je klaar bent.</p>
        <div className="mt-4">
          <button
            className={ctaCls}
            disabled={readOnly}
            onClick={() => ob.activateMonthly(amount, account.monthly_day ?? 1, account.remind_app, account.remind_mail)}
          >
            Weer aanzetten
          </button>
        </div>
      </>
    );
  } else if (depositDone) {
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-green-700">Deze maand</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Gelukt, je storting van deze maand is binnen 🎉</h3>
        <p className="mt-1.5 text-sm text-gray-600">Mooi volgehouden. Volgende maand zijn we er weer om je eraan te herinneren.</p>
      </>
    );
  } else {
    const left = daysLeftInMonth();
    body = (
      <>
        <div className="text-xs font-bold uppercase tracking-wider text-orange-600">Deze maand</div>
        <h3 className="mt-1 text-lg font-bold text-gray-900 sm:text-xl">Stort {currencySymbol}{amount} en houd je reeks vast</h3>
        <p className="mt-1.5 max-w-prose text-sm text-gray-600">
          {left === 0 ? 'Vandaag is de laatste dag van de maand. ' : `Nog ${left} ${left === 1 ? 'dag' : 'dagen'}. `}
          Zodra we je storting op je wallet zien, tellen we hem vanzelf mee.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
          <button className={ctaCls} onClick={() => setShowHow((v) => !v)} aria-expanded={showHow}>Zo stort ik</button>
          <button className={linkCls} onClick={onOpenChat}>Vragen? Chat met ons</button>
        </div>
        {showHow && <HowToDeposit address={ob.wallet?.address} amount={amount} symbol={currencySymbol} />}
      </>
    );
  }

  return (
    <section className={`rounded-2xl border p-4 sm:p-5 ${done || depositDone ? 'border-green-300 bg-gradient-to-b from-green-50 to-white' : 'border-orange-200 bg-gradient-to-b from-orange-50 to-white'}`}>
      {showStepper && <Stepper stage={stage} />}
      {body}
    </section>
  );
}
