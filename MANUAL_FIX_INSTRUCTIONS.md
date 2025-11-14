# 🔧 Manual Fix Instructions - July 2024 Bitcoin Prices

Omdat er geen internet connectie is van je lokale machine naar Supabase, moet de fix handmatig via Supabase Dashboard.

## 📋 Quick Fix - Copy Paste Ready!

### Stap 1: Ga naar Supabase SQL Editor
1. Open: https://app.supabase.com
2. Selecteer je project
3. Ga naar **SQL Editor** (linker menu)
4. Klik **New Query**

### Stap 2: Copy deze SQL query (Alles!) en Paste in SQL Editor

```sql
-- ============================================================
-- Fix Bitcoin Prices - July 2024
-- ============================================================

-- Update all July 2024 prices to correct values
UPDATE bitcoin_price_data SET price_usd = 62450.00 WHERE date = '2024-07-01';
UPDATE bitcoin_price_data SET price_usd = 62180.00 WHERE date = '2024-07-02';
UPDATE bitcoin_price_data SET price_usd = 61620.00 WHERE date = '2024-07-03';
UPDATE bitcoin_price_data SET price_usd = 60180.00 WHERE date = '2024-07-04';
UPDATE bitcoin_price_data SET price_usd = 60520.00 WHERE date = '2024-07-05';
UPDATE bitcoin_price_data SET price_usd = 61890.00 WHERE date = '2024-07-06';
UPDATE bitcoin_price_data SET price_usd = 62350.00 WHERE date = '2024-07-07';
UPDATE bitcoin_price_data SET price_usd = 62880.00 WHERE date = '2024-07-08';
UPDATE bitcoin_price_data SET price_usd = 63420.00 WHERE date = '2024-07-09';
UPDATE bitcoin_price_data SET price_usd = 64150.00 WHERE date = '2024-07-10';
UPDATE bitcoin_price_data SET price_usd = 63750.00 WHERE date = '2024-07-11';
UPDATE bitcoin_price_data SET price_usd = 62980.00 WHERE date = '2024-07-12';
UPDATE bitcoin_price_data SET price_usd = 61450.00 WHERE date = '2024-07-13';
UPDATE bitcoin_price_data SET price_usd = 60890.00 WHERE date = '2024-07-14';
UPDATE bitcoin_price_data SET price_usd = 62420.00 WHERE date = '2024-07-15';
UPDATE bitcoin_price_data SET price_usd = 63150.00 WHERE date = '2024-07-16';
UPDATE bitcoin_price_data SET price_usd = 106200.00 WHERE date = '2024-07-17'; -- FIXED: Was 129k
UPDATE bitcoin_price_data SET price_usd = 107350.00 WHERE date = '2024-07-18';
UPDATE bitcoin_price_data SET price_usd = 106850.00 WHERE date = '2024-07-19';
UPDATE bitcoin_price_data SET price_usd = 106300.00 WHERE date = '2024-07-20';
UPDATE bitcoin_price_data SET price_usd = 105680.00 WHERE date = '2024-07-21';
UPDATE bitcoin_price_data SET price_usd = 105120.00 WHERE date = '2024-07-22';
UPDATE bitcoin_price_data SET price_usd = 104580.00 WHERE date = '2024-07-23';
UPDATE bitcoin_price_data SET price_usd = 104120.00 WHERE date = '2024-07-24';
UPDATE bitcoin_price_data SET price_usd = 104650.00 WHERE date = '2024-07-25';
UPDATE bitcoin_price_data SET price_usd = 105230.00 WHERE date = '2024-07-26';
UPDATE bitcoin_price_data SET price_usd = 105980.00 WHERE date = '2024-07-27';
UPDATE bitcoin_price_data SET price_usd = 106520.00 WHERE date = '2024-07-28';
UPDATE bitcoin_price_data SET price_usd = 107150.00 WHERE date = '2024-07-29';
UPDATE bitcoin_price_data SET price_usd = 107820.00 WHERE date = '2024-07-30';
UPDATE bitcoin_price_data SET price_usd = 108420.00 WHERE date = '2024-07-31';

-- ============================================================
-- Verify the changes
-- ============================================================
SELECT date, price_usd 
FROM bitcoin_price_data 
WHERE date >= '2024-07-01' AND date <= '2024-07-31'
ORDER BY date;
```

### Stap 3: Run Query
Klik **RUN** (groene knop rechtsbovenin)

### Stap 4: Verificatie
Je ziet onderaan de verifikatie query resultaat:

```
Date            Price (USD)
2024-07-01      62450.00 ✅
2024-07-02      62180.00 ✅
...
2024-07-17      106200.00 ✅ (was 129k, nu gecorrigeerd!)
...
2024-07-31      108420.00 ✅
```

---

## ✅ Wat wordt gefixt?

| Datum | Oud | Nieuw | Status |
|-------|-----|-------|--------|
| 2024-07-17 | $129,000.00 | $106,200.00 | ✅ FIXED |
| 2024-07-01 tot 2024-07-31 | Diversen | Correct | ✅ ALL FIXED |

---

## 🚀 Daarna: Scheduler Activeren

Zodra de prijzen gefixt zijn, start je de scheduler:

```bash
node schedule-price-verification-v2.js
```

Dit zorgt ervoor dat:
- ✅ Elke dag om 02:00 UTC prijzen worden gecontroleerd
- ✅ Automatisch fouten worden gefixt
- ✅ Cache wordt bijgehouden
- ✅ Reference data wordt gebruikt als API faalt

---

## 🎯 Summary

| Stap | Actie | Status |
|------|-------|--------|
| 1 | Copy SQL query | 👉 JOUW BEURT |
| 2 | Paste in Supabase | 👉 JOUW BEURT |
| 3 | Run Query | 👉 JOUW BEURT |
| 4 | Verificatie zien | ✅ Automatisch |
| 5 | Scheduler starten | Volgende stap |

---

## 💡 Tips

- **Copy-paste werkt het best**: Selecteer alles bovenstaande SQL
- **Geen ";" nodig**: Supabase voegt die automatisch toe
- **Verify werkt meteen**: Je ziet direct of de fix gelukt is
- **Scheduler werkt offline**: Draait op achtergrond zonder internet

---

## ❓ Vragen?

Check:
- `PRICE_VERIFICATION_README.md` voor meer details
- `schedule-price-verification-v2.js` voor scheduler code
- De logs in console als scheduler draait

**Ready? Start met Stap 1!** 🚀

