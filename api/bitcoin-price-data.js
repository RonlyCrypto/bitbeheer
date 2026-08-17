/**
 * Bitcoin price data API
 * GET  ?year=YYYY              - historische CSV data voor een jaar
 * GET  (geen params)           - samenvatting beschikbare data
 * GET  ?action=sync            - dagelijkse prijs opslaan (Vercel cron / admin)
 * GET  ?action=backfill&from=  - ontbrekende datums opvullen vanuit CoinGecko
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// ── Supabase ───────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

// ── Main handler ───────────────────────────────────────────────────────────
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, year, from, to, admin } = req.query;

  // ── Sync / backfill acties (alleen admin / cron) ────────────────────────
  if (action === 'sync' || action === 'backfill') {
    const authHeader = req.headers.authorization || '';
    const cronSecret = process.env.CRON_SECRET || '';
    const isVercelCron = req.headers['x-vercel-cron'] === '1';
    const hasSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
    const isAdmin = admin && admin === process.env.ADMIN_SYNC_TOKEN;
    const isAnonKey = admin && admin === (process.env.VITE_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY);

    if (!isVercelCron && !hasSecret && !isAdmin && !isAnonKey) {
      return res.status(401).json({ error: 'Niet geautoriseerd' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    if (action === 'sync') {
      try {
        const today = new Date().toISOString().split('T')[0];
        const priceData = await fetchPriceForDate(today);
        await savePriceRow(supabase, today, priceData);
        return res.status(200).json({
          success: true,
          action: 'sync',
          date: today,
          price_usd: priceData.price_usd,
          message: `Prijs opgeslagen: $${priceData.price_usd.toFixed(0)} op ${today}`,
        });
      } catch (error) {
        console.error('sync error:', error);
        return res.status(500).json({ error: error.message });
      }
    }

    if (action === 'backfill') {
      try {
        const fromDate = from || '2025-12-01';
        const toDate   = to   || new Date().toISOString().split('T')[0];

        const existing     = await getExistingDates(supabase, fromDate, toDate);
        const allDates     = getDatesInRange(fromDate, toDate);
        const missingDates = allDates.filter(d => !existing.has(d));

        if (missingDates.length === 0) {
          return res.status(200).json({
            success: true, action: 'backfill',
            message: 'Alle datums al aanwezig in database',
            existing: existing.size, missing: 0, saved: 0,
          });
        }

        const rangeData = await fetchPriceRange(fromDate, toDate);
        let saved = 0;
        const errors = [];
        for (const row of rangeData) {
          if (!missingDates.includes(row.date)) continue;
          try {
            await savePriceRow(supabase, row.date, row);
            saved++;
          } catch (e) {
            errors.push(`${row.date}: ${e.message}`);
          }
          await new Promise(r => setTimeout(r, 20));
        }

        return res.status(200).json({
          success: true, action: 'backfill',
          from: fromDate, to: toDate,
          total: allDates.length,
          existing: existing.size,
          missing: missingDates.length,
          saved,
          errors: errors.length > 0 ? errors : undefined,
          message: `Backfill klaar: ${saved} nieuwe datums opgeslagen`,
        });
      } catch (error) {
        console.error('backfill error:', error);
        return res.status(500).json({ error: error.message });
      }
    }
  }

  // ── Historische CSV data ────────────────────────────────────────────────
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (year) {
      const yearData = await loadYearData(year);
      if (!yearData || yearData.length === 0) {
        return res.status(404).json({ error: `No data found for year ${year}` });
      }
      return res.status(200).json({ success: true, year: parseInt(year), data: yearData, count: yearData.length });
    }

    const summary = await getDataSummary();
    return res.status(200).json({ success: true, summary, lastUpdated: new Date().toISOString() });

  } catch (error) {
    console.error('Error in bitcoin-price-data API:', error);
    return res.status(500).json({
      error: 'Failed to load Bitcoin price data',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ── CoinGecko helpers ──────────────────────────────────────────────────────
async function fetchPriceForDate(dateStr) {
  const [year, month, day] = dateStr.split('-');
  const cgDate = `${day}-${month}-${year}`;
  const response = await fetch(`${COINGECKO_URL}/coins/bitcoin/history?date=${cgDate}&localization=false`);
  if (!response.ok) throw new Error(`CoinGecko ${response.status} voor ${dateStr}`);
  const data = await response.json();
  if (!data.market_data) throw new Error(`Geen marktdata voor ${dateStr}`);
  return {
    price_usd:      data.market_data.current_price.usd,
    price_eur:      data.market_data.current_price.eur || 0,
    volume_usd:     data.market_data.total_volume?.usd || 0,
    market_cap_usd: data.market_data.market_cap?.usd || 0,
  };
}

async function fetchPriceRange(fromDate, toDate) {
  const fromTs = Math.floor(new Date(fromDate).getTime() / 1000);
  const toTs   = Math.floor(new Date(toDate).getTime()   / 1000);
  const response = await fetch(`${COINGECKO_URL}/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}`);
  if (!response.ok) throw new Error(`CoinGecko range fetch mislukt: ${response.status}`);
  const data = await response.json();

  const byDate = {};
  for (const [ts, price] of data.prices) byDate[new Date(ts).toISOString().split('T')[0]] = price;
  const marketCaps = {};
  for (const [ts, mc] of (data.market_caps || [])) marketCaps[new Date(ts).toISOString().split('T')[0]] = mc;
  const volumes = {};
  for (const [ts, vol] of (data.total_volumes || [])) volumes[new Date(ts).toISOString().split('T')[0]] = vol;

  return Object.entries(byDate).map(([date, price_usd]) => ({
    date, price_usd, price_eur: 0,
    volume_usd: volumes[date] || 0,
    market_cap_usd: marketCaps[date] || 0,
  }));
}

// ── Supabase helpers ───────────────────────────────────────────────────────
async function savePriceRow(supabase, date, priceData) {
  const { error } = await supabase.from('bitcoin_price_data').upsert([{
    date,
    timestamp:        new Date(date).getTime() / 1000,
    price_usd:        priceData.price_usd,
    price_eur:        priceData.price_eur || 0,
    volume:           priceData.volume_usd || 0,
    volume_usd:       priceData.volume_usd || 0,
    market_cap:       priceData.market_cap_usd || 0,
    market_cap_usd:   priceData.market_cap_usd || 0,
    price_change_24h: 0,
    year:             new Date(date).getFullYear(),
  }], { onConflict: 'date' });
  if (error) throw new Error(`Supabase save mislukt voor ${date}: ${error.message}`);
}

async function getExistingDates(supabase, fromDate, toDate) {
  const { data, error } = await supabase.from('bitcoin_price_data').select('date').gte('date', fromDate).lte('date', toDate);
  if (error) throw new Error(`Database leesfout: ${error.message}`);
  return new Set((data || []).map(r => r.date));
}

function getDatesInRange(fromDate, toDate) {
  const dates = [];
  const current = new Date(fromDate);
  const end     = new Date(toDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// ── CSV helpers ────────────────────────────────────────────────────────────
async function loadYearData(year) {
  try {
    const csvPath = path.join(process.cwd(), 'public', `bitcoin-price-history-${year}.csv`);
    if (fs.existsSync(csvPath)) return parseCSV(fs.readFileSync(csvPath, 'utf-8'));

    const eurPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    if (fs.existsSync(eurPath)) {
      return parseCSV(fs.readFileSync(eurPath, 'utf-8')).filter(
        item => new Date(item.date).getFullYear() === parseInt(year)
      );
    }
    return [];
  } catch (error) {
    console.error(`Error loading year ${year} data:`, error);
    return [];
  }
}

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    const columns = line.includes(';') ? line.split(';') : line.split(',');
    if (columns.length >= 2) {
      const dateStr  = columns[0].replace(/"/g, '').trim();
      const priceStr = columns[1].replace(/"/g, '').replace(',', '.').trim();
      const volumeStr = columns[2] ? columns[2].replace(/"/g, '').trim() : null;
      const price = parseFloat(priceStr);
      if (!isNaN(price)) data.push({ timestamp: new Date(dateStr).getTime(), date: dateStr, price, volume: volumeStr ? parseFloat(volumeStr) : undefined });
    }
  }
  return data;
}

async function getDataSummary() {
  const summary = { availableYears: [], totalDataPoints: 0, dataRange: { start: null, end: null } };
  try {
    const eurPath = path.join(process.cwd(), 'public', 'eur', 'bitcoin-eur-complete-history.csv');
    if (fs.existsSync(eurPath)) {
      const data = parseCSV(fs.readFileSync(eurPath, 'utf-8'));
      if (data.length > 0) {
        const years = new Set(data.map(item => new Date(item.date).getFullYear()));
        summary.availableYears = Array.from(years).sort();
        summary.totalDataPoints = data.length;
        summary.dataRange.start = data[0].date;
        summary.dataRange.end   = data[data.length - 1].date;
        return summary;
      }
    }
    const publicPath = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicPath);
    const yearFiles = files.filter(f => f.startsWith('bitcoin-price-history-') && f.endsWith('.csv'));
    const years = [];
    let totalPoints = 0;
    for (const file of yearFiles) {
      const yearMatch = file.match(/bitcoin-price-history-(\d{4})\.csv/);
      if (yearMatch) {
        years.push(parseInt(yearMatch[1]));
        totalPoints += parseCSV(fs.readFileSync(path.join(publicPath, file), 'utf-8')).length;
      }
    }
    summary.availableYears = years.sort();
    summary.totalDataPoints = totalPoints;
    return summary;
  } catch (error) {
    console.error('Error getting data summary:', error);
    return summary;
  }
}
