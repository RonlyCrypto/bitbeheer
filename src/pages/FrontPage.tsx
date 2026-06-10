import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { bitcoinApiService } from '../services/bitcoinApiService';

const PREV_ATH = 69000;   // Nov 2021
const LAST_ATH = 126080;  // Okt 2025

function useLiveBtcPrice() {
  const [price, setPrice] = useState<number | null>(null);
  const [change24h, setChange24h] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPrice() {
      try {
        // Probeer live CoinGecko eerst
        const res = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true',
          { signal: AbortSignal.timeout(5000) }
        );
        const data = await res.json();
        setPrice(data.bitcoin.usd);
        setChange24h(data.bitcoin.usd_24h_change);
      } catch {
        // Fallback op database
        const fallback = await bitcoinApiService.getCurrentPrice();
        setPrice(fallback);
      }
    }
    fetchPrice();
  }, []);

  return { price, change24h };
}

function formatUsd(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

function MarktpositieBadge({ price }: { price: number }) {
  const pctVanPrevATH = (price / PREV_ATH) * 100;
  const pctVanLastATH = (price / LAST_ATH) * 100;
  const onderVorigATH = price < PREV_ATH;
  const onderLaatsteATH = price < LAST_ATH;

  // Bereken positie op de balk (0% = diep dal, 100% = nieuwe ATH)
  // Balk: $20k (links) → LAST_ATH * 1.1 (rechts), PREV_ATH valt op ~40% (groen/geel grens)
  const LOW = 20000;
  const HIGH = LAST_ATH * 1.1;
  const balPos = Math.min(Math.max(((price - LOW) / (HIGH - LOW)) * 100, 2), 96);

  let fase = 'Accumulatiefase';
  let faseKleur = 'green';
  let uitleg = 'Bitcoin zit onder de vorige ATH. Historisch gezien een goede koopperiode.';

  if (price > LAST_ATH) {
    fase = 'Prijsontdekking';
    faseKleur = 'red';
    uitleg = 'Bitcoin staat op een nieuw all-time high. Wees voorzichtig.';
  } else if (pctVanLastATH > 85) {
    fase = 'Hoog risico';
    faseKleur = 'orange';
    uitleg = 'Bitcoin nadert het laatste all-time high. Pas op voor hype.';
  } else if (pctVanPrevATH > 100) {
    fase = 'Herstelfase';
    faseKleur = 'yellow';
    uitleg = 'Bitcoin is boven de vorige ATH, maar nog onder het laatste record.';
  }

  const kleurMap: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Marktpositie</h3>
          <p className="text-xs text-gray-500">Waar staat Bitcoin nu?</p>
        </div>
      </div>

      {/* ATH vergelijking — gesorteerd op prijs */}
      <div className="grid grid-cols-3 gap-3 mb-5 text-center">
        {[
          { label: 'Vorige ATH', sub: 'Nov 2021', value: PREV_ATH, live: false },
          { label: 'Nu · Live', sub: `${pctVanLastATH.toFixed(0)}% van ATH`, value: price, live: true },
          { label: 'Laatste ATH', sub: 'Okt 2025', value: LAST_ATH, live: false },
        ].sort((a, b) => a.value - b.value).map(item => (
          item.live ? (
            <div key="live" className="bg-orange-50 rounded-xl p-3 border border-orange-200">
              <div className="text-xs text-orange-600 font-medium mb-1">{item.label}</div>
              <div className="font-bold text-orange-600 text-lg">{formatUsd(item.value)}</div>
              <div className="text-xs text-gray-400">{item.sub}</div>
            </div>
          ) : (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">{item.label}</div>
              <div className="font-bold text-gray-800 text-sm">{formatUsd(item.value)}</div>
              <div className="text-xs text-gray-400">{item.sub}</div>
            </div>
          )
        ))}
      </div>

      {/* Positiebalk */}
      <div className="mb-4">
        <div className="relative h-4 rounded-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #22c55e 0%, #86efac 25%, #fbbf24 50%, #f97316 75%, #ef4444 100%)'
        }}>
          <div className="absolute top-0 bottom-0 flex items-center" style={{ left: `${balPos}%` }}>
            <div className="w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow-lg -translate-x-1/2" />
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Accumulatie</span>
          <span>Herstel</span>
          <span>Hoog risico</span>
        </div>
      </div>

      {/* Status */}
      <div className={`border rounded-xl p-3 mb-4 ${kleurMap[faseKleur]}`}>
        <div className="font-bold text-sm">✓ {fase}</div>
        <p className="text-xs mt-1">{uitleg}</p>
        {onderVorigATH && (
          <p className="text-xs mt-1 font-medium">
            {((1 - price / PREV_ATH) * 100).toFixed(1)}% onder de vorige ATH van {formatUsd(PREV_ATH)}
          </p>
        )}
        {!onderVorigATH && onderLaatsteATH && (
          <p className="text-xs mt-1 font-medium">
            {((1 - price / LAST_ATH) * 100).toFixed(1)}% onder het laatste ATH van {formatUsd(LAST_ATH)}
          </p>
        )}
      </div>

      {/* Quote */}
      <div className="bg-gray-900 text-white rounded-xl p-4">
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
  );
}

export default function FrontPage() {
  const { price, change24h } = useLiveBtcPrice();
  const isPositive = (change24h ?? 0) >= 0;

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* NAVBAR */}
      <nav className="bg-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div>
            <div className="font-bold text-lg leading-tight">BitBeheer</div>
            <div className="text-orange-100 text-xs">Persoonlijke Bitcoin begeleiding</div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/aanmelden" className="bg-white text-orange-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition">
            Inloggen
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-[88vh] flex items-center px-6 py-16"
        style={{ background: 'radial-gradient(ellipse at 80% 20%, rgba(249,115,22,0.08) 0%, transparent 60%)' }}>
        <div className="max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">

          {/* Links */}
          <div>
            <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 bg-orange-500 rounded-full inline-block animate-pulse" />
              Bitcoin staat nu in de accumulatiefase
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
              Investeer in Bitcoin.<br />
              <span className="text-orange-500">Verstandig.</span> In eigen beheer.
            </h1>

            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Persoonlijke begeleiding voor Bitcoin beginners in Nederland.
              Geen hype, geen exchanges, geen risico op verlies van je keys.
              Jij hebt de controle.
            </p>

            {/* Live BTC prijs */}
            <div className="inline-flex items-center gap-4 bg-gray-900 text-white px-5 py-3 rounded-2xl mb-8 shadow-lg">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-sm font-bold">₿</div>
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wide">Live Bitcoin prijs</div>
                <div className="text-xl font-bold">
                  {price ? formatUsd(price) : '...'}
                </div>
              </div>
              {change24h !== null && (
                <div className={`text-sm font-semibold px-2 py-1 rounded-lg ${isPositive ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                  {isPositive ? '▲' : '▼'} {Math.abs(change24h).toFixed(1)}%
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/aanmelden"
                className="bg-orange-500 hover:bg-orange-600 text-white px-7 py-4 rounded-xl font-bold text-lg transition shadow-lg hover:shadow-xl flex items-center gap-2">
                Start mijn Bitcoin reis
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            <div className="flex items-center gap-6 mt-6 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gratis kennismaking
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                20 min gesprek
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Geen spam
              </span>
            </div>
          </div>

          {/* Rechts: marktpositie */}
          {price ? (
            <MarktpositieBadge price={price} />
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 flex items-center justify-center h-64">
              <div className="text-gray-400 text-sm">Marktdata laden...</div>
            </div>
          )}
        </div>
      </section>

      {/* SERVICE KAARTEN */}
      <section className="bg-gray-50 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Hoe wij jou helpen</h2>
            <p className="text-gray-600">Beweeg over een kaart voor meer uitleg</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">

            {/* Kaart 1 */}
            <div className="group cursor-default">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-orange-300 group-hover:shadow-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4 text-2xl">🤝</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">1-op-1 begeleiding</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Persoonlijk gesprek zodat jij begrijpt wat je doet. Wij dragen kennis over, jij neemt zelf de beslissingen.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-400 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-400">
                  <li>✓ Jij leert hoe Bitcoin werkt</li>
                  <li>✓ We kijken samen naar jouw situatie</li>
                  <li>✓ Geen advies, wel inzicht</li>
                  <li>✓ Gratis kennismakingsgesprek van 20 min</li>
                </ul>
              </div>
            </div>

            {/* Kaart 2 */}
            <div className="group cursor-default">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-orange-300 group-hover:shadow-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-2xl">🔐</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Eigen beheer</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Jij houdt je eigen keys. Bitcoin op een exchange is niet jouw Bitcoin. Wij helpen je een hardware wallet instellen.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-400 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-400">
                  <li>✓ Geen exchange risico</li>
                  <li>✓ Jij bent de enige eigenaar</li>
                  <li>✓ Ledger hardware wallet setup</li>
                  <li>✓ Stap voor stap begeleid</li>
                </ul>
              </div>
            </div>

            {/* Kaart 3 */}
            <div className="group cursor-default">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all duration-300 group-hover:-translate-y-2 group-hover:border-orange-300 group-hover:shadow-lg">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-2xl">📈</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">Slimme instapstrategie</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Leer het juiste moment te herkennen. Rustig instappen, je inleg het werk laten doen en ontspannen achterover zitten.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-gray-400 max-h-0 overflow-hidden group-hover:max-h-40 transition-all duration-400">
                  <li>✓ DCA: maandelijks vast bedrag</li>
                  <li>✓ Juiste instapmoment herkennen</li>
                  <li>✓ Geen paniek bij dips</li>
                  <li>✓ Lange termijn denken</li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* AANMELDFORMULIER */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 mb-3">Start je Bitcoin reis</h2>
            <p className="text-gray-600">Vul je gegevens in voor een gratis kennismakingsgesprek van 20 minuten.</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <SignupForm />
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

function SignupForm() {
  const [formData, setFormData] = useState({
    voornaam: '',
    achternaam: '',
    email: '',
    telefoon: '',
    ervaring: '',
  });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.voornaam || !formData.email) {
      setError('Vul minimaal je voornaam en e-mailadres in.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/create-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || 'Er ging iets mis, probeer het opnieuw.');
      }
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Er ging iets mis, probeer het opnieuw.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center py-6">
        <div className="text-4xl mb-4">🎉</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Aanmelding ontvangen!</h3>
        <p className="text-gray-600">We nemen zo snel mogelijk contact met je op voor een gratis kennismakingsgesprek.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Voornaam *</label>
          <input name="voornaam" type="text" placeholder="Jan" value={formData.voornaam} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Achternaam</label>
          <input name="achternaam" type="text" placeholder="Jansen" value={formData.achternaam} onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">E-mailadres *</label>
        <input name="email" type="email" placeholder="jan@voorbeeld.nl" value={formData.email} onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Telefoonnummer <span className="text-gray-400 font-normal">(optioneel)</span></label>
        <input name="telefoon" type="tel" placeholder="+31 6 12345678" value={formData.telefoon} onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm transition" />
      </div>
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ervaring met Bitcoin</label>
        <select name="ervaring" value={formData.ervaring} onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 text-sm text-gray-600 transition bg-white">
          <option value="">Selecteer je niveau...</option>
          <option value="beginner">Totaal beginner, ik weet nog niets</option>
          <option value="gehoord">Ik heb er wel eens van gehoord</option>
          <option value="onderzoek">Ik heb al een beetje onderzoek gedaan</option>
          <option value="ervaren">Ik heb al eerder Bitcoin gekocht</option>
        </select>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button type="submit" disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-4 rounded-xl font-bold text-base transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-2">
        {loading ? 'Aanmelden...' : 'Meld me aan voor een gratis gesprek'}
        {!loading && <ArrowRight className="w-5 h-5" />}
      </button>

      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-400">
        <span>✓ Geen spam</span>
        <span>✓ Gratis gesprek</span>
        <span>✓ Je data is veilig</span>
      </div>
    </form>
  );
}
