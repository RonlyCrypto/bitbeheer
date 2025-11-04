# Bitcoin Data Import naar Supabase

## Overzicht

Dit script importeert alle Bitcoin prijsdata van 2009 tot 2025 vanuit CSV bestanden naar de Supabase `bitcoin_price_data` tabel.

## Vereisten

1. **Environment Variables:**
   ```bash
   export VITE_SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **CSV Bestanden:**
   - De CSV bestanden moeten in de `public/` directory staan
   - Verwacht format: `bitcoin-price-history-YYYY.csv` (2010-2025)
   - Optioneel: `public/eur/bitcoin-eur-complete-history.csv` voor complete geschiedenis

3. **Database:**
   - Eerst `extend-bitcoin-price-data-table.sql` uitvoeren in Supabase SQL Editor
   - Dit creëert de benodigde tabellen en kolommen

## Gebruik

### 1. Database Setup

Voer eerst het SQL script uit:
```sql
-- In Supabase SQL Editor
-- Run: extend-bitcoin-price-data-table.sql
```

### 2. Import Script Uitvoeren

```bash
# Zet environment variables
export VITE_SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Run het import script
node import-all-bitcoin-data-to-supabase.js
```

## Wat het Script Doet

1. **2009 Data:**
   - Voegt vroege Bitcoin data toe (Genesis block, eerste transacties)
   - 4 data punten voor 2009

2. **Complete History CSV:**
   - Probeert eerst `public/eur/bitcoin-eur-complete-history.csv` te laden
   - Dit is meestal de meest complete dataset

3. **Jaar-specifieke CSV's:**
   - Laadt alle `bitcoin-price-history-YYYY.csv` bestanden (2010-2025)
   - Voegt deze toe aan de dataset, voorkomt duplicaten

4. **Data Processing:**
   - Parseert verschillende CSV formaten (semicolon/comma separated)
   - Handelt Europese getalnotatie (comma als decimaal) af
   - Converteert EUR prijzen naar USD (approximatie)
   - Sorteert op datum

5. **Import naar Supabase:**
   - Importeert in batches van 1000 rijen
   - Gebruikt `upsert` om duplicaten te voorkomen
   - Toont progressie en statistieken

## CSV Format

Het script ondersteunt verschillende CSV formaten:

**Format 1 (Semicolon):**
```csv
"Date";"Price"
"2010-01-31 00:00:00";0,004
"2010-02-28 00:00:00";0,014
```

**Format 2 (Comma):**
```csv
Date,Price
2010-01-31,0.004
2010-02-28,0.014
```

**Format 3 (Met Volume):**
```csv
Date,Price,Volume
2010-01-31,0.004,1000
```

## Output Voorbeeld

```
🚀 Starting Bitcoin data import to Supabase...

📅 Adding 2009 data (early Bitcoin)...
✅ Added 4 data points for 2009

📊 Loading complete history CSV...
📊 Loaded 5840 data points from complete history CSV

📊 Loading individual year CSV files...
📊 Loaded 175 data points for year 2010
📊 Loaded 365 data points for year 2011
...

📈 Total data points collected: 5844
   Date range: 2009-01-03 to 2025-12-31

📊 Year distribution:
   2009: 4 data points
   2010: 175 data points
   2011: 365 data points
   ...

📤 Importing 5844 data points to Supabase...
✅ Imported batch 1: 1000 rows (1000/5844)
✅ Imported batch 2: 1000 rows (2000/5844)
...
✅ Import complete!
   Imported: 5844 rows
```

## Troubleshooting

### "Missing Supabase credentials"
- Zorg dat `VITE_SUPABASE_URL` en `SUPABASE_SERVICE_ROLE_KEY` zijn gezet
- Check of de service role key correct is (niet de anon key)

### "CSV file not found"
- Check of de CSV bestanden in `public/` directory staan
- Check bestandsnamen (moeten `bitcoin-price-history-YYYY.csv` zijn)

### "Error importing batch"
- Check of de database tabel bestaat
- Check of de kolommen overeenkomen met de SQL schema
- Check of er geen constraint violations zijn

### Data niet compleet
- Check of alle CSV bestanden aanwezig zijn
- Check of de CSV formaten correct zijn
- Run het script opnieuw (upsert voorkomt duplicaten)

## Verificatie

Na import, check de database:

```sql
-- Check totaal aantal records
SELECT COUNT(*) FROM bitcoin_price_data;

-- Check datum range
SELECT MIN(date), MAX(date) FROM bitcoin_price_data;

-- Check per jaar
SELECT year, COUNT(*) 
FROM bitcoin_price_data 
GROUP BY year 
ORDER BY year;
```

## Volgende Stappen

Na succesvolle import:
1. ✅ Data is nu beschikbaar in Supabase
2. ✅ Frontend kan data ophalen via `bitcoinPriceDataService`
3. ✅ Edge Functions kunnen automatisch updates doen
4. ✅ Backup systeem werkt (laatste bekende prijs als API faalt)

