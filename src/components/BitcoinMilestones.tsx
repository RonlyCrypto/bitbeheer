import React, { useEffect, useState } from 'react';
import { TrendingUp, Target, CheckCircle, Lock } from 'lucide-react';
import { bitcoinApiService } from '../services/bitcoinApiService';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

interface Milestone {
  btcAmount: number;
  label: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  description: string;
}

interface UserMilestoneStatus {
  milestone01: boolean;
  milestone1: boolean;
}

export default function BitcoinMilestones() {
  const { user } = useSupabaseAuth();
  const [currentBTC, setCurrentBTC] = useState<number>(0);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(95000);
  const [userMilestones, setUserMilestones] = useState<UserMilestoneStatus>({
    milestone01: false,
    milestone1: false
  });
  const [loading, setLoading] = useState(true);

  const MILESTONES: Milestone[] = [
    {
      btcAmount: 0.1,
      label: '0.1 Bitcoin',
      icon: Target,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'First Step'
    },
    {
      btcAmount: 1,
      label: '1 Bitcoin',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Full Bitcoin'
    }
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load current Bitcoin price
        const priceData = await bitcoinApiService.getCurrentPrice();
        setBitcoinPrice(priceData.price);

        // Load user's total portfolio value (in BTC equivalent)
        if (user?.email) {
          // Get wallets from database
          const { data: wallets } = await supabase
            .from('bitcoin_wallets')
            .select('total_btc_holdings')
            .eq('user_email', user.email)
            .maybeSingle();

          if (wallets?.total_btc_holdings) {
            setCurrentBTC(wallets.total_btc_holdings);

            // Update milestone status
            const reached01 = wallets.total_btc_holdings >= 0.1;
            const reached1 = wallets.total_btc_holdings >= 1;

            setUserMilestones({
              milestone01: reached01,
              milestone1: reached1
            });

            // Save milestone achievement to database
            if (reached01 || reached1) {
              await supabase
                .from('user_milestones')
                .upsert({
                  user_email: user.email,
                  milestone_01_btc: reached01,
                  milestone_1_btc: reached1,
                  updated_at: new Date().toISOString()
                }, {
                  onConflict: 'user_email'
                });
            }
          }
        }
      } catch (error) {
        console.error('Error loading milestone data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.email]);

  const calculateProgress = (milestone: number) => {
    return Math.min((currentBTC / milestone) * 100, 100);
  };

  const calculateRemaining = (milestone: number) => {
    const remaining = milestone - currentBTC;
    return remaining > 0 ? remaining.toFixed(4) : 0;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">🎯 Bitcoin Milestones</h3>
        <p className="text-sm text-gray-600">
          Jouw huurdige holdings: <span className="font-bold text-orange-600">{currentBTC.toFixed(4)} BTC</span>
          {' '}(≈ €{(currentBTC * bitcoinPrice).toLocaleString('nl-NL')})
        </p>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MILESTONES.map((milestone, idx) => {
          const progress = calculateProgress(milestone.btcAmount);
          const remaining = calculateRemaining(milestone.btcAmount);
          const isMilestoneReached = idx === 0 ? userMilestones.milestone01 : userMilestones.milestone1;
          const Icon = milestone.icon;

          return (
            <div
              key={milestone.btcAmount}
              className={`${milestone.bgColor} rounded-lg p-4 border-2 ${
                isMilestoneReached ? 'border-green-400' : 'border-gray-200'
              } transition-all`}
            >
              {/* Title with Icon */}
              <div className="flex items-center gap-3 mb-3">
                <div className={`p-2 rounded-lg ${milestone.bgColor}`}>
                  {isMilestoneReached ? (
                    <CheckCircle className={`w-5 h-5 ${milestone.color} text-green-600`} />
                  ) : (
                    <Icon className={`w-5 h-5 ${milestone.color}`} />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-bold ${milestone.color}`}>{milestone.label}</p>
                  <p className="text-xs text-gray-500">{milestone.description}</p>
                </div>
              </div>

              {/* Achievement Badge */}
              {isMilestoneReached && (
                <div className="mb-3 inline-block px-2 py-1 bg-green-200 text-green-700 text-xs font-bold rounded">
                  ✅ Bereikt!
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs font-medium text-gray-700 mb-1">
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 transition-all duration-500 ${
                      isMilestoneReached ? 'bg-green-500' : 'bg-orange-500'
                    }`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Huidden</p>
                  <p className="font-bold text-gray-900">{currentBTC.toFixed(4)}</p>
                </div>
                <div className="bg-white bg-opacity-50 p-2 rounded">
                  <p className="text-xs text-gray-600">Nog nodig</p>
                  <p className={`font-bold ${isMilestoneReached ? 'text-green-600' : 'text-orange-600'}`}>
                    {isMilestoneReached ? '✅' : remaining} BTC
                  </p>
                </div>
              </div>

              {/* Milestone Status Message */}
              {isMilestoneReached && (
                <div className="mt-3 p-2 bg-green-100 border border-green-300 rounded text-xs text-green-700">
                  🎉 Je bent lid van de <strong>{milestone.label} groep!</strong>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total Progress */}
      <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">Total Journey</p>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-2">
          <div
            className="h-3 bg-gradient-to-r from-orange-500 to-green-500 transition-all duration-500"
            style={{ width: `${Math.min((currentBTC / 1) * 100, 100)}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-600">
          {currentBTC >= 1
            ? '🚀 Je bent een echte Bitcoin holder!'
            : currentBTC >= 0.1
            ? '💪 Goed bezig! Volgende stop: 1 BTC'
            : '📈 Start je Bitcoin reis - streef naar 0.1 BTC'}
        </p>
      </div>
    </div>
  );
}

