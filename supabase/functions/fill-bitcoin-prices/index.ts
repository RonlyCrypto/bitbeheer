import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const COINGECKO_API = "https://api.coingecko.com/api/v3";

interface PriceData {
  price_usd: number;
  price_eur: number;
  volume_usd: number;
  market_cap_usd: number;
}

// Helper function to fetch historical price
async function fetchHistoricalPrice(date: string): Promise<PriceData | null> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/bitcoin/history?date=${date}&localization=false`
    );
    const data = await response.json();

    if (!data.market_data) {
      console.warn(`⚠️ No data for ${date}`);
      return null;
    }

    return {
      price_usd: data.market_data.current_price.usd,
      price_eur: data.market_data.current_price.eur || 0,
      volume_usd: data.market_data.total_volume.usd || 0,
      market_cap_usd: data.market_cap.usd || 0,
    };
  } catch (error) {
    console.error(`❌ Error fetching ${date}:`, error.message);
    return null;
  }
}

// Main function
serve(async (req) => {
  try {
    console.log("🚀 Starting Bitcoin price history fill...");

    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the date range: last 30 days (to catch any gaps)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    let current = new Date(startDate);
    let count = 0;
    const failed: string[] = [];

    console.log(
      `📊 Filling prices from ${
        startDate.toISOString().split("T")[0]
      } to ${endDate.toISOString().split("T")[0]}`
    );

    while (current <= endDate) {
      const dateStr = current.toISOString().split("T")[0];

      // Check if price already exists
      const { data: existing } = await supabase
        .from("bitcoin_price_data")
        .select("id")
        .eq("date", dateStr)
        .single();

      if (!existing) {
        // Fetch price from CoinGecko
        const price = await fetchHistoricalPrice(dateStr);

        if (price) {
          // Insert into database
          const { error } = await supabase
            .from("bitcoin_price_data")
            .insert([
              {
                date: dateStr,
                timestamp: Math.floor(current.getTime() / 1000),
                price_usd: price.price_usd,
                price_eur: price.price_eur,
                volume: price.volume_usd,
                market_cap: price.market_cap_usd,
                volume_usd: price.volume_usd,
                market_cap_usd: price.market_cap_usd,
                price_change_24h: 0,
                year: current.getFullYear(),
              },
            ]);

          if (error) {
            console.error(`❌ Error saving ${dateStr}:`, error.message);
            failed.push(dateStr);
          } else {
            count++;
            console.log(`✅ Saved ${dateStr}: $${price.price_usd}`);
          }
        } else {
          failed.push(dateStr);
        }

        // Rate limiting - CoinGecko has limits
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        console.log(`⏭️ Already exists for ${dateStr}`);
      }

      current.setDate(current.getDate() + 1);
    }

    console.log(`\n✅ Completed! Saved ${count} new prices`);
    if (failed.length > 0) {
      console.warn(`⚠️ Failed to fetch: ${failed.join(", ")}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Filled ${count} prices`,
        failed: failed.length,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      { headers: { "Content-Type": "application/json" }, status: 500 }
    );
  }
});

