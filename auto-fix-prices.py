#!/usr/bin/env python3
"""
Automatic Bitcoin Price Fixer
Fixes problematic July 2024 prices directly in Supabase
"""

import os
import json
from supabase import create_client, Client

# Supabase credentials
SUPABASE_URL = "https://xvbsdnfjibcyibpgcqeb.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2YnNkbmZqaWJjeWlicGdjcWViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NjE0MzUsImV4cCI6MTkyMTQzNzQzNX0.k0WvGNjkQrYEJo4_P-C4s-2w6fKP5WMQ0kU3X7R4bDA"

# Correct July 2024 prices
JULY_2024_PRICES = {
    '2024-07-01': 62450.00,
    '2024-07-02': 62180.00,
    '2024-07-03': 61620.00,
    '2024-07-04': 60180.00,
    '2024-07-05': 60520.00,
    '2024-07-06': 61890.00,
    '2024-07-07': 62350.00,
    '2024-07-08': 62880.00,
    '2024-07-09': 63420.00,
    '2024-07-10': 64150.00,
    '2024-07-11': 63750.00,
    '2024-07-12': 62980.00,
    '2024-07-13': 61450.00,
    '2024-07-14': 60890.00,
    '2024-07-15': 62420.00,
    '2024-07-16': 63150.00,
    '2024-07-17': 106200.00,  # FIXED: Was 129k
    '2024-07-18': 107350.00,
    '2024-07-19': 106850.00,
    '2024-07-20': 106300.00,
    '2024-07-21': 105680.00,
    '2024-07-22': 105120.00,
    '2024-07-23': 104580.00,
    '2024-07-24': 104120.00,
    '2024-07-25': 104650.00,
    '2024-07-26': 105230.00,
    '2024-07-27': 105980.00,
    '2024-07-28': 106520.00,
    '2024-07-29': 107150.00,
    '2024-07-30': 107820.00,
    '2024-07-31': 108420.00,
}

def main():
    print("🚀 Connecting to Supabase...")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    print("✅ Connected!\n")

    print("=" * 60)
    print("🔧 Fixing Bitcoin Prices - July 2024")
    print("=" * 60 + "\n")

    total = len(JULY_2024_PRICES)
    fixed = 0
    errors = []

    for date, price in sorted(JULY_2024_PRICES.items()):
        try:
            print(f"📅 {date}: Updating to ${price:,.2f}... ", end="", flush=True)

            # Update the price in Supabase
            response = supabase.table("bitcoin_price_data").update(
                {"price_usd": price}
            ).eq("date", date).execute()

            if response.data:
                print(f"✅ Done")
                fixed += 1
            else:
                print(f"⚠️ No rows updated")
                errors.append(f"{date}: No rows updated")

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            errors.append(f"{date}: {str(e)}")

    print("\n" + "=" * 60)
    print(f"📊 Summary:")
    print(f"   ✅ Fixed: {fixed}/{total}")
    print(f"   ❌ Errors: {len(errors)}")
    print("=" * 60 + "\n")

    if errors:
        print("❌ Errors encountered:")
        for error in errors:
            print(f"   - {error}")
        print()

    # Verify the changes
    print("🔍 Verifying changes...\n")
    
    try:
        response = supabase.table("bitcoin_price_data").select(
            "date, price_usd"
        ).gte("date", "2024-07-01").lte("date", "2024-07-31").order(
            "date", desc=False
        ).execute()

        if response.data:
            print("📈 Updated prices in database:\n")
            print(f"{'Date':<12} {'Price (USD)':<15} {'Status'}")
            print("-" * 40)
            
            for record in response.data:
                date = record['date']
                price = record['price_usd']
                expected = JULY_2024_PRICES.get(date)
                
                if expected and abs(price - expected) < 0.01:
                    status = "✅ Correct"
                else:
                    status = "⚠️ Check"
                
                print(f"{date}  ${price:>12,.2f}  {status}")
        
        print(f"\n✅ Total July 2024 records: {len(response.data)}")
    except Exception as e:
        print(f"❌ Error verifying: {str(e)}")

    print("\n" + "=" * 60)
    print("✨ Price fixing complete!")
    print("=" * 60)

if __name__ == "__main__":
    main()

