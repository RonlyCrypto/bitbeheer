/**
 * Initialize Bitcoin Price Tracking
 * Call this once when the app loads to start automatic price updates
 */

import { bitcoinPriceTracker } from '../services/bitcoinPriceTracker';

let isInitialized = false;

export function initBitcoinPriceTracking(): void {
  if (isInitialized) {
    console.log('⚠️  Bitcoin price tracking already initialized');
    return;
  }

  console.log('🚀 Initializing Bitcoin price tracking...');

  // Start hourly tracking (saves every hour for live charts)
  bitcoinPriceTracker.startHourlyTracking();

  // Start daily updates (saves yesterday's closing price)
  bitcoinPriceTracker.startDailyUpdates();

  isInitialized = true;
  console.log('✅ Bitcoin price tracking initialized');
}

export function stopBitcoinPriceTracking(): void {
  bitcoinPriceTracker.stopHourlyTracking();
  bitcoinPriceTracker.stopDailyUpdates();
  isInitialized = false;
  console.log('⏸️  Bitcoin price tracking stopped');
}

export { bitcoinPriceTracker };

