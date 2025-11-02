# Bitcoin Data Import naar Supabase

## Overzicht
Deze setup importeert Bitcoin prijs data automatisch vanuit CSV bestanden naar Supabase via een Edge Function.

## Stappen

### 1. SQL Tabel Uitvoeren
Voer eerst `create-bitcoin-price-data-table.sql` uit in Supabase SQL Editor.

### 2. Edge Function Deployen
Deploy de Edge Function `import-bitcoin-csv` naar Supabase:
```bash
supabase functions deploy import-bitcoin-csv
```

Of via Supabase Dashboard:
- Ga naar Edge Functions
- Maak nieuwe function aan: `import-bitcoin-csv`
- Plak de code uit `supabase/functions/import-bitcoin-csv/index.ts`

### 3. CSV Data Importeren

**Optie A: Automatisch via Script (Aanbevolen)**
```bash
# Zet environment variables
export REACT_APP_SUPABASE_URL="jouw-supabase-url"
export REACT_APP_SUPABASE_ANON_KEY="jouw-anon-key"
export VITE_PUBLIC_URL="https://www.bitbeheer.nl"  # Of je lokale URL

# Run het import script
node import-bitcoin-csv-automatically.js
```

**Optie B: Direct via Service Role (Snel)**
```bash
# Zet service role key
export SUPABASE_SERVICE_ROLE_KEY="jouw-service-role-key"
export REACT_APP_SUPABASE_URL="jouw-supabase-url"

# Run direct import
node import-bitcoin-csv-to-supabase.js
```

### 4. Verifiëren
Check in Supabase Dashboard:
- Ga naar Table Editor → `bitcoin_price_data`
- Check of data is geïmporteerd
- Test de database functies:
  ```sql
  SELECT get_bitcoin_price_summary();
  SELECT get_bitcoin_price_by_year(2024);
  SELECT get_latest_bitcoin_price();
  ```

## Edge Function Endpoints

### Import vanuit URL
```javascript
const { data } = await supabase.functions.invoke('import-bitcoin-csv', {
  body: {
    action: 'import_from_url',
    csvUrl: 'https://www.bitbeheer.nl/eur/bitcoin-eur-complete-history.csv'
  }
});
```

### Import vanuit Data Array
```javascript
const { data } = await supabase.functions.invoke('import-bitcoin-csv', {
  body: {
    action: 'import_csv_data',
    csvData: [
      { date: '2024-01-01', price: 42000, volume: 1000000 }
    ]
  }
});
```

### Get Summary
```javascript
const { data } = await supabase.functions.invoke('import-bitcoin-csv', {
  body: { action: 'get_summary' }
});
```

## Automatische Updates
Om automatisch nieuwe CSV data te importeren:
1. Zet CSV bestanden in `/public` folder
2. Roep Edge Function aan met de URL van het nieuwe CSV bestand
3. Data wordt automatisch geüpdatet (upsert op `date`)

## Troubleshooting

- **"Table not found"**: Voer eerst de SQL uit
- **"Function not found"**: Deploy de Edge Function eerst
- **"Permission denied"**: Check of service role key correct is
- **"No data imported"**: Check CSV format (moet Date en Price kolommen hebben)

