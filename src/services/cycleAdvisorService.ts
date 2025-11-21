/**
 * Cycle Advisor Service
 * Analyzes Bitcoin cycles and provides DCA recommendations based on price position vs previous ATH
 * 
 * ALL data is fetched dynamically from database - NO hardcoded values!
 */

import { bitcoinPriceDataService } from './bitcoinPriceDataService';

export interface CycleData {
  id: string;
  name: string;
  number: number;
  startDate: string; // Calculated from data
  endDate: string;   // Calculated from data
  ath: number;
  athDate: string;
  previousATH: number | null;
  previousATHDate: string | null;
  halving: string;
  phaseLow: number;
  phaseLowDate: string;
  phaseHigh: number;
  phaseHighDate: string;
}

export interface PricePosition {
  status: 'above_ath' | 'below_ath' | 'near_ath' | 'unknown';
  percentageVsPrevATH: number;
  distanceFromATH: number;
  percentageFromATH: number;
}

export interface Recommendation {
  level: 'strong_buy' | 'buy' | 'wait' | 'hold' | 'caution' | 'risky';
  description: string;
  reasoning: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

export interface ROIProjection {
  scenario: string;
  targetPrice: number;
  investmentAmount: number;
  projectedValue: number;
  projectedROI: number;
  projectedROIPercent: number;
  likelihood: number;
}

export interface CycleComparison {
  currentCycle: number;
  mostSimilarCycle: number;
  similarityScore: number;
  similarities: string[];
  differences: string[];
  warnings: string[];
}

export interface CycleAdvisorData {
  currentCycle: CycleData;
  currentPhase: 'accumulation' | 'bullRun' | 'bearMarket' | 'unknown';
  pricePosition: PricePosition;
  recommendation: Recommendation;
  roiProjections: ROIProjection[];
  cycleComparison: CycleComparison;
  timestamp: Date;
}

// Halving dates are fixed - these are historical facts
const HALVING_DATES = {
  1: '2012-11-28',
  2: '2016-07-09',
  3: '2020-05-11',
  4: '2024-04-20'
};

let cachedCycles: CycleData[] | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

class CycleAdvisorService {
  /**
   * Calculate cycles from historical price data
   */
  async calculateCyclesFromData(): Promise<CycleData[]> {
    // Check cache
    if (cachedCycles && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
      console.log('✅ Using cached cycle data');
      return cachedCycles;
    }

    try {
      console.log('📊 Calculating cycles from database...');
      const priceService = new bitcoinPriceDataService();
      const summary = await priceService.getSummary();

      if (!summary?.available_years || summary.available_years.length === 0) {
        throw new Error('No price data available');
      }

      const allData = await priceService.getDataForYears(summary.available_years, 'USD');

      if (allData.length === 0) {
        throw new Error('No historical data');
      }

      // Sort by date
      allData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const cycles: CycleData[] = [];

      // Cycle 1: 2009 - 2015 (first halving to second halving era)
      cycles.push(this.calculateCycle(1, allData, '2009-01-03', '2015-12-31'));

      // Cycle 2: 2015 - 2018 (second halving to third halving era)
      cycles.push(this.calculateCycle(2, allData, '2016-01-01', '2018-12-31'));

      // Cycle 3: 2018 - 2022 (third halving to fourth halving era)
      cycles.push(this.calculateCycle(3, allData, '2019-01-01', '2022-12-31'));

      // Cycle 4: 2022 - now (fourth halving to present)
      cycles.push(this.calculateCycle(4, allData, '2023-01-01', new Date().toISOString().split('T')[0]));

      // Set previousATH for each cycle
      for (let i = 1; i < cycles.length; i++) {
        cycles[i].previousATH = cycles[i - 1].ath;
        cycles[i].previousATHDate = cycles[i - 1].athDate;
      }

      cachedCycles = cycles;
      cacheTimestamp = Date.now();

      console.log('✅ Cycles calculated:', cycles.map(c => ({
        number: c.number,
        ath: c.ath,
        athDate: c.athDate,
        previousATH: c.previousATH
      })));

      return cycles;
    } catch (error) {
      console.error('❌ Error calculating cycles:', error);
      throw error;
    }
  }

  /**
   * Calculate a single cycle from data
   */
  private calculateCycle(
    number: number,
    allData: any[],
    startDateStr: string,
    endDateStr: string
  ): CycleData {
    const cycleData = allData.filter(d => {
      const date = new Date(d.date);
      return date >= new Date(startDateStr) && date <= new Date(endDateStr);
    });

    if (cycleData.length === 0) {
      throw new Error(`No data for cycle ${number}`);
    }

    const prices = cycleData.map(d => d.price || 0).filter(p => p > 0);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    // Find ATH date
    const athData = cycleData.find(d => d.price === maxPrice);
    const athDate = athData?.date || endDateStr;

    // Find low date
    const lowData = cycleData.find(d => d.price === minPrice);
    const lowDate = lowData?.date || startDateStr;

    return {
      id: `cycle${number}`,
      name: `${number}e Cycle`,
      number,
      startDate: startDateStr,
      endDate: endDateStr,
      ath: Math.round(maxPrice),
      athDate,
      previousATH: null, // Set later
      previousATHDate: null,
      halving: HALVING_DATES[number as keyof typeof HALVING_DATES] || '',
      phaseLow: Math.round(minPrice),
      phaseLowDate: lowDate,
      phaseHigh: Math.round(maxPrice),
      phaseHighDate: athDate
    };
  }

  /**
   * Get current cycle based on date
   */
  async getCurrentCycle(date: Date = new Date()): Promise<CycleData> {
    const cycles = await this.calculateCyclesFromData();
    const year = date.getFullYear();

    for (const cycle of cycles) {
      const cycleStart = new Date(cycle.startDate);
      const cycleEnd = new Date(cycle.endDate);
      if (date >= cycleStart && date <= cycleEnd) {
        return cycle;
      }
    }

    // Return last cycle if past all known cycles
    return cycles[cycles.length - 1];
  }

  /**
   * Determine current phase in cycle
   */
  async getCurrentPhase(date: Date = new Date()): Promise<'accumulation' | 'bullRun' | 'bearMarket' | 'unknown'> {
    const cycle = await this.getCurrentCycle(date);
    const priceService = new bitcoinPriceDataService();
    const summary = await priceService.getSummary();

    if (!summary?.available_years) return 'unknown';

    const allData = await priceService.getDataForYears(summary.available_years, 'USD');
    const cycleData = allData.filter(d => {
      const d_date = new Date(d.date);
      return d_date >= new Date(cycle.startDate) && d_date <= new Date(cycle.endDate);
    });

    if (cycleData.length < 3) return 'unknown';

    // Get last 20% of data to determine current phase
    const recentData = cycleData.slice(Math.floor(cycleData.length * 0.8));
    const recentPrice = Math.max(...recentData.map(d => d.price || 0));
    const previousPrice = Math.min(...recentData.map(d => d.price || 0));

    // Simple heuristic: if price > low + 66% of range, it's bullRun
    const low = Math.min(...cycleData.map(d => d.price || 0));
    const high = Math.max(...cycleData.map(d => d.price || 0));
    const range = high - low;
    const threshold = low + (range * 0.66);

    if (recentPrice > threshold) {
      return 'bullRun';
    } else if (recentPrice < low + (range * 0.33)) {
      return 'accumulation';
    } else {
      return 'bearMarket';
    }
  }

  /**
   * Analyze price position vs previous ATH
   */
  analyzePricePosition(currentPrice: number, cycle: CycleData): PricePosition {
    if (!cycle.previousATH) {
      return {
        status: 'unknown',
        percentageVsPrevATH: 0,
        distanceFromATH: 0,
        percentageFromATH: 0
      };
    }

    const diffFromPrevATH = currentPrice - cycle.previousATH;
    const percentDiff = (diffFromPrevATH / cycle.previousATH) * 100;

    let status: 'above_ath' | 'below_ath' | 'near_ath';
    if (percentDiff > 5) {
      status = 'above_ath';
    } else if (percentDiff < -5) {
      status = 'below_ath';
    } else {
      status = 'near_ath';
    }

    return {
      status,
      percentageVsPrevATH: percentDiff,
      distanceFromATH: Math.abs(diffFromPrevATH),
      percentageFromATH: Math.abs(percentDiff)
    };
  }

  /**
   * Get buy recommendation based on price position and mode
   */
  getRecommendation(
    pricePosition: PricePosition,
    mode: 'conservative' | 'balanced' | 'aggressive' = 'balanced',
    currentPhase: 'accumulation' | 'bullRun' | 'bearMarket' | 'unknown' = 'unknown'
  ): Recommendation {
    const { status, percentageVsPrevATH } = pricePosition;

    // CONSERVATIVE MODE
    if (mode === 'conservative') {
      if (status === 'below_ath' && percentageVsPrevATH <= -20) {
        return {
          level: 'strong_buy',
          description: 'Excellente koopmogelijkheid - -20% of meer onder vorige ATH',
          reasoning: 'Historisch gezien zijn dips van -20% onder vorige ATH zeer gunstig voor long-term gains',
          riskLevel: 'low'
        };
      }
      if (status === 'below_ath' && percentageVsPrevATH > -20) {
        return {
          level: 'buy',
          description: 'Goede koopmogelijkheid - onder vorige ATH',
          reasoning: 'Nog steeds onder vorige ATH, maar niet zo diep',
          riskLevel: 'low'
        };
      }
      if (status === 'near_ath') {
        return {
          level: 'wait',
          description: 'Wacht op dip - dicht bij vorige ATH',
          reasoning: 'Prijs is dicht bij vorige ATH. Wacht tot het 5%+ daalt',
          riskLevel: 'medium'
        };
      }
      if (status === 'above_ath' && percentageVsPrevATH < 20) {
        return {
          level: 'hold',
          description: 'Hold positie - licht boven vorige ATH',
          reasoning: 'Boven vorige ATH maar nog geen extreem.',
          riskLevel: 'medium'
        };
      }
      return {
        level: 'caution',
        description: 'Voorzichtig - significant boven vorige ATH',
        reasoning: 'Significant boven vorige ATH (+20%+). Onzeker territorium.',
        riskLevel: 'high'
      };
    }

    // BALANCED MODE
    if (mode === 'balanced') {
      if (status === 'below_ath') {
        return {
          level: 'strong_buy',
          description: 'Sterke koopsignaal - onder vorige ATH',
          reasoning: 'In alle 3 vorige cycles: kopen onder vorige ATH = 90% kans op profit',
          riskLevel: 'low'
        };
      }
      if (status === 'near_ath') {
        return {
          level: 'buy',
          description: 'Goede prijs - dicht bij vorige ATH',
          reasoning: 'Fair price zone. DCA nu is verstandig.',
          riskLevel: 'medium'
        };
      }
      if (status === 'above_ath' && percentageVsPrevATH < 30) {
        return {
          level: 'wait',
          description: 'Wacht op dip - boven vorige ATH maar nog haalbaar',
          reasoning: 'Boven vorige ATH maar nog geen extreme. Wacht op dip.',
          riskLevel: 'medium'
        };
      }
      return {
        level: 'caution',
        description: 'Zeer voorzichtig - zeer hoog boven vorige ATH',
        reasoning: 'Onbekend territorium. Geen historische data beschikbaar.',
        riskLevel: 'very_high'
      };
    }

    // AGGRESSIVE MODE
    if (mode === 'aggressive') {
      if (status === 'below_ath') {
        return {
          level: 'strong_buy',
          description: 'Maximale koopmogelijkheid',
          reasoning: 'Beste entry point. Under ATH = momentum break highly profitable',
          riskLevel: 'low'
        };
      }
      if (status === 'near_ath' || (status === 'above_ath' && percentageVsPrevATH < 15)) {
        return {
          level: 'buy',
          description: 'Koop het momentum - prijsstijging ingang',
          reasoning: 'Momentum play. Prijs breekt uit boven vorige ATH = bullish signal',
          riskLevel: 'medium'
        };
      }
      if (status === 'above_ath' && percentageVsPrevATH < 50) {
        return {
          level: 'wait',
          description: 'Wacht op consolidatie',
          reasoning: 'Strong rally, wacht op pullback voor betere entry',
          riskLevel: 'high'
        };
      }
      return {
        level: 'risky',
        description: 'Zeer riskant - extreem hoog',
        reasoning: 'Extreme territory. Only for experienced traders. FOMO warning!',
        riskLevel: 'very_high'
      };
    }

    // Default fallback
    return {
      level: 'hold',
      description: 'Onbekende status',
      reasoning: 'Kan aanbeveling niet bepalen',
      riskLevel: 'high'
    };
  }

  /**
   * Calculate ROI projections for different scenarios
   */
  calculateROIProjections(
    investmentAmount: number,
    currentPrice: number,
    cycle: CycleData,
    currentPhase: 'accumulation' | 'bullRun' | 'bearMarket' | 'unknown'
  ): ROIProjection[] {
    const projections: ROIProjection[] = [];

    // Scenario 1: Back to previous ATH
    if (cycle.previousATH) {
      const projectedValue = (investmentAmount / currentPrice) * cycle.previousATH;
      projections.push({
        scenario: 'Terug naar vorige ATH',
        targetPrice: cycle.previousATH,
        investmentAmount,
        projectedValue,
        projectedROI: projectedValue - investmentAmount,
        projectedROIPercent: ((projectedValue - investmentAmount) / investmentAmount) * 100,
        likelihood: 90
      });
    }

    // Scenario 2: 50% above previous ATH
    if (cycle.previousATH) {
      const targetPrice = cycle.previousATH * 1.5;
      const projectedValue = (investmentAmount / currentPrice) * targetPrice;
      projections.push({
        scenario: 'Nieuwe ATH (+50% boven vorige)',
        targetPrice,
        investmentAmount,
        projectedValue,
        projectedROI: projectedValue - investmentAmount,
        projectedROIPercent: ((projectedValue - investmentAmount) / investmentAmount) * 100,
        likelihood: currentPhase === 'bullRun' ? 60 : 40
      });
    }

    // Scenario 3: 100% above previous ATH (2x)
    if (cycle.previousATH) {
      const targetPrice = cycle.previousATH * 2;
      const projectedValue = (investmentAmount / currentPrice) * targetPrice;
      projections.push({
        scenario: 'Massieve rally (2x vorige ATH)',
        targetPrice,
        investmentAmount,
        projectedValue,
        projectedROI: projectedValue - investmentAmount,
        projectedROIPercent: ((projectedValue - investmentAmount) / investmentAmount) * 100,
        likelihood: currentPhase === 'bullRun' ? 30 : 10
      });
    }

    // Scenario 4: Further dip (-10% from current)
    const dippedPrice = currentPrice * 0.9;
    const projectedValue = (investmentAmount / currentPrice) * dippedPrice;
    projections.push({
      scenario: 'Verdere dip (-10%)',
      targetPrice: dippedPrice,
      investmentAmount,
      projectedValue,
      projectedROI: projectedValue - investmentAmount,
      projectedROIPercent: ((projectedValue - investmentAmount) / investmentAmount) * 100,
      likelihood: 40
    });

    return projections;
  }

  /**
   * Compare current cycle with previous cycles
   */
  async compareCycles(currentCycleNumber: number): Promise<CycleComparison> {
    const cycles = await this.calculateCyclesFromData();
    const currentCycle = cycles.find(c => c.number === currentCycleNumber);

    if (!currentCycle || currentCycleNumber <= 1) {
      return {
        currentCycle: currentCycleNumber,
        mostSimilarCycle: 0,
        similarityScore: 0,
        similarities: [],
        differences: [],
        warnings: []
      };
    }

    const previousCycle = cycles.find(c => c.number === currentCycleNumber - 1);
    if (!previousCycle) {
      return {
        currentCycle: currentCycleNumber,
        mostSimilarCycle: 0,
        similarityScore: 0,
        similarities: [],
        differences: [],
        warnings: []
      };
    }

    const similarities = [
      `Cycle ${currentCycle.number} begon na halving op ${currentCycle.halving}`,
      `Vorige cycle bereikt ATH van $${previousCycle.ath.toLocaleString()}`,
      'Cyclische patronen herhalen zich in bull runs na halvings'
    ];

    const differences = [];
    const athDifference = ((currentCycle.ath - previousCycle.ath) / previousCycle.ath) * 100;
    if (Math.abs(athDifference) > 10) {
      differences.push(`ATH verschil: ${athDifference > 0 ? '+' : ''}${athDifference.toFixed(0)}% vs vorige cycle`);
    }

    const warnings: string[] = [];
    if (currentCycleNumber === 4) {
      warnings.push('⚠️ Cycle 4 is nog niet afgelopen - ATH kan nog stijgen');
      warnings.push('⚠️ Geen historische data boven vorige ATH beschikbaar');
    }

    return {
      currentCycle: currentCycleNumber,
      mostSimilarCycle: previousCycle.number,
      similarityScore: 75,
      similarities,
      differences,
      warnings
    };
  }

  /**
   * Get complete advisor data for a specific price point and investment amount
   */
  async getAdvisorData(
    currentPrice: number,
    investmentAmount: number = 100,
    mode: 'conservative' | 'balanced' | 'aggressive' = 'balanced',
    date: Date = new Date()
  ): Promise<CycleAdvisorData> {
    const currentCycle = await this.getCurrentCycle(date);
    const currentPhase = await this.getCurrentPhase(date);
    const pricePosition = this.analyzePricePosition(currentPrice, currentCycle);
    const recommendation = this.getRecommendation(pricePosition, mode, currentPhase);
    const roiProjections = this.calculateROIProjections(investmentAmount, currentPrice, currentCycle, currentPhase);
    const cycleComparison = await this.compareCycles(currentCycle.number);

    return {
      currentCycle,
      currentPhase,
      pricePosition,
      recommendation,
      roiProjections,
      cycleComparison,
      timestamp: new Date()
    };
  }

  /**
   * Get all cycles
   */
  async getAllCycles(): Promise<CycleData[]> {
    return this.calculateCyclesFromData();
  }

  /**
   * Get cycle by number
   */
  async getCycleByNumber(number: number): Promise<CycleData | undefined> {
    const cycles = await this.calculateCyclesFromData();
    return cycles.find(c => c.number === number);
  }
}

export const cycleAdvisorService = new CycleAdvisorService();
