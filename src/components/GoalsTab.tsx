import React, { useState, useEffect } from 'react';
import { Plus, Target, TrendingUp, Calendar, DollarSign, Zap, Trash2, Check, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { bitcoinApiService } from '../services/bitcoinApiService';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  status: string;
  createdAt: string;
  targetBitcoinAmount?: number;
  currentBitcoinAmount?: number;
  monthlyInvestment?: number;
  bitcoinPriceAtCreation?: number;
  timeframeMonths?: number;
  isBitcoinGoal?: boolean;
}

export default function GoalsTab({ goals: initialGoals, setGoals: setInitialGoals }: any) {
  const { user } = useSupabaseAuth();
  const [goals, setGoals] = useState<Goal[]>(initialGoals || []);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(95000);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [selectedGoalTemplate, setSelectedGoalTemplate] = useState<string | null>(null);
  const [newGoalData, setNewGoalData] = useState({
    title: '',
    description: '',
    targetAmount: 0,
    targetBitcoinAmount: 0,
    currentBitcoinAmount: 0,
    timeframeMonths: 12,
    category: 'bitcoin',
    targetDate: ''
  });
  const [loading, setLoading] = useState(false);

  // Load Bitcoin price and wallet balance
  useEffect(() => {
    const loadData = async () => {
      try {
        const priceData = await bitcoinApiService.getCurrentPrice();
        setBitcoinPrice(priceData.price);
      } catch (error) {
        console.error('Error loading Bitcoin price:', error);
        setBitcoinPrice(95000);
      }

      // Load wallet balance
      if (user?.email) {
        try {
          const { data: walletData, error } = await supabase
            .from('wallets')
            .select('wallet_data')
            .eq('email', user.email)
            .single();

          if (!error && walletData?.wallet_data) {
            const balance = walletData.wallet_data.balance || 0;
            setCurrentBalance(balance);
          }
        } catch (error) {
          console.error('Error loading wallet balance:', error);
        }
      }
    };

    loadData();
  }, [user?.email]);

  // Load goals from database
  useEffect(() => {
    const loadGoals = async () => {
      if (!user?.email) return;

      try {
        const { data: goalsData, error } = await supabase
          .from('goals')
          .select('*')
          .eq('email', user.email)
          .order('created_at', { ascending: false });

        if (!error && goalsData) {
          // Transform database goals to Goal format
          const formattedGoals: Goal[] = goalsData.map((goal: any) => {
            const isBTC = goal.title?.toLowerCase().includes('btc') || 
                         goal.description?.toLowerCase().includes('btc') ||
                         goal.title?.toLowerCase().includes('spaar') && goal.description?.toLowerCase().includes('btc');
            
            // Parse BTC amount from title or description
            let targetBitcoinAmount = 0;
            if (isBTC) {
              const btcMatch = goal.title?.match(/(\d+\.?\d*)\s*BTC/i) || goal.description?.match(/(\d+\.?\d*)\s*BTC/i);
              if (btcMatch) {
                targetBitcoinAmount = parseFloat(btcMatch[1]);
              }
            }

            // Parse timeframe
            const timeframeMatch = goal.description?.match(/(\d+)\s*(maanden?|weken?|dagen?)/i);
            const timeframeMonths = timeframeMatch ? parseInt(timeframeMatch[1]) : undefined;

            return {
              id: goal.id,
              title: goal.title || '',
              description: goal.description || '',
              targetAmount: goal.target_amount || 0,
              currentAmount: isBTC ? (currentBalance * bitcoinPrice) : (goal.current_amount || 0),
              targetDate: goal.target_date || '',
              category: goal.category || 'bitcoin',
              status: goal.status || 'active',
              createdAt: goal.created_at || new Date().toISOString(),
              targetBitcoinAmount: isBTC ? targetBitcoinAmount : undefined,
              currentBitcoinAmount: isBTC ? currentBalance : undefined,
              monthlyInvestment: goal.monthly_investment,
              bitcoinPriceAtCreation: goal.bitcoin_price_at_creation,
              timeframeMonths: timeframeMonths,
              isBitcoinGoal: isBTC
            };
          });

          setGoals(formattedGoals);
          if (setInitialGoals) {
            setInitialGoals(formattedGoals);
          }
        }
      } catch (error) {
        console.error('Error loading goals:', error);
      }
    };

    loadGoals();
  }, [user?.email, currentBalance, bitcoinPrice, setInitialGoals]);

  const DEFAULT_GOALS = [
    {
      id: 'default_0.1_btc',
      title: '0.1 Bitcoin Doel',
      description: 'Behaal jouw eerste milestone: 0.1 BTC',
      targetBitcoinAmount: 0.1,
      currentBitcoinAmount: 0,
      category: 'bitcoin',
      icon: '🎯'
    },
    {
      id: 'default_1_btc',
      title: '1 Bitcoin Doel',
      description: 'Een volledige Bitcoin - de ultieme goal!',
      targetBitcoinAmount: 1,
      currentBitcoinAmount: 0,
      category: 'bitcoin',
      icon: '🚀'
    },
    {
      id: 'default_5k',
      title: 'Portfolio €5.000',
      description: 'Bouw je eerste €5.000 opbouw',
      targetAmount: 5000,
      currentAmount: 0,
      category: 'savings',
      icon: '💰'
    },
    {
      id: 'default_10k',
      title: 'Portfolio €10.000',
      description: 'Bereik €10.000 in je portfolio',
      targetAmount: 10000,
      currentAmount: 0,
      category: 'savings',
      icon: '📈'
    }
  ];

  // Calculate monthly needed to reach target
  const calculateMonthlySavings = (targetBTC: number, currentBTC: number, months: number): number => {
    const remainingBTC = targetBTC - currentBTC;
    const remainingUSD = remainingBTC * bitcoinPrice;
    return Math.ceil(remainingUSD / months);
  };

  // Calculate remaining amount
  const calculateRemaining = (target: number, current: number, isBTC: boolean = false): string => {
    const remaining = target - current;
    if (isBTC) {
      return remaining.toFixed(4);
    }
    return Math.ceil(remaining).toLocaleString('nl-NL', { style: 'currency', currency: 'EUR' });
  };

  // Create goal from template or custom
  const handleCreateGoal = async () => {
    try {
      setLoading(true);
      let goal: Goal;

      if (selectedGoalTemplate && selectedGoalTemplate.startsWith('default_')) {
        // Use default template
        const template = DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate);
        if (!template) return;

        if ('targetBitcoinAmount' in template) {
          const monthlyNeeded = calculateMonthlySavings(
            template.targetBitcoinAmount,
            template.currentBitcoinAmount,
            newGoalData.timeframeMonths
          );

          goal = {
            id: Date.now().toString(),
            title: template.title,
            description: template.description,
            targetAmount: template.targetBitcoinAmount * bitcoinPrice,
            currentAmount: template.currentBitcoinAmount * bitcoinPrice,
            targetDate: new Date(Date.now() + newGoalData.timeframeMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: template.category,
            status: 'active',
            createdAt: new Date().toISOString(),
            isBitcoinGoal: true,
            targetBitcoinAmount: template.targetBitcoinAmount,
            currentBitcoinAmount: template.currentBitcoinAmount,
            monthlyInvestment: monthlyNeeded,
            bitcoinPriceAtCreation: bitcoinPrice,
            timeframeMonths: newGoalData.timeframeMonths
          };
        } else {
          goal = {
            id: Date.now().toString(),
            title: template.title,
            description: template.description,
            targetAmount: template.targetAmount,
            currentAmount: template.currentAmount,
            targetDate: new Date(Date.now() + newGoalData.timeframeMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
            category: template.category,
            status: 'active',
            createdAt: new Date().toISOString(),
            timeframeMonths: newGoalData.timeframeMonths
          };
        }
      } else {
        // Custom goal
        goal = {
          id: Date.now().toString(),
          title: newGoalData.title,
          description: newGoalData.description,
          targetAmount: newGoalData.targetAmount,
          currentAmount: 0,
          targetDate: new Date(Date.now() + newGoalData.timeframeMonths * 30 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'custom',
          status: 'active',
          createdAt: new Date().toISOString(),
          timeframeMonths: newGoalData.timeframeMonths
        };
      }

      // Save to database
      if (user?.id && user?.email) {
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: user.id,
            email: user.email,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            status: goal.status,
            target_amount: goal.targetAmount,
            current_amount: goal.currentAmount,
            target_date: goal.targetDate,
            monthly_investment: goal.monthlyInvestment,
            bitcoin_price_at_creation: goal.bitcoinPriceAtCreation,
            created_at: goal.createdAt
          })
          .select()
          .single();

        if (error) {
          console.error('Error saving goal to database:', error);
          alert('Er is een fout opgetreden bij het opslaan van het doel.');
          return;
        }

        // Update goal with database ID
        if (data) {
          goal.id = data.id;
        }
      }

      setGoals([...goals, goal]);
      if (setInitialGoals) {
        setInitialGoals([...goals, goal]);
      }
      setShowNewGoal(false);
      setSelectedGoalTemplate(null);
      setNewGoalData({
        title: '',
        description: '',
        targetAmount: 0,
        targetBitcoinAmount: 0,
        currentBitcoinAmount: 0,
        timeframeMonths: 12,
        category: 'bitcoin',
        targetDate: ''
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      alert('Er is een fout opgetreden bij het aanmaken van het doel.');
    } finally {
      setLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      // Delete from database if it's a database goal
      if (user?.email) {
        const { error } = await supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('email', user.email);

        if (error) {
          console.error('Error deleting goal:', error);
          return;
        }
      }

      // Update local state
    setGoals(goals.filter((g: Goal) => g.id !== id));
      if (setInitialGoals) {
        setInitialGoals(goals.filter((g: Goal) => g.id !== id));
      }
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mijn Doelen</h2>
        <button
          onClick={() => setShowNewGoal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nieuw Doel
        </button>
      </div>

      {/* Create Goal Modal */}
      {showNewGoal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Nieuw Doel Aanmaken</h3>
              <button onClick={() => setShowNewGoal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            {!selectedGoalTemplate ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600 mb-4">Kies een template of maak een custom doel:</p>
                
                {/* Default Goal Templates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  {DEFAULT_GOALS.map(template => {
                    const isBTC = 'targetBitcoinAmount' in template;
                    const target = isBTC ? template.targetBitcoinAmount : template.targetAmount;
                    const targetLabel = isBTC ? `${target} BTC` : `€${target.toLocaleString('nl-NL')}`;
                    
                    return (
                      <button
                        key={template.id}
                        onClick={() => setSelectedGoalTemplate(template.id)}
                        className="p-4 text-left border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{template.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900">{template.title}</h4>
                            <p className="text-xs text-gray-600 mt-1">{template.description}</p>
                            <p className="text-sm font-semibold text-orange-600 mt-2">Target: {targetLabel}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={() => setSelectedGoalTemplate('custom')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">➕</div>
                      <div>
                        <h4 className="font-bold text-gray-900">Custom Doel</h4>
                        <p className="text-xs text-gray-600">Maak je eigen doel</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedGoalTemplate !== 'custom' && (
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900">
                      {DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate)?.title}
                    </p>
                  </div>
                )}

                {selectedGoalTemplate === 'custom' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Doel Titel</label>
                      <input
                        type="text"
                        value={newGoalData.title}
                        onChange={(e) => setNewGoalData({ ...newGoalData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Bijv: Mijn Eerste Bitcoin"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Omschrijving</label>
                      <textarea
                        value={newGoalData.description}
                        onChange={(e) => setNewGoalData({ ...newGoalData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Beschrijf je doel..."
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Bedrag (€)</label>
                      <input
                        type="number"
                        value={newGoalData.targetAmount}
                        onChange={(e) => setNewGoalData({ ...newGoalData, targetAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder="Bijv: 5000"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe (maanden)</label>
                  <input
                    type="number"
                    value={newGoalData.timeframeMonths}
                    onChange={(e) => setNewGoalData({ ...newGoalData, timeframeMonths: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    min="1"
                    max="120"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newGoalData.timeframeMonths} maand{newGoalData.timeframeMonths !== 1 ? 'en' : ''} = {Math.floor(newGoalData.timeframeMonths / 12)} jaar{newGoalData.timeframeMonths % 12 > 0 ? ` en ${newGoalData.timeframeMonths % 12} maand${newGoalData.timeframeMonths % 12 !== 1 ? 'en' : ''}` : ''}
                  </p>
                </div>

                {/* Show calculation preview for default BTC goals */}
                {selectedGoalTemplate && selectedGoalTemplate.startsWith('default_') && selectedGoalTemplate !== 'custom' && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {(() => {
                      const template = DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate);
                      if (!template || !('targetBitcoinAmount' in template)) return null;
                      
                      const monthly = calculateMonthlySavings(
                        template.targetBitcoinAmount,
                        template.currentBitcoinAmount,
                        newGoalData.timeframeMonths
                      );
                      const remaining = calculateRemaining(
                        template.targetBitcoinAmount,
                        template.currentBitcoinAmount,
                        true
                      );

                      return (
                        <div className="space-y-2 text-sm">
                          <p className="font-semibold text-gray-900">Berekening:</p>
                          <p className="text-gray-700">
                            Target: <span className="font-bold">{template.targetBitcoinAmount} BTC</span> (€{(template.targetBitcoinAmount * bitcoinPrice).toLocaleString('nl-NL')})
                          </p>
                          <p className="text-gray-700">
                            Nog nodig: <span className="font-bold">{remaining} BTC</span>
                          </p>
                          <p className="text-gray-700">
                            Maandelijks sparen: <span className="font-bold">€{monthly.toLocaleString('nl-NL')}</span>
                          </p>
                          <p className="text-gray-700">
                            Over {newGoalData.timeframeMonths} maand{newGoalData.timeframeMonths !== 1 ? 'en' : ''}
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setSelectedGoalTemplate(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Terug
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Aanmaken...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Doel Aanmaken
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals && goals.length > 0 ? (
          goals.map((goal: Goal) => {
            const isBTC = goal.isBitcoinGoal;
            
            // Calculate progress
            let progress = 0;
            if (isBTC && goal.targetBitcoinAmount && goal.currentBitcoinAmount !== undefined) {
              progress = (goal.currentBitcoinAmount / goal.targetBitcoinAmount) * 100;
            } else if (goal.targetAmount > 0 && goal.currentAmount !== undefined) {
              progress = (goal.currentAmount / goal.targetAmount) * 100;
            }
            
            // Calculate remaining
            let remaining: string | number = 0;
            if (isBTC && goal.targetBitcoinAmount !== undefined && goal.currentBitcoinAmount !== undefined) {
              remaining = (goal.targetBitcoinAmount - goal.currentBitcoinAmount).toFixed(4);
            } else if (goal.targetAmount !== undefined && goal.currentAmount !== undefined) {
              remaining = Math.ceil(goal.targetAmount - goal.currentAmount);
            }
            
            // Calculate monthly savings
            let monthlySavings = 0;
            if (goal.monthlyInvestment) {
              monthlySavings = goal.monthlyInvestment;
            } else if (goal.timeframeMonths) {
              if (isBTC && goal.targetBitcoinAmount) {
                const remainingBTC = Math.max(0, goal.targetBitcoinAmount - (goal.currentBitcoinAmount || 0));
                monthlySavings = Math.ceil((remainingBTC * bitcoinPrice) / goal.timeframeMonths);
              } else if (goal.targetAmount) {
                monthlySavings = Math.ceil((goal.targetAmount - (goal.currentAmount || 0)) / goal.timeframeMonths);
              }
            }

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{goal.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Voortgang</span>
                    <span className="text-sm font-bold text-orange-600">{isNaN(progress) ? '0' : Math.min(Math.round(progress), 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-600 h-2 rounded-full transition-all" 
                      style={{ width: `${isNaN(progress) ? 0 : Math.min(progress, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {/* Goal Details */}
                <div className="space-y-2 text-sm">
                  {isBTC ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige hoeveelheid:</span>
                        <span className="font-medium text-gray-900">{(goal.currentBitcoinAmount || 0).toFixed(4)} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-medium text-gray-900">{(goal.targetBitcoinAmount || 0).toFixed(4)} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nog nodig:</span>
                        <span className="font-bold text-orange-600">{remaining} BTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidige waarde:</span>
                        <span className="font-medium text-gray-900">€{((goal.currentBitcoinAmount || 0) * bitcoinPrice).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target waarde:</span>
                        <span className="font-medium text-gray-900">€{((goal.targetBitcoinAmount || 0) * bitcoinPrice).toLocaleString('nl-NL', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Huidig bedrag:</span>
                        <span className="font-medium text-gray-900">€{Math.round(goal.currentAmount || 0).toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Target:</span>
                        <span className="font-medium text-gray-900">€{Math.round(goal.targetAmount || 0).toLocaleString('nl-NL')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nog nodig:</span>
                        <span className="font-bold text-orange-600">€{typeof remaining === 'number' ? remaining.toLocaleString('nl-NL') : remaining}</span>
                      </div>
                    </>
                  )}

                  {goal.timeframeMonths && (
                    <>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Timeframe:</span>
                          <span className="font-medium text-gray-900">
                            {goal.timeframeMonths} maand{goal.timeframeMonths !== 1 ? 'en' : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Maandelijks sparen:</span>
                          <span className="font-bold text-blue-600">
                            {isBTC ? '€' : '€'}{monthlySavings.toLocaleString('nl-NL')}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Target Date */}
                {goal.targetDate && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                    <p>Target datum: {new Date(goal.targetDate).toLocaleDateString('nl-NL')}</p>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12">
            <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">Geen doelen ingesteld</p>
            <button
              onClick={() => setShowNewGoal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Maak je eerste doel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

