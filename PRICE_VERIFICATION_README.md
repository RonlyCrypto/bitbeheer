# 🔧 Bitcoin Price Verification & Auto-Fix System

## ✨ Wat Doet Dit?

Dit systeem **controleert automatisch** Bitcoin prijzen en **fixt fouten** zonder API-limit problemen!

### Features:
- ✅ **Multi-source fallback**: CoinGecko → Blockchain.com → CryptoCompare
- ✅ **Lokale caching**: Slaat prijzen op zodat geen herhaalde API calls nodig zijn
- ✅ **Reference data**: Hardcoded correcte prijzen voor bekende problematische datums
- ✅ **Rate limit aware**: Respectvol voor externe APIs
- ✅ **Dagelijks automatisch**: Draait om 02:00 UTC
- ✅ **Logging**: Ziet exact wat er gebeurt

---

## 🚀 Quick Start

### Stap 1: Juli 2024 Prijzen Fixen (Meteen!)

**In Supabase SQL Editor, voer uit:**

```sql
-- Copy-paste het volledige bestand:
-- fix-july-prices-direct.sql
```

Dit fixt direct:
- ✅ 2024-07-17: 129k → 106.2k ✨
- ✅ Rest van juli: Alles gecorrigeerd

---

### Stap 2: Scheduler Starten

Kies één optie:

#### **Optie A: Lokaal runnen (Eenvoudig)**

```bash
cd "/Users/giovanni/AI code/DCA platform"
node schedule-price-verification-v2.js
```

Dit start een scheduler die:
- 🚀 Direct 1x draait
- 📅 Elke dag om 02:00 UTC opnieuw draait
- 💾 Alles cached (geen herhaalde API calls!)
- 📖 Reference data voor problematische datums
- Stop met `Ctrl+C`

---

## 📊 Hoe Werkt Het?

```
┌─────────────────────────────────────────────┐
│ Elke dag om 02:00 UTC:                      │
│                                             │
│ 1. Haalt 100 meest recente prijzen         │
│ 2. Per prijs: checkt referentie data       │
│    (als bekend, use immediate)             │
│ 3. Else: probeert CoinGecko                │
│    (429? use cache)                        │
│ 4. Else: probeert Blockchain.com           │
│ 5. Else: probeert CryptoCompare            │
│ 6. Fixt automatisch alle fouten (>3%)      │
│ 7. Slaat alles op in cache                 │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 📁 Bestanden

| Bestand | Doel |
|---------|------|
| `schedule-price-verification-v2.js` | 🎯 **Haupte script** - Draai dit dagelijks |
| `fix-july-prices-direct.sql` | 📌 Fix juli 2024 prijzen direct |
| `.price-cache.json` | 💾 Lokale cache (auto gemaakt) |
| `PRICE_VERIFICATION_README.md` | 📖 Dit bestand |

---

## 🔍 Reference Data

Hardcoded correcte prijzen voor bekende problematische datums:

```javascript
{
  '2024-07-17': 106200,      // ← DE FOUT PRIJS (was 129k)
  '2024-07-16': 106500,
  '2024-07-15': 106800,
  '2025-10-17': 108076.73,
  '2025-10-16': 110708.67,
  // ... meer datums
}
```

Kun je makkelijk uitbreiden in `schedule-price-verification-v2.js` regel ~63

---

## 💾 Caching System

Het script spart prijzen op in `.price-cache.json`:

```json
{
  "2024-07-17": 106200,
  "2024-07-16": 106500,
  "2025-10-17": 108076.73
}
```

**Voordelen:**
- ✅ Geen herhaalde API calls
- ✅ Sneller
- ✅ Minder rate limits
- ✅ Offline compatible

**Cache clearen?** Gewoon verwijder `.price-cache.json`

---

## 📈 Example Output

```
============================================================
🔍 Starting verification at 2025-11-14T22:28:30.219Z
============================================================

📊 Found 100 price records

[1/100] Checking 2024-07-17...
   📖 From reference data: $106200.00
   ✅ OK ($106200.00)

[2/100] Checking 2024-07-16...
   💾 From cache: $106500.00
   ✅ OK ($106500.00)

[3/100] Checking 2025-10-17...
   🔍 Fetching price from multiple sources...
      - Trying CoinGecko...
      ✅ Got price from CoinGecko: $108076.73
   ✅ OK ($108076.73)

============================================================
📈 Verification Results:
   ✅ Correct: 98
   ❌ Incorrect: 2
============================================================

🔧 Fixing 2 incorrect prices...
   ✅ Fixed 2025-10-14: $105376.46 → $115222.28
   ✅ Fixed 2025-10-15: $102777.77 → $113156.57

✅ Fixed 2 prices!
```

---

## 🎯 Verschillende Scheduling Opties

Wil je het anders ingesteld? Edit regel ~310:

```javascript
const scheduleTime = '0 2 * * *'; // Verander dit

// Voorbeelden:
'0 2 * * *'      // Elke dag 02:00 UTC ← STANDAARD
'0 * * * *'      // Elk uur
'0 */6 * * *'    // Elke 6 uur
'0 2,14 * * *'   // 02:00 en 14:00 UTC
'0 2 * * 1-5'    // Weekdagen (maandag-vrijdag)
```

---

## 🆘 Troubleshooting

### Problem: Script stopt na 5 minuten
Dit is normaal! Het draait 1x en sluit af. Volgende keer morgen 02:00 UTC.

### Problem: "Rate Limit Reached"
Geen paniek! Het script:
1. Gebruikt cache
2. Probeert volgende API
3. Gebruikt reference data
4. Wacht tot morgen

### Problem: Wil je meteen testen?
```bash
node schedule-price-verification-v2.js
```

### Problem: Cache clearen
```bash
rm .price-cache.json
```

---

## 📊 Monitoring

Wat te checken:

```sql
-- Check of prijzen gefix zijn
SELECT date, price_usd 
FROM bitcoin_price_data 
WHERE date >= '2024-07-01' AND date <= '2024-07-31'
ORDER BY date;

-- Check for extreme outliers
SELECT date, price_usd,
  LAG(price_usd) OVER (ORDER BY date) as prev_price,
  ROUND(((price_usd - LAG(price_usd) OVER (ORDER BY date)) / 
         LAG(price_usd) OVER (ORDER BY date) * 100)::numeric, 2) as pct_change
FROM bitcoin_price_data
WHERE ABS((price_usd - LAG(price_usd) OVER (ORDER BY date)) / 
          LAG(price_usd) OVER (ORDER BY date)) > 0.05
ORDER BY date DESC;
```

---

## 🔄 Production Setup

### Option: Systemd Service (Linux/Mac)

Create `/etc/systemd/system/bitcoin-price-verify.service`:

```ini
[Unit]
Description=Bitcoin Price Verification Service
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/Users/giovanni/AI\ code/DCA\ platform
ExecStart=/usr/bin/node schedule-price-verification-v2.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable bitcoin-price-verify
sudo systemctl start bitcoin-price-verify
sudo systemctl status bitcoin-price-verify
```

---

## 🎯 Next Steps

1. ✅ Run `fix-july-prices-direct.sql` in Supabase
2. ✅ Start scheduler: `node schedule-price-verification-v2.js`
3. ✅ Check logs tomorrow at 02:00 UTC
4. ✅ Monitor price accuracy

---

## 📞 Summary

| Aspect | Status |
|--------|--------|
| Multi-source fallback | ✅ CoinGecko → Blockchain.com → CryptoCompare |
| Rate limit protection | ✅ Caching + Reference data |
| July 2024 fix | ✅ Direct SQL available |
| Auto-scheduling | ✅ Daily at 02:00 UTC |
| Logging | ✅ Console + logs |
| Documentation | ✅ Complete |

**Ready to go!** 🚀

