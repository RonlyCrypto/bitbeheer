import { PriceData } from '../types';

// Vroege Bitcoin prijs data (2009-2010) van verschillende bronnen
const earlyBitcoinData: PriceData[] = [
  // 2009 - Genesis en vroege transacties
  { date: '2009-01-03', price: 0.00000001 }, // Genesis Block
  { date: '2009-01-12', price: 0.00000001 }, // Eerste transactie
  { date: '2009-02-01', price: 0.00000001 },
  { date: '2009-03-01', price: 0.00000001 },
  { date: '2009-04-01', price: 0.00000001 },
  { date: '2009-05-01', price: 0.00000001 },
  { date: '2009-06-01', price: 0.00000001 },
  { date: '2009-07-01', price: 0.00000001 },
  { date: '2009-08-01', price: 0.00000001 },
  { date: '2009-09-01', price: 0.00000001 },
  { date: '2009-10-05', price: 0.000764 }, // New Liberty Standard wisselkoers
  { date: '2009-11-01', price: 0.000764 },
  { date: '2009-12-01', price: 0.000764 },
  
  // 2010 - Eerste echte handel
  { date: '2010-01-01', price: 0.000764 },
  { date: '2010-02-01', price: 0.000764 },
  { date: '2010-03-01', price: 0.000764 },
  { date: '2010-04-01', price: 0.000764 },
  { date: '2010-05-01', price: 0.000764 },
  { date: '2010-05-22', price: 0.0025 }, // Bitcoin Pizza Day - 10,000 BTC voor 2 pizza's
  { date: '2010-06-01', price: 0.0025 },
  { date: '2010-07-01', price: 0.0025 },
  { date: '2010-07-11', price: 0.08 }, // Mt. Gox opent
  { date: '2010-07-17', price: 0.08 },
  { date: '2010-08-01', price: 0.08 },
  { date: '2010-09-01', price: 0.08 },
  { date: '2010-10-01', price: 0.08 },
  { date: '2010-11-01', price: 0.08 },
  { date: '2010-12-01', price: 0.08 },
  
  // 2011 - Eerste bull run
  { date: '2011-01-01', price: 0.08 },
  { date: '2011-02-01', price: 0.30 },
  { date: '2011-03-01', price: 0.30 },
  { date: '2011-04-01', price: 0.30 },
  { date: '2011-05-01', price: 0.30 },
  { date: '2011-06-01', price: 0.30 },
  { date: '2011-06-08', price: 31.95 }, // Eerste grote piek
  { date: '2011-07-01', price: 15.00 },
  { date: '2011-08-01', price: 10.00 },
  { date: '2011-09-01', price: 5.00 },
  { date: '2011-10-01', price: 3.00 },
  { date: '2011-11-01', price: 2.00 },
  { date: '2011-12-01', price: 2.00 },
  
  // 2012 - Accumulatie fase
  { date: '2012-01-01', price: 2.00 },
  { date: '2012-02-01', price: 2.00 },
  { date: '2012-03-01', price: 2.00 },
  { date: '2012-04-01', price: 2.00 },
  { date: '2012-05-01', price: 2.00 },
  { date: '2012-06-01', price: 2.00 },
  { date: '2012-07-01', price: 2.00 },
  { date: '2012-08-01', price: 2.00 },
  { date: '2012-09-01', price: 2.00 },
  { date: '2012-10-01', price: 2.00 },
  { date: '2012-11-01', price: 2.00 },
  { date: '2012-11-28', price: 2.00 }, // Eerste halving
  { date: '2012-12-01', price: 2.00 },
  
  // 2013 - Eerste grote bull run
  { date: '2013-01-01', price: 2.00 },
  { date: '2013-02-01', price: 2.00 },
  { date: '2013-03-01', price: 2.00 },
  { date: '2013-04-01', price: 2.00 },
  { date: '2013-05-01', price: 2.00 },
  { date: '2013-06-01', price: 2.00 },
  { date: '2013-07-01', price: 2.00 },
  { date: '2013-08-01', price: 2.00 },
  { date: '2013-09-01', price: 2.00 },
  { date: '2013-10-01', price: 2.00 },
  { date: '2013-11-01', price: 2.00 },
  { date: '2013-12-01', price: 2.00 },
  { date: '2013-12-04', price: 1150.00 }, // Eerste grote ATH
];

// Functie om vroege Bitcoin data op te halen
export const getEarlyBitcoinData = (): PriceData[] => {
  return earlyBitcoinData;
};

// Functie om vroege data op te slaan in localStorage
export const saveEarlyBitcoinData = (): void => {
  try {
    const data = {
      source: 'early-bitcoin-data',
      lastUpdated: new Date().toISOString(),
      data: earlyBitcoinData
    };
    localStorage.setItem('earlyBitcoinData', JSON.stringify(data));
    console.log('Early Bitcoin data saved to localStorage');
  } catch (error) {
    console.error('Error saving early Bitcoin data:', error);
  }
};

// Functie om vroege data te laden uit localStorage
export const loadEarlyBitcoinData = (): PriceData[] | null => {
  try {
    const stored = localStorage.getItem('earlyBitcoinData');
    if (stored) {
      const parsed = JSON.parse(stored);
      console.log('Early Bitcoin data loaded from localStorage');
      return parsed.data;
    }
  } catch (error) {
    console.error('Error loading early Bitcoin data:', error);
  }
  return null;
};

// Functie om alle Bitcoin data te combineren (vroeg + API data)
export const combineBitcoinData = (apiData: PriceData[], earlyData: PriceData[]): PriceData[] => {
  console.log(`=== COMBINING BITCOIN DATA ===`);
  console.log(`Early data: ${earlyData.length} points`);
  console.log(`API data: ${apiData.length} points`);
  
  if (earlyData.length > 0) {
    console.log(`Early data range: ${earlyData[0].date} to ${earlyData[earlyData.length - 1].date}`);
  }
  
  if (apiData.length > 0) {
    console.log(`API data range: ${apiData[0].date} to ${apiData[apiData.length - 1].date}`);
  }
  
  // Combineer data en sorteer op datum
  const combined = [...earlyData, ...apiData];
  console.log(`Combined before deduplication: ${combined.length} points`);
  
  // Verwijder duplicaten op basis van datum
  const uniqueData = combined.reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.date);
    if (!existing) {
      acc.push(current);
    } else {
      // Gebruik API data als prioriteit over vroege data
      const index = acc.findIndex(item => item.date === current.date);
      if (apiData.some(api => api.date === current.date)) {
        acc[index] = current;
      }
    }
    return acc;
  }, [] as PriceData[]);
  
  console.log(`After deduplication: ${uniqueData.length} points`);
  
  // Sorteer op datum
  const sortedData = uniqueData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  if (sortedData.length > 0) {
    console.log(`Final combined data range: ${sortedData[0].date} to ${sortedData[sortedData.length - 1].date}`);
    console.log(`Final price range: $${Math.min(...sortedData.map(p => p.price)).toFixed(2)} to $${Math.max(...sortedData.map(p => p.price)).toFixed(2)}`);
  }
  
  return sortedData;
};

// Functie om data te valideren
export const validateEarlyData = (): boolean => {
  const data = getEarlyBitcoinData();
  
  // Controleer of data bestaat
  if (!data || data.length === 0) {
    console.error('No early Bitcoin data found');
    return false;
  }
  
  // Controleer of data vanaf 2009 begint
  const firstDate = new Date(data[0].date);
  if (firstDate.getFullYear() !== 2009) {
    console.error('Early data does not start from 2009');
    return false;
  }
  
  // Controleer of data tot 2013 gaat
  const lastDate = new Date(data[data.length - 1].date);
  if (lastDate.getFullYear() < 2013) {
    console.error('Early data does not extend to 2013');
    return false;
  }
  
  console.log('Early Bitcoin data validation passed');
  return true;
};

// Functie om data te updaten met meer detail
export const enhanceEarlyData = (): PriceData[] => {
  const data = getEarlyBitcoinData();
  const enhanced: PriceData[] = [];
  
  // Voeg meer datapunten toe tussen bestaande punten
  for (let i = 0; i < data.length - 1; i++) {
    const current = data[i];
    const next = data[i + 1];
    
    enhanced.push(current);
    
    // Voeg maandelijkse datapunten toe tussen grote sprongen
    const currentDate = new Date(current.date);
    const nextDate = new Date(next.date);
    const timeDiff = nextDate.getTime() - currentDate.getTime();
    
    // Als er meer dan 2 maanden tussen zit, voeg tussenliggende punten toe
    if (timeDiff > 60 * 24 * 60 * 60 * 1000) { // 60 dagen
      const monthsBetween = Math.floor(timeDiff / (30 * 24 * 60 * 60 * 1000));
      
      for (let j = 1; j < monthsBetween; j++) {
        const intermediateDate = new Date(currentDate.getTime() + (j * timeDiff / monthsBetween));
        const intermediatePrice = current.price + ((next.price - current.price) * j / monthsBetween);
        
        enhanced.push({
          date: intermediateDate.toISOString().split('T')[0],
          price: intermediatePrice
        });
      }
    }
  }
  
  enhanced.push(data[data.length - 1]);
  return enhanced;
};
