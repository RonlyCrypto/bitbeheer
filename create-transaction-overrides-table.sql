-- Manual per-transaction annotations: an optional exchange label/note,
-- and an optional price override so the user's actual known cost basis
-- can replace the automatic blockchain-date price used in profit/FIFO
-- calculations. Keyed by (email, wallet_address, tx_hash, tx_time) since
-- transactions themselves aren't rows we own -- they come from the chain.

CREATE TABLE IF NOT EXISTS public.transaction_overrides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR NOT NULL,
  wallet_address VARCHAR NOT NULL,
  tx_hash VARCHAR NOT NULL,
  tx_time BIGINT NOT NULL,
  exchange_label VARCHAR,
  price_override NUMERIC(14, 2),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(email, wallet_address, tx_hash, tx_time)
);

CREATE INDEX IF NOT EXISTS idx_transaction_overrides_lookup
  ON public.transaction_overrides(email, wallet_address);

ALTER TABLE public.transaction_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own transaction overrides"
  ON public.transaction_overrides
  FOR SELECT
  USING (
    (auth.jwt() ->> 'email') = email
    OR (auth.jwt() ->> 'email') = 'admin@bitbeheer.nl'
  );

CREATE POLICY "Users can insert their own transaction overrides"
  ON public.transaction_overrides
  FOR INSERT
  WITH CHECK ((auth.jwt() ->> 'email') = email);

CREATE POLICY "Users can update their own transaction overrides"
  ON public.transaction_overrides
  FOR UPDATE
  USING ((auth.jwt() ->> 'email') = email)
  WITH CHECK ((auth.jwt() ->> 'email') = email);

CREATE POLICY "Users can delete their own transaction overrides"
  ON public.transaction_overrides
  FOR DELETE
  USING ((auth.jwt() ->> 'email') = email);
