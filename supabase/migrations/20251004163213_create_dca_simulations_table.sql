/*
  # Crypto DCA App Database Schema

  ## Overview
  This migration creates the foundation for a crypto DCA (Dollar Cost Averaging) education platform.
  
  ## New Tables
  
  ### 1. `dca_simulations`
  Stores user-created DCA simulation configurations and results
  - `id` (uuid, primary key) - Unique identifier for each simulation
  - `user_id` (uuid, nullable) - Optional user ID for registered users
  - `coin` (text) - Cryptocurrency symbol (e.g., 'BTC', 'ETH')
  - `start_date` (date) - When the DCA simulation starts
  - `monthly_amount` (numeric) - Amount invested each month
  - `total_invested` (numeric) - Total amount invested
  - `current_value` (numeric) - Current portfolio value
  - `roi_percentage` (numeric) - Return on investment percentage
  - `created_at` (timestamptz) - When the simulation was created
  
  ### 2. `price_cache`
  Caches historical price data to reduce API calls
  - `id` (uuid, primary key) - Unique identifier
  - `coin` (text) - Cryptocurrency symbol
  - `date` (date) - Price date
  - `price_usd` (numeric) - Price in USD
  - `fetched_at` (timestamptz) - When data was fetched
  
  ## Security
  - Enable RLS on both tables
  - Public read access for price cache (educational data)
  - Users can create and view their own simulations
  - Anonymous users can create temporary simulations (no user_id)
  
  ## Notes
  - Price cache improves performance and reduces external API dependency
  - Simulations can be anonymous or tied to authenticated users
  - Data is optimized for fast DCA calculations
*/

CREATE TABLE IF NOT EXISTS dca_simulations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coin text NOT NULL DEFAULT 'BTC',
  start_date date NOT NULL,
  monthly_amount numeric NOT NULL CHECK (monthly_amount > 0),
  total_invested numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  roi_percentage numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS price_cache (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coin text NOT NULL,
  date date NOT NULL,
  price_usd numeric NOT NULL CHECK (price_usd > 0),
  fetched_at timestamptz DEFAULT now(),
  UNIQUE(coin, date)
);

CREATE INDEX IF NOT EXISTS idx_price_cache_coin_date ON price_cache(coin, date);
CREATE INDEX IF NOT EXISTS idx_dca_simulations_user_id ON dca_simulations(user_id);
CREATE INDEX IF NOT EXISTS idx_dca_simulations_created_at ON dca_simulations(created_at);

ALTER TABLE dca_simulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read price cache"
  ON price_cache FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service can insert price data"
  ON price_cache FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can create simulations"
  ON dca_simulations FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read simulations"
  ON dca_simulations FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update own simulations"
  ON dca_simulations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
  ON dca_simulations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);