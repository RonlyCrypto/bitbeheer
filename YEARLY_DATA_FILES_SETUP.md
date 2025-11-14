# Yearly Bitcoin Price Data Files Setup

Automatische JSON files per jaar (2025.json, 2026.json, etc.)

## 🎯 Wat Doet Het

- **Elk jaar automatisch** → Nieuw bestand aangemaakt (2026.json, 2027.json, etc.)
- **Per jaar opgeslagen** → Alle data van dat jaar in 1 file
- **Snelle laadtijden** → Direct data beschikbaar zonder database queries
- **Offline beschikbaar** → Kan gebufferd worden in browser

## 📋 Setup Keuze 1: **Supabase Storage** (AANBEVOLEN)

Serverless en automatisch.

### 1. Deploy Edge Function

```bash
# Deploy naar Supabase
supabase functions deploy generate-yearly-files

# Test
supabase functions invoke generate-yearly-files
```

### 2. Create Supabase Storage Bucket

```bash
# Via Supabase Dashboard:
# 1. Go to "Storage"
# 2. Click "New bucket"
# 3. Name: "bitcoin-price-data"
# 4. Make public (for direct access)
# 5. Click "Create"
```

### 3. Set Up Scheduled Job

```bash
# Via Supabase Dashboard:
# 1. Go to "Database" -> "Webhooks"
# 2. Create new webhook
# 3. Name: "generate-yearly-files"
# 4. Event: Every January 1st at 00:00 UTC
# 5. URL: Your Edge Function URL
# 6. Method: POST
```

## 📋 Setup Keuze 2: **Local Node.js**

Voor development of self-hosted.

### 1. Generate Files Manually

```bash
# Generate all yearly files right now
node generate-yearly-json-files.js

# This creates:
# public/bitcoin-data/2024.json
# public/bitcoin-data/2025.json
# public/bitcoin-data/2026.json
# public/bitcoin-data/index.json
```

### 2. Set Up Cron Job

```bash
# Add to crontab (runs every January 1st)
0 0 1 1 * cd /path/to/DCA\ platform && node generate-yearly-json-files.js >> /tmp/yearly-gen.log 2>&1

# Or for testing: every day at 2 AM
0 2 * * * cd /path/to/DCA\ platform && node generate-yearly-json-files.js >> /tmp/yearly-gen.log 2>&1
```

## 🗂️ File Structure

Each yearly file contains:

```json
{
  "year": 2025,
  "startDate": "2025-01-01",
  "endDate": "2025-11-14",
  "totalDays": 319,
  "priceRecords": [
    {
      "date": "2025-01-01",
      "timestamp": 1735689600,
      "price_usd": 94567.89,
      "price_eur": 91234.56,
      "volume_usd": 28500000000,
      "market_cap_usd": 1876543000000,
      "price_change_24h": 2.34
    },
    // ... more records
  ],
  "lastUpdated": "2025-11-14T22:30:00Z",
  "version": "1.0.0"
}
```

Index file (index.json):

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-11-14T22:30:00Z",
  "availableYears": [2024, 2025, 2026],
  "files": {
    "2024": {
      "filename": "2024.json",
      "path": "/bitcoin-data/2024.json",
      "type": "application/json"
    },
    "2025": {
      "filename": "2025.json",
      "path": "/bitcoin-data/2025.json",
      "type": "application/json"
    }
  }
}
```

## 💻 Load Yearly Data in Frontend

```typescript
import { bitcoinYearlyDataManager } from './services/bitcoinYearlyDataManager';

// Load data for specific year
const data2025 = await bitcoinYearlyDataManager.loadYearlyData(2025);

console.log(`${data2025.year}: ${data2025.totalDays} price records`);
console.log(`From ${data2025.startDate} to ${data2025.endDate}`);

// Get price for specific date
const dayPrice = await bitcoinYearlyDataManager.getPriceForDate('2025-06-15');
console.log(`BTC price on 2025-06-15: $${dayPrice.price_usd}`);

// Export year as download
await bitcoinYearlyDataManager.exportYear(2025);

// Get all available years
const years = await bitcoinYearlyDataManager.getAllYears();
console.log(`Available years: ${years.join(', ')}`);
```

## 🔄 Auto-Generate New Year

Automatically called on year change:

```typescript
// In App.tsx or component
useEffect(() => {
  // Check if new year started and create file
  bitcoinYearlyDataManager.checkAndCreateNewYear();
}, []);
```

## 📊 File Access URLs

Once deployed:

```
# Via Supabase Storage
https://your-project.supabase.co/storage/v1/object/public/bitcoin-price-data/2025.json

# Via local public folder
https://yoursite.com/bitcoin-data/2025.json

# Index file
https://yoursite.com/bitcoin-data/index.json
```

## 🚀 Automation Timeline

- **January 1st, 00:00 UTC** → New year file created automatically
- **Every day** → Prices in current year file updated via scheduler
- **End of year** → Previous year file is complete and immutable
- **2026 starts** → 2026.json automatically created

## ✅ Checklist

- [ ] Deploy `generate-yearly-files` Edge Function
- [ ] Create `bitcoin-price-data` Storage Bucket in Supabase
- [ ] Set up scheduled webhook for January 1st
- [ ] First run: `node generate-yearly-json-files.js`
- [ ] Verify files created in `public/bitcoin-data/` or Storage
- [ ] Test loading data in frontend
- [ ] Monitor logs for errors

## 🧪 Test

```bash
# Local test
node generate-yearly-json-files.js

# Check output
ls -la public/bitcoin-data/
cat public/bitcoin-data/index.json

# Monitor cron logs (if using crontab)
tail -f /tmp/yearly-gen.log
```

## 🎯 Benefits

✅ **One file per year** - Easy organization  
✅ **Fast loading** - No database queries needed  
✅ **Offline ready** - Can be cached/downloaded  
✅ **Immutable history** - Previous years don't change  
✅ **Auto-creation** - New year = new file automatically  
✅ **Indexed access** - index.json knows all files  

---

**Result**: You have organized Bitcoin price data per year, automatically created, and instantly accessible! 📊📅

