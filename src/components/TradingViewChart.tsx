/**
 * TradingView Lightweight Chart Component
 * Embedded TradingView chart for Bitcoin real-time prices
 */

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    TradingView?: any;
  }
}

interface TradingViewChartProps {
  symbol?: string;
  height?: number;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({
  symbol = 'BITSTAMP:BTCUSD',
  height = 500
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create TradingView widget script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: '60', // 1 hour candles
          timezone: 'Etc/UTC',
          theme: 'light',
          style: '1', // Candles style
          locale: 'nl_NL',
          toolbar_bg: '#f1f3f6',
          enable_publishing: false,
          allow_symbol_change: false,
          container_id: 'tradingview-chart'
        });
      }
    };

    // Remove previous script if exists
    const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
    if (existingScript) {
      existingScript.remove();
    }

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol]);

  return (
    <div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
      <div
        id="tradingview-chart"
        ref={containerRef}
        style={{ height: `${height}px`, width: '100%' }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Laading TradingView Chart...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewChart;

