# Bitcoin Price Tracking System Setup

Dit systeem zorgt dat je website **dagelijks** automatisch Bitcoin prijshistorie opslaat en dat **elk uur** live prijsgegevens trackt voor grafieken.

## 🎯 Voordelen

✅ **Onafhankelijk van externe APIs** - Je hebt je eigen prijs database  
✅ **Snellere website** - Geen vertraging door externe API calls  
✅ **Betrouwbare transactieprijs** - Exacte prijs van de dag dat je Bitcoin kocht  
✅ **Live grafieken** - Alle prijs bewegingen opgeslagen elk uur  
✅ **Goedkoper** - API calls geminimaliseerd

## 📊 Setup Stappen

### Stap 1: Update Supabase Database

Run dit SQL script in je Supabase SQL editor:

```sql
-- Copy from: extend-bitcoin-price-table-usd.sql
```

Dit voegt toe:
- `price_usd` kolom aan `bitcoin_price_data` tabel
- Nieuwe `bitcoin_price_history` tabel voor hourly tracking
- Functies voor prijs ophalen

### Stap 2: Vul Historische Data In (Eenmalig)

```bash
# Vul alle prijzen van 2020 tot vandaag in
node fill-bitcoin-price-history.js 2020-01-01 2025-11-14

# Of alleen dit jaar
node fill-bitcoin-price-history.js 2025-01-01 2025-11-14

# Of vorige 30 dagen
node fill-bitcoin-price-history.js 2025-10-15 2025-11-14
```

Dit kan even duren (CoinGecko API ratelimiting). Elke dag kost ~1 seconde.

### Stap 3: Start Automatische Tracking

Klaar! De app start automatisch wanneer je de website laadt:

```typescript
// Gebeurt automatisch in App.tsx
initBitcoinPriceTracking(); 

// Startups:
// ✅ Hourly tracking (elk uur)
// ✅ Daily updates (dagelijks om 2 AM UTC)
```

## 🔄 Hoe Werkt Het

### Dagelijks (Daily Update)
- Elke dag om 2 AM UTC
- Haalt gisteren's sluitingsprijs van CoinGecko
- Slaat op in `bitcoin_price_data` tabel
- Permanent opgeslagen voor transactiehistorie

### Elk Uur (Hourly Tracking)
- Haalt de huidige BTC prijs
- Slaat op in `bitcoin_price_history` tabel
- Gebruikt voor live charts
- 24 uur bewaren (oud data verwijderen)

## 💡 Gebruik in Je Code

### 1. Transactieprijs Ophalen (Automatisch)

De inkoopprijs wordt nu automatisch van je database gehaald:

```typescript
// bitcoinApiService.ts doet dit automatisch:
// 1. Check Supabase (price_usd)
// 2. Als niet gevonden, fallback naar CoinGecko
```

### 2. Huidige Prijs Ophalen

```typescript
import { bitcoinPriceTracker } from './services/bitcoinPriceTracker';

const prices = await bitcoinPriceTracker.getLatestPrices();
console.log(prices.price_usd);  // Huidige BTC prijs in USD
```

### 3. Historische Prijs Voor Een Datum

```typescript
const datePrice = await bitcoinPriceTracker.getPriceForDate('2025-11-14');
console.log(datePrice.price_usd);  // Sluitingsprijs van die dag
```

### 4. Live Grafiek Data

```typescript
// Query direct van Supabase:
const { data } = await supabase
  .from('bitcoin_price_history')
  .select('*')
  .gte('timestamp', now - 24h)
  .order('timestamp', { ascending: false });
```

## 🛠️ Beheer

### Handmatig Data Toevoegen (Eenmalig)

```typescript
import { bitcoinPriceTracker } from './services/bitcoinPriceTracker';

// Vul gemiste data in
await bitcoinPriceTracker.fillMissingPrices('2025-01-01', '2025-11-14');
```

### Stop Tracking (Niet Aanbevolen)

```typescript
import { stopBitcoinPriceTracking } from './lib/initPriceTracking';

stopBitcoinPriceTracking(); // Stopt alle updates
```

## 📈 Database Schema

### bitcoin_price_data (Dagelijks)
```
- date (DATE) - Unieke sleutel
- timestamp (BIGINT)
- price_usd (NUMERIC) ← JIJ HEBT DIT NODIG
- price_eur (NUMERIC)
- volume_usd (NUMERIC)
- market_cap_usd (NUMERIC)
- year (INTEGER)
```

### bitcoin_price_history (Elk Uur)
```
- id (UUID)
- timestamp (TIMESTAMP) - Hourly
- price_usd (NUMERIC)
- price_eur (NUMERIC)
- volume_24h (NUMERIC)
- market_cap (NUMERIC)
- price_change_24h (NUMERIC)
```

## ⚠️ Belangrijk

1. **Eerste Run**: Vul minstens de laatste 2 jaren in
2. **CoinGecko Limiet**: 50 requests/minuut, dus 1 dag = ~1 seconde
3. **Prijs Nulwaarden**: Check je records na import

## 🚀 Optimalisaties

- Caching: Prijs van vandaag wordt maar 1x opgehaald per dag
- Indexering: Snelle queries door datum/timestamp indexen
- RLS: Publiekelijk leesbaar (prijs is openbare data)

## 🐛 Debug

Kijk in je browser console voor logs:

```
✅ Hourly price tracking started
✅ Daily price updates started
✓ BTC Price op 2025-11-14 (Supabase): $94893.12
```

Probleem? Checken:
1. `bitcoin_price_data` tabel bestaat
2. `price_usd` kolom ingevuld
3. Supabase RLS policies toestaan SELECT

---

**Nu heb je je eigen betrouwbare Bitcoin prijs database! 🎉**

