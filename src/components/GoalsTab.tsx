import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Target, TrendingUp, Calendar, DollarSign, Zap, Trash2, Check, Loader2, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
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
  const { isImpersonating, impersonatedUser } = usePermissions();
  const [goals, setGoals] = useState<Goal[]>(initialGoals || []);
  
  // Get effective user ID and email (considering impersonation)
  // Note: When impersonating, we filter by email since we can't easily get the impersonated user's ID
  // The RLS policies will ensure proper access control
  const effectiveUserId = useMemo(() => {
    // When impersonating, we'll filter by email instead of user_id
    // This is safe because RLS policies check auth.uid() = user_id
    // For impersonation, we need to query by email and let RLS handle it
    return user?.id;
  }, [user?.id]);
  
  const effectiveUserEmail = useMemo(() => {
    if (isImpersonating && impersonatedUser) {
      return impersonatedUser;
    }
    return user?.email;
  }, [user?.email, isImpersonating, impersonatedUser]);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(95000);
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [selectedGoalTemplate, setSelectedGoalTemplate] = useState<string | null>(null);
  const [newGoalType, setNewGoalType] = useState<'save' | 'monthly'>('save');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [newGoalTimeframe, setNewGoalTimeframe] = useState('');
  const [newGoalMonthlyAmount, setNewGoalMonthlyAmount] = useState('');
  const [newGoalMonthlyCurrency, setNewGoalMonthlyCurrency] = useState<'btc' | 'eur'>('btc');
  const [newGoalMonthlyEurAmount, setNewGoalMonthlyEurAmount] = useState<string>('');
  const [newGoalStartDate, setNewGoalStartDate] = useState<string>('');
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
  const [walletTransactions, setWalletTransactions] = useState<any[]>([]);
  const [showMonthlyGoalPopup, setShowMonthlyGoalPopup] = useState(false);
  const [selectedMonthlyGoal, setSelectedMonthlyGoal] = useState<any>(null);

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

      // Load wallet balance and transactions from portfolio
      if (effectiveUserEmail) {
        try {
          const { data: walletData, error } = await supabase
            .from('wallets')
            .select('wallet_data, balance')
            .eq('email', effectiveUserEmail)
            .single();

          if (!error && walletData) {
            const balance = walletData.balance || walletData.wallet_data?.balance || 0;
            setCurrentBalance(balance);
            
            // Load transactions from wallet_data
            const transactions = walletData.wallet_data?.transactions || [];
            setWalletTransactions(transactions);
            
            // Update goals with current balance
            setGoals(prevGoals => prevGoals.map(goal => {
              if (goal.isBitcoinGoal && goal.targetBitcoinAmount) {
                return {
                  ...goal,
                  currentBitcoinAmount: balance,
                  currentAmount: balance * bitcoinPrice
                };
              }
              return goal;
            }));
          }
        } catch (error) {
          console.error('Error loading wallet balance:', error);
        }
      }
    };

    loadData();
  }, [effectiveUserEmail, bitcoinPrice]);

  // Load goals from database - filter by user_id (per account)
  useEffect(() => {
    const loadGoals = async () => {
      if (!effectiveUserEmail) {
        console.log('⚠️ No email available for loading goals');
        return;
      }

      try {
        // Filter by user_id to ensure goals are per account, not per email
        // When impersonating, we filter by email since we can't get the impersonated user's ID easily
        let query = supabase
          .from('goals')
          .select('*');
        
        if (isImpersonating && impersonatedUser) {
          // When impersonating, filter by email only (RLS will handle security)
          query = query.eq('email', effectiveUserEmail);
        } else if (effectiveUserId) {
          // Normal case: filter by both user_id and email for extra security
          query = query.eq('user_id', effectiveUserId).eq('email', effectiveUserEmail);
        } else {
          // Fallback: filter by email only if user_id is not available
          query = query.eq('email', effectiveUserEmail);
        }
        
        const { data: goalsData, error } = await query.order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading goals:', error);
          return;
        }

        if (goalsData && goalsData.length > 0) {
            // Transform database goals to Goal format
            const formattedGoals: Goal[] = goalsData.map((goal: any) => {
              const isMonthly = goal.title?.toLowerCase().includes('stort elke maand') || 
                               goal.title?.toLowerCase().includes('elke maand');
              const isBTC = goal.title?.toLowerCase().includes('btc') || 
                           goal.description?.toLowerCase().includes('btc') ||
                           (goal.title?.toLowerCase().includes('spaar') && goal.description?.toLowerCase().includes('btc'));
            
              // Parse BTC amount from title or description
              let targetBitcoinAmount = 0;
              if (isBTC && !isMonthly) {
                const btcMatch = goal.title?.match(/(\d+\.?\d*)\s*BTC/i) || goal.description?.match(/(\d+\.?\d*)\s*BTC/i);
                if (btcMatch) {
                  targetBitcoinAmount = parseFloat(btcMatch[1]);
                }
              }

              // Parse timeframe
              const timeframeMatch = goal.description?.match(/(\d+)\s*(maanden?|weken?|dagen?)/i);
              const timeframeMonths = timeframeMatch ? parseInt(timeframeMatch[1]) : undefined;

              // For monthly goals, parse amount
              let monthlyAmount = 0;
              if (isMonthly) {
                const amountMatch = goal.title?.match(/(\d+\.?\d*)/);
                monthlyAmount = amountMatch ? parseFloat(amountMatch[1]) : 0;
              }

              return {
                id: goal.id,
                title: goal.title || '',
                description: goal.description || '',
                targetAmount: isMonthly ? (goal.target_amount || monthlyAmount) : (goal.target_amount || 0),
                currentAmount: isBTC && !isMonthly ? (currentBalance * bitcoinPrice) : (goal.current_amount || 0),
                targetDate: goal.target_date || '',
                category: goal.category || 'bitcoin',
                status: goal.status || 'active',
                createdAt: goal.created_at || new Date().toISOString(),
                targetBitcoinAmount: isBTC && !isMonthly ? targetBitcoinAmount : (isMonthly && isBTC ? monthlyAmount : undefined),
                currentBitcoinAmount: isBTC && !isMonthly ? currentBalance : (isMonthly ? 0 : undefined),
                monthlyInvestment: goal.monthly_investment || monthlyAmount,
                bitcoinPriceAtCreation: goal.bitcoin_price_at_creation || bitcoinPrice,
                timeframeMonths: timeframeMonths,
                isBitcoinGoal: isBTC && !isMonthly
              };
            });

          setGoals(formattedGoals);
          if (setInitialGoals) {
            setInitialGoals(formattedGoals);
          }
        } else {
          // No goals found - set empty array
          setGoals([]);
          if (setInitialGoals) {
            setInitialGoals([]);
          }
        }
      } catch (error) {
        console.error('Error loading goals:', error);
        setGoals([]);
        if (setInitialGoals) {
          setInitialGoals([]);
        }
      }
    };

    loadGoals();
  }, [effectiveUserId, effectiveUserEmail, isImpersonating, impersonatedUser, currentBalance, bitcoinPrice, setInitialGoals]);

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

  // Analyze monthly goal transactions for popup with streak tracking (same as UserDashboard)
  const analyzeMonthlyGoalTransactions = (goal: any) => {
    // Check if this is a monthly goal
    const isMonthly = goal.title?.toLowerCase().includes('stort elke maand') || 
                     goal.title?.toLowerCase().includes('elke maand');
    if (!isMonthly) return null;

    const now = new Date();
    // Use target_date (start date) - this is when the goal actually starts
    let goalStartDate = new Date();
    if (goal.targetDate) {
      goalStartDate = new Date(goal.targetDate);
    } else if (goal.createdAt) {
      goalStartDate = new Date(goal.createdAt);
    } else {
      // Fallback: start from current month
      goalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    const months: any[] = [];
    
    // Get all deposit transactions (positive value) from portfolio
    // Filter transactions from start date onwards
    const startDate = new Date(goalStartDate.getFullYear(), goalStartDate.getMonth(), 1);
    const depositTransactions = walletTransactions
      .filter(tx => {
        const txDate = new Date(tx.time * 1000);
        return tx.value > 0 && txDate >= startDate; // Only include transactions from start date
      })
      .map(tx => {
        const btcAmount = Math.abs(tx.value) / 100000000; // Convert to BTC
        const usdValue = tx.price ? btcAmount * tx.price : 0; // USD value at time of transaction
        return {
          ...tx,
          date: new Date(tx.time * 1000),
          amount: btcAmount, // Always in BTC
          usdValue: usdValue, // USD value at time of transaction
          txid: tx.hash || ''
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate months: ONLY from start date to now + 3 months ahead (no months before start)
    // startDate is already defined above
    let currentDate = new Date(startDate);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 3, 1); // Show 3 months ahead

    // Parse monthly amount from goal title or description
    let targetAmountBTC = 0;
    const btcMatch = goal.title?.match(/(\d+\.?\d*)\s*BTC/i) || goal.description?.match(/(\d+\.?\d*)\s*BTC/i);
    if (btcMatch) {
      targetAmountBTC = parseFloat(btcMatch[1]);
    } else if (goal.targetAmount) {
      // If targetAmount is in BTC (for monthly goals)
      targetAmountBTC = goal.targetAmount;
    }

    while (currentDate <= endDate) {
      const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      const monthTransactions = depositTransactions.filter(tx => {
        const txMonth = `${tx.date.getFullYear()}-${String(tx.date.getMonth() + 1).padStart(2, '0')}`;
        return txMonth === monthKey;
      });

      const totalAmount = monthTransactions.reduce((sum, tx) => sum + tx.amount, 0); // Always in BTC
      const isStartMonth = currentDate.getMonth() === startDate.getMonth() && currentDate.getFullYear() === startDate.getFullYear();
      const isCurrentMonth = currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
      const isPastMonth = currentDate < new Date(now.getFullYear(), now.getMonth(), 1);
      const isFutureMonth = currentDate > new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Calculate average price for the month (for USD conversion)
      const avgPrice = monthTransactions.length > 0
        ? monthTransactions.reduce((sum, tx) => sum + (tx.price || 0), 0) / monthTransactions.length
        : bitcoinPrice;

      // Determine status
      let status: 'completed' | 'missed' | 'made_up' | 'extra' | 'pending' = 'pending';
      let madeUpMonths: string[] = []; // Which months were made up with this deposit
      let remainingToMakeUp = 0; // How much still needs to be deposited for missed months
      
      if (isFutureMonth) {
        status = 'pending';
      } else if (isCurrentMonth && totalAmount === 0) {
        status = 'pending';
      } else if (totalAmount >= targetAmountBTC) {
        const excess = totalAmount - targetAmountBTC;
        // Check if this excess can cover missed months
        const previousMonths = months.filter(m => 
          m.date < currentDate && 
          m.status === 'missed' && 
          !m.madeUpBy
        );
        
        if (previousMonths.length > 0 && excess >= targetAmountBTC) {
          // This deposit can make up for missed months
          const canMakeUp = Math.floor(excess / targetAmountBTC);
          const monthsToMakeUp = previousMonths.slice(0, canMakeUp);
          madeUpMonths = monthsToMakeUp.map(m => m.monthKey);
          
          // Mark these months as made up
          monthsToMakeUp.forEach(month => {
            const monthIndex = months.findIndex(m => m.monthKey === month.monthKey);
            if (monthIndex !== -1) {
              months[monthIndex].status = 'made_up';
              months[monthIndex].madeUpBy = monthKey;
            }
          });
          
          // If there's still excess after making up, it's extra
          const remainingExcess = excess - (canMakeUp * targetAmountBTC);
          if (remainingExcess > targetAmountBTC * 0.1) {
            status = 'extra';
          } else {
            status = 'completed';
          }
        } else if (excess > targetAmountBTC * 0.1) {
          // More than 10% over target and no missed months to cover = extra deposit
          status = 'extra';
        } else {
          status = 'completed';
        }
      } else if (totalAmount > 0 && totalAmount < targetAmountBTC) {
        // Partial deposit - might be making up for a missed month
        const previousMonths = months.filter(m => 
          m.date < currentDate && 
          m.status === 'missed' && 
          !m.madeUpBy
        );
        
        if (previousMonths.length > 0) {
          // Check if this partial deposit + previous excess can make up a month
          const previousExcess = months
            .filter(m => m.date < currentDate && m.status === 'extra')
            .reduce((sum, m) => sum + (m.totalAmount - m.targetAmount), 0);
          
          if (totalAmount + previousExcess >= targetAmountBTC) {
            status = 'made_up';
            const firstMissed = previousMonths[0];
            madeUpMonths = [firstMissed.monthKey];
            const monthIndex = months.findIndex(m => m.monthKey === firstMissed.monthKey);
            if (monthIndex !== -1) {
              months[monthIndex].status = 'made_up';
              months[monthIndex].madeUpBy = monthKey;
            }
          } else {
            status = 'made_up'; // Partial, trying to make up
            remainingToMakeUp = targetAmountBTC - totalAmount;
          }
        } else {
          status = 'made_up'; // Partial deposit
          remainingToMakeUp = targetAmountBTC - totalAmount;
        }
      } else if (isPastMonth && totalAmount === 0) {
        status = 'missed';
        remainingToMakeUp = targetAmountBTC;
      }

      months.push({
        month: currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' }),
        monthKey,
        date: new Date(currentDate),
        transactions: monthTransactions,
        totalAmount,
        targetAmount: targetAmountBTC,
        status,
        isStartMonth,
        isCurrentMonth,
        isPastMonth,
        isFutureMonth,
        avgPrice,
        madeUpMonths, // Which months this deposit made up
        remainingToMakeUp, // How much still needed
        madeUpBy: undefined as string | undefined // Which month made this one up
      });

      // Move to next month
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    // Calculate streak: count all completed months (total number of completed months)
    // Streak = total number of completed months, not consecutive
    const completedMonths = months.filter(m => 
      (m.status === 'completed' || m.status === 'made_up') && 
      !m.isFutureMonth
    );
    const streak = completedMonths.length;
    // For backward compatibility, keep these fields
    const streakBroken = false;
    const isPaused = false;
    const lastActiveMonth = completedMonths.length > 0 ? completedMonths[completedMonths.length - 1].monthKey : null;
    const pausedAtMonth = null;

    // Count missed months that haven't been made up
    const missedMonths = months.filter(m => m.status === 'missed' && !m.madeUpBy);
    const totalMissedAmount = missedMonths.reduce((sum, m) => sum + m.remainingToMakeUp, 0);

    return {
      months,
      totalDeposited: depositTransactions.reduce((sum, tx) => sum + tx.amount, 0),
      missedCount: missedMonths.length,
      completedCount: months.filter(m => m.status === 'completed' || m.status === 'made_up').length,
      streak,
      streakBroken,
      isPaused,
      lastActiveMonth,
      startMonth: months.find(m => m.isStartMonth)?.monthKey || '',
      currentMonth: months.find(m => m.isCurrentMonth)?.monthKey || '',
      totalMissedAmount
    };
  };

  // Create goal from template or custom
  const handleCreateGoal = async () => {
    try {
      setLoading(true);
      
      if (!effectiveUserEmail) {
        alert('Je moet ingelogd zijn om een doel toe te voegen');
        setLoading(false);
        return;
      }

      // Handle template goals
      if (selectedGoalTemplate && selectedGoalTemplate.startsWith('default_')) {
        const template = DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate);
        if (!template) return;

        if ('targetBitcoinAmount' in template) {
          const monthlyNeeded = calculateMonthlySavings(
            template.targetBitcoinAmount,
            template.currentBitcoinAmount || currentBalance,
            newGoalData.timeframeMonths
          );

          const title = template.title;
          const description = template.description;
          const targetAmount = template.targetBitcoinAmount;
          const isCompleted = currentBalance >= targetAmount;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: effectiveUserId,
              email: effectiveUserEmail,
              title: title,
              description: description,
              category: template.category,
              status: isCompleted ? 'completed' : 'active',
              target_amount: targetAmount,
              current_amount: currentBalance,
              target_date: null,
              monthly_investment: monthlyNeeded,
              bitcoin_price_at_creation: bitcoinPrice
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal: Goal = {
              id: data.id,
              title: title,
              description: description,
              targetAmount: targetAmount * bitcoinPrice,
              currentAmount: currentBalance * bitcoinPrice,
              targetDate: '',
              category: template.category,
              status: isCompleted ? 'completed' : 'active',
              createdAt: data.created_at || new Date().toISOString(),
              targetBitcoinAmount: targetAmount,
              currentBitcoinAmount: currentBalance,
              monthlyInvestment: monthlyNeeded,
              bitcoinPriceAtCreation: bitcoinPrice,
              timeframeMonths: newGoalData.timeframeMonths,
              isBitcoinGoal: true
            };
            
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
          }
        } else {
          // EUR template
          const title = template.title;
          const description = template.description;
          const targetAmount = template.targetAmount;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: effectiveUserId,
              email: effectiveUserEmail,
              title: title,
              description: description,
              category: template.category,
              status: 'active',
              target_amount: targetAmount,
              current_amount: 0,
              target_date: new Date(Date.now() + newGoalData.timeframeMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              monthly_investment: Math.ceil(targetAmount / newGoalData.timeframeMonths)
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal: Goal = {
              id: data.id,
              title: title,
              description: description,
              targetAmount: targetAmount,
              currentAmount: 0,
              targetDate: data.target_date || '',
              category: template.category,
              status: 'active',
              createdAt: data.created_at || new Date().toISOString(),
              timeframeMonths: newGoalData.timeframeMonths,
              monthlyInvestment: Math.ceil(targetAmount / newGoalData.timeframeMonths),
              isBitcoinGoal: false
            };
            
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
          }
        }
        return;
      }

      // Handle custom goals
      if (newGoalType === 'save') {
        if (!newGoalAmount || !newGoalTimeframe) {
          alert('Vul alle velden in');
          return;
        }
        
        const title = `Spaar ${newGoalAmount} BTC binnen ${newGoalTimeframe}`;
        const description = `Spaardoel: ${newGoalAmount} BTC binnen ${newGoalTimeframe}`;
        const targetAmount = parseFloat(newGoalAmount);
        const isCompleted = currentBalance >= targetAmount;

        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: effectiveUserId || null, // Database trigger will set this if null
            email: effectiveUserEmail,
            title: title,
            description: description,
            category: 'beginners',
            status: isCompleted ? 'completed' : 'active',
            target_amount: targetAmount,
            current_amount: currentBalance,
            target_date: null
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          const goal: Goal = {
            id: data.id,
            title: title,
            description: description,
            targetAmount: targetAmount * bitcoinPrice,
            currentAmount: currentBalance * bitcoinPrice,
            targetDate: '',
            category: 'beginners',
            status: isCompleted ? 'completed' : 'active',
            createdAt: data.created_at || new Date().toISOString(),
            targetBitcoinAmount: targetAmount,
            currentBitcoinAmount: currentBalance,
            isBitcoinGoal: true
          };
          
          setGoals([...goals, goal]);
          if (setInitialGoals) {
            setInitialGoals([...goals, goal]);
          }
          
          // Reset form
          setNewGoalAmount('');
          setNewGoalTimeframe('');
          setShowNewGoal(false);
        }
      } else {
        // Monthly goal
        if (newGoalMonthlyCurrency === 'btc') {
          if (!newGoalMonthlyAmount) {
            alert('Vul het maandelijkse bedrag in');
            return;
          }
          
          const title = `Stort elke maand ${newGoalMonthlyAmount} BTC`;
          const description = `Maandelijks doel: ${newGoalMonthlyAmount} BTC per maand`;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: effectiveUserId,
              email: effectiveUserEmail,
              title: title,
              description: description,
              category: 'beginners',
              status: 'active',
              target_amount: parseFloat(newGoalMonthlyAmount),
              current_amount: 0,
              target_date: newGoalStartDate || new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal: Goal = {
              id: data.id,
              title: title,
              description: description,
              targetAmount: parseFloat(newGoalMonthlyAmount) * bitcoinPrice,
              currentAmount: 0,
              targetDate: data.target_date || newGoalStartDate || new Date().toISOString().split('T')[0],
              category: 'beginners',
              status: 'active',
              createdAt: data.created_at || new Date().toISOString(),
              targetBitcoinAmount: parseFloat(newGoalMonthlyAmount),
              currentBitcoinAmount: 0,
              isBitcoinGoal: true
            };
            
            setGoals([...goals, goal]);
            if (setInitialGoals) {
              setInitialGoals([...goals, goal]);
            }
            
            // Reset form
            setNewGoalMonthlyAmount('');
            setNewGoalStartDate('');
            setShowNewGoal(false);
          }
        } else {
          if (!newGoalMonthlyEurAmount) {
            alert('Vul het maandelijkse bedrag in');
            return;
          }
          
          const title = `Stort elke maand €${newGoalMonthlyEurAmount}`;
          const description = `Maandelijks doel: €${newGoalMonthlyEurAmount} per maand`;

          const { data, error } = await supabase
            .from('goals')
            .insert({
              user_id: effectiveUserId,
              email: effectiveUserEmail,
              title: title,
              description: description,
              category: 'beginners',
              status: 'active',
              target_amount: parseFloat(newGoalMonthlyEurAmount),
              current_amount: 0,
              target_date: newGoalStartDate || new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

          if (error) throw error;

          if (data) {
            const goal: Goal = {
              id: data.id,
              title: title,
              description: description,
              targetAmount: parseFloat(newGoalMonthlyEurAmount),
              currentAmount: 0,
              targetDate: data.target_date || newGoalStartDate || new Date().toISOString().split('T')[0],
              category: 'beginners',
              status: 'active',
              createdAt: data.created_at || new Date().toISOString(),
              isBitcoinGoal: false
            };
            
            setGoals([...goals, goal]);
            if (setInitialGoals) {
              setInitialGoals([...goals, goal]);
            }
            
            // Reset form
            setNewGoalMonthlyEurAmount('');
            setNewGoalStartDate('');
            setShowNewGoal(false);
          }
        }
      }
      
      return;
      
      // Old template code (not used anymore)
      if (false && selectedGoalTemplate && selectedGoalTemplate.startsWith('default_')) {
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

      // Save to database - use effective user ID and email
      // When impersonating, we need to get the impersonated user's ID
      if (effectiveUserEmail) {
        let userIdToUse = effectiveUserId;
        
        // If impersonating, try to get the user_id from the goals table or use a workaround
        if (isImpersonating && impersonatedUser && !userIdToUse) {
          // Try to find existing goal to get user_id, or we'll let the database trigger handle it
          const { data: existingGoal } = await supabase
            .from('goals')
            .select('user_id')
            .eq('email', effectiveUserEmail)
            .limit(1)
            .single();
          
          if (existingGoal?.user_id) {
            userIdToUse = existingGoal.user_id;
          }
        }
        
        const { data, error } = await supabase
          .from('goals')
          .insert({
            user_id: userIdToUse || null, // Database trigger will set this if null
            email: effectiveUserEmail,
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
      // Delete from database - filter by user_id to ensure per-account separation
      if (effectiveUserEmail) {
        let deleteQuery = supabase
          .from('goals')
          .delete()
          .eq('id', id)
          .eq('email', effectiveUserEmail);
        
        // Add user_id filter if not impersonating
        if (!isImpersonating && effectiveUserId) {
          deleteQuery = deleteQuery.eq('user_id', effectiveUserId);
        }
        
        const { error } = await deleteQuery;

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
              <button 
                onClick={() => {
                  setShowNewGoal(false);
                  setSelectedGoalTemplate(null);
                  setNewGoalType('save');
                  setNewGoalAmount('');
                  setNewGoalTimeframe('');
                  setNewGoalMonthlyAmount('');
                  setNewGoalMonthlyEurAmount('');
                  setNewGoalMonthlyCurrency('btc');
                  setNewGoalStartDate('');
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
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
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
                {selectedGoalTemplate !== 'custom' ? (
                  <>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-900">
                      {DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate)?.title}
                    </p>
                  </div>

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
                    {selectedGoalTemplate && selectedGoalTemplate.startsWith('default_') && (
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {(() => {
                      const template = DEFAULT_GOALS.find(g => g.id === selectedGoalTemplate);
                      if (!template || !('targetBitcoinAmount' in template)) return null;
                      
                      const monthly = calculateMonthlySavings(
                        template.targetBitcoinAmount,
                            template.currentBitcoinAmount || currentBalance,
                        newGoalData.timeframeMonths
                      );
                      const remaining = calculateRemaining(
                        template.targetBitcoinAmount,
                            template.currentBitcoinAmount || currentBalance,
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
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Terug
                  </button>
                  <button
                    onClick={handleCreateGoal}
                    disabled={loading}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Toevoegen...' : 'Toevoegen'}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Goal Type Selection for custom */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setNewGoalType('save')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newGoalType === 'save'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        Spaar doel
                      </button>
                      <button
                        onClick={() => setNewGoalType('monthly')}
                        className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          newGoalType === 'monthly'
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 border border-gray-300'
                        }`}
                      >
                        Maandelijks
                      </button>
                    </div>
                    
                    {newGoalType === 'save' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hoeveel BTC wil je sparen?
                          </label>
                          <input
                            type="number"
                            step="0.0001"
                            value={newGoalAmount}
                            onChange={(e) => setNewGoalAmount(e.target.value)}
                            placeholder="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Binnen hoeveel tijd? (bijv. "3 maanden")
                          </label>
                          <input
                            type="text"
                            value={newGoalTimeframe}
                            onChange={(e) => setNewGoalTimeframe(e.target.value)}
                            placeholder="3 maanden"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kies valuta
                          </label>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setNewGoalMonthlyCurrency('btc')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                newGoalMonthlyCurrency === 'btc'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}
                            >
                              BTC
                            </button>
                            <button
                              onClick={() => setNewGoalMonthlyCurrency('eur')}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                newGoalMonthlyCurrency === 'eur'
                                  ? 'bg-orange-600 text-white'
                                  : 'bg-gray-100 text-gray-700 border border-gray-300'
                              }`}
                            >
                              Euro
                            </button>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {newGoalMonthlyCurrency === 'btc' ? 'Hoeveel BTC per maand?' : 'Hoeveel Euro per maand?'}
                          </label>
                          <input
                            type="number"
                            step={newGoalMonthlyCurrency === 'btc' ? '0.0001' : '1'}
                            value={newGoalMonthlyCurrency === 'btc' ? newGoalMonthlyAmount : newGoalMonthlyEurAmount}
                            onChange={(e) => {
                              if (newGoalMonthlyCurrency === 'btc') {
                                setNewGoalMonthlyAmount(e.target.value);
                              } else {
                                setNewGoalMonthlyEurAmount(e.target.value);
                              }
                            }}
                            placeholder={newGoalMonthlyCurrency === 'btc' ? '0.001' : '100'}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Startdatum (optioneel - standaard vandaag)
                          </label>
                          <input
                            type="date"
                            value={newGoalStartDate}
                            onChange={(e) => setNewGoalStartDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Vanaf deze datum wordt je maandelijkse storting geteld. Je kunt verder terug op de agenda.
                          </p>
                        </div>
                      </>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => setSelectedGoalTemplate(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                      >
                        Terug
                      </button>
                      <button
                        onClick={handleCreateGoal}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
                      >
                        {loading ? 'Toevoegen...' : 'Toevoegen'}
                  </button>
                </div>
                  </>
                )}
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

            // Check if this is a monthly BTC goal
            const isMonthlyBTC = (goal.title?.toLowerCase().includes('stort elke maand') || 
                                 goal.title?.toLowerCase().includes('elke maand')) &&
                                (goal.title?.toLowerCase().includes('btc') || 
                                 goal.description?.toLowerCase().includes('btc'));
            const analysis = isMonthlyBTC ? analyzeMonthlyGoalTransactions(goal) : null;
            const streak = analysis?.streak || 0;

            // For monthly BTC goals, parse the monthly amount from title/description
            let monthlyBTCAmount = 0;
            if (isMonthlyBTC) {
              const btcMatch = goal.title?.match(/(\d+\.?\d*)\s*BTC/i) || goal.description?.match(/(\d+\.?\d*)\s*BTC/i);
              if (btcMatch) {
                monthlyBTCAmount = parseFloat(btcMatch[1]);
              } else if (goal.targetBitcoinAmount) {
                monthlyBTCAmount = goal.targetBitcoinAmount;
              } else if (goal.targetAmount && bitcoinPrice > 0) {
                // If targetAmount is in EUR, convert to BTC
                monthlyBTCAmount = goal.targetAmount / bitcoinPrice;
              }
            }

            // For monthly BTC goals, calculate progress based on monthly completions since start date
            if (isMonthlyBTC && monthlyBTCAmount > 0 && analysis) {
              // Get start date
              const now = new Date();
              let goalStartDate = new Date();
              if (goal.targetDate) {
                goalStartDate = new Date(goal.targetDate);
              } else if (goal.createdAt) {
                goalStartDate = new Date(goal.createdAt);
              } else {
                goalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
              }

              // Calculate total months since start (including current month)
              const startDate = new Date(goalStartDate.getFullYear(), goalStartDate.getMonth(), 1);
              const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
              const monthsSinceStart = Math.max(1, Math.floor((currentMonthStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1);
              
              // Count completed months (completed or made_up, excluding future months and current month)
              const pastMonths = analysis.months.filter((m: any) => 
                m.isPastMonth &&
                m.date >= startDate
              );
              const completedPastMonths = pastMonths.filter((m: any) => 
                m.status === 'completed' || m.status === 'made_up'
              ).length;
              
              // Get current month data
              const currentMonthData = analysis.months.find((m: any) => m.isCurrentMonth);
              let currentMonthProgress = 0;
              if (currentMonthData && currentMonthData.totalAmount > 0) {
                // Current month progress = (amount deposited / monthly target) as a fraction of 1 month
                currentMonthProgress = Math.min(1, currentMonthData.totalAmount / monthlyBTCAmount);
              }
              
              // Total progress = (completed past months + current month progress) / total months since start
              const totalProgress = completedPastMonths + currentMonthProgress;
              if (monthsSinceStart > 0) {
                progress = Math.min(100, (totalProgress / monthsSinceStart) * 100);
              } else {
                progress = 0;
              }

              // Calculate remaining for current month
              if (currentMonthData) {
                remaining = Math.max(0, monthlyBTCAmount - currentMonthData.totalAmount).toFixed(4);
              } else {
                remaining = monthlyBTCAmount.toFixed(4);
              }
            }

            return (
              <div key={goal.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 
                      className={`font-bold text-gray-900 text-lg ${isMonthlyBTC ? 'cursor-pointer hover:text-orange-600 transition-colors' : ''}`}
                      onClick={() => {
                        if (isMonthlyBTC) {
                          setSelectedMonthlyGoal(goal);
                          setShowMonthlyGoalPopup(true);
                        }
                      }}
                    >
                      {goal.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                    {isMonthlyBTC && analysis && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-700">Streak:</span>
                        <span className="text-base font-bold text-orange-600">🔥 {streak}</span>
                        <span className="text-xs text-gray-500">maanden</span>
                        {analysis.isPaused && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">⏸️ Gepauzeerd</span>
                        )}
                        {analysis.streakBroken && !analysis.isPaused && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">⚠️ Verbroken</span>
                        )}
                  </div>
                    )}
                    {isMonthlyBTC && analysis && analysis.missedCount > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        ⚠️ {analysis.missedCount} maand(en) gemist
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isMonthlyBTC && (
                      <button
                        onClick={() => {
                          setSelectedMonthlyGoal(goal);
                          setShowMonthlyGoalPopup(true);
                        }}
                        className="text-gray-400 hover:text-orange-600 transition-colors"
                        title="Details bekijken"
                      >
                        <Target className="w-4 h-4" />
                      </button>
                    )}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
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
                  {isMonthlyBTC && analysis ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Maandelijks doel:</span>
                        <span className="font-medium text-gray-900">{monthlyBTCAmount.toFixed(4)} BTC</span>
                      </div>
                      {(() => {
                        const now = new Date();
                        let goalStartDate = new Date();
                        if (goal.targetDate) {
                          goalStartDate = new Date(goal.targetDate);
                        } else if (goal.createdAt) {
                          goalStartDate = new Date(goal.createdAt);
                        } else {
                          goalStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        }
                        const startDate = new Date(goalStartDate.getFullYear(), goalStartDate.getMonth(), 1);
                        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                        const monthsSinceStart = Math.max(1, Math.floor((currentMonthStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1);
                        
                        // Count completed past months
                        const pastMonths = analysis.months.filter((m: any) => 
                          m.isPastMonth &&
                          m.date >= startDate
                        );
                        const completedPastMonths = pastMonths.filter((m: any) => 
                          m.status === 'completed' || m.status === 'made_up'
                        ).length;
                        
                        const currentMonthData = analysis.months.find((m: any) => m.isCurrentMonth);
                        const currentMonthDeposited = currentMonthData ? currentMonthData.totalAmount : 0;
                        const isCurrentMonthCompleted = currentMonthData && currentMonthData.totalAmount >= monthlyBTCAmount;
                        
                        // Total completed months = past completed + current (if completed)
                        const totalCompleted = completedPastMonths + (isCurrentMonthCompleted ? 1 : 0);
                        
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Voltooide maanden:</span>
                              <span className="font-medium text-gray-900">{totalCompleted} / {monthsSinceStart}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Deze maand gestort:</span>
                              <span className="font-medium text-gray-900">{currentMonthDeposited.toFixed(4)} BTC</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Nog nodig deze maand:</span>
                              <span className="font-bold text-orange-600">{remaining} BTC</span>
                            </div>
                          </>
                        );
                      })()}
                    </>
                  ) : isBTC ? (
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

                {/* Created Date and Target Date */}
                <div className="mt-4 space-y-2">
                  {goal.createdAt && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Aangemaakt op:</span>
                      <span className="font-medium">{new Date(goal.createdAt).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                {goal.targetDate && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Startdatum:</span>
                      <span className="font-medium">{new Date(goal.targetDate).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                )}
                </div>
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

      {/* Monthly Goal Detail Popup */}
      {showMonthlyGoalPopup && selectedMonthlyGoal && (() => {
        const analysis = analyzeMonthlyGoalTransactions(selectedMonthlyGoal);
        if (!analysis) return null;
        
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => { setShowMonthlyGoalPopup(false); }}>
            <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 max-w-4xl w-full max-h-[95vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6 gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{selectedMonthlyGoal.title}</h3>
                  {/* Streak Display */}
                  <div className="mt-2 flex flex-wrap items-center gap-2 sm:gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-700">Streak:</span>
                      <span className="text-lg font-bold text-orange-600">🔥 {analysis.streak}</span>
                      <span className="text-xs text-gray-500">maanden</span>
                    </div>
                    {analysis.isPaused && (
                      <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-blue-100 rounded-full">
                        <span className="text-xs sm:text-sm font-semibold text-blue-700">⏸️ Gepauzeerd</span>
                      </div>
                    )}
                    {analysis.streakBroken && !analysis.isPaused && (
                      <div className="flex items-center gap-2 px-2 sm:px-3 py-1 bg-red-100 rounded-full">
                        <span className="text-xs sm:text-sm font-semibold text-red-700">⚠️ Streak verbroken</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Status Summary */}
              {(analysis.missedCount > 0 || analysis.totalMissedAmount > 0) && (
                <div className="mb-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-red-600 font-semibold text-sm sm:text-base">⚠️ Gemiste maanden</span>
                  </div>
                  <div className="text-xs sm:text-sm text-red-700 break-words">
                    Je hebt <span className="font-bold">{analysis.missedCount}</span> maand(en) gemist.
                    {analysis.totalMissedAmount > 0 && (
                      <span> Nog te storten: <span className="font-bold">{analysis.totalMissedAmount.toFixed(4)} BTC</span></span>
                    )}
                  </div>
                </div>
              )}

              {/* Calendar Overview */}
              <div className="mb-4 sm:mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-2">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900">Maandoverzicht</h4>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    {analysis.startMonth && (
                      <div>
                        <span className="font-semibold">Start:</span>{' '}
                        {analysis.months.find(m => m.monthKey === analysis.startMonth)?.month || ''}
                      </div>
                    )}
                    {analysis.currentMonth && (
                      <div>
                        <span className="font-semibold">Nu:</span>{' '}
                        {analysis.months.find(m => m.monthKey === analysis.currentMonth)?.month || ''}
                      </div>
                    )}
                  </div>
                </div>
                <div className="overflow-x-auto pb-2 -mx-1 sm:-mx-2 px-1 sm:px-2 overflow-y-visible">
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3 min-w-max pt-4 sm:pt-6">
                  {analysis.months.map((month: any) => {
                    let bgColor = 'bg-gray-100';
                    let borderColor = 'border-gray-300';
                    let textColor = 'text-gray-700';
                    let statusText = '';
                    
                    if (month.status === 'completed') {
                      bgColor = 'bg-green-100';
                      borderColor = 'border-green-500';
                      textColor = 'text-green-900';
                      statusText = '✓';
                    } else if (month.status === 'missed') {
                      bgColor = 'bg-red-100';
                      borderColor = 'border-red-500';
                      textColor = 'text-red-900';
                      statusText = '✗';
                    } else if (month.status === 'made_up') {
                      bgColor = 'bg-orange-100';
                      borderColor = 'border-orange-500';
                      textColor = 'text-orange-900';
                      statusText = '↩';
                    } else if (month.status === 'extra') {
                      bgColor = 'bg-blue-100';
                      borderColor = 'border-blue-500';
                      textColor = 'text-blue-900';
                      statusText = '⭐';
                    } else {
                      bgColor = 'bg-gray-100';
                      borderColor = 'border-gray-300';
                      textColor = 'text-gray-600';
                      statusText = month.isCurrentMonth ? '...' : '';
                    }

                    return (
                      <div
                        key={month.monthKey}
                        className={`p-2 sm:p-3 rounded-lg border-2 ${bgColor} ${borderColor} ${textColor} text-center relative ${
                          month.isStartMonth ? 'ring-2 ring-blue-500 ring-offset-1 sm:ring-offset-2' : ''
                        } ${month.isCurrentMonth ? 'ring-2 ring-purple-500 ring-offset-1 sm:ring-offset-2' : ''}`}
                        style={{ overflow: 'visible' }}
                      >
                        {month.isStartMonth && (
                          <div className="absolute -top-3 -right-1 sm:-top-4 sm:-right-2 bg-blue-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold z-20 shadow-md">
                            START
                          </div>
                        )}
                        {month.isCurrentMonth && (
                          <div className="absolute -top-3 -left-1 sm:-top-4 sm:-left-2 bg-purple-500 text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold z-20 shadow-md">
                            NU
                          </div>
                        )}
                        <div className="text-[10px] sm:text-xs font-semibold mb-1">{month.date.toLocaleDateString('nl-NL', { month: 'short' })}</div>
                        <div className="text-base sm:text-lg font-bold mb-1">{statusText}</div>
                        <div className="text-[10px] sm:text-xs">{month.date.getFullYear()}</div>
                        {month.totalAmount > 0 && (
                          <div className="text-[10px] sm:text-xs mt-1 font-medium break-words">
                            <span className="block">{month.totalAmount.toFixed(4)} BTC</span>
                            {month.avgPrice > 0 && (
                              <span className="text-gray-600 block sm:inline">
                                (${(month.totalAmount * month.avgPrice).toFixed(2)})
                              </span>
                            )}
                          </div>
                        )}
                        {month.remainingToMakeUp > 0 && (
                          <div className="text-[10px] sm:text-xs mt-1 text-red-600 font-semibold break-words">
                            Nog: {month.remainingToMakeUp.toFixed(4)} BTC
                          </div>
                        )}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-100 border-2 border-green-500 rounded"></div>
                  <span>Voltooid</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-100 border-2 border-red-500 rounded"></div>
                  <span>Gemist</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
                  <span>Goedgemaakt</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
                  <span>Extra storting</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-100 border-2 border-gray-300 rounded"></div>
                  <span>Nog te doen</span>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="mt-4 sm:mt-6">
                <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Transactie overzicht</h4>
                <div className="space-y-3">
                  {analysis.months
                    .filter((month: any) => month.transactions.length > 0)
                    .map((month: any) => (
                      <div key={month.monthKey} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                          <h5 className="font-semibold text-gray-900 text-sm sm:text-base">{month.month}</h5>
                          <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                            month.status === 'completed' ? 'bg-green-100 text-green-800' :
                            month.status === 'missed' ? 'bg-red-100 text-red-800' :
                            month.status === 'made_up' ? 'bg-orange-100 text-orange-800' :
                            month.status === 'extra' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {month.status === 'completed' && '✓ Voltooid'}
                            {month.status === 'missed' && '✗ Gemist'}
                            {month.status === 'made_up' && '↩ Goedgemaakt'}
                            {month.status === 'extra' && '⭐ Extra storting'}
                          </span>
                        </div>

                        {month.status === 'extra' && (
                          <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                            🎉 Goed van je dat je extra hebt gestort!
                            {month.madeUpMonths && month.madeUpMonths.length > 0 && (
                              <div className="mt-1">
                                Deze storting heeft {month.madeUpMonths.length} gemiste maand(en) goedgemaakt.
                              </div>
                            )}
                          </div>
                        )}
                        {month.madeUpMonths && month.madeUpMonths.length > 0 && (
                          <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded text-sm text-orange-800">
                            ↪️ Deze storting heeft de volgende maand(en) goedgemaakt:
                            <ul className="mt-1 list-disc list-inside">
                              {month.madeUpMonths.map((madeUpKey: string) => {
                                const madeUpMonth = analysis.months.find((m: any) => m.monthKey === madeUpKey);
                                return madeUpMonth ? (
                                  <li key={madeUpKey}>{madeUpMonth.month}</li>
                                ) : null;
                              })}
                            </ul>
                          </div>
                        )}
                        {month.remainingToMakeUp > 0 && (
                          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                            ⚠️ Nog te storten deze maand: {month.remainingToMakeUp.toFixed(4)} BTC
                          </div>
                        )}

                        <div className="space-y-2">
                          {month.transactions.map((tx: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded gap-2">
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                                  month.status === 'completed' ? 'bg-green-500' :
                                  month.status === 'made_up' ? 'bg-orange-500' :
                                  month.status === 'extra' ? 'bg-blue-500' :
                                  'bg-gray-400'
                                }`}></div>
                                <div className="min-w-0 flex-1">
                                  <div className="font-medium text-gray-900 text-sm sm:text-base break-words">
                                    {tx.amount.toFixed(4)} BTC
                                    {tx.price && (
                                      <span className="text-gray-600 ml-1 sm:ml-2 font-normal">
                                        (${tx.usdValue.toFixed(2)})
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {tx.date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              <a
                                href={`https://blockstream.info/tx/${tx.txid || tx.hash || ''}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            </div>
                          ))}
                        </div>

                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-0 text-sm">
                            <span className="text-gray-600">Totaal deze maand:</span>
                            <span className="font-semibold text-gray-900 break-words">
                              {month.totalAmount.toFixed(4)} BTC
                              {month.avgPrice > 0 && (
                                <span className="text-gray-600 ml-1 sm:ml-2 font-normal">
                                  (${(month.totalAmount * month.avgPrice).toFixed(2)})
                                </span>
                              )}
                            </span>
                          </div>
                          {month.totalAmount > month.targetAmount && (
                            <div className="mt-1 text-xs text-blue-600 break-words">
                              +{(month.totalAmount - month.targetAmount).toFixed(4)} BTC extra
                              {month.avgPrice > 0 && (
                                <span className="ml-1">
                                  (${((month.totalAmount - month.targetAmount) * month.avgPrice).toFixed(2)})
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  {analysis.months.filter((month: any) => month.transactions.length === 0 && month.status === 'missed').length > 0 && (
                    <div className="border border-red-200 rounded-lg p-3 sm:p-4 bg-red-50">
                      <h5 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Gemiste maanden</h5>
                      <div className="space-y-1">
                        {analysis.months
                          .filter((month: any) => month.transactions.length === 0 && month.status === 'missed')
                          .map((month: any) => (
                            <div key={month.monthKey} className="text-xs sm:text-sm text-red-700 break-words">
                              {month.month} - Je kunt deze maand goedmaken met een extra storting
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowMonthlyGoalPopup(false)}
                  className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                >
                  Sluiten
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

