import { useEffect, useState, useMemo } from 'react';
import { TrendingUp, Calendar, Zap, Minus, Maximize, Calculator, Eye, EyeOff, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { initializeEarlyBitcoinData, fetchAllBitcoinData } from '../services/priceService';
import { bitcoinDataManager } from '../services/bitcoinDataManager';
import { bitcoinApiService } from '../services/bitcoinApiService';
import { PriceData, SimulationResult } from '../types';
import PriceChart from './PriceChart';
import LiveCandleChart from './LiveCandleChart';
import TradingViewChart from './TradingViewChart';
import DCASimulator from './DCASimulator';
import LiveBitcoinPrice from './LiveBitcoinPrice';
import CurrencyToggle from './CurrencyToggle';
import MarketStatusWidget from './MarketStatusWidget';
import { useCurrency } from '../contexts/CurrencyContext';

const halvingEvents = [
  { date: '2012-11-28', block: 210000, reward: '50 → 25 BTC' },
  { date: '2016-07-09', block: 420000, reward: '25 → 12.5 BTC' },
  { date: '2020-05-11', block: 630000, reward: '12.5 → 6.25 BTC' },
  { date: '2024-04-19', block: 840000, reward: '6.25 → 3.125 BTC' }
];

const majorEvents = [
  { 
    date: '2009-01-03', 
    label: 'Genesis Block', 
    description: 'Bitcoin wordt geboren - 3 januari 2009',
    details: 'Satoshi Nakamoto mine de eerste Bitcoin blok (Block 0) met de boodschap "The Times 03/Jan/2009 Chancellor on brink of second bailout for banks". Dit markeert de geboorte van Bitcoin en de blockchain technologie.'
  },
  { 
    date: '2009-01-12', 
    label: 'Eerste Transactie', 
    description: '10 BTC van Satoshi naar Hal Finney',
    details: 'De eerste Bitcoin transactie ooit vond plaats tussen Satoshi Nakamoto en Hal Finney. Finney was een vroege Bitcoin ontwikkelaar en ontving 10 BTC, wat destijds praktisch waardeloos was.'
  },
  { 
    date: '2009-10-05', 
    label: 'Eerste Wisselkoers', 
    description: 'New Liberty Standard: $1 = 1,309 BTC',
    details: 'New Liberty Standard publiceerde de eerste Bitcoin wisselkoers: $1 USD = 1,309.03 BTC. Dit was gebaseerd op de kosten van elektriciteit om Bitcoin te minen.'
  },
  { 
    date: '2010-05-22', 
    label: 'Bitcoin Pizza Day', 
    description: '10,000 BTC voor 2 pizza\'s ($25)',
    details: 'Laszlo Hanyecz kocht twee pizza\'s voor 10,000 BTC, wat destijds $25 waard was. Dit wordt beschouwd als de eerste echte Bitcoin aankoop en wordt jaarlijks gevierd als Bitcoin Pizza Day.'
  },
  { 
    date: '2010-07-11', 
    label: 'Mt. Gox Opent', 
    description: 'Eerste grote Bitcoin exchange',
    details: 'Mt. Gox (Magic: The Gathering Online Exchange) werd opgericht en groeide uit tot de grootste Bitcoin exchange ter wereld. Het verwerkte op zijn hoogtepunt 70% van alle Bitcoin transacties.'
  },
  { 
    date: '2011-06-08', 
    label: 'Eerste ATH', 
    description: 'Bitcoin bereikt $31.95',
    details: 'Bitcoin bereikte zijn eerste All-Time High van $31.95 op Mt. Gox, een stijging van $0.30 naar $31.95 in slechts 6 maanden. Dit was de eerste grote prijsbubbel.'
  },
  { 
    date: '2012-11-28', 
    label: 'Eerste Halving', 
    description: 'Mining reward gehalveerd naar 25 BTC',
    details: 'De eerste Bitcoin halving vond plaats op block 210,000. De mining reward werd gehalveerd van 50 BTC naar 25 BTC per blok. Dit was de eerste test van Bitcoin\'s deflationaire mechanisme.'
  },
  { 
    date: '2013-12-04', 
    label: 'ATH $1,150', 
    description: 'Eerste grote bull run (Cycle 1)',
    details: 'Bitcoin bereikte $1,150 tijdens de eerste grote bull run, een stijging van 10,000% in 2 jaar. Dit werd gedreven door toenemende media aandacht en adoptie in China.'
  },
  { 
    date: '2015-01-01', 
    label: 'Bear Market', 
    description: 'Daling tot $150',
    details: 'Na de piek van $1,150 daalde Bitcoin naar $150, een daling van 87%. Dit was het einde van de eerste Bitcoin cyclus en markeerde het begin van een lange bear market.'
  },
  { 
    date: '2016-07-09', 
    label: 'Tweede Halving', 
    description: 'Mining reward gehalveerd naar 12.5 BTC',
    details: 'De tweede Bitcoin halving vond plaats op block 420,000. De mining reward werd gehalveerd van 25 BTC naar 12.5 BTC per blok. Dit markeerde het begin van de tweede Bitcoin cyclus.'
  },
  { 
    date: '2017-12-17', 
    label: 'ATH $19,700', 
    description: 'Tweede bull run (Cycle 2)',
    details: 'Bitcoin bereikte $19,700 tijdens de tweede grote bull run, een stijging van 13,000% in 2 jaar. Dit werd gedreven door ICO hype, institutional interest en mainstream media aandacht.'
  },
  { 
    date: '2018-12-15', 
    label: 'Bear Market', 
    description: 'Daling tot $3,200',
    details: 'Na de piek van $19,700 daalde Bitcoin naar $3,200, een daling van 84%. Dit was het einde van de tweede Bitcoin cyclus en markeerde het begin van de "crypto winter".'
  },
  { 
    date: '2020-05-11', 
    label: 'Derde Halving', 
    description: 'Mining reward gehalveerd naar 6.25 BTC',
    details: 'De derde Bitcoin halving vond plaats op block 630,000. De mining reward werd gehalveerd van 12.5 BTC naar 6.25 BTC per blok. Dit markeerde het begin van de derde Bitcoin cyclus.'
  },
  { 
    date: '2021-11-10', 
    label: 'ATH $69,000', 
    description: 'Derde bull run (Cycle 3)',
    details: 'Bitcoin bereikte $69,000 tijdens de derde grote bull run, een stijging van 2,100% in 1.5 jaar. Dit werd gedreven door institutional adoption, COVID-19 stimulus en DeFi hype.'
  },
  { 
    date: '2022-12-30', 
    label: 'Bear Market', 
    description: 'Daling tot $15,500',
    details: 'Na de piek van $69,000 daalde Bitcoin naar $15,500, een daling van 78%. Dit was het einde van de derde Bitcoin cyclus en markeerde het begin van een nieuwe bear market.'
  },
  { 
    date: '2024-04-19', 
    label: 'Vierde Halving', 
    description: 'Mining reward gehalveerd naar 3.125 BTC',
    details: 'De vierde Bitcoin halving vond plaats op block 840,000. De mining reward werd gehalveerd van 6.25 BTC naar 3.125 BTC per blok. Dit markeerde het begin van de vierde Bitcoin cyclus.'
  }
];

const bitcoinCycles = [
  {
    id: 'cycle1',
    name: '1e Cycle',
    startYear: 2009,
    endYear: 2015,
    description: 'Accumulatie: 2009–2012 | Bull Run: eind 2012 → eind 2013 | Bear: 2014–2015',
    halving: '2012-11-28',
    phases: {
      accumulation: { start: '2009-01-03', end: '2012-11-28', priceRange: '$0.0008 → $2', type: 'accumulation' },
      bullRun: { start: '2012-11-28', end: '2013-12-17', priceRange: '$2 → $1,150', type: 'bullRun' },
      bearMarket: { start: '2013-12-17', end: '2015-01-14', priceRange: '$1,150 → $150', type: 'bearMarket' }
    }
  },
  {
    id: 'cycle2', 
    name: '2e Cycle',
    startYear: 2015,
    endYear: 2018,
    description: 'Accumulatie: 2015–2016 | Bull Run: 2016–2017 | Bear: 2018',
    halving: '2016-07-09',
    phases: {
      accumulation: { start: '2015-01-15', end: '2016-07-09', priceRange: '$150 → $400', type: 'accumulation' },
      bullRun: { start: '2016-07-09', end: '2017-12-17', priceRange: '$400 → $19,700', type: 'bullRun' },
      bearMarket: { start: '2017-12-18', end: '2018-12-15', priceRange: '$19,700 → $3,200', type: 'bearMarket' }
    }
  },
  {
    id: 'cycle3',
    name: '3e Cycle', 
    startYear: 2018,
    endYear: 2022,
    description: 'Accumulatie: 2019–2020 | Bull Run: 2020–2021 | Bear: 2022',
    halving: '2020-05-11',
    phases: {
      accumulation: { start: '2018-12-16', end: '2020-05-11', priceRange: '$3,200 → $7,000', type: 'accumulation' },
      bullRun: { start: '2020-05-11', end: '2021-11-10', priceRange: '$7,000 → $69,000', type: 'bullRun' },
      bearMarket: { start: '2021-11-11', end: '2022-12-30', priceRange: '$69,000 → $15,500', type: 'bearMarket' }
    }
  },
  {
    id: 'cycle4',
    name: '4e Cycle',
    startYear: 2022,
    endYear: 2026,
    description: 'Accumulatie: 2023–2024 | Bull Run: 2024–2025 | Bear: 2026 (verwacht)',
    halving: '2024-04-20',
    phases: {
      accumulation: { start: '2022-12-31', end: '2024-04-20', priceRange: '$16,000 → $30,000', type: 'accumulation' },
      bullRun: { start: '2024-04-20', end: '2025-06-30', priceRange: 'Bull Run richting top', type: 'bullRun' },
      bearMarket: { start: '2025-07-01', end: '2026-12-31', priceRange: 'Bear Market fase', type: 'bearMarket' }
    }
  }
];

export default function BitcoinHistory() {
  const { currency } = useCurrency();
  const [allPriceData, setAllPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1y' | '3y' | '5y' | 'all' | 'live'>('all');
  const [selectedCycle, setSelectedCycle] = useState<string | null>(null);
  const [zoomStartDate, setZoomStartDate] = useState<string | null>(null);
  const [zoomEndDate, setZoomEndDate] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'price' | 'marketCap'>('price');
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveData, setLiveData] = useState<PriceData[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);

  // Chart layer visibility - Inkoop ON by default, others OFF
  const [showPriceChart, setShowPriceChart] = useState(false);
  const [showDCALayer, setShowDCALayer] = useState(false);  // Inkoop layer OFF by default
  const [showCyclePhases, setShowCyclePhases] = useState(false);
  const [showHalvingEvents, setShowHalvingEvents] = useState(false);
  const [showMajorEvents, setShowMajorEvents] = useState(false);

  // DCA results state
  const [dcaResult, setDcaResult] = useState<SimulationResult | null>(null);

  // Market Status Widget states
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [previousATH, setPreviousATH] = useState<number>(19700);
  const [latestATH, setLatestATH] = useState<number>(69000);

  // Debug DCA result changes
  useEffect(() => {
    if (dcaResult) {
      console.log('DCA Result updated in BitcoinHistory:', {
        purchasePointsCount: dcaResult.purchasePoints.length,
        purchaseDetailsCount: dcaResult.purchaseDetails.length,
        purchasePoints: dcaResult.purchasePoints.slice(0, 3) // First 3 for debugging
      });
    }
  }, [dcaResult]);

  // Load current price and ATH data
  useEffect(() => {
    const loadPriceData = async () => {
      try {
        let price = 0;

        // 1️⃣ Try to get from LiveBitcoinPrice localStorage cache (most reliable)
        const bitcoinCache = localStorage.getItem('bitcoin_last_price');
        if (bitcoinCache) {
          try {
            const cacheData = JSON.parse(bitcoinCache);
            if (cacheData.price && cacheData.price > 1000) {
              price = cacheData.price;
              console.log('💰 Price from LiveBitcoinPrice cache:', price);
            }
          } catch (e) {
            console.warn('⚠️ Cache parse error:', e);
          }
        }

        // 2️⃣ Fallback: Try TradingView price in header
        if (price === 0) {
          // Look for price text in page (1h, 30m, 1h buttons and price display)
          const headerText = document.body.innerText || '';
          // Match 5-digit prices like "85004" or "124753"
          const priceMatches = headerText.match(/\b([0-9]{4,6})\b/g);
          if (priceMatches && priceMatches.length > 0) {
            // Find the largest number in the reasonable range (likely the current price)
            const validPrices = priceMatches
              .map(p => parseInt(p))
              .filter(p => p > 1000 && p < 500000);
            if (validPrices.length > 0) {
              price = Math.max(...validPrices);
              console.log('💰 TradingView price extracted:', price);
            }
          }
        }

        // 3️⃣ Fallback: Try bitcoinApiService
        if (price === 0) {
          try {
            price = await bitcoinApiService.getCurrentPrice();
            console.log('💰 Current price from API:', price);
          } catch (apiError) {
            console.warn('⚠️ API price fetch failed:', apiError);
          }
        }

        // 4️⃣ Fallback: Use old cached price from localStorage
        if (price === 0) {
          const cached = localStorage.getItem('btc_last_price');
          if (cached) {
            price = parseFloat(cached);
            console.log('💾 Using old cached price:', price);
          }
        }

        // Save price to localStorage for next session
        if (price > 0) {
          localStorage.setItem('btc_last_price', price.toString());
          setCurrentPrice(Math.round(price));
        }

        // Extract ATH from cycles
        // Helper function to parse price from range string
        const parseMaxPrice = (priceRange: string): number => {
          const numbers = priceRange.match(/[\d,]+\.?\d*/g);
          if (!numbers) return 0;
          const prices = numbers.map(n => parseFloat(n.replace(/,/g, '')));
          return Math.max(...prices);
        };

        // Previous ATH from Cycle 3 bullRun
        const cycle3 = bitcoinCycles.find(c => c.id === 'cycle3');
        if (cycle3?.phases?.bullRun) {
          const cycle3ATH = parseMaxPrice(cycle3.phases.bullRun.priceRange);
          setPreviousATH(Math.round(cycle3ATH));
          console.log(`📊 Cycle 3 (Previous) ATH: $${cycle3ATH}`);
        }

        // Latest ATH from Cycle 4 bullRun
        const cycle4 = bitcoinCycles.find(c => c.id === 'cycle4');
        if (cycle4?.phases?.bullRun) {
          const cycle4ATH = parseMaxPrice(cycle4.phases.bullRun.priceRange);
          // If it's "Bull Run richting top" (current), use latest price data
          if (cycle4.phases.bullRun.priceRange.includes('richting top')) {
            // Find highest price in current cycle data
            if (allPriceData && allPriceData.length > 0) {
              const cycle4StartDate = new Date('2024-04-20');
              const recentData = allPriceData.filter((p: PriceData) => new Date(p.date) >= cycle4StartDate);
              if (recentData.length > 0) {
                const recentMax = Math.max(...recentData.map((p: PriceData) => p.price));
                setLatestATH(Math.round(recentMax));
                console.log(`📊 Cycle 4 (Current) ATH: $${recentMax}`);
              }
            }
          } else {
            setLatestATH(Math.round(cycle4ATH));
            console.log(`📊 Cycle 4 (Latest) ATH: $${cycle4ATH}`);
          }
        }

        console.log('✅ Market Status prices loaded:', { currentPrice: price, previousATH, latestATH: Math.round(Math.max(...(allPriceData.map((p: PriceData) => p.price) || [0]))) });
      } catch (error) {
        console.error('❌ Error loading price data:', error);
        
        // Fallback to cached price
        const cached = localStorage.getItem('btc_last_price');
        if (cached) {
          setCurrentPrice(Math.round(parseFloat(cached)));
        }
      }
    };

    if (allPriceData.length > 0) {
      loadPriceData();
    }
  }, [allPriceData]);

  // Live data fetch function

  useEffect(() => {
    // Reload data when currency changes
    const initializeData = async () => {
      console.log(`Initializing Bitcoin data for ${currency}...`);
      // Load data for current currency
      await bitcoinDataManager.loadDataForCurrency(currency);
      await loadAllPriceData();
    };
    
    initializeData();
  }, [currency]);


  const loadAllPriceData = async () => {
    setLoading(true);
    try {
      // Loading Bitcoin price data from Supabase (no console logs)
      
      // Check if we have complete data from the new manager for this currency
      const completeData = bitcoinDataManager.getData(currency);
      
      if (completeData && !bitcoinDataManager.getDataInfo(currency).needsUpdate) {
        console.log(`Using cached complete Bitcoin data for ${currency}:`, {
          daily: completeData.daily.length,
          hourly: completeData.hourly.length,
          minute15: completeData.minute15.length,
          dataRange: completeData.dataRange
        });
        
        // Convert to PriceData format
        const prices = completeData.daily.map(point => ({
          date: point.date,
          price: point.price
        }));
        
        setAllPriceData(prices);
      } else {
        console.log(`Fetching complete Bitcoin history from 2009 to present for ${currency}...`);
        
        // Fetch complete history using the new manager for this currency
        await bitcoinDataManager.fetchCompleteHistory(currency);
        
        const newData = bitcoinDataManager.getData(currency);
        if (newData) {
          console.log(`Complete Bitcoin history fetched successfully for ${currency}:`, {
            daily: newData.daily.length,
            dataRange: newData.dataRange
          });
          
          const prices = newData.daily.map(point => ({
            date: point.date,
            price: point.price
          }));
          
          setAllPriceData(prices);
        } else {
          console.log('Fallback to old data loading method...');
          // Fallback to old method
          initializeEarlyBitcoinData();
          const prices = await fetchAllBitcoinData();
          setAllPriceData(prices);
        }
      }
      
      if (allPriceData.length > 0) {
        console.log(`=== DATA LOADING SUCCESS ===`);
        console.log(`Total data points loaded: ${allPriceData.length}`);
        console.log(`Date range in loaded data: ${allPriceData[0].date} to ${allPriceData[allPriceData.length - 1].date}`);
        console.log(`Price range: $${Math.min(...allPriceData.map(p => p.price)).toFixed(2)} to $${Math.max(...allPriceData.map(p => p.price)).toFixed(2)}`);
        
        // Check for early data
        const earlyData = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date < new Date('2011-01-01');
        });
        console.log(`Data before 2011: ${earlyData.length} points`);
        if (earlyData.length > 0) {
          console.log(`Early data sample:`, earlyData.slice(0, 3).map(d => ({ date: d.date, price: d.price })));
        }
        
        // Verify we have data for all cycles
        const cycle1Data = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2009-01-03') && date <= new Date('2015-01-01');
        });
        console.log(`Cycle 1 data points (2009-2015): ${cycle1Data.length}`);
        
        const cycle2Data = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2015-01-01') && date <= new Date('2018-12-31');
        });
        console.log(`Cycle 2 data points (2015-2018): ${cycle2Data.length}`);
        
        const cycle3Data = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2019-01-01') && date <= new Date('2022-12-31');
        });
        console.log(`Cycle 3 data points (2019-2022): ${cycle3Data.length}`);
        
        const cycle4Data = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2023-01-01') && date <= new Date('2026-12-31');
        });
        console.log(`Cycle 4 data points (2023-2026): ${cycle4Data.length}`);
        
        // Check for modern data (2013-present)
        const modernData = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2013-01-01');
        });
        console.log(`Modern data points (2013-present): ${modernData.length}`);
        
        // Check for recent data (2020-present)
        const recentData = allPriceData.filter(p => {
          const date = new Date(p.date);
          return date >= new Date('2020-01-01');
        });
        console.log(`Recent data points (2020-present): ${recentData.length}`);
        
        // Show first few and last few data points
        console.log(`First 5 data points:`, allPriceData.slice(0, 5).map(d => ({ date: d.date, price: d.price })));
        console.log(`Last 5 data points:`, allPriceData.slice(-5).map(d => ({ date: d.date, price: d.price })));
      } else {
        console.warn('No price data loaded!');
      }
    } catch (error) {
      console.error('Error loading price data:', error);
      // Set empty array to prevent crashes
      setAllPriceData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentYearData = async () => {
    try {
      console.log('Updating 2025 data from local CSV...');
      await bitcoinDataManager.update2025DataFromLocalCSV();
      
      // Reload data after update
      await loadAllPriceData();
      
      console.log('2025 data updated successfully from local CSV');
    } catch (error) {
      console.error('Error updating 2025 data:', error);
    }
  };

  // Filter data based on selected time range, cycle, or zoom
  const filteredData = useMemo(() => {
    if (!allPriceData.length) return [];

    // Check for zoom selection first
    if (zoomStartDate && zoomEndDate) {
      const filtered = allPriceData.filter(d => {
        const date = new Date(d.date);
        return date >= new Date(zoomStartDate) && date <= new Date(zoomEndDate);
      });
      
      console.log(`=== ZOOM FILTERING DEBUG ===`);
      console.log(`Zoom range: ${zoomStartDate} to ${zoomEndDate}`);
      console.log(`Filtered data points: ${filtered.length}`);
      
      if (filtered.length > 0) {
        console.log(`Zoom date range: ${filtered[0].date} to ${filtered[filtered.length - 1].date}`);
        console.log(`Zoom price range: $${Math.min(...filtered.map(p => p.price)).toFixed(2)} to $${Math.max(...filtered.map(p => p.price)).toFixed(2)}`);
      }
      
      return filtered;
    }

    if (selectedCycle) {
      const cycle = bitcoinCycles.find(c => c.id === selectedCycle);
      if (!cycle) return allPriceData;
      
      // Use more specific date ranges for cycles
      let startDate: Date;
      let endDate: Date;
      
      switch (cycle.id) {
        case 'cycle1':
          startDate = new Date('2009-01-03'); // Start from Bitcoin genesis
          endDate = new Date('2015-01-01');
          break;
        case 'cycle2':
          startDate = new Date('2015-01-01');
          endDate = new Date('2018-12-31');
          break;
        case 'cycle3':
          startDate = new Date('2019-01-01');
          endDate = new Date('2022-12-31');
          break;
        case 'cycle4':
          startDate = new Date('2023-01-01');
          endDate = new Date();
          break;
        default:
          startDate = new Date(cycle.startYear, 0, 1);
          endDate = new Date(cycle.endYear, 11, 31);
      }
      
      const filtered = allPriceData.filter(d => {
        const date = new Date(d.date);
        return date >= startDate && date <= endDate;
      });
      
      console.log(`=== CYCLE FILTERING DEBUG ===`);
      console.log(`Cycle: ${cycle.name} (${cycle.id})`);
      console.log(`Filter range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      console.log(`Total data points available: ${allPriceData.length}`);
      console.log(`Filtered data points: ${filtered.length}`);
      console.log(`Date range in all data: ${allPriceData[0]?.date} to ${allPriceData[allPriceData.length - 1]?.date}`);
      
      if (filtered.length > 0) {
        console.log(`Filtered date range: ${filtered[0].date} to ${filtered[filtered.length - 1].date}`);
        console.log(`Price range: $${Math.min(...filtered.map(p => p.price)).toFixed(2)} to $${Math.max(...filtered.map(p => p.price)).toFixed(2)}`);
      } else {
        console.warn(`NO DATA FOUND for ${cycle.name}!`);
        console.log(`Available data sample:`, allPriceData.slice(0, 5).map(d => ({ date: d.date, price: d.price })));
      }
      
      return filtered;
    }

      const end = new Date();
      const start = new Date();

      switch (timeRange) {
        case '1y':
          start.setFullYear(end.getFullYear() - 1);
          break;
        case '3y':
          start.setFullYear(end.getFullYear() - 3);
          break;
        case '5y':
          start.setFullYear(end.getFullYear() - 5);
          break;
        case 'live':
          setIsLiveMode(true);
          return liveData.length > 0 ? liveData : allPriceData.slice(-24); // Last 24 hours or live data
        case 'all':
          return allPriceData;
      }

    return allPriceData.filter(d => {
      const date = new Date(d.date);
      return date >= start && date <= end;
    });
  }, [allPriceData, timeRange, selectedCycle, zoomStartDate, zoomEndDate]);

  // Filter out unrealistic prices from chart data (Bitcoin ATH is ~$126k, so anything > $130k is incorrect)
  const REAL_BITCOIN_ATH = 126080; // Real ATH from Oct 6, 2025
  const cleanedFilteredData = useMemo(() => {
    return filteredData.map(d => {
      // Cap any price > $130k to the real ATH
      if (d.price > 130000) {
        return { ...d, price: REAL_BITCOIN_ATH };
      }
      return d;
    });
  }, [filteredData]);

  // Calculate min and max prices for the filtered data
  // Note: Real Bitcoin ATH is approximately $126,080 (Oct 6, 2025), not $133k or higher
  const { minPrice, maxPrice, minDate, maxDate } = useMemo(() => {
    if (!cleanedFilteredData.length) return { minPrice: 0, maxPrice: 0, minDate: '', maxDate: '' };
    
    const prices = cleanedFilteredData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const minData = cleanedFilteredData.find(d => d.price === minPrice);
    const maxData = cleanedFilteredData.find(d => d.price === maxPrice);
    
    return {
      minPrice,
      maxPrice,
      minDate: minData?.date || '',
      maxDate: maxData?.date || ''
    };
  }, [cleanedFilteredData]);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      // Voor zeer lage prijzen (onder $0.01), toon 6 decimalen
      return price.toLocaleString('nl-NL', { 
        minimumFractionDigits: 6,
        maximumFractionDigits: 6 
      });
    } else if (price < 1) {
      // Voor prijzen onder $1, toon 4 decimalen
      return price.toLocaleString('nl-NL', { 
        minimumFractionDigits: 4,
        maximumFractionDigits: 4 
      });
    } else if (price < 10) {
      // Voor prijzen onder $10, toon 2-4 decimalen
      return price.toLocaleString('nl-NL', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 4 
      });
    } else if (price < 100) {
      // Voor prijzen onder $100, toon 2 decimalen
      return price.toLocaleString('nl-NL', { 
        minimumFractionDigits: 2,
        maximumFractionDigits: 2 
      });
    } else {
      // Voor hoge prijzen, toon geen decimalen
      return price.toLocaleString('nl-NL', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0 
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Bitcoin Prijsgeschiedenis en Analyse</h1>
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-3 rounded-xl">
            <TrendingUp className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bitcoin Geschiedenis</h2>
            <p className="text-gray-600 text-sm">Historische prijsontwikkeling sinds 2009 (Genesis)</p>
          </div>
        </div>

        {/* Live Bitcoin Price */}
        <div className="flex items-center gap-4">
          <div className="lg:max-w-xs">
            <LiveBitcoinPrice />
          </div>
          {/* Currency toggle removed from admin view */}
        </div>
      </div>

      {/* Data Management */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Beheer</h3>
        <div className="flex gap-3">
          <button
            onClick={updateCurrentYearData}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Update 2025 Data
          </button>
          <button
            onClick={async () => {
              try {
                await bitcoinDataManager.triggerDailyUpdate();
                await loadAllPriceData();
                alert('Dagelijkse prijs update voltooid!');
              } catch (error) {
                console.error('Error updating daily price:', error);
                alert('Fout bij het updaten van de dagelijkse prijs');
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Update Huidige Prijs
          </button>
          <button
            onClick={() => {
              const info = bitcoinDataManager.getDataInfo();
              console.log('Data Info:', info);
              alert(`Data Info:\nTotal Days: ${info.totalDays}\nDate Range: ${info.dateRange}\nLast Updated: ${info.lastUpdated}\nNeeds Update: ${info.needsUpdate}`);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Data Info
          </button>
          <button
            onClick={() => {
              setSelectedCycle(null);
              setTimeRange('all');
              setZoomStartDate(null);
              setZoomEndDate(null);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Reset Zoom
          </button>
          <button
            onClick={async () => {
              console.log('Force reloading all data...');
              await bitcoinDataManager.forceReloadAllData();
              await loadAllPriceData();
              console.log('Data reload completed');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Force Reload
          </button>
        </div>
      </div>

      {/* Cycle Filters */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Bitcoin Market Cycli per Halving</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bitcoinCycles.map((cycle) => (
            <button
              key={cycle.id}
              onClick={() => {
                setSelectedCycle(cycle.id);
                setTimeRange('all');
                
                // Auto-zoom to selected cycle
                let startDate: Date;
                let endDate: Date;
                
                switch (cycle.id) {
                  case 'cycle1':
                    startDate = new Date('2009-01-03');
                    endDate = new Date('2015-01-01');
                    break;
                  case 'cycle2':
                    startDate = new Date('2015-01-01');
                    endDate = new Date('2018-12-31');
                    break;
                  case 'cycle3':
                    startDate = new Date('2019-01-01');
                    endDate = new Date('2022-12-31');
                    break;
                  case 'cycle4':
                    startDate = new Date('2023-01-01');
                    endDate = new Date();
                    break;
                  default:
                    startDate = new Date(cycle.startYear, 0, 1);
                    endDate = new Date(cycle.endYear, 11, 31);
                }
                
                // Set zoom dates to focus on the cycle
                setZoomStartDate(startDate.toISOString().split('T')[0]);
                setZoomEndDate(endDate.toISOString().split('T')[0]);
              }}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selectedCycle === cycle.id
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold text-sm text-gray-900">{cycle.name}</div>
                <div className="text-xs text-gray-500">
                  {cycle.startYear} - {cycle.endYear}
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-600">Accumulatie:</span>
                  <span className="text-gray-800 font-medium">{cycle.phases.accumulation.priceRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bull Run:</span>
                  <span className="text-green-600 font-medium">{cycle.phases.bullRun.priceRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bear Market:</span>
                  <span className="text-red-600 font-medium">{cycle.phases.bearMarket.priceRange}</span>
                </div>
                <div className="flex justify-between mt-2 pt-1 border-t border-gray-200">
                  <span className="text-gray-600">Halving:</span>
                  <span className="text-orange-600 font-medium">
                    {new Date(cycle.halving).toLocaleDateString('nl-NL', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>


      {loading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          {/* Min/Max Price Display */}
          {filteredData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Minus className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Laagste Punt</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  ${formatPrice(minPrice)}
                </p>
                <p className="text-xs text-red-700 mt-1">
                  {new Date(minDate).toLocaleDateString('nl-NL', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Maximize className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Hoogste Punt</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  ${formatPrice(maxPrice)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  {new Date(maxDate).toLocaleDateString('nl-NL', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Time Range Controls for Bitcoin History */}
          <div className="mb-4 flex gap-2 flex-wrap">
            <button
              onClick={() => {
                setTimeRange('1y');
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
                setIsLiveMode(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '1y'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              1Y
            </button>
            <button
              onClick={() => {
                setTimeRange('3y');
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
                setIsLiveMode(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '3y'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              3Y
            </button>
            <button
              onClick={() => {
                setTimeRange('5y');
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
                setIsLiveMode(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === '5y'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              5Y
            </button>
            <button
              onClick={() => {
                setTimeRange('all');
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
                setIsLiveMode(false);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === 'all'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Alles
            </button>
            <button
              onClick={() => {
                setTimeRange('live');
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
                setIsLiveMode(true);
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                timeRange === 'live'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              Live
              {isLiveMode && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </button>
          </div>

          {/* Chart Layer Controls - Disabled when Live is active */}
          <div className={`mb-4 rounded-xl p-4 transition-all ${
            timeRange === 'live' 
              ? 'bg-gray-200 opacity-50 cursor-not-allowed' 
              : 'bg-gray-50'
          }`}>
            <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
              timeRange === 'live' 
                ? 'text-gray-500' 
                : 'text-gray-900'
            }`}>
              <Layers className="w-5 h-5" />
              Chart Lagen
            </h3>
            <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 ${
              timeRange === 'live' ? 'pointer-events-none' : ''
            }`}>
              <button
                onClick={() => setShowPriceChart(!showPriceChart)}
                disabled={!dcaResult || timeRange === 'live'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  !dcaResult || timeRange === 'live'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showPriceChart
                    ? 'bg-gray-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {showPriceChart ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Inkoop
              </button>
              
              <button
                onClick={() => setShowCyclePhases(!showCyclePhases)}
                disabled={timeRange === 'live'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'live'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showCyclePhases
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {showCyclePhases ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Market Cycli
              </button>
              
              <button
                onClick={() => setShowHalvingEvents(!showHalvingEvents)}
                disabled={timeRange === 'live'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'live'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showHalvingEvents
                    ? 'bg-purple-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {showHalvingEvents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Halving Events
              </button>
              
              <button
                onClick={() => setShowMajorEvents(!showMajorEvents)}
                disabled={timeRange === 'live'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'live'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showMajorEvents
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {showMajorEvents ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                Belangrijke Momenten
              </button>
              
              <button
                onClick={() => setShowDCALayer(!showDCALayer)}
                disabled={timeRange === 'live'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === 'live'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : showDCALayer
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300'
                }`}
              >
                {showDCALayer ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                DCA Simulator
              </button>
            </div>
          </div>

          {/* Chart Section - Toggle between Live (TradingView) and Historical */}
          {timeRange === 'live' ? (
            // Live Chart
            <div className="mb-6">
              <TradingViewChart height={500} />
            </div>
          ) : (
            // Historical Chart
          <div className="bg-gray-50 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Historische Analyse</h3>
            <PriceChart
              data={cleanedFilteredData}
              height={400}
              color="#f97316"
              minMaxLines={{
                min: { price: minPrice, date: minDate },
                max: { price: maxPrice, date: maxDate }
              }}
              halvingEvents={showHalvingEvents ? halvingEvents : []}
              majorEvents={showMajorEvents ? majorEvents : []}
              highlightedEvent={selectedEvent}
              cyclePhases={showCyclePhases ? 
                selectedCycle ? 
                  bitcoinCycles.find(cycle => cycle.id === selectedCycle)?.phases ? 
                    Object.values(bitcoinCycles.find(cycle => cycle.id === selectedCycle)!.phases).map(phase => ({
                      start: phase.start,
                      end: phase.end,
                      priceRange: phase.priceRange,
                      type: phase.type as 'accumulation' | 'bullRun' | 'bearMarket'
                    })) : [] : 
                  bitcoinCycles.flatMap(cycle => 
                    Object.values(cycle.phases).map(phase => ({
                      start: phase.start,
                      end: phase.end,
                      priceRange: phase.priceRange,
                      type: phase.type as 'accumulation' | 'bullRun' | 'bearMarket'
                    }))
                  ) : []
              }
              purchasePoints={showPriceChart && dcaResult ? dcaResult.purchasePoints : []}
              purchaseDetails={showPriceChart && dcaResult ? dcaResult.purchaseDetails : []}
              showZoomControls={true}
              showMetricToggle={true}
              showZoomSlider={true}
              onZoomChange={(startDate, endDate) => {
                setZoomStartDate(startDate);
                setZoomEndDate(endDate);
                // Don't clear cycle selection when zooming - user is still exploring the cycle
                setTimeRange('all');
              }}
              onMetricChange={(metric) => {
                setSelectedMetric(metric);
              }}
              onTimeRangeChange={(range) => {
                setTimeRange(range);
                setSelectedCycle(null);
                setZoomStartDate(null);
                setZoomEndDate(null);
              }}
              currentTimeRange={timeRange}
              isLiveMode={isLiveMode}
              lastUpdateTime={lastUpdateTime}
              selectedCycle={selectedCycle}
              bitcoinCycles={bitcoinCycles}
            />
          </div>
          )}

          {/* Market Status Widget - Own Row */}
          <div className="mb-6 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <MarketStatusWidget 
              position="between_aths" 
              compact={false}
              currentPrice={currentPrice}
              previousATH={previousATH}
              latestATH={latestATH}
              collapsible={true}
              defaultExpanded={false}
            />
          </div>

          {/* DCA Simulator - Compact below chart */}
          {showDCALayer && (
            <div className="mb-6 bg-emerald-50 rounded-xl p-3 border border-emerald-200">
              <h3 className="text-sm font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                DCA Simulator
              </h3>
              <DCASimulator 
                startDate={zoomStartDate || (filteredData.length > 0 ? filteredData[0].date : '2009-01-03')}
                endDate={zoomEndDate || (filteredData.length > 0 ? filteredData[filteredData.length - 1].date : new Date().toISOString().split('T')[0])}
                priceData={filteredData}
                selectedCycle={selectedCycle}
                onDCAResult={(result) => {
                  console.log('DCA Result received in BitcoinHistory:', result);
                  setDcaResult(result);
                }}
              />
            </div>
          )}

          {/* Halving Events and Major Events - Always visible */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Halving Events</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                Elke ~4 jaar wordt de Bitcoin mining reward gehalveerd, wat historisch geleid heeft tot prijsstijgingen.
              </p>
              <div className="space-y-3">
                {halvingEvents.map((event, index) => (
                  <div key={index} className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-blue-900">
                      {new Date(event.date).toLocaleDateString('nl-NL', {
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                      <span className="text-xs text-gray-600">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-900 font-semibold">Block {event.block.toLocaleString()}</span>
                      <span className="text-blue-700 font-medium">{event.reward}</span>
                    </div>
                  </div>
                ))}
                <div className="pt-3 border-t border-blue-200">
                  <p className="text-xs text-gray-600">
                    Volgende halving: ~2028
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-lg font-bold text-orange-900">Belangrijke Momenten</h3>
              </div>
              <p className="text-sm text-gray-700 mb-3">
                Bitcoin kent cyclische bewegingen met extreme hoogte- en dieptepunten.
              </p>
              
              {/* Scrollable container with 4 visible blocks */}
              <div className="max-h-[320px] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#f97316 #f3f4f6' }}>
                <style>{`
                  div::-webkit-scrollbar {
                    width: 6px;
                  }
                  div::-webkit-scrollbar-track {
                    background: #f3f4f6;
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb {
                    background: #f97316;
                    border-radius: 3px;
                  }
                  div::-webkit-scrollbar-thumb:hover {
                    background: #ea580c;
                  }
                `}</style>
                <div className="space-y-2">
                {majorEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className={`bg-white bg-opacity-50 rounded-lg p-3 relative cursor-pointer hover:bg-opacity-70 transition-all ${
                        selectedEvent === event.date ? 'ring-2 ring-orange-500 bg-opacity-80' : ''
                      }`}
                      onMouseEnter={() => setHoveredEvent(index)}
                      onMouseLeave={() => setHoveredEvent(null)}
                      onClick={() => {
                        // Toggle selection: if already selected, deselect; otherwise select
                        setSelectedEvent(selectedEvent === event.date ? null : event.date);
                      }}
                    >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-orange-900">{event.label}</span>
                      <span className="text-xs text-gray-600">
                        {event.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-700">{event.description}</p>
                      
                      {/* Hover popup */}
                      {hoveredEvent === index && (
                        <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10">
                          <p className="leading-relaxed">{event.details}</p>
                          <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                        </div>
                      )}
                  </div>
                ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6">
            <h4 className="font-semibold text-gray-900 mb-3">4-Jaar Cyclus Patroon</h4>
            <p className="text-sm text-gray-700 leading-relaxed mb-3">
              Bitcoin volgt historisch gezien een patroon van 4-jarige cycli, gedreven door de halving events.
              Elke cyclus bestaat uit drie fasen: <strong>Accumulatie</strong> (laagste prijzen), <strong>Bull Run</strong> (prijsstijging), 
              en <strong>Bear Market</strong> (correctie). Dit patroon heeft zich tot nu toe drie keer herhaald.
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Historisch patroon:</strong> Bitcoin bereikt de top 12-18 maanden na elke halving</p>
              <p><strong>Huidige cyclus (4e):</strong> Halving was op 19 april 2024, verwachte top midden tot eind 2025</p>
              <p><strong>Belangrijk:</strong> Historische prestaties zijn geen garantie voor de toekomst</p>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
