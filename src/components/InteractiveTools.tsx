import { useState, useEffect } from 'react';
import { Clock, Activity, TrendingUp, Calculator } from 'lucide-react';

export default function InteractiveTools() {
  const [nextHalving, setNextHalving] = useState({
    date: new Date('2028-04-15'),
    daysRemaining: 0
  });

  const [fearGreedIndex] = useState(65);
  const [btcDominance] = useState(52.3);

  useEffect(() => {
    const calculateDaysRemaining = () => {
      const now = new Date();
      const diff = nextHalving.date.getTime() - now.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
      setNextHalving(prev => ({ ...prev, daysRemaining: days }));
    };

    calculateDaysRemaining();
    const interval = setInterval(calculateDaysRemaining, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  const getFearGreedLabel = (index: number) => {
    if (index < 25) return { label: 'Extreme Fear', color: 'red' };
    if (index < 45) return { label: 'Fear', color: 'orange' };
    if (index < 55) return { label: 'Neutral', color: 'gray' };
    if (index < 75) return { label: 'Greed', color: 'green' };
    return { label: 'Extreme Greed', color: 'emerald' };
  };

  const fearGreed = getFearGreedLabel(fearGreedIndex);

  const colorClasses = {
    red: 'from-red-500 to-red-600',
    orange: 'from-orange-500 to-orange-600',
    gray: 'from-gray-500 to-gray-600',
    green: 'from-green-500 to-green-600',
    emerald: 'from-emerald-500 to-emerald-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Interactieve Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-orange-900">Halving Countdown</h3>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-bold text-orange-600 mb-2">
              {nextHalving.daysRemaining}
            </div>
            <div className="text-gray-700 font-medium mb-4">dagen</div>
            <div className="text-sm text-gray-600">
              Tot volgende halving (~{nextHalving.date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })})
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="leading-relaxed">
              De Bitcoin halving vermindert de mining reward met 50%, wat historisch heeft geleid tot verhoogde schaarste en prijsstijgingen.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-blue-900">Fear & Greed Index</h3>
          </div>

          <div className="text-center py-6">
            <div className="relative w-48 h-48 mx-auto mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#e5e7eb"
                  strokeWidth="16"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={`${(fearGreedIndex / 100) * 502.4} 502.4`}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div>
                  <div className="text-4xl font-bold text-gray-900">{fearGreedIndex}</div>
                  <div className={`text-sm font-medium bg-gradient-to-r ${colorClasses[fearGreed.color as keyof typeof colorClasses]} bg-clip-text text-transparent`}>
                    {fearGreed.label}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="leading-relaxed">
              De Fear & Greed Index meet het marktsentiment. Extreme fear kan koopkansen betekenen, extreme greed waarschuwt voor overenthousiasme.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-green-900">Bitcoin Dominance</h3>
          </div>

          <div className="text-center py-6">
            <div className="text-5xl font-bold text-green-600 mb-2">
              {btcDominance}%
            </div>
            <div className="text-gray-700 font-medium mb-4">van totale crypto markt</div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div
              className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full transition-all duration-1000"
              style={{ width: `${btcDominance}%` }}
            />
          </div>

          <div className="bg-white bg-opacity-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="leading-relaxed">
              Bitcoin dominance toont het marktaandeel van Bitcoin. Hoge dominance betekent vaak een vlucht naar veiligheid in de crypto markt.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calculator className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900">Wat Als Calculator</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">€100 in 2011 (€2/BTC)</div>
              <div className="text-2xl font-bold text-purple-900">≈ €1.800.000</div>
              <div className="text-xs text-gray-500 mt-1">50 BTC → 18,000x return</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">€100 in 2015 (€200/BTC)</div>
              <div className="text-2xl font-bold text-purple-900">≈ €9.000</div>
              <div className="text-xs text-gray-500 mt-1">0.5 BTC → 90x return</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">€100 in 2018 (€3.200/BTC)</div>
              <div className="text-2xl font-bold text-purple-900">≈ €2.800</div>
              <div className="text-xs text-gray-500 mt-1">0.031 BTC → 28x return</div>
            </div>
            <div className="bg-white bg-opacity-50 rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-1">€100 in 2020 (€7.000/BTC)</div>
              <div className="text-2xl font-bold text-purple-900">≈ €1.300</div>
              <div className="text-xs text-gray-500 mt-1">0.014 BTC → 13x return</div>
            </div>
          </div>

          <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4 text-sm text-gray-700">
            <p className="leading-relaxed">
              Deze voorbeelden tonen historische returns, maar zijn geen garantie voor toekomstige resultaten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
