import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface PriceData {
  date: string;
  timestamp: number;
  price_usd: number;
  price_eur: number | null;
  volume: number | null;
  year: number;
}

// Fetch price from CoinGecko
async function fetchPriceFromCoinGecko(date: string): Promise<PriceData | null> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${date}&localization=false`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`CoinGecko API returned status ${response.status} for date ${date}`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data.market_data?.current_price?.usd) {
      console.log(`No price data from CoinGecko for ${date}`);
      return null;
    }
    
    const priceDate = new Date(date);
    const timestamp = Math.floor(priceDate.getTime() / 1000);
    const year = priceDate.getFullYear();
    
    return {
      date,
      timestamp,
      price_usd: data.market_data.current_price.usd,
      price_eur: data.market_data.current_price.eur || null,
      volume: data.market_data.total_volume?.usd || null,
      year,
    };
  } catch (error) {
    console.error(`Error fetching price for ${date}:`, error);
    return null;
  }
}

// Format date as YYYY-MM-DD
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Get dates to fetch (yesterday + previous 3 days if missing)
function getDatesToFetch(): string[] {
  const dates: string[] = [];
  const today = new Date();
  
  // Yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  dates.push(formatDate(yesterday));
  
  // Previous 3 days
  for (let i = 2; i <= 4; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  
  return dates;
}

// Check if date already exists in database
async function dateExists(date: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("bitcoin_price_data")
      .select("id")
      .eq("date", date)
      .limit(1);
    
    if (error) {
      console.error(`Error checking date ${date}:`, error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error(`Error checking date ${date}:`, error);
    return false;
  }
}

// Save price to database
async function savePriceToDatabase(priceData: PriceData): Promise<boolean> {
  try {
    // Check if exists first
    const exists = await dateExists(priceData.date);
    
    if (exists) {
      console.log(`Date ${priceData.date} already exists, skipping`);
      return true;
    }
    
    const { error } = await supabase
      .from("bitcoin_price_data")
      .insert([
        {
          date: priceData.date,
          timestamp: priceData.timestamp,
          price_usd: priceData.price_usd,
          price_eur: priceData.price_eur,
          volume: priceData.volume,
          year: priceData.year,
        },
      ]);
    
    if (error) {
      console.error(`Error saving price for ${priceData.date}:`, error);
      return false;
    }
    
    console.log(`✅ Saved price for ${priceData.date}: $${priceData.price_usd}`);
    return true;
  } catch (error) {
    console.error(`Error saving price for ${priceData.date}:`, error);
    return false;
  }
}

// Main function
async function dailyPriceSync() {
  console.log("🚀 Starting daily price sync...");
  
  const datesToFetch = getDatesToFetch();
  let successCount = 0;
  let skipCount = 0;
  
  for (const date of datesToFetch) {
    const exists = await dateExists(date);
    
    if (exists) {
      console.log(`⏭️  ${date} already in database, skipping`);
      skipCount++;
      continue;
    }
    
    console.log(`📥 Fetching price for ${date}...`);
    const priceData = await fetchPriceFromCoinGecko(date);
    
    if (priceData) {
      const saved = await savePriceToDatabase(priceData);
      if (saved) successCount++;
      
      // Rate limit - wait 1 second between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(
    `✨ Daily sync complete! Saved: ${successCount}, Skipped: ${skipCount}`
  );
  
  return {
    success: true,
    saved: successCount,
    skipped: skipCount,
    timestamp: new Date().toISOString(),
  };
}

// HTTP handler
serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  
  try {
    const result = await dailyPriceSync();
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in daily-price-sync:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

