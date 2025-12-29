import React from 'react';
import { Asset, ExchangeRates } from '../types';
import { Edit, Trash2 } from 'lucide-react';

interface AssetTableProps {
  assets: Asset[];
  rates: ExchangeRates;
  onEdit: (asset: Asset) => void;
  onDelete: (id: number) => void;
}

const AssetTable: React.FC<AssetTableProps> = ({ assets, rates, onEdit, onDelete }) => {
  
  const getDisplayData = (asset: Asset) => {
    const price = asset.currentPrice || asset.cost || 0;
    let currency = 'TWD';
    
    if (asset.type === 'us_stock' || asset.type === 'crypto') currency = 'USD';
    else if (asset.type === 'cash') currency = asset.symbol;

    const rate = rates[currency] || 1;
    const marketValueTWD = (asset.type === 'cash') 
      ? asset.quantity * price // For cash, currentPrice is the exchange rate usually, or we treat quantity as face value
      : asset.quantity * price * rate;

    // Profit % calculation
    // Cost basis in original currency
    const profitPct = (currency === 'TWD' || asset.cost === 0) 
      ? 0 
      : (((price - asset.cost) / asset.cost) * 100);

    const catLabel = asset.type === 'tw_stock' ? '台股' :
                     asset.type === 'us_stock' ? '美/英股' :
                     asset.type === 'crypto' ? '虛擬幣' : '現金/負債';

    return {
      catLabel,
      priceDisp: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }),
      marketValue: Math.round(marketValueTWD).toLocaleString(),
      profitPct,
      isPositive: profitPct >= 0
    };
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-100">
      <table className="min-w-full leading-normal">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-800">
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">類別</th>
            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider">代號</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">數量</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">現價(原幣)</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">市值(台幣)</th>
            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider">損益%</th>
            <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody>
          {assets.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-5 py-5 text-center text-sm text-gray-500">
                目前沒有資產，請新增一筆。
              </td>
            </tr>
          ) : (
            assets.map((asset) => {
              const data = getDisplayData(asset);
              return (
                <tr key={asset.id} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0">
                  <td className="px-5 py-4 text-sm font-medium text-gray-600">{data.catLabel}</td>
                  <td className="px-5 py-4 text-sm font-bold text-gray-800">{asset.symbol}</td>
                  <td className="px-5 py-4 text-sm text-right text-gray-600 font-mono">{asset.quantity.toLocaleString()}</td>
                  <td className="px-5 py-4 text-sm text-right text-gray-600 font-mono">{data.priceDisp}</td>
                  <td className="px-5 py-4 text-sm text-right font-bold text-gray-800 font-mono">{data.marketValue}</td>
                  <td className={`px-5 py-4 text-sm text-right font-bold ${data.isPositive ? 'text-red-500' : 'text-green-600'}`}>
                     {data.isPositive && data.profitPct > 0 ? '+' : ''}{data.profitPct.toFixed(2)}%
                  </td>
                  <td className="px-5 py-4 text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => onEdit(asset)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-full transition-colors"
                        title="編輯"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(asset.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                        title="刪除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AssetTable;
