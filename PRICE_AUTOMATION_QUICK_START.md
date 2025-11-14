# ⚡ Quick Start: Automatische Prijs Verificatie

## 🚀 3 Seconden Setup

### Lokale Variant (Eenvoudig)

```bash
# Terminal openen in project folder
cd "/Users/giovanni/AI code/DCA platform"

# Starten (draait elke dag om 02:00 UTC)
node schedule-price-verification.js
```

**Dat is het!** Het script:
- ✅ Verifieert elke dag om 02:00 UTC
- ✅ Controleert prijzen tegen CoinGecko
- ✅ Fixt automatisch fouten
- ✅ Log alles wat het doet

---

### Production Variant (Supabase Edge Function)

```bash
# Deploy de function
supabase functions deploy verify-fix-bitcoin-prices

# Voer deze SQL uit in Supabase Console:
select cron.schedule(
  'verify-bitcoin-prices-daily',
  '0 2 * * *',
  $$select http_post(
    'https://xvbsdnfjibcyibpgcqeb.supabase.co/functions/v1/verify-fix-bitcoin-prices',
    '{}',
    'application/json',
    jsonb_build_object('Authorization', 'Bearer YOUR_ANON_KEY')
  )$$
);
```

---

## 📊 Wat Gebeurt Er?

```
🔍 Starting verification at 2025-01-15T02:00:00Z
📊 Found 100 price records

[1/100] Checking 2025-01-15...
   ✅ OK ($95180.00)

[2/100] Checking 2025-01-14...
   ❌ MISMATCH:
      Supabase: $95500.00
      CoinGecko: $94800.00
      Difference: 0.73%
      ✅ Fixed 2025-01-14: $95500.00 → $94800.00

📈 Verification Results:
   ✅ Correct: 98
   ❌ Incorrect: 2

🔧 Fixing 2 incorrect prices...
   ✅ Fixed 2025-01-14: $95500.00 → $94800.00
   ✅ Fixed 2025-01-13: $96000.00 → $95200.00

✅ Fixed 2 prices!
✅ Verification complete
```

---

## ✅ Configuratie Check

```bash
# Zorg dat deze omgevingsvariabelen zijn ingesteld:
echo $VITE_SUPABASE_URL        # moet iets zijn zoals https://...supabase.co
echo $VITE_SUPABASE_ANON_KEY   # moet een lange sleutel zijn
```

Missen ze? Voeg toe aan `.env.local`:
```
VITE_SUPABASE_URL=https://xvbsdnfjibcyibpgcqeb.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

---

## 🎯 Voordelen

| Wat | Lokaal | Supabase |
|-----|--------|----------|
| Setup | 1 commando | 3 commando's |
| Altijd aan | ❌ Moet pc/server aan | ✅ Altijd |
| Kosten | Gratis | Gratis (edge function) |
| Gemakkelijk | ✅ Super | ✅ Goed |
| Production | ❌ Niet aangeraden | ✅ Aanbevolen |

---

## 🆘 Problemen?

### Script stopt na 5 minuten
Dit is normaal. Het draait 1x per dag om 02:00 UTC. Volgende keer morgen.

### "Supabase credentials not found"
Voeg toe aan `.env.local`:
```bash
VITE_SUPABASE_URL=https://xvbsdnfjibcyibpgcqeb.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_key_here
```

### Wil je meteen testen?
```bash
# Manueel runnen (niet wachten op schema)
node schedule-price-verification.js
```

---

## 📈 Monitoring

**Logs bekijken:**
```bash
# Supabase function logs
supabase functions logs verify-fix-bitcoin-prices

# Of check database direct
# SELECT * FROM bitcoin_price_data ORDER BY date DESC LIMIT 10;
```

---

## 🔄 Scheduling Opties

```javascript
// Elke dag om 02:00 UTC
'0 2 * * *'

// Elk uur
'0 * * * *'

// Elke 6 uur
'0 */6 * * *'

// Elke zondag om 02:00
'0 2 * * 0'

// Meerdere keren per dag (02:00, 08:00, 14:00, 20:00 UTC)
'0 2,8,14,20 * * *'
```

Edit `schedule-price-verification.js` regel ~120 om te veranderen.

---

## ✨ Klaar!

Je prijs verificatie draait nu automatisch. 🎉

Vragen? Check `VERIFY_PRICES_SETUP.md` voor meer details.

