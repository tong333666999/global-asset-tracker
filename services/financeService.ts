import { Asset, ExchangeRates } from '../types';

const PROXY_URL = 'https://api.allorigins.win/get?url=';

export const fetchExchangeRates = async (): Promise<Partial<ExchangeRates>> => {
  const newRates: Partial<ExchangeRates> = {};
  const currencies = ['USD', 'JPY', 'CHF'];

  for (const curr of currencies) {
    try {
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${curr}TWD=X?interval=1d&range=1d`;
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
      const json = await response.json();
      const data = JSON.parse(json.contents);
      
      if (data.chart && data.chart.result && data.chart.result[0]) {
        newRates[curr] = data.chart.result[0].meta.regularMarketPrice;
      }
    } catch (e) {
      console.warn(`Failed to fetch rate for ${curr}`, e);
    }
  }
  return newRates;
};

export const fetchAssetPrices = async (assets: Asset[], rates: ExchangeRates): Promise<Asset[]> => {
  const updatedAssets = [...assets];

  for (const asset of updatedAssets) {
    // Logic for Cash/Liabilities
    if (asset.type === 'cash') {
      const currency = asset.symbol.toUpperCase();
      if (currency === 'TWD') {
        asset.currentPrice = 1;
      } else if (rates[currency]) {
        asset.currentPrice = rates[currency];
      }
      continue;
    }

    // Logic for Stocks/Crypto
    let ySymbol = asset.symbol;
    if (asset.type === 'tw_stock' && !ySymbol.includes('.')) ySymbol += '.TW';
    if (asset.type === 'crypto' && !ySymbol.includes('-')) ySymbol += '-USD';

    try {
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${ySymbol}?interval=1d&range=1d`;
      const response = await fetch(`${PROXY_URL}${encodeURIComponent(targetUrl)}`);
      const json = await response.json();
      const data = JSON.parse(json.contents);

      if (data.chart && data.chart.result && data.chart.result[0]) {
        asset.currentPrice = data.chart.result[0].meta.regularMarketPrice;
      }
    } catch (e) {
      console.warn(`Failed to fetch price for ${ySymbol}`, e);
    }
  }

  return updatedAssets;
};
