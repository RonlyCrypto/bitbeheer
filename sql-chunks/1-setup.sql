-- ============================================================
-- REBUILD: Bitcoin data from Yahoo Finance 2014-TODAY
-- This REPLACES all data from 2014-01-01 onwards
-- Period: 2014-09-17 to 2025-11-15
-- Total Records: 4078
-- Source: Yahoo Finance (AUTHORITATIVE)
-- Generated: 2025-11-15T01:04:58.444Z
-- ============================================================

-- DISABLE TRIGGERS TEMPORARILY (for faster updates)
ALTER TABLE bitcoin_price_data DISABLE TRIGGER ALL;

-- CLEAR all data from 2014 onwards (keep only pre-2014 if exists)
DELETE FROM bitcoin_price_data WHERE date >= '2014-01-01';