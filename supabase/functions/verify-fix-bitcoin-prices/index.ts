import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sleep function
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Fetch price from CoinGecko
async function getCoinGeckoPrice(dateStr: string): Promise<number | null> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/bitcoin/history?date=${dateStr}&localization=false`
    );

    if (!response.ok) {
      console.error(`CoinGecko error for ${dateStr}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    if (data.market_data?.current_price?.usd) {
      return data.market_data.current_price.usd;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching CoinGecko price for ${dateStr}:`, error.message);
    return null;
  }
}

// Main verification and fix function
async function verifyAndFixPrices() {
  console.log("🔍 Starting Bitcoin price verification...");

  try {
    // Get all prices from Supabase
    const { data: prices, error: fetchError } = await supabase
      .from("bitcoin_price_data")
      .select("id, date, price_usd")
      .order("date", { ascending: false });

    if (fetchError) {
      console.error("Error fetching prices:", fetchError);
      return {
        success: false,
        error: `Fetch error: ${fetchError.message}`,
      };
    }

    if (!prices || prices.length === 0) {
      console.log("⚠️ No prices found in database");
      return {
        success: true,
        message: "No prices to verify",
        stats: {
          total: 0,
          correct: 0,
          fixed: 0,
        },
      };
    }

    console.log(`📊 Found ${prices.length} price records`);

    let correctCount = 0;
    let incorrectCount = 0;
    const fixedPrices: Array<{
      id: string;
      date: string;
      oldPrice: number;
      newPrice: number;
    }> = [];

    // Check last 100 prices (most recent)
    const pricesToCheck = prices.slice(0, 100);

    for (let i = 0; i < pricesToCheck.length; i++) {
      const record = pricesToCheck[i];

      console.log(`[${i + 1}/${pricesToCheck.length}] Checking ${record.date}...`);

      const cgPrice = await getCoinGeckoPrice(record.date);

      if (!cgPrice) {
        console.log(`  ⚠️ Could not fetch CoinGecko price for ${record.date}`);
        continue;
      }

      // Allow 2% tolerance (due to different data sources)
      const tolerance = 0.02;
      const priceDiff = Math.abs(record.price_usd - cgPrice) / cgPrice;

      if (priceDiff > tolerance) {
        console.log(
          `  ❌ MISMATCH: Supabase=$${record.price_usd.toFixed(2)}, CoinGecko=$${cgPrice.toFixed(2)} (${(priceDiff * 100).toFixed(2)}%)`
        );
        incorrectCount++;
        fixedPrices.push({
          id: record.id,
          date: record.date,
          oldPrice: record.price_usd,
          newPrice: cgPrice,
        });
      } else {
        console.log(`  ✅ OK ($${cgPrice.toFixed(2)})`);
        correctCount++;
      }

      // Rate limit to be nice to CoinGecko API
      await sleep(1000);
    }

    console.log(`\n📈 Verification Results:`);
    console.log(`  ✅ Correct: ${correctCount}`);
    console.log(`  ❌ Incorrect: ${incorrectCount}`);

    // Fix incorrect prices
    if (fixedPrices.length > 0) {
      console.log(`\n🔧 Fixing ${fixedPrices.length} incorrect prices...`);

      for (const item of fixedPrices) {
        const { error: updateError } = await supabase
          .from("bitcoin_price_data")
          .update({ price_usd: item.newPrice })
          .eq("id", item.id);

        if (updateError) {
          console.error(`  ❌ Error updating ${item.date}:`, updateError);
        } else {
          console.log(
            `  ✅ Fixed ${item.date}: $${item.oldPrice.toFixed(2)} → $${item.newPrice.toFixed(2)}`
          );
        }

        await sleep(500);
      }
    }

    return {
      success: true,
      message: `Verification complete. Fixed ${fixedPrices.length} prices.`,
      stats: {
        total: pricesToCheck.length,
        correct: correctCount,
        fixed: fixedPrices.length,
      },
      fixedDetails: fixedPrices,
    };
  } catch (error) {
    console.error("Error during verification:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

serve(async (req) => {
  // Verify this is a scheduled function call
  const authHeader = req.headers.get("authorization");

  // Simple security check (in production, validate JWT properly)
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const result = await verifyAndFixPrices();

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

