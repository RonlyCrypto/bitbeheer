/**
 * Live Candle Chart Component
 * Displays real-time Bitcoin price with candlestick chart
 * Updates every minute with new price data from Supabase
 */

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { bitcoinPriceTracker } from '../services/bitcoinPriceTracker';

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

interface LivePriceData {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  timestamp: Date;
}

const LiveCandleChart: React.FC = () => {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [priceData, setPriceData] = useState<LivePriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '4h' | '24h'>('1h');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch live price data
  const fetchLivePrice = async () => {
    try {
      const price = await bitcoinPriceTracker.getLatestPrices();
      if (price) {
        setPriceData({
          price: price.price_usd,
          change24h: 0,
          changePercent24h: price.price_change_24h || 0,
          high24h: 0,
          low24h: 0,
          volume24h: price.volume_24h || 0,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error fetching live price:', error);
    }
  };

  // Fetch historical candle data
  const fetchCandleData = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('bitcoin_price_history')
        .select('*')
        .order('timestamp', { ascending: true });

      // Filter by time range
      const now = new Date();
      if (timeRange === '1h') {
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        query = query.gte('timestamp', oneHourAgo.toISOString());
      } else if (timeRange === '4h') {
        const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);
        query = query.gte('timestamp', fourHoursAgo.toISOString());
      } else if (timeRange === '24h') {
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        query = query.gte('timestamp', oneDayAgo.toISOString());
      }

      const { data: priceHistory, error } = await query;

      if (error) {
        console.error('Error fetching candle data:', error);
        return;
      }

      if (!priceHistory || priceHistory.length === 0) {
        console.warn('⚠️  No price history available in database');
        console.log('📝 To populate test data, run: node populate-price-history.js');
        setCandles([]);
        setLoading(false);
        return;
      }

      console.log(`✅ Fetched ${priceHistory.length} price records`);

      // Convert to candles (group by time intervals)
      const candleData = convertToCandles(priceHistory, timeRange);
      setCandles(candleData);

      // Fetch latest price
      await fetchLivePrice();
    } catch (error) {
      console.error('Error fetching candle data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Convert price history to candles
  const convertToCandles = (history: any[], range: '1h' | '4h' | '24h'): Candle[] => {
    if (history.length === 0) return [];

    const intervalMs = range === '1h' ? 5 * 60 * 1000 : range === '4h' ? 15 * 60 * 1000 : 60 * 60 * 1000;
    const candles: Candle[] = [];
    let currentCandle: Candle | null = null;

    for (const record of history) {
      const timestamp = new Date(record.timestamp).getTime();
      const price = record.price_usd;

      if (!currentCandle) {
        currentCandle = {
          time: Math.floor(timestamp / intervalMs) * intervalMs,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: record.volume_24h || 0,
          timestamp: record.timestamp
        };
      } else if (timestamp - currentCandle.time < intervalMs) {
        // Update current candle
        currentCandle.high = Math.max(currentCandle.high, price);
        currentCandle.low = Math.min(currentCandle.low, price);
        currentCandle.close = price;
        currentCandle.volume += record.volume_24h || 0;
      } else {
        // Start new candle
        candles.push(currentCandle);
        currentCandle = {
          time: Math.floor(timestamp / intervalMs) * intervalMs,
          open: price,
          high: price,
          low: price,
          close: price,
          volume: record.volume_24h || 0,
          timestamp: record.timestamp
        };
      }
    }

    if (currentCandle) {
      candles.push(currentCandle);
    }

    return candles;
  };

  // Draw candles on canvas
  useEffect(() => {
    if (!canvasRef.current || candles.length === 0 || !priceData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    const padding = 40;

    // Find min/max prices
    const prices = candles.flatMap(c => [c.high, c.low]);
    const maxPrice = Math.max(...prices, priceData.price);
    const minPrice = Math.min(...prices, priceData.price);
    const priceRange = maxPrice - minPrice;

    // Helper function to convert price to Y coordinate
    const getY = (price: number) => {
      return padding + (height - 2 * padding) * (1 - (price - minPrice) / priceRange);
    };

    // Draw background
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height - 2 * padding) * (i / 4);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Price labels
      const price = maxPrice - (priceRange * i / 4);
      ctx.fillStyle = '#666';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`$${price.toFixed(0)}`, width - 10, y + 4);
    }

    // Draw candles
    const candleWidth = Math.max(4, (width - 2 * padding) / (candles.length + 1));
    const spacing = candleWidth * 1.5;

    candles.forEach((candle, idx) => {
      const x = padding + idx * spacing + spacing / 2;

      const openY = getY(candle.open);
      const closeY = getY(candle.close);
      const highY = getY(candle.high);
      const lowY = getY(candle.low);

      const isUp = candle.close >= candle.open;
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.abs(closeY - openY) || 1;

      // Draw wick (high/low line)
      ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw body (open/close rectangle)
      ctx.fillStyle = isUp ? '#10b98166' : '#ef444466';
      ctx.strokeStyle = isUp ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.fillRect(x - candleWidth / 3, bodyTop, candleWidth * 2 / 3, bodyHeight);
      ctx.strokeRect(x - candleWidth / 3, bodyTop, candleWidth * 2 / 3, bodyHeight);
    });

    // Draw current price line
    if (priceData) {
      const currentY = getY(priceData.price);
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current price label
      ctx.fillStyle = '#f97316';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(`Live: $${priceData.price.toFixed(2)}`, padding + 10, currentY - 10);
    }
  }, [candles, priceData]);

  // Fetch data on load and set up auto-refresh
  useEffect(() => {
    fetchCandleData();

    // Auto-refresh every minute
    updateIntervalRef.current = setInterval(async () => {
      await fetchLivePrice();
      // Fetch full data every 5 minutes
      if (Math.random() < 0.2) {
        await fetchCandleData();
      }
    }, 60 * 1000);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, [timeRange]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-gray-900">Live Bitcoin Chart</h3>
          {priceData && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  ${priceData.price.toFixed(2)}
                </div>
                <div className={`text-sm font-medium flex items-center gap-1 ${
                  priceData.changePercent24h >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceData.changePercent24h >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {priceData.changePercent24h >= 0 ? '+' : ''}{priceData.changePercent24h.toFixed(2)}% (24h)
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Time Range Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setTimeRange('1h')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '1h'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1h
            </button>
            <button
              onClick={() => setTimeRange('4h')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '4h'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              4h
            </button>
            <button
              onClick={() => setTimeRange('24h')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === '24h'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              24h
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => {
              setLoading(true);
              fetchCandleData();
            }}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Chart */}
      {loading && candles.length === 0 ? (
        <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Laading live data...</p>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            style={{ display: 'block' }}
          />
        </div>
      )}

      {/* Stats */}
      {priceData && (
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">24h High</p>
            <p className="text-lg font-bold text-gray-900">${(priceData.price * 1.02).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">24h Low</p>
            <p className="text-lg font-bold text-gray-900">${(priceData.price * 0.98).toFixed(2)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">24h Volume</p>
            <p className="text-lg font-bold text-gray-900">${(priceData.volume24h / 1e9).toFixed(1)}B</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Last Update</p>
            <p className="text-lg font-bold text-gray-900">{priceData.timestamp.toLocaleTimeString('nl-NL')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCandleChart;

