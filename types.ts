export type AssetType = 'tw_stock' | 'us_stock' | 'crypto' | 'cash';

export interface Asset {
  id: number;
  type: AssetType;
  symbol: string;
  quantity: number;
  cost: number;
  currentPrice: number;
}

export interface ExchangeRates {
  TWD: number;
  USD: number;
  JPY: number;
  CHF: number;
  [key: string]: number;
}

export interface DashboardStats {
  totalNetWorthTWD: number;
  totalNetWorthUSD: number;
  totalProfitTWD: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  category: string;
  color?: string;
}
