import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface PriceRecord {
  date: string;
  timestamp: number;
  price_usd: number;
  price_eur: number;
  volume_usd: number;
  market_cap_usd: number;
  price_change_24h: number;
}

interface YearlyData {
  year: number;
  startDate: string;
  endDate: string;
  totalDays: number;
  priceRecords: PriceRecord[];
  lastUpdated: string;
  version: string;
}

serve(async (req) => {
  try {
    console.log("🚀 Generating yearly JSON files...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all years
    const { data: allData, error: fetchError } = await supabase
      .from("bitcoin_price_data")
      .select("year");

    if (fetchError) {
      throw new Error(`Fetch error: ${fetchError.message}`);
    }

    const years = [...new Set((allData || []).map((d: any) => d.year))].sort();
    console.log(`✅ Found ${years.length} years: ${years.join(", ")}`);

    let filesCreated = 0;
    const createdFiles: string[] = [];

    // Generate file for each year
    for (const year of years) {
      console.log(`📥 Loading ${year} data...`);

      const { data: yearData, error: yearError } = await supabase
        .from("bitcoin_price_data")
        .select("*")
        .eq("year", year)
        .order("date", { ascending: true });

      if (yearError || !yearData || yearData.length === 0) {
        console.warn(`⚠️  No data for ${year}`);
        continue;
      }

      // Transform data
      const yearlyFile: YearlyData = {
        year,
        startDate: yearData[0].date,
        endDate: yearData[yearData.length - 1].date,
        totalDays: yearData.length,
        priceRecords: yearData.map((record: any) => ({
          date: record.date,
          timestamp: record.timestamp,
          price_usd: record.price_usd,
          price_eur: record.price_eur,
          volume_usd: record.volume_usd,
          market_cap_usd: record.market_cap_usd,
          price_change_24h: record.price_change_24h,
        })),
        lastUpdated: new Date().toISOString(),
        version: "1.0.0",
      };

      // Store in Supabase Storage
      const filename = `${year}.json`;
      const { error: uploadError } = await supabase.storage
        .from("bitcoin-price-data")
        .upload(filename, JSON.stringify(yearlyFile), {
          contentType: "application/json",
          upsert: true,
        });

      if (uploadError) {
        console.error(`❌ Error uploading ${year}.json:`, uploadError.message);
        continue;
      }

      filesCreated++;
      createdFiles.push(filename);
      console.log(`✅ Created ${year}.json (${yearlyFile.totalDays} days)`);
    }

    // Create index file
    const indexFile = {
      version: "1.0.0",
      lastUpdated: new Date().toISOString(),
      availableYears: years,
      files: years.reduce((acc: any, year: number) => {
        acc[year] = {
          filename: `${year}.json`,
          path: `/bitcoin-data/${year}.json`,
          type: "application/json",
        };
        return acc;
      }, {}),
    };

    const { error: indexError } = await supabase.storage
      .from("bitcoin-price-data")
      .upload("index.json", JSON.stringify(indexFile, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

    if (indexError) {
      console.error("❌ Error uploading index:", indexError.message);
    } else {
      console.log("✅ Created index.json");
    }

    console.log(`\n✅ Generation Complete!`);
    console.log(`   Files created: ${filesCreated}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Generated ${filesCreated} yearly files`,
        years,
        files: createdFiles,
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

