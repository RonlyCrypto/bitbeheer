/**
 * Vercel Cron Job: Dagelijkse Bitcoin prijs opslaan
 * Draait elke dag om 02:00 UTC via vercel.json crons
 * Kan ook handmatig worden aangeroepen met ?action=backfill&from=YYYY-MM-DD&to=YYYY-MM-DD
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const COINGECKO_URL = 'https://api.coingecko.com/api/v3';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Haal Bitcoin prijs op voor een specifieke datum via CoinGecko
 * Format datum: DD-MM-YYYY (CoinGecko vereiste)
 */
async function fetchPriceForDate(dateStr) {
  // dateStr = YYYY-MM-DD, omzetten naar DD-MM-YYYY voor CoinGecko
  const [year, month, day] = dateStr.split('-');
  const cgDate = `${day}-${month}-${year}`;

  const url = `${COINGECKO_URL}/coins/bitcoin/history?date=${cgDate}&localization=false`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinGecko ${response.status} voor ${dateStr}`);
  }

  const data = await response.json();

  if (!data.market_data) {
    throw new Error(`Geen marktdata voor ${dateStr}`);
  }

  return {
    price_usd: data.market_data.current_price.usd,
    price_eur: data.market_data.current_price.eur || 0,
    volume_usd: data.market_data.total_volume?.usd || 0,
    market_cap_usd: data.market_data.market_cap?.usd || 0,
  };
}

/**
 * Haal recente Bitcoin prijzen op via market_chart/range (efficiënter dan per dag)
 */
async function fetchPriceRange(fromDate, toDate) {
  const fromTs = Math.floor(new Date(fromDate).getTime() / 1000);
  const toTs   = Math.floor(new Date(toDate).getTime()   / 1000);

  const url = `${COINGECKO_URL}/coins/bitcoin/market_chart/range?vs_currency=usd&from=${fromTs}&to=${toTs}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`CoinGecko range fetch mislukt: ${response.status}`);
  }

  const data = await response.json();

  // Dedupleer op datum (bewaar laatste prijs per dag)
  const byDate = {};
  for (const [ts, price] of data.prices) {
    const dateStr = new Date(ts).toISOString().split('T')[0];
    byDate[dateStr] = price;
  }

  const marketCaps = {};
  for (const [ts, mc] of (data.market_caps || [])) {
    const dateStr = new Date(ts).toISOString().split('T')[0];
    marketCaps[dateStr] = mc;
  }

  const volumes = {};
  for (const [ts, vol] of (data.total_volumes || [])) {
    const dateStr = new Date(ts).toISOString().split('T')[0];
    volumes[dateStr] = vol;
  }

  return Object.entries(byDate).map(([date, price_usd]) => ({
    date,
    price_usd,
    price_eur: 0, // niet beschikbaar via range endpoint
    volume_usd: volumes[date] || 0,
    market_cap_usd: marketCaps[date] || 0,
  }));
}

/**
 * Sla een rij prijs-data op in Supabase (upsert op date)
 */
async function savePriceRow(date, priceData) {
  const { error } = await supabase
    .from('bitcoin_price_data')
    .upsert([{
      date,
      timestamp:      new Date(date).getTime() / 1000,
      price_usd:      priceData.price_usd,
      price_eur:      priceData.price_eur || 0,
      volume:         priceData.volume_usd || 0,
      volume_usd:     priceData.volume_usd || 0,
      market_cap:     priceData.market_cap_usd || 0,
      market_cap_usd: priceData.market_cap_usd || 0,
      price_change_24h: 0,
      year:           new Date(date).getFullYear(),
    }], { onConflict: 'date' });

  if (error) throw new Error(`Supabase save mislukt voor ${date}: ${error.message}`);
}

/**
 * Haal alle datums op die al in de database staan
 */
async function getExistingDates(fromDate, toDate) {
  const { data, error } = await supabase
    .from('bitcoin_price_data')
    .select('date')
    .gte('date', fromDate)
    .lte('date', toDate);

  if (error) throw new Error(`Database leesfout: ${error.message}`);
  return new Set((data || []).map(r => r.date));
}

/**
 * Genereer alle datums tussen twee datums (inclusief)
 */
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

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check: alleen admin of cron mag dit aanroepen
  const authHeader = req.headers.authorization || '';
  const cronSecret = process.env.CRON_SECRET || '';
  const isVercelCron = req.headers['x-vercel-cron'] === '1';
  const hasSecret = cronSecret && authHeader === `Bearer ${cronSecret}`;
  const isAdmin = req.query.admin === process.env.ADMIN_SYNC_TOKEN;

  if (!isVercelCron && !hasSecret && !isAdmin) {
    return res.status(401).json({ error: 'Niet geautoriseerd' });
  }

  const action = req.query.action || 'daily';

  try {
    // === DAGELIJKS: sla huidige prijs op ===
    if (action === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const priceData = await fetchPriceForDate(today);
      await savePriceRow(today, priceData);

      return res.status(200).json({
        success: true,
        action: 'daily',
        date: today,
        price_usd: priceData.price_usd,
        message: `Prijs opgeslagen: $${priceData.price_usd.toFixed(0)} op ${today}`,
      });
    }

    // === BACKFILL: haal ontbrekende datums op ===
    if (action === 'backfill') {
      const fromDate = req.query.from || '2025-12-01';
      const toDate   = req.query.to   || new Date().toISOString().split('T')[0];

      // Haal bestaande datums op zodat we ze overslaan
      const existing     = await getExistingDates(fromDate, toDate);
      const allDates     = getDatesInRange(fromDate, toDate);
      const missingDates = allDates.filter(d => !existing.has(d));

      if (missingDates.length === 0) {
        return res.status(200).json({
          success: true,
          action: 'backfill',
          message: 'Alle datums al aanwezig in database',
          existing: existing.size,
          missing: 0,
        });
      }

      // Haal alle ontbrekende data in één API-call op (efficiënter)
      const rangeData = await fetchPriceRange(fromDate, toDate);

      // Filter op ontbrekende datums en sla op
      let saved = 0;
      const errors = [];
      for (const row of rangeData) {
        if (!missingDates.includes(row.date)) continue;
        try {
          await savePriceRow(row.date, row);
          saved++;
        } catch (e) {
          errors.push(`${row.date}: ${e.message}`);
        }
        // Kleine pauze om Supabase rate limit te vermijden
        await new Promise(r => setTimeout(r, 20));
      }

      return res.status(200).json({
        success: true,
        action: 'backfill',
        from: fromDate,
        to: toDate,
        total: allDates.length,
        existing: existing.size,
        missing: missingDates.length,
        saved,
        errors: errors.length > 0 ? errors : undefined,
        message: `Backfill klaar: ${saved} nieuwe datums opgeslagen`,
      });
    }

    return res.status(400).json({ error: `Onbekende action: ${action}` });

  } catch (error) {
    console.error('daily-bitcoin-sync error:', error);
    return res.status(500).json({
      error: error.message,
      action,
    });
  }
};
