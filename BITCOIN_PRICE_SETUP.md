# Bitcoin Price Backend Setup

## Database Setup

1. **Execute SQL Scripts:**
   - Run `extend-bitcoin-price-data-table.sql` in Supabase SQL Editor
   - This extends the `bitcoin_price_data` table with USD prices and minute-level tracking
   - Creates a new `bitcoin_price_minute` table for minute-level updates

## Edge Function Setup

1. **Deploy Edge Functions:**
   - `update-bitcoin-price` - Manual trigger to update Bitcoin price
   - `schedule-bitcoin-price-update` - Automated trigger (called by cron)

2. **Deploy Functions:**
   ```bash
   supabase functions deploy update-bitcoin-price
   supabase functions deploy schedule-bitcoin-price-update
   ```

## Cron Job Setup

To automatically update Bitcoin prices every minute, set up a cron job:

### Option 1: Supabase Cron (Recommended)
If Supabase supports pg_cron, create a scheduled job:
```sql
SELECT cron.schedule(
  'update-bitcoin-price',
  '* * * * *', -- Every minute
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT.supabase.co/functions/v1/schedule-bitcoin-price-update',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
  );
  $$
);
```

### Option 2: External Cron Service
Use a service like cron-job.org or EasyCron:

1. **URL:** `https://YOUR_PROJECT.supabase.co/functions/v1/schedule-bitcoin-price-update`
2. **Method:** POST
3. **Headers:**
   ```
   Authorization: Bearer YOUR_SERVICE_ROLE_KEY
   Content-Type: application/json
   ```
4. **Schedule:** Every minute (1 minute interval)

### Option 3: GitHub Actions (Alternative)
Create `.github/workflows/bitcoin-price-update.yml`:
```yaml
name: Update Bitcoin Price
on:
  schedule:
    - cron: '* * * * *' # Every minute
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - name: Update Bitcoin Price
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}" \
            -H "Content-Type: application/json" \
            https://YOUR_PROJECT.supabase.co/functions/v1/schedule-bitcoin-price-update
```

## Testing

1. **Manual Update:**
   ```bash
   curl -X POST \
     -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY" \
     -H "Content-Type: application/json" \
     https://YOUR_PROJECT.supabase.co/functions/v1/update-bitcoin-price
   ```

2. **Check Database:**
   ```sql
   SELECT * FROM bitcoin_price_minute 
   ORDER BY timestamp DESC 
   LIMIT 10;
   ```

## Data Flow

1. **Cron Job** calls `schedule-bitcoin-price-update` every minute
2. **Edge Function** fetches current price from CoinGecko (EUR & USD)
3. **Database Function** (`upsert_bitcoin_price_minute`) stores:
   - Minute-level data in `bitcoin_price_minute` table
   - Latest daily price in `bitcoin_price_data` table
4. **Frontend** uses `get_latest_bitcoin_price()` RPC function:
   - First tries CoinGecko API (real-time)
   - Falls back to database if API fails (backup data)

## Benefits

- ✅ **Backup Data:** If CoinGecko API fails, use last known price from database
- ✅ **Historical Minute Data:** Track price changes every minute
- ✅ **Dual Currency:** Support both EUR and USD prices
- ✅ **Automatic Updates:** No manual intervention needed

