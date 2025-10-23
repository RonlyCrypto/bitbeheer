export interface DCASimulation {
  id?: string;
  user_id?: string;
  coin: string;
  start_date: string;
  monthly_amount: number;
  total_invested: number;
  current_value: number;
  roi_percentage: number;
  created_at?: string;
}

export interface PriceData {
  date: string;
  price: number;
}

export interface HalvingEvent {
  date: string;
  block: number;
  label?: string;
}

export interface SimulationResult {
  totalInvested: number;
  currentValue: number;
  roiPercentage: number;
  averageBuyPrice: number;
  totalCoins: number;
  cycleATHValue: number;
  totalPurchases: number;
  monthlyData: {
    date: string;
    invested: number;
    value: number;
    coins: number;
  }[];
  purchasePoints: {
    date: string;
    price: number;
  }[];
  purchaseDetails: {
    date: string;
    amount: number;
    price: number;
    btcAcquired: number;
    monthNumber: number;
    currentValue: number;
  }[];
}
