# 🔧 Bitcoin Price Verification & Auto-Fix Setup

Dit document beschrijft hoe je de automatische Bitcoin prijs verificatie en correctie instelt.

## 📋 Wat doet dit?

- ✅ **Dagelijks** alle Bitcoin prijzen in Supabase controleren tegen CoinGecko
- ✅ Automatisch **foutieve prijzen corrigeren** (>2% verschil)
- ✅ **Logging** van alle aanpassingen
- ✅ Werkt volledig **automatisch** zonder handmatig ingrijpen

## 🚀 Installatie

### Optie 1: Supabase Edge Function (AANBEVOLEN)

#### Stap 1: Deploy de function
```bash
cd /Users/giovanni/AI\ code/DCA\ platform
supabase functions deploy verify-fix-bitcoin-prices
```

#### Stap 2: Stel scheduling in via cron

Ga naar je **Supabase Dashboard** → **Database** → **Extensions** en zorg dat `pg_cron` is ingeschakeld.

Voer dan deze SQL uit in Supabase SQL Editor:

```sql
-- Maak een scheduled job voor dagelijkse verificatie
-- Dit draait elke dag om 02:00 UTC

select cron.schedule(
  'verify-bitcoin-prices-daily',
  '0 2 * * *', -- Every day at 2 AM UTC
  $$
  select
    http_post(
      'https://YOUR_FUNCTION_URL/functions/v1/verify-fix-bitcoin-prices',
      '{}'::jsonb,
      'application/json',
      jsonb_build_object(
        'Authorization', 'Bearer YOUR_ANON_KEY'
      )
    ) as request_id;
  $$
);

-- Verificatie: Bekijk geplande jobs
select * from cron.job;
```

**Let op:** Vervang:
- `YOUR_FUNCTION_URL` met je Supabase project URL
- `YOUR_ANON_KEY` met je Supabase anon key

---

### Optie 2: Node.js Cron Job (LOKAAL)

#### Stap 1: Installeer dependencies
```bash
npm install node-cron
```

#### Stap 2: Configureer .env
```bash
cat > .env.local << EOF
VITE_SUPABASE_URL=https://xvbsdnfjibcyibpgcqeb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
EOF
```

#### Stap 3: Draai het script
```bash
node verify-bitcoin-prices.js
```

---

## 📊 Hoe werkt het?

### Verificatie Process:
1. Haalt alle prijzen uit Supabase
2. Per datum: vergelijkt met CoinGecko historische API
3. Als verschil > 2%: markeer als fout
4. Update foutieve prijzen naar correcte waarde
5. Log alle wijzigingen

### Voorbeeld Output:
```
🔍 Starting Bitcoin price verification...
📊 Found 500 price records
[1/100] Checking 2025-01-14...
  ✅ OK ($95180.00)
[2/100] Checking 2025-01-13...
  ❌ MISMATCH: Supabase=$95180.00, CoinGecko=$94500.00 (0.72%)
  ✅ Fixed 2025-01-13: $95180.00 → $94500.00

📈 Verification Results:
  ✅ Correct: 98
  ❌ Incorrect: 2

🔧 Fixed 2 incorrect prices...
```

---

## 🔍 Monitoring

### Check geplande jobs in Supabase:
```sql
-- Bekijk alle scheduled jobs
SELECT * FROM cron.job WHERE jobname LIKE '%bitcoin%';

-- Bekijk logs van vorige run
SELECT * FROM cron.job_run_details 
WHERE job_id IN (SELECT jobid FROM cron.job WHERE jobname = 'verify-bitcoin-prices-daily')
ORDER BY start_time DESC
LIMIT 10;
```

### Check functie logs:
```bash
supabase functions logs verify-fix-bitcoin-prices
```

---

## 🆘 Troubleshooting

### Problem: Function niet beschikbaar
```bash
# Check status
supabase functions list

# Redeploy
supabase functions deploy verify-fix-bitcoin-prices --no-verify-jwt
```

### Problem: CoinGecko rate limit
- Function wacht 1 seconde tussen requests
- Controleert max 100 recente prijzen per run
- Dit is veilig en respectvol naar CoinGecko

### Problem: Prices niet bijgewerkt
```sql
-- Check manually
SELECT * FROM bitcoin_price_data 
WHERE date = '2024-07-17' 
LIMIT 5;
```

---

## 📅 Recommended Schedule

```
0 2 * * *  = 02:00 UTC (04:00 CET/05:00 CEST) - Elke dag
0 2 * * 0  = Zondag 02:00 UTC - Wekelijks
0 2 1 * *  = 1ste van maand 02:00 UTC - Maandelijks
```

Aanbevolen: **Elke dag** zodat je altijd actuele data hebt.

---

## 🔧 Handmatige Triggers

### Via SQL:
```sql
-- Voer verificatie direct uit
SELECT http_post(
  'https://xvbsdnfjibcyibpgcqeb.supabase.co/functions/v1/verify-fix-bitcoin-prices',
  '{}',
  'application/json',
  jsonb_build_object('Authorization', 'Bearer YOUR_ANON_KEY')
);
```

### Via Node.js:
```bash
VITE_SUPABASE_ANON_KEY='your_key' node verify-bitcoin-prices-simple.js
```

---

## ✅ Verification Checklist

- [ ] Edge Function gedeployed
- [ ] pg_cron extension ingeschakeld
- [ ] Cron job gepland (check `cron.job`)
- [ ] Eerste test run voltooid
- [ ] Logs gecontroleerd
- [ ] Prijzen gecontroleerd op correctheid

---

## 📞 Support

Vragen? Check:
- Logs: `supabase functions logs verify-fix-bitcoin-prices`
- Cron jobs: `SELECT * FROM cron.job`
- Prijs data: `SELECT * FROM bitcoin_price_data ORDER BY date DESC LIMIT 10`

