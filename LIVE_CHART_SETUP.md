# Live Chart Setup Guide

De live chart werkt, maar je hebt prijs data nodig om candels te zien!

## 🚀 Snel Starten

### Stap 1: Voeg Test Data Toe

```bash
# Run dit eenmalig om test data toe te voegen
node populate-price-history.js
```

Dit voegt 24 uur van test price data toe (elke 15 minuten).

**Output:**
```
✅ Successfully populated 96 price records!
📈 You should now see candels in the Live Chart
```

### Stap 2: Ga naar Bitcoin Geschiedenis

1. Open je browser op `/admin` of `/bitcoin-history`
2. Klik op **🟢 Live** tabje
3. Kies tijdframe: **1h**, **4h**, of **24h**
4. Jij ziet nu **live candels** met groene/rode wieken! 📊

---

## 📊 Hoe Het Werkt Nu

### Data Flow:

```
LiveBitcoinPrice component (elke minuut)
        ↓
bitcoinPriceTracker.saveHourlyPrice()
        ↓
bitcoin_price_history tabel
        ↓
LiveCandleChart (leest en toont)
        ↓
Candels op scherm! 🕯️
```

### Real-Time Updates:

- **Elke minuut**: Nieuwe prijs wordt opgeslagen
- **Elke 1/4/24 uur**: Nieuwe candle getekend
- **Auto-refresh**: Chart update zonder refresh nodig

---

## 🎨 Candel Kleuren

- 🟢 **Groene candle** = Prijs omhoog (close > open)
- 🔴 **Rode candle** = Prijs omlaag (close < open)
- 📍 **Oranje streeplijn** = Live prijs nu
- 🔀 **Wiggen** = High & Low van de period

---

## 📈 Tijdframes

| Frame | Interval | Data |
|-------|----------|------|
| **1h** | 5 minuten | ~12 candels |
| **4h** | 15 minuten | ~16 candels |
| **24h** | 1 uur | ~24 candels |

---

## 🔧 Troubleshooting

### "Ik zie geen candels"

Checklist:
1. ✅ Zit je op **Live** tabje?
2. ✅ Heb je `node populate-price-history.js` gerund?
3. ✅ Open de browser console (F12) en check logs
4. ✅ Supabase tabel `bitcoin_price_history` bevat data?

**Check database:**
```sql
SELECT COUNT(*) FROM bitcoin_price_history;
-- Should return 96+ if data was populated
```

### "Browser console shows: No price history available"

**Fix:**
```bash
# Populate test data
node populate-price-history.js

# Refresh browser
```

### "Candels zijn leeg rechthoeken"

Dit gebeurt als geen data beschikbaar. Even wachten tot nieuwe prijs wordt opgeslagen:
- Wacht 1-2 minuten
- Klik refresh knop (⟲)
- Probeer ander tijdframe

---

## 🎯 Automatic Real-Time Flow

Eenmaal ingesteld:

1. **LiveBitcoinPrice** haalt elke minuut live prijs op
2. **bitcoinPriceTracker** slaat automatisch op in database
3. **LiveCandleChart** leest data en toont candels
4. **Geen handmatig werk nodig** - alles is automatisch!

---

## 📊 Data In Database

Elk record bevat:
```json
{
  "timestamp": "2025-11-14T22:35:00Z",
  "price_usd": 94567.89,
  "price_eur": 87000.45,
  "volume_24h": 28500000000,
  "market_cap": 1876543000000,
  "price_change_24h": 2.34
}
```

---

## 💡 Tips

### Debug Console Logs

Open F12 en zie:
```
✅ Fetched 96 price records
🕯️ Created 16 candles for 4h view
📍 Current price line at: $94,567.89
```

### Manual Refresh

Klik refresh knop (⟲) om direct data op te halen:
- Laadt `bitcoin_price_history`
- Herberekent candels
- Tekent chart opnieuw

### Test Met Ander Tijdframe

- Probeer **1h** voor meer detail
- Probeer **24h** voor overzicht
- Each frame toont ander interval

---

## ✅ Checklist

- [ ] `node populate-price-history.js` uitgevoerd
- [ ] Database check: `SELECT COUNT(*) FROM bitcoin_price_history` > 0
- [ ] Browser console: geen errors
- [ ] Live tabje actief
- [ ] Candels zichtbaar

**Klaar!** Je hebt nu een werkende live chart! 🎉📊

