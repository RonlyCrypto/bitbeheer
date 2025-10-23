import { PriceData, SimulationResult } from '../types';

export function calculateDCA(
  startDate: Date,
  endDate: Date,
  monthlyAmount: number,
  historicalPrices: PriceData[],
  currentPrice: number,
  selectedPhases?: {
    accumulation: boolean;
    bullRun: boolean;
    bearMarket: boolean;
  }
): SimulationResult {
  const monthlyData: SimulationResult['monthlyData'] = [];
  const purchasePoints: SimulationResult['purchasePoints'] = [];
  const purchaseDetails: SimulationResult['purchaseDetails'] = [];
  let totalInvested = 0;
  let totalCoins = 0;
  let purchaseCount = 0;

  const priceMap = new Map(historicalPrices.map(p => [p.date, p.price]));

  // Define cycle phases based on actual Bitcoin price movements
  const cyclePhases = [
    // Cycle 1: 2009-2015 (Corrected dates based on actual price movements)
    { start: '2009-01-03', end: '2011-06-01', type: 'accumulation' as const }, // $0.0008 → $2
    { start: '2011-06-01', end: '2013-11-30', type: 'bullRun' as const },     // $2 → $1,150
    { start: '2013-12-01', end: '2015-01-01', type: 'bearMarket' as const }, // $1,150 → $150
    
    // Cycle 2: 2015-2018 (Corrected dates)
    { start: '2015-01-01', end: '2016-07-01', type: 'accumulation' as const }, // $150 → $400
    { start: '2016-07-01', end: '2017-12-17', type: 'bullRun' as const },      // $400 → $19,700
    { start: '2017-12-18', end: '2018-12-15', type: 'bearMarket' as const },   // $19,700 → $3,200
    
    // Cycle 3: 2019-2022 (Corrected dates)
    { start: '2019-01-01', end: '2020-03-01', type: 'accumulation' as const }, // $3,200 → $7,000
    { start: '2020-03-01', end: '2021-11-10', type: 'bullRun' as const },      // $7,000 → $69,000
    { start: '2021-11-11', end: '2022-12-30', type: 'bearMarket' as const },   // $69,000 → $15,500
    
    // Cycle 4: 2023-2026 (Projected)
    { start: '2023-01-01', end: '2023-10-01', type: 'accumulation' as const },
    { start: '2023-11-01', end: '2025-12-31', type: 'bullRun' as const },
    { start: '2025-12-01', end: '2026-12-31', type: 'bearMarket' as const }
  ];

  // Function to determine which phase a date belongs to
  const getPhaseForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    for (const phase of cyclePhases) {
      if (dateStr >= phase.start && dateStr <= phase.end) {
        return phase.type;
      }
    }
    return 'accumulation'; // Default fallback
  };

  // Get the price on the end date for final value calculation
  const endDateStr = endDate.toISOString().split('T')[0];
  let endDatePrice = priceMap.get(endDateStr);
  if (!endDatePrice) {
    const nearestPrice = findNearestPrice(endDateStr, historicalPrices);
    endDatePrice = nearestPrice?.price || currentPrice;
  }

  const currentDate = new Date(startDate);
  const finalDate = new Date(endDate);

  while (currentDate <= finalDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const currentPhase = getPhaseForDate(currentDate);

    // Check if we should make a purchase in this phase
    // If no phases are selected, purchase in all phases
    const hasSelection = selectedPhases && (selectedPhases.accumulation || selectedPhases.bullRun || selectedPhases.bearMarket);
    const shouldPurchase = !hasSelection || (
      (currentPhase === 'accumulation' && selectedPhases.accumulation) ||
      (currentPhase === 'bullRun' && selectedPhases.bullRun) ||
      (currentPhase === 'bearMarket' && selectedPhases.bearMarket)
    );

    // Debug logging for first few purchases
    if (purchaseCount < 5) {
      console.log(`DCA Debug: ${dateStr} - Phase: ${currentPhase}, HasSelection: ${hasSelection}, ShouldPurchase: ${shouldPurchase}, SelectedPhases:`, selectedPhases);
    }

    let priceOnDate = priceMap.get(dateStr);
    if (!priceOnDate) {
      const nearestPrice = findNearestPrice(dateStr, historicalPrices);
      priceOnDate = nearestPrice?.price || currentPrice;
    }

    // Only make purchases in selected phases
    if (shouldPurchase) {
      const coinsAcquired = monthlyAmount / priceOnDate;
      totalCoins += coinsAcquired;
      totalInvested += monthlyAmount;
      purchaseCount++;

      // Add detailed purchase information
      purchaseDetails.push({
        date: dateStr,
        amount: monthlyAmount,
        price: priceOnDate,
        btcAcquired: coinsAcquired,
        monthNumber: purchaseCount,
        currentValue: coinsAcquired * currentPrice // Current value using real-time Bitcoin price
      });

      purchasePoints.push({
        date: dateStr,
        price: priceOnDate // Use the actual purchase price, not portfolio value
      });
      
      // Debug logging for first few purchases
      if (purchaseCount <= 5) {
        console.log(`DCA Calculator - Purchase ${purchaseCount}:`, {
          date: dateStr,
          price: priceOnDate,
          amount: monthlyAmount,
          coinsAcquired: coinsAcquired,
          currentValue: coinsAcquired * currentPrice,
          currentPrice: currentPrice,
          phase: currentPhase
        });
      }
    }

    // Use the price on the current date for portfolio value calculation
    const portfolioValue = totalCoins * priceOnDate;

    monthlyData.push({
      date: dateStr,
      invested: totalInvested,
      value: portfolioValue,
      coins: totalCoins
    });

    currentDate.setMonth(currentDate.getMonth() + 1);
  }
  
  // Calculate current value using current Bitcoin price (passed as parameter)
  const currentValue = totalCoins * currentPrice;
  const roiPercentage = ((currentValue - totalInvested) / totalInvested) * 100;
  const averageBuyPrice = totalInvested / totalCoins;

  console.log('=== DCA CALCULATOR FINAL RESULT ===');
  console.log('Total purchases made:', purchaseCount);
  console.log('Current price used:', currentPrice);
  console.log('End date price:', endDatePrice);
  console.log('Purchase points generated:', purchasePoints.length);
  console.log('Purchase details generated:', purchaseDetails.length);
  console.log('First 3 purchase points:', purchasePoints.slice(0, 3));
  console.log('Historical prices sample:', historicalPrices.slice(0, 3));
  console.log('Date range:', { start: startDate.toISOString().split('T')[0], end: endDate.toISOString().split('T')[0] });
  console.log('=== END DCA CALCULATOR RESULT ===');

  // Calculate cycle ATH value (value at cycle peak)
  const cycleATHValue = totalCoins * getCycleATH(startDate, endDate);

  return {
    totalInvested,
    currentValue,
    roiPercentage,
    averageBuyPrice,
    totalCoins,
    cycleATHValue,
    monthlyData,
    purchasePoints,
    purchaseDetails,
    totalPurchases: purchaseCount
  };
}

function getCycleATH(startDate: Date, endDate: Date): number {
  // Bitcoin cycle ATH prices based on historical data
  const cycleATHs = [
    { start: new Date('2009-01-03'), end: new Date('2015-01-01'), ath: 1150 }, // Cycle 1
    { start: new Date('2015-01-01'), end: new Date('2018-12-31'), ath: 19700 }, // Cycle 2
    { start: new Date('2019-01-01'), end: new Date('2022-12-31'), ath: 69000 }, // Cycle 3
    { start: new Date('2023-01-01'), end: new Date('2026-12-31'), ath: 100000 } // Cycle 4 (projected)
  ];

  // Find which cycle the date range falls into
  for (const cycle of cycleATHs) {
    if (startDate >= cycle.start && endDate <= cycle.end) {
      return cycle.ath;
    }
  }

  // If no specific cycle found, return the highest ATH in the range
  return 69000; // Default to Cycle 3 ATH
}

function findNearestPrice(targetDate: string, prices: PriceData[]): PriceData | null {
  if (prices.length === 0) return null;

  const target = new Date(targetDate).getTime();
  let nearest = prices[0];
  let minDiff = Math.abs(new Date(prices[0].date).getTime() - target);

  for (const price of prices) {
    const diff = Math.abs(new Date(price.date).getTime() - target);
    if (diff < minDiff) {
      minDiff = diff;
      nearest = price;
    }
  }

  return nearest;
}
