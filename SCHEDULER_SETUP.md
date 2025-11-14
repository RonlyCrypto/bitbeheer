# Bitcoin Price Scheduler Setup

Automatische dagelijkse updates van Bitcoin prijshistorie!

## 🎯 Wat Doet Het

- **Elke dag** haalt het systeem prijzen op van de afgelopen 30 dagen
- **Automatisch** checkt het of prijzen al bestaan (geen duplicaten)
- **Vult gaten in** je database met ontbrekende prijsdata
- **Geen handmatig werk** nodig!

## 📋 Keuze 1: **Supabase Scheduler** (Best - Serverless)

Dit is het beste! Draait automatisch op Supabase servers.

### Setup:

```bash
# 1. Deploy Edge Function naar Supabase
supabase functions deploy fill-bitcoin-prices

# 2. Create scheduled job in Supabase Dashboard:
# - Go to "Database" -> "Webhooks"
# - Create new webhook
# - Name: "fill-bitcoin-prices"
# - Event: Daily at 2 AM UTC
# - Function: fill-bitcoin-prices
```

### Test:

```bash
# Test locally eerst
supabase functions invoke fill-bitcoin-prices

# Dan deploy naar production
supabase functions deploy fill-bitcoin-prices --prod
```

---

## 📋 Keuze 2: **Node.js Scheduler** (Local/VPS)

Draait op jouw machine of VPS met cron job.

### Setup:

#### Mac/Linux:

```bash
# 1. Open crontab editor
crontab -e

# 2. Add this line (runs daily at 2 AM UTC)
0 2 * * * cd /path/to/DCA\ platform && node scheduler-bitcoin-prices.js >> /tmp/bitcoin-scheduler.log 2>&1

# 3. Save (Ctrl+X, Y, Enter in nano)

# 4. Verify
crontab -l
```

**Explanation:**
- `0 2 * * *` = Every day at 2 AM UTC
- `/path/to/DCA platform` = Your project directory
- `>> /tmp/bitcoin-scheduler.log` = Save logs for debugging

#### Windows (Task Scheduler):

```batch
REM 1. Create batch file: scheduler.bat
@echo off
cd /d "C:\path\to\DCA platform"
node scheduler-bitcoin-prices.js
pause

REM 2. Open Task Scheduler
REM 3. Create Basic Task
REM 4. Set trigger: Daily at 2 AM
REM 5. Set action: Run scheduler.bat
```

### Manual Test:

```bash
# Test locally first
node scheduler-bitcoin-prices.js

# Output should show:
# ✅ Completed! Saved X prices
```

---

## 🧪 Test Both Options

### Option 1 - Edge Function:

```bash
# Invoke once to test
curl -X POST https://your-project.supabase.co/functions/v1/fill-bitcoin-prices \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"

# Check result
supabase functions list
```

### Option 2 - Node Script:

```bash
# Run manually
node scheduler-bitcoin-prices.js

# Check logs
tail -f /tmp/bitcoin-scheduler.log

# Should show:
# 🚀 Bitcoin Price Scheduler Started
# ✅ [1] 2025-10-16: $94500
# ✅ [2] 2025-10-17: $94600
# ...
```

---

## 📊 Database Status

Check how much data you have:

```sql
-- Via Supabase SQL editor
SELECT 
  COUNT(*) as total_prices,
  MIN(date) as oldest_date,
  MAX(date) as newest_date,
  COUNT(DISTINCT YEAR(date)) as years_covered
FROM bitcoin_price_data
WHERE price_usd IS NOT NULL;
```

Expected: ~800+ daily prices + hourly prices

---

## 🔧 Troubleshooting

### CronTab Not Working

```bash
# Check crontab is running
ps aux | grep cron

# Check logs
cat /tmp/bitcoin-scheduler.log

# Verify path and env vars
echo $PATH
echo $VITE_SUPABASE_URL
```

### "No Supabase environment variables"

```bash
# Make sure .env is in your project root
cat .env | grep VITE_SUPABASE

# If missing, add:
VITE_SUPABASE_URL=your-url
VITE_SUPABASE_ANON_KEY=your-key
```

### "Rate limit exceeded"

The script already has 500ms delays between requests. If still failing:

```bash
# Increase delay in scheduler-bitcoin-prices.js
await new Promise(resolve => setTimeout(resolve, 1000)); // Change to 1000ms
```

---

## 📈 What Gets Stored

Every day the scheduler:

1. **Checks last 30 days** for gaps
2. **Fetches missing prices** from CoinGecko
3. **Saves to `bitcoin_price_data`**:
   - `date` (YYYY-MM-DD)
   - `price_usd`
   - `price_eur`
   - `volume_usd`
   - `market_cap_usd`
   - `year` (for indexing)

Your charts then use this data instantly! 📊

---

## 🎯 Recommendation

**Best Setup:**
1. Use **Supabase Edge Function** for production (no setup needed, serverless)
2. Use **Node Scheduler** as backup for local testing

This way you're never missing any Bitcoin price data! ✅

