import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const TICKER = "BTC-USD";

interface PriceData {
  date: string;
  timestamp: number;
  price_usd: number;
  price_high: number | null;
  price_low: number | null;
  price_open: number | null;
  volume: number;
  year: number;
}

function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

async function fetchYahooData(date: Date): Promise<PriceData | null> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const startUnix = dateToUnix(startOfDay);
  const endUnix = dateToUnix(endOfDay);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${TICKER}?period1=${startUnix}&period2=${endUnix}&interval=1d&includePrePost=false`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
      !data.chart?.result?.[0]?.timestamp ||
      data.chart.result[0].timestamp.length === 0
    ) {
      console.warn(`No data for ${date.toISOString().split("T")[0]}`);
      return null;
    }

    const result = data.chart.result[0];
    const timestamp = result.timestamp[0];
    const quote = result.indicators.quote[0];

    const open = quote.open?.[0];
    const high = quote.high?.[0];
    const low = quote.low?.[0];
    const close = quote.close?.[0];
    const volume = quote.volume?.[0] || 0;

    if (!close) {
      console.warn(
        `Incomplete data for ${date.toISOString().split("T")[0]}`
      );
      return null;
    }

    // Calculate average price
    const validPrices = [open, high, low, close].filter(
      (p) => p !== null && p !== undefined
    );
    const avgPrice =
      validPrices.length > 0
        ? validPrices.reduce((a, b) => a + b, 0) / validPrices.length
        : close;

    return {
      date: date.toISOString().split("T")[0],
      timestamp,
      price_usd: parseFloat(close.toFixed(2)),
      price_high: high ? parseFloat(high.toFixed(2)) : null,
      price_low: low ? parseFloat(low.toFixed(2)) : null,
      price_open: open ? parseFloat(open.toFixed(2)) : null,
      volume: Math.floor(volume),
      year: date.getFullYear(),
    };
  } catch (error) {
    console.error(
      `Error fetching Yahoo data for ${date.toISOString().split("T")[0]}:`,
      error
    );
    return null;
  }
}

serve(async (req: Request) => {
  try {
    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    console.log(
      `Fetching Bitcoin data for ${yesterday.toISOString().split("T")[0]}`
    );

    // Fetch from Yahoo
    const priceData = await fetchYahooData(yesterday);

    if (!priceData) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `No data available for ${yesterday.toISOString().split("T")[0]}`,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Update Supabase
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const supabase = createClient(supabaseUrl, supabaseKey);

    const { error } = await supabase.from("bitcoin_price_data").upsert(
      {
        date: priceData.date,
        timestamp: priceData.timestamp,
        price_usd: priceData.price_usd,
        price_high: priceData.price_high,
        price_low: priceData.price_low,
        price_open: priceData.price_open,
        volume: priceData.volume,
        year: priceData.year,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "date",
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        date: priceData.date,
        price: priceData.price_usd,
        message: "Bitcoin price updated successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in sync function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});

