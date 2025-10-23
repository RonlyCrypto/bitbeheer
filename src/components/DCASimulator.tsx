import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Coins, Download, Share2 } from 'lucide-react';
import { fetchHistoricalPrices, getCurrentPrice } from '../services/priceService';
import { bitcoinDataManager } from '../services/bitcoinDataManager';
import { calculateDCA } from '../services/dcaCalculator';
import { SimulationResult, PriceData } from '../types';

interface DCASimulatorProps {
  startDate?: string;
  endDate?: string;
  priceData?: PriceData[];
  selectedCycle?: string | null;
  onDCAResult?: (result: SimulationResult | null) => void;
}

export default function DCASimulator({ startDate: propStartDate, endDate: propEndDate, onDCAResult }: DCASimulatorProps) {
  const [startDate, setStartDate] = useState(propStartDate || '2009-01-03');
  const [endDate, setEndDate] = useState(propEndDate || new Date().toISOString().split('T')[0]);
  const [monthlyAmount, setMonthlyAmount] = useState(50);
  const [coin, setCoin] = useState('BTC');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [hasSimulated, setHasSimulated] = useState(false);

  // Function to reset chart to full view - removed, now using "Alles" button in Market Phase Navigator

  // Function to format price with appropriate decimal places
  const formatPrice = (price: number): string => {
    if (price >= 100) {
      // For prices >= €100, show 2 decimal places
      return price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 10) {
      // For prices >= €10, show 2 decimal places
      return price.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (price >= 1) {
      // For prices >= €1, show 4 decimal places
      return price.toLocaleString('nl-NL', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    } else {
      // For prices < €1, show 8 decimal places
      return price.toLocaleString('nl-NL', { minimumFractionDigits: 8, maximumFractionDigits: 8 });
    }
  };
  
  // Market phase selection
  const [selectedPhases, setSelectedPhases] = useState<{
    accumulation: boolean;
    bullRun: boolean;
    bearMarket: boolean;
  }>({
    accumulation: true,
    bullRun: true,
    bearMarket: true
  });

  const minDate = '2009-01-03'; // Bitcoin genesis block

  // Sync props with local state
  useEffect(() => {
    if (propStartDate) setStartDate(propStartDate);
    if (propEndDate) setEndDate(propEndDate);
  }, [propStartDate, propEndDate]);
  
  const maxDate = new Date().toISOString().split('T')[0];

  const runSimulation = async () => {
    setLoading(true);
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);

      console.log('Starting simulation with:', { coin, startDate, endDate, monthlyAmount });
      
      let prices: PriceData[] = [];
      
      // Voor Bitcoin, gebruik onze CSV data
      if (coin.toLowerCase() === 'bitcoin' || coin.toLowerCase() === 'btc') {
        console.log('Using Bitcoin CSV data from bitcoinDataManager');
        const allBitcoinData = await bitcoinDataManager.getAllBitcoinData();
        
        // Filter data op het gevraagde bereik
        prices = allBitcoinData.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= start && itemDate <= end;
        });
        
        // Store price data for calculations
        
        console.log('Filtered Bitcoin CSV data:', prices.length, 'data points');
      } else {
        // Voor andere coins, gebruik de API
        prices = await fetchHistoricalPrices(coin, start, end);
        console.log('Fetched API prices:', prices.length, 'data points');
      }
      
      // Voor Bitcoin, gebruik de echte huidige prijs van vandaag
      let currentPrice: number;
      if (coin.toLowerCase() === 'bitcoin' || coin.toLowerCase() === 'btc') {
        console.log('Fetching real-time Bitcoin price for current value calculation...');
        currentPrice = await bitcoinDataManager.getCurrentBitcoinPrice('eur') || await getCurrentPrice(coin);
      } else {
        currentPrice = await getCurrentPrice(coin);
      }
      console.log('Current price used for calculation:', currentPrice);

              const simulationResult = calculateDCA(start, end, monthlyAmount, prices, currentPrice, selectedPhases);
              console.log('=== DCA SIMULATION RESULT ===');
              console.log('Total invested:', simulationResult.totalInvested);
              console.log('Total purchases:', simulationResult.totalPurchases);
              console.log('Purchase points count:', simulationResult.purchasePoints.length);
              console.log('Purchase details count:', simulationResult.purchaseDetails.length);
              console.log('Purchase points:', simulationResult.purchasePoints);
              console.log('Purchase details:', simulationResult.purchaseDetails);
              console.log('=== END SIMULATION RESULT ===');
              
      setResult(simulationResult);
              setHasSimulated(true);
              
              // Pass result to parent component
              if (onDCAResult) {
                onDCAResult(simulationResult);
              }
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Er is een fout opgetreden bij de simulatie. Controleer de console voor details.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (!result) return;
    
    const csvContent = [
      ['Datum', 'Prijs (€)', 'Ingelegd (€)', 'BTC Gekocht', 'Totaal BTC', 'Portfolio Waarde (€)'],
      ...result.purchaseDetails.map(purchase => [
        purchase.date,
        purchase.price.toFixed(8),
        purchase.amount.toFixed(2),
        purchase.btcAcquired.toFixed(8),
        (purchase.btcAcquired * purchase.monthNumber).toFixed(8),
        purchase.currentValue.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dca-simulatie-${coin}-${startDate}-${endDate}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    if (!result) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>DCA Simulatie Rapport</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; }
            .stat-box { border: 1px solid #ddd; padding: 15px; border-radius: 8px; }
            .stat-label { font-weight: bold; color: #666; }
            .stat-value { font-size: 24px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>DCA Simulatie Rapport</h1>
            <p>${coin} - ${startDate} tot ${endDate}</p>
            <p>Maandelijks bedrag: €${monthlyAmount}</p>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Totaal Geïnvesteerd</div>
              <div class="stat-value">€${result.totalInvested.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Huidige Waarde</div>
              <div class="stat-value">€${result.currentValue.toLocaleString()}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">ROI</div>
              <div class="stat-value">${result.roiPercentage >= 0 ? '+' : ''}${result.roiPercentage.toFixed(1)}%</div>
        </div>
            <div class="stat-box">
              <div class="stat-label">Gemiddelde Aankoopprijs</div>
              <div class="stat-value">€${formatPrice(result.averageBuyPrice)}</div>
        </div>
      </div>

          <h3>Inkoop Details</h3>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Prijs (€)</th>
                <th>Ingelegd (€)</th>
                <th>BTC Gekocht</th>
                <th>Totaal BTC</th>
                <th>Portfolio Waarde (€)</th>
              </tr>
            </thead>
            <tbody>
              ${result.purchaseDetails.map(purchase => `
                <tr>
                  <td>${purchase.date}</td>
                  <td>€${purchase.price.toFixed(8)}</td>
                  <td>€${purchase.amount.toFixed(2)}</td>
                  <td>${purchase.btcAcquired.toFixed(8)}</td>
                  <td>${(purchase.btcAcquired * purchase.monthNumber).toFixed(8)}</td>
                  <td>€${purchase.currentValue.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const shareResults = () => {
    if (!result) return;
    
    const shareText = `DCA Simulatie Resultaten:
${coin} - ${startDate} tot ${endDate}
Maandelijks: €${monthlyAmount}

Totaal Geïnvesteerd: €${result.totalInvested.toLocaleString()}
Huidige Waarde: €${result.currentValue.toLocaleString()}
ROI: ${result.roiPercentage >= 0 ? '+' : ''}${result.roiPercentage.toFixed(1)}%
Gemiddelde Aankoopprijs: €${formatPrice(result.averageBuyPrice)}

Bekijk de volledige simulatie op Crypto DCA Academy!`;
    
    if (navigator.share) {
      navigator.share({ text: shareText });
    } else {
      navigator.clipboard.writeText(shareText);
      alert('Resultaten gekopieerd naar clipboard!');
    }
  };

  return (
    <div className="space-y-2">

      {/* Compact DCA Controls */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Cryptocurrency</label>
          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="ADA">Cardano (ADA)</option>
            <option value="DOT">Polkadot (DOT)</option>
            <option value="LINK">Chainlink (LINK)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Start Datum</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={minDate}
            max={maxDate}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Eind Datum</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={maxDate}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Maandelijks (€)</label>
          <input
            type="number"
            value={monthlyAmount}
            onChange={(e) => setMonthlyAmount(Number(e.target.value))}
            min="1"
            step="10"
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>
      </div>

      {/* Compact Market Phase Selection */}
      <div className="bg-orange-50 rounded-md p-2 border border-orange-200">
        <label className="block text-xs font-medium text-gray-700 mb-1">Markt Periodes voor DCA:</label>
        <div className="flex gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPhases.accumulation}
              onChange={(e) => setSelectedPhases(prev => ({ ...prev, accumulation: e.target.checked }))}
              className="w-3.5 h-3.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-xs text-gray-700">Accumulatie</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPhases.bullRun}
              onChange={(e) => setSelectedPhases(prev => ({ ...prev, bullRun: e.target.checked }))}
              className="w-3.5 h-3.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-xs text-gray-700">Bull Market</span>
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedPhases.bearMarket}
              onChange={(e) => setSelectedPhases(prev => ({ ...prev, bearMarket: e.target.checked }))}
              className="w-3.5 h-3.5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
            />
            <span className="text-xs text-gray-700">Bear Market</span>
          </label>
        </div>
      </div>

      <div className="space-y-2">
      <button
        onClick={runSimulation}
        disabled={loading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm"
      >
        {loading ? 'Berekenen...' : 'Simuleer DCA Strategie'}
      </button>

        {hasSimulated && (
          <div className="space-y-2">
            {result ? (
              <>

                {/* Compact Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-100 p-1.5 rounded-md">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-green-900">Totaal Ingelegd</h4>
              </div>
                    <p className="text-lg font-bold text-green-800">€{result.totalInvested.toLocaleString()}</p>
                    <p className="text-xs text-green-700 mt-1">
                      {result.totalPurchases} keer ingekocht
              </p>
            </div>

                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-100 p-1.5 rounded-md">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-blue-900">Gemiddelde Prijs</h4>
              </div>
                    <p className="text-lg font-bold text-blue-800">€{formatPrice(result.averageBuyPrice)}</p>
            </div>

                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                      <div className="bg-orange-100 p-1.5 rounded-md">
                        <Coins className="w-4 h-4 text-orange-600" />
              </div>
                      <h4 className="text-sm font-semibold text-orange-900">Cycle ATH Waarde</h4>
            </div>
                    <p className="text-lg font-bold text-orange-800">€{result.cycleATHValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Huidige waarde: €{result.currentValue.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>

                {/* Compact Export Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={exportToCSV}
                    className="flex-1 flex items-center justify-center gap-1 bg-green-500 text-white py-1.5 px-2 rounded-md text-xs font-medium hover:bg-green-600 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    CSV
                  </button>
                  <button
                    onClick={exportToPDF}
                    className="flex-1 flex items-center justify-center gap-1 bg-blue-500 text-white py-1.5 px-2 rounded-md text-xs font-medium hover:bg-blue-600 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    PDF
                  </button>
                  <button
                    onClick={shareResults}
                    className="flex-1 flex items-center justify-center gap-1 bg-purple-500 text-white py-1.5 px-2 rounded-md text-xs font-medium hover:bg-purple-600 transition-all"
                  >
                    <Share2 className="w-3 h-3" />
                    Deel
                  </button>
              </div>
              </>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Simulatie is voltooid, maar er zijn geen resultaten beschikbaar.</p>
                <p className="text-xs mt-1">Controleer de console voor meer details.</p>
              </div>
            )}
          </div>
        )}
        </div>
    </div>
  );
}