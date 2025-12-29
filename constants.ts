export const ASSET_TYPES = [
  { value: 'tw_stock', label: '台股 (2330)' },
  { value: 'us_stock', label: '美/英股 (QQQ, VWRA.L)' },
  { value: 'crypto', label: '虛擬幣 (BTC)' },
  { value: 'cash', label: '現金/負債' },
];

export const INITIAL_RATES = {
  TWD: 1,
  USD: 32.5,
  JPY: 0.21,
  CHF: 38,
};

export const CATEGORY_COLORS: Record<string, string> = {
  '台股': '#FF6384',
  '美/英股': '#36A2EB',
  '虛擬幣': '#FFCE56',
  '現金/負債': '#4BC0C0',
  'Default': '#9966FF'
};
