import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import LoginRegister from '../components/LoginRegister';
import { createUser } from '../lib/supabase';
import { DirectEmailService } from '../services/directEmailService';
import { checkHoneypot, checkFormTiming, generateMathChallenge, verifyMathChallenge } from '../utils/botProtection';

const PREV_ATH = 69000; // Nov 2021 — historische referentie

function formatUsd(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

const CACHE_KEY = 'btc_market_cache';

function useLiveBtcData() {
  const cached = (() => {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
  })();

  const [price, setPrice] = useState<number | null>(cached?.price ?? null);
  const [change24h, setChange24h] = useState<number | null>(cached?.change24h ?? null);
  const [ath, setAth] = useState<number | null>(cached?.ath ?? null);
  const [athDate, setAthDate] = useState<string | null>(cached?.athDate ?? null);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin', {
      signal: AbortSignal.timeout(8000),
    })
      .then(r => r.json())
      .then(([d]) => {
        const formattedDate = d.ath_date
          ? new Date(d.ath_date).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })
          : null;
        setPrice(d.current_price);
        setChange24h(d.price_change_percentage_24h);
        setAth(d.ath);
        setAthDate(formattedDate);
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          price: d.current_price,
          change24h: d.price_change_percentage_24h,
          ath: d.ath,
          athDate: formattedDate,
          cachedAt: Date.now(),
        }));
      })
      .catch(() => {}); // cache is al geladen, geen actie nodig
  }, []);

  return { price, change24h, ath, athDate };
}

function MarktpositieMini({ price, ath, athDate }: { price: number; ath: number; athDate: string | null }) {
  const pctVanATH = (price / ath) * 100;
  const onderVorigATH = price < PREV_ATH;
  let balPos: number;
  if (price <= PREV_ATH) {
    balPos = (price / PREV_ATH) * 50;
  } else if (price <= ath) {
    balPos = 50 + ((price - PREV_ATH) / (ath - PREV_ATH)) * 35;
  } else {
    balPos = 85 + Math.min(((price - ath) / ath) * 15, 11);
  }
  balPos = Math.min(Math.max(balPos, 2), 96);

  let fase = 'Accumulatiefase';
  let faseKleur = 'green';
  let uitleg = 'Bitcoin zit onder de vorige ATH. Historisch gezien een goede koopperiode.';

  if (price > ath) {
    fase = 'Prijsontdekking'; faseKleur = 'red';
    uitleg = 'Bitcoin staat op een nieuw all-time high. Wees voorzichtig.';
  } else if (pctVanATH > 85) {
    fase = 'Hoog risico'; faseKleur = 'orange';
    uitleg = 'Bitcoin nadert het all-time high. Pas op voor hype.';
  } else if (price > PREV_ATH) {
    fase = 'Herstelfase'; faseKleur = 'yellow';
    uitleg = 'Bitcoin is boven de vorige ATH, maar nog onder het laatste record.';
  }

  const badge: Record<string, string> = {
    green:  'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red:    'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <span className="font-bold text-gray-900 text-sm">Marktpositie</span>
        <span className="ml-auto text-xs text-gray-400">Waar staat Bitcoin nu?</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
        {[
          { label: 'Vorige ATH', sub: 'Nov 2021', value: PREV_ATH, live: false },
          { label: 'Nu · Live', sub: `${pctVanATH.toFixed(0)}% van ATH`, value: price, live: true },
          { label: 'Hoogste ooit', sub: athDate ?? '', value: ath, live: false },
        ].sort((a, b) => a.value - b.value).map(item => (
          item.live ? (
            <div key="live" className="bg-orange-50 rounded-xl p-2.5 border border-orange-200">
              <div className="text-orange-600 font-medium mb-1">{item.label}</div>
              <div className="font-bold text-orange-600 text-base">{formatUsd(item.value)}</div>
              <div className="text-gray-400">{item.sub}</div>
            </div>
          ) : (
            <div key={item.label} className="bg-gray-50 rounded-xl p-2.5">
              <div className="text-gray-400 mb-1">{item.label}</div>
              <div className="font-bold text-gray-800">{formatUsd(item.value)}</div>
              <div className="text-gray-400">{item.sub}</div>
            </div>
          )
        ))}
      </div>

      <div className="mb-3">
        <div className="relative h-3 rounded-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #16a34a 0%, #22c55e 40%, #86efac 50%, #fbbf24 65%, #f97316 82%, #ef4444 100%)'
        }}>
          <div className="absolute top-0 bottom-0 flex items-center" style={{ left: `${balPos}%` }}>
            <div className="w-3.5 h-3.5 bg-white rounded-full border-2 border-gray-800 shadow -translate-x-1/2" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Accumulatie</span><span>Herstel</span><span>Hoog risico</span>
        </div>
      </div>

      <div className={`border rounded-xl p-3 ${badge[faseKleur]}`}>
        <div className="font-bold text-xs">✓ {fase}</div>
        <p className="text-xs mt-0.5">{uitleg}</p>
        {onderVorigATH && (
          <p className="text-xs mt-1 font-medium">
            {((1 - price / PREV_ATH) * 100).toFixed(1)}% onder de vorige ATH van {formatUsd(PREV_ATH)}
          </p>
        )}
        {!onderVorigATH && price < ath && (
          <p className="text-xs mt-1 font-medium">
            {((1 - price / ath) * 100).toFixed(1)}% onder het all-time high van {formatUsd(ath)}
          </p>
        )}
      </div>
    </div>
  );
}



export default function SoonOnlinePage() {
  const { price, change24h, ath, athDate } = useLiveBtcData();
  const isPositive = (change24h ?? 0) >= 0;

  // Form state
  const [quickEmail, setQuickEmail] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formStartTime] = useState(Date.now());
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [mathChallenge] = useState(() => Math.random() < 0.1 ? generateMathChallenge() : null);
  const [mathAnswer, setMathAnswer] = useState('');

  const submitForm = async (submittedEmail: string, submittedName: string, submittedMessage: string) => {
    if (!submittedEmail || !submittedEmail.includes('@')) {
      setErrorMsg('Vul een geldig e-mailadres in.');
      setStatus('error');
      return;
    }

    if (honeypotRef.current && checkHoneypot({ website: honeypotRef.current.value })) return;
    if (!checkFormTiming(formStartTime, 3000)) return;
    if (mathChallenge && !verifyMathChallenge(mathAnswer, mathChallenge.answer)) {
      setErrorMsg('Beveiligingsvraag onjuist beantwoord.');
      setStatus('error');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    try {
      await createUser({
        email: submittedEmail.trim().toLowerCase(),
        name: submittedName?.trim() || 'Niet opgegeven',
        message: submittedMessage?.trim() || 'Geen bericht',
        category: 'opening_website',
      });

      await DirectEmailService.sendNotificationRequest(
        submittedEmail.trim().toLowerCase(),
        submittedName?.trim() || 'Niet opgegeven',
        submittedMessage?.trim() || 'Geen bericht'
      ).catch(() => {});

      await DirectEmailService.sendNotificationConfirmation(
        submittedEmail.trim().toLowerCase(),
        submittedName?.trim() || 'Niet opgegeven'
      ).catch(() => {});

      setStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.includes('duplicate')) {
        setErrorMsg('Dit e-mailadres is al aangemeld.');
      } else {
        setErrorMsg('Er ging iets mis. Probeer het opnieuw.');
      }
      setStatus('error');
    }
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(quickEmail, '', '');
  };

  const handleFullSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm(email, name, message);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div>
          <div className="font-bold text-lg leading-tight">BitBeheer</div>
          <div className="text-orange-100 text-xs">Persoonlijke Bitcoin begeleiding</div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white bg-opacity-20 border border-white border-opacity-30 px-3 py-1.5 rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-white rounded-full inline-block animate-pulse" />
            Binnenkort live
          </div>
          <div className="[&>button]:bg-white [&>button]:text-orange-600 [&>button]:hover:bg-orange-50">
            <LoginRegister />
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-[90vh] flex items-center px-6 py-20" style={{
        background: 'radial-gradient(ellipse at 70% 30%, rgba(249,115,22,0.10) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(249,115,22,0.05) 0%, transparent 50%)'
      }}>
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-16 items-center">

          {/* Links */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full inline-block animate-pulse" />
              We zijn bijna klaar
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-gray-900 leading-tight mb-5">
              Binnenkort<br />
              <span className="text-orange-500">Online.</span>
            </h1>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-md">
              We werken hard aan de laatste details om je de beste Bitcoin begeleiding van Nederland te kunnen bieden.
              Persoonlijk, eerlijk en in eigen beheer.
            </p>

            {/* Checkpunten */}
            <div className="space-y-3 mb-8">
              {[
                '1-op-1 begeleiding voor Bitcoin beginners',
                'Bitcoin in eigen beheer via hardware wallet',
                'Slimme instapstrategie en marktanalyse',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-gray-700">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Snelle aanmelding */}
            {status === 'success' ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
                <div className="text-2xl mb-2">🎉</div>
                <p className="font-bold text-green-800">Aangemeld!</p>
                <p className="text-sm text-green-700 mt-1">We sturen je een bericht zodra we live zijn.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Meld je aan en wij laten je als eerste weten wanneer we live gaan:
                </p>
                <form onSubmit={handleQuickSubmit} className="flex flex-col sm:flex-row gap-3">
                  <input ref={honeypotRef as React.RefObject<HTMLInputElement>} type="text" name="website"
                    style={{ display: 'none' }} tabIndex={-1} autoComplete="off" aria-hidden="true" />
                  <input type="email" value={quickEmail} onChange={e => setQuickEmail(e.target.value)}
                    placeholder="jouw@email.nl"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm transition focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100" />
                  <button type="submit" disabled={status === 'loading'}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow-md flex items-center gap-2 whitespace-nowrap">
                    Houd me op de hoogte
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
                {status === 'error' && <p className="text-red-500 text-xs mt-2">{errorMsg}</p>}
                <p className="text-xs text-gray-400 mt-2">Geen spam. Alleen een berichtje als we live zijn.</p>
              </div>
            )}
          </div>

          {/* Rechts: live prijs + markt */}
          <div className="space-y-4">
            {/* Live prijs */}
            <div className="bg-gray-900 text-white rounded-2xl p-5 flex items-center gap-4 shadow-xl">
              <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0">₿</div>
              <div className="flex-1">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-0.5">Live Bitcoin prijs</div>
                <div className="text-2xl font-black">{price ? formatUsd(price) : 'Laden...'}</div>
              </div>
              {change24h !== null && (
                <div className={`text-sm font-semibold px-3 py-1.5 rounded-lg ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                  {isPositive ? '▲ +' : '▼ '}{Math.abs(change24h).toFixed(1)}%
                </div>
              )}
            </div>

            {/* Marktpositie */}
            {price && ath ? <MarktpositieMini price={price} ath={ath} athDate={athDate} /> : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-5 h-48 flex items-center justify-center text-gray-400 text-sm">
                Marktdata laden...
              </div>
            )}

            {/* Quote */}
            <div className="bg-gray-900 text-white rounded-2xl p-5">
              <p className="text-sm leading-relaxed italic">
                "Echte winners kopen als er <span className="text-orange-400 font-semibold">angst</span> is.
                De massa koopt pas als het al in het nieuws is, dan is het te laat."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">B</div>
                <span className="text-xs text-gray-400">BitBeheer</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">Jouw persoonlijk dashboard</span>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Alles wat je nodig hebt, op één plek</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Na aanmelding krijg je toegang tot je persoonlijk dashboard met live data, portfolio tracking en directe begeleiding.</p>
          </div>

          {/* Feature 1 — Portfolio */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Portfolio</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Jouw Bitcoin altijd in beeld</h3>
              <p className="text-gray-500 leading-relaxed mb-4">Koppel je wallet en zie direct hoeveel jouw Bitcoin waard is. Alle transacties worden automatisch gesynchroniseerd en overzichtelijk weergegeven.</p>
              <ul className="space-y-2">
                {['Live Bitcoin koers in euro', 'Automatische transactie sync', 'Totale waarde in één oogopslag'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 select-none">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Portfolio overzicht</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Live</span>
              </div>
              <div className="flex items-end gap-3 mb-5">
                <span className="text-4xl font-black text-gray-900">€14.820</span>
                <span className="text-green-600 text-sm font-semibold mb-1">+12,4%</span>
              </div>
              <div className="space-y-2 mb-4">
                {[
                  { name: 'Hardware wallet', btc: '0.1842 BTC', eur: '€11.340' },
                  { name: 'DCA wallet', btc: '0.0567 BTC', eur: '€3.480' },
                ].map(w => (
                  <div key={w.name} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-gray-700">{w.name}</div>
                      <div className="text-xs text-gray-400">{w.btc}</div>
                    </div>
                    <div className="text-sm font-bold text-gray-900">{w.eur}</div>
                  </div>
                ))}
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: '77%' }} />
              </div>
            </div>
          </div>

          {/* Feature 2 — Marktpositie */}
          <div className="grid md:grid-cols-2 gap-10 items-center mb-20">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 select-none order-2 md:order-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Marktpositie</span>
                <span className="text-xs text-gray-400">Waar staat Bitcoin nu?</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-gray-400 mb-1">Vorige ATH</div>
                  <div className="font-bold text-gray-800">$69.000</div>
                  <div className="text-gray-400">Nov 2021</div>
                </div>
                <div className="bg-orange-50 rounded-xl p-2.5 border border-orange-200">
                  <div className="text-orange-600 font-medium mb-1">Nu · Live</div>
                  <div className="font-bold text-orange-600 text-base">$66.445</div>
                  <div className="text-gray-400">96% van ATH</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2.5">
                  <div className="text-gray-400 mb-1">Hoogste ooit</div>
                  <div className="font-bold text-gray-800">$126.080</div>
                  <div className="text-gray-400">okt 2025</div>
                </div>
              </div>
              <div className="relative h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full mb-1">
                <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow" style={{ left: '76%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>Accumulatie</span><span>Herstel</span><span>Hoog risico</span>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-green-700 font-medium">
                ✓ Herstelfase — Bitcoin nadert het vorige ATH. Historisch gezien nog een interessante zone.
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Marktanalyse</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Weet altijd waar Bitcoin staat</h3>
              <p className="text-gray-500 leading-relaxed mb-4">Begrijp in één oogopslag of Bitcoin historisch hoog of laag staat. BitBeheer vertaalt de markt naar begrijpelijke taal — geen ruis, gewoon duidelijkheid.</p>
              <ul className="space-y-2">
                {['Live prijs vs. historische ATH', 'Duidelijke marktfase indicator', 'Persoonlijk advies van je begeleider'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 — Chat */}
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-4">Persoonlijke begeleiding</div>
              <h3 className="text-2xl font-black text-gray-900 mb-3">Altijd iemand om op terug te vallen</h3>
              <p className="text-gray-500 leading-relaxed mb-4">Via de ingebouwde chat heb je direct contact met je begeleider. Geen forums, geen chatbots — gewoon een eerlijk antwoord van een mens die Bitcoin begrijpt.</p>
              <ul className="space-y-2">
                {['Persoonlijke begeleider toegewezen', 'Directe chat in je dashboard', 'Reactie binnen 24 uur gegarandeerd'].map(t => (
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    </div>
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 select-none">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">BB</div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">BitBeheer begeleider</div>
                  <div className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span><span className="text-xs text-gray-400">Online</span></div>
                </div>
              </div>
              <div className="space-y-3 mb-3">
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">BB</div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 max-w-[75%]">Hoi! Is er iets waar ik je mee kan helpen? Geen vraag is te klein.</div>
                </div>
                <div className="flex gap-2 justify-end">
                  <div className="bg-orange-500 rounded-2xl rounded-tr-none px-3 py-2 text-xs text-white max-w-[75%]">Moet ik nu kopen of nog even wachten?</div>
                  <div className="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-xs font-bold flex-shrink-0">JJ</div>
                </div>
                <div className="flex gap-2">
                  <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">BB</div>
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3 py-2 text-xs text-gray-700 max-w-[75%]">Goede vraag. Bitcoin zit nu nog onder het vorige ATH — historisch een interessante zone. Laten we jouw situatie even doornemen.</div>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-400">Stel je vraag...</div>
                <div className="w-8 h-8 bg-orange-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-16">
            <Link to="/aanmelden" className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl">
              Meld je aan en krijg toegang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <p className="text-xs text-gray-400 mt-3">Gratis aanmelden · Geen creditcard nodig</p>
          </div>
        </div>
      </section>

      {/* WAT KOMT ER AAN */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Wat komt er aan?</h2>
            <p className="text-gray-600">Alles wat je nodig hebt om verstandig in Bitcoin te investeren</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { emoji: '🤝', color: 'bg-orange-100', title: '1-op-1 begeleiding', text: 'Persoonlijk gesprek zodat jij begrijpt wat je doet. Wij dragen kennis over, jij neemt zelf de beslissingen.' },
              { emoji: '🔐', color: 'bg-blue-100', title: 'Eigen beheer', text: 'Jij houdt je eigen keys. Bitcoin op een exchange is niet jouw Bitcoin. Wij helpen je een hardware wallet instellen.' },
              { emoji: '📈', color: 'bg-green-100', title: 'Slimme instapstrategie', text: 'Leer het juiste moment te herkennen. Rustig instappen, je inleg het werk laten doen en ontspannen achterover zitten.' },
            ].map(card => (
              <div key={card.title} className="group cursor-default">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-all duration-300 group-hover:-translate-y-2 group-hover:border-orange-300 group-hover:shadow-lg">
                  <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mb-4 text-2xl`}>{card.emoji}</div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UITGEBREID FORMULIER */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">✉️</div>
            <h2 className="text-3xl font-black text-gray-900 mb-3">Blijf op de hoogte</h2>
            <p className="text-gray-600">Laat je gegevens achter en we sturen je een bericht zodra we live gaan.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            {status === 'success' ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aanmelding ontvangen!</h3>
                <p className="text-gray-600">We sturen je een bericht zodra we live zijn.</p>
              </div>
            ) : (
              <form onSubmit={handleFullSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Naam <span className="text-gray-400 font-normal">(optioneel)</span>
                  </label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Jan Jansen"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mailadres *</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="jan@voorbeeld.nl" required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Extra bericht <span className="text-gray-400 font-normal">(optioneel)</span>
                  </label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)}
                    placeholder="Stel gerust een vraag..." rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition resize-none" />
                </div>

                {mathChallenge && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Beveiligingsvraag: {mathChallenge.question}
                    </label>
                    <input type="number" value={mathAnswer} onChange={e => setMathAnswer(e.target.value)}
                      placeholder="Jouw antwoord"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
                  </div>
                )}

                {status === 'error' && <p className="text-red-500 text-sm">{errorMsg}</p>}

                <button type="submit" disabled={status === 'loading'}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2">
                  {status === 'loading' ? 'Versturen...' : 'Houd me op de hoogte'}
                  {status !== 'loading' && <ArrowRight className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
                  <span>✓ Geen spam</span>
                  <span>✓ Gratis</span>
                  <span>✓ Je data is veilig</span>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-6 text-center text-sm">
        <p>© {new Date().getFullYear()} BitBeheer. Persoonlijke begeleiding bij het investeren in Bitcoin.</p>
        <p className="mt-1 text-xs text-gray-600">Deze site biedt educatieve informatie en geen financieel advies. Investeer verantwoord.</p>
      </footer>
    </div>
  );
}
