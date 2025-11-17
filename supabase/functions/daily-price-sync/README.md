# Daily Price Sync Function

Automatically syncs Bitcoin prices daily from CoinGecko to Supabase.

## What it does:

1. **Every day at 00:01 UTC** - fetches previous day's Bitcoin price
2. **Checks last 3 days** - if missing, backfills from CoinGecko
3. **Stores in database** - bitcoin_price_data table
4. **Avoids duplicates** - checks if date already exists

## Setup:

### 1. Deploy Edge Function

```bash
supabase functions deploy daily-price-sync
```

### 2. Create HTTP Trigger in Supabase

In Supabase Dashboard → SQL Editor, run:

```sql
-- Create a scheduled trigger using pg_cron
SELECT cron.schedule(
  'daily-price-sync',
  '1 0 * * *',  -- Every day at 00:01 UTC
  'select net.http_post(
    url:=current_setting(''app.settings.edge_function_url'')||''/functions/v1/daily-price-sync'',
    headers:=jsonb_build_object(
      ''Authorization'', ''Bearer '' || current_setting(''app.settings.service_role_key''),
      ''Content-Type'', ''application/json''
    ),
    body:=jsonb_build_object(''trigger'', ''cron'')
  )'
);
```

**Note:** This requires pg_cron extension. Alternative: use external scheduler (GitHub Actions, etc.)

### 3. Alternative: GitHub Actions Trigger

Create `.github/workflows/daily-price-sync.yml`:

```yaml
name: Daily Price Sync

on:
  schedule:
    - cron: '1 0 * * *'  # Every day at 00:01 UTC

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger price sync
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json" \
            ${{ secrets.SUPABASE_URL }}/functions/v1/daily-price-sync
```

## Testing:

### Manual trigger:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  https://YOUR_PROJECT.supabase.co/functions/v1/daily-price-sync
```

### Via Supabase Dashboard:

1. Go to Edge Functions
2. Click "daily-price-sync"
3. Click "Invoke" button

## Logs:

View function logs in Supabase Dashboard → Functions → daily-price-sync

## Rate Limiting:

- CoinGecko free tier: ~10-50 calls/min
- Function waits 1 second between requests
- Safe for production

## Database Structure:

Expects `bitcoin_price_data` table with columns:
- `date` (TEXT, YYYY-MM-DD)
- `timestamp` (INTEGER, Unix seconds)
- `price_usd` (DECIMAL)
- `price_eur` (DECIMAL, nullable)
- `volume` (DECIMAL, nullable)
- `year` (INTEGER)

