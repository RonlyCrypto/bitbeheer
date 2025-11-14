#!/usr/bin/env python3
"""
Sync Yahoo Finance 2025 Data to Supabase - NOW
Direct synchronization with retry logic
"""

import requests
import csv
import time
import sys

SUPABASE_URL = "https://xvbsdnfjibcyibpgcqeb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnNkbmZqaWJjeWlicGdjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NjE0MzUsImV4cCI6MTkyMTQzNzQzNX0.k0WvGNjkQrYEJo4_P-C4s-2w6fKP5WMQ0kU3X7R4bDA"

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal"
}

def load_yahoo_data():
    """Load Yahoo Finance data from CSV"""
    data = {}
    with open('yahoo-finance-2025-data.csv', 'r') as f:
        reader = csv.reader(f)
        next(reader)  # Skip header
        for row in reader:
            if len(row) >= 2:
                date = row[0].strip()
                price = float(row[1].strip())
                data[date] = price
    return data

def sync_price(date, price, retries=3):
    """Sync single price with retries"""
    for attempt in range(retries):
        try:
            url = f"{SUPABASE_URL}/rest/v1/bitcoin_price_data?date=eq.{date}"
            response = requests.patch(
                url,
                headers=headers,
                json={"price_usd": price},
                timeout=10
            )
            
            if response.status_code in [200, 204]:
                return True
            elif response.status_code == 409:
                # Conflict - record might not exist, try INSERT instead
                url = f"{SUPABASE_URL}/rest/v1/bitcoin_price_data"
                response = requests.post(
                    url,
                    headers=headers,
                    json={"date": date, "price_usd": price},
                    timeout=10
                )
                return response.status_code in [200, 201]
            else:
                print(f"   ⚠️ HTTP {response.status_code}", end="")
                if attempt < retries - 1:
                    print(", retrying...")
                    time.sleep(2)
                    continue
                return False
        except requests.exceptions.RequestException as e:
            print(f"   ⚠️ Error: {str(e)[:50]}", end="")
            if attempt < retries - 1:
                print(", retrying...")
                time.sleep(2)
                continue
            return False
    
    return False

def main():
    print("\n" + "="*80)
    print("🚀 Syncing Yahoo Finance 2025 Data to Supabase - NOW!")
    print("="*80 + "\n")
    
    # Load data
    print("📂 Loading Yahoo Finance data...")
    data = load_yahoo_data()
    dates = sorted(data.keys())
    print(f"✅ Loaded {len(dates)} records\n")
    
    print("📊 Syncing to Supabase...\n")
    
    updated = 0
    failed = 0
    
    for i, date in enumerate(dates, 1):
        price = data[date]
        sys.stdout.write(f"[{i}/{len(dates)}] {date}: ${price:,.2f}... ")
        sys.stdout.flush()
        
        if sync_price(date, price):
            print("✅")
            updated += 1
        else:
            print("❌")
            failed += 1
        
        # Rate limiting
        time.sleep(0.1)
    
    print("\n" + "="*80)
    print("📊 SYNC SUMMARY")
    print("="*80)
    print(f"✅ Synced: {updated}/{len(dates)}")
    print(f"❌ Failed: {failed}/{len(dates)}")
    print("="*80 + "\n")
    
    if updated == len(dates):
        print("🎉 ALL DATA SYNCED SUCCESSFULLY!")
        print("\n📝 Next steps:")
        print("1. Refresh your browser (Cmd+R / F5)")
        print("2. Go to Bitcoin History page")
        print("3. Check chart shows correct prices:")
        print("   - Lowest: $76,271.95 (Apr 8)")
        print("   - Highest: $124,752.53 (Oct 6) 🏆")
        print("   - July 26: $117,947.37 ✓\n")
    else:
        print(f"⚠️ {failed} records failed to sync")
        print("Please try again or use manual SQL sync.\n")

if __name__ == "__main__":
    main()

