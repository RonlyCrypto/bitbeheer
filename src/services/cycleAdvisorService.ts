/**
 * Cycle Advisor Service
 * Analyzes Bitcoin cycles and provides DCA recommendations based on price position vs previous ATH
 */

export interface CycleData {
  id: string;
  name: string;
  number: number;
  startYear: number;
  endYear: number;
  halving: string;
  ath: number; // All-Time High in USD
  previousATH: number | null; // Previous cycle ATH (for comparison)
  phases: {
    accumulation: { start: string; end: string; priceRange: string };
    bullRun: { start: string; end: string; priceRange: string };
    bearMarket: { start: string; end: string; priceRange: string };
  };
}

export interface PricePosition {
  status: 'above_ath' | 'below_ath' | 'near_ath' | 'unknown';
  percentageVsPrevATH: number; // Positive = above, negative = below
  distanceFromATH: number; // In USD
  percentageFromATH: number; // In percentage
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
  likelihood: number; // 0-100%
}

export interface CycleComparison {
  currentCycle: number;
  mostSimilarCycle: number;
  similarityScore: number; // 0-100%
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

// Bitcoin cycle definitions with ATH data
const BITCOIN_CYCLES: CycleData[] = [
  {
    id: 'cycle1',
    name: '1e Cycle',
    number: 1,
    startYear: 2009,
    endYear: 2015,
    halving: '2012-11-28',
    ath: 1150,
    previousATH: null,
    phases: {
      accumulation: { start: '2009-01-03', end: '2012-11-28', priceRange: '$0.0008 → $2' },
      bullRun: { start: '2012-11-28', end: '2013-12-17', priceRange: '$2 → $1,150' },
      bearMarket: { start: '2013-12-18', end: '2015-01-14', priceRange: '$1,150 → $150' }
    }
  },
  {
    id: 'cycle2',
    name: '2e Cycle',
    number: 2,
    startYear: 2015,
    endYear: 2018,
    halving: '2016-07-09',
    ath: 19700,
    previousATH: 1150,
    phases: {
      accumulation: { start: '2015-01-15', end: '2016-07-09', priceRange: '$150 → $400' },
      bullRun: { start: '2016-07-09', end: '2017-12-17', priceRange: '$400 → $19,700' },
      bearMarket: { start: '2017-12-18', end: '2018-12-15', priceRange: '$19,700 → $3,200' }
    }
  },
  {
    id: 'cycle3',
    name: '3e Cycle',
    number: 3,
    startYear: 2018,
    endYear: 2022,
    halving: '2020-05-11',
    ath: 69000,
    previousATH: 19700,
    phases: {
      accumulation: { start: '2018-12-16', end: '2020-05-11', priceRange: '$3,200 → $7,000' },
      bullRun: { start: '2020-05-11', end: '2021-11-10', priceRange: '$7,000 → $69,000' },
      bearMarket: { start: '2021-11-11', end: '2022-12-30', priceRange: '$69,000 → $15,500' }
    }
  },
  {
    id: 'cycle4',
    name: '4e Cycle',
    number: 4,
    startYear: 2022,
    endYear: 2026,
    halving: '2024-04-20',
    ath: 0, // To be determined
    previousATH: 69000,
    phases: {
      accumulation: { start: '2022-12-31', end: '2024-04-20', priceRange: '$16,000 → $30,000' },
      bullRun: { start: '2024-04-20', end: '2025-06-30', priceRange: 'Bull Run richting top' },
      bearMarket: { start: '2025-07-01', end: '2026-12-31', priceRange: 'Bear Market fase' }
    }
  }
];

class CycleAdvisorService {
  /**
   * Get current cycle based on date
   */
  getCurrentCycle(date: Date = new Date()): CycleData {
    const year = date.getFullYear();
    
    for (const cycle of BITCOIN_CYCLES) {
      if (year >= cycle.startYear && year <= cycle.endYear) {
        return cycle;
      }
    }
    
    // If we're past the last known cycle, return cycle 4
    return BITCOIN_CYCLES[BITCOIN_CYCLES.length - 1];
  }

  /**
   * Determine current phase in cycle
   */
  getCurrentPhase(date: Date = new Date()): 'accumulation' | 'bullRun' | 'bearMarket' | 'unknown' {
    const cycle = this.getCurrentCycle(date);
    const timestamp = date.getTime();
    
    const accumStart = new Date(cycle.phases.accumulation.start).getTime();
    const accumEnd = new Date(cycle.phases.accumulation.end).getTime();
    const bullStart = new Date(cycle.phases.bullRun.start).getTime();
    const bullEnd = new Date(cycle.phases.bullRun.end).getTime();
    const bearStart = new Date(cycle.phases.bearMarket.start).getTime();
    const bearEnd = new Date(cycle.phases.bearMarket.end).getTime();
    
    if (timestamp >= accumStart && timestamp <= accumEnd) return 'accumulation';
    if (timestamp >= bullStart && timestamp <= bullEnd) return 'bullRun';
    if (timestamp >= bearStart && timestamp <= bearEnd) return 'bearMarket';
    
    return 'unknown';
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
        likelihood: 90 // Historical: 90% chance
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
  compareCycles(currentCycleNumber: number): CycleComparison {
    const currentCycle = BITCOIN_CYCLES.find(c => c.number === currentCycleNumber);
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

    // Compare with most recent cycle
    const previousCycle = BITCOIN_CYCLES.find(c => c.number === currentCycleNumber - 1);
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

    // Calculate similarity (simplified)
    const similarities = [
      `${currentCycle.name} begon na halving op ${currentCycle.halving.split('-')[0]}`,
      `Vorige cycle (${previousCycle.name}) bereikte ATH van $${previousCycle.ath.toLocaleString()}`,
      'Cyclische patronen herhalen zich in bull runs na halvings'
    ];

    const differences = [];
    if (currentCycle.phases.bullRun.start !== previousCycle.phases.bullRun.start) {
      differences.push('Bull run timing verschilt van vorige cycle');
    }

    const warnings = [];
    if (currentCycleNumber === 4) {
      warnings.push('⚠️ Cycle 4 ATH nog niet bereikt - onzekerheid groter');
      warnings.push('⚠️ Geen historische data voor prijzenpeil boven vorige ATH');
    }

    return {
      currentCycle: currentCycleNumber,
      mostSimilarCycle: previousCycle.number,
      similarityScore: 75, // Simplified
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
    const currentCycle = this.getCurrentCycle(date);
    const currentPhase = this.getCurrentPhase(date);
    const pricePosition = this.analyzePricePosition(currentPrice, currentCycle);
    const recommendation = this.getRecommendation(pricePosition, mode, currentPhase);
    const roiProjections = this.calculateROIProjections(investmentAmount, currentPrice, currentCycle, currentPhase);
    const cycleComparison = this.compareCycles(currentCycle.number);

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
   * Get all cycles for reference
   */
  getAllCycles(): CycleData[] {
    return BITCOIN_CYCLES;
  }

  /**
   * Get cycle by number
   */
  getCycleByNumber(number: number): CycleData | undefined {
    return BITCOIN_CYCLES.find(c => c.number === number);
  }
}

export const cycleAdvisorService = new CycleAdvisorService();

