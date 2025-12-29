import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Asset, AssetType, ExchangeRates } from './types';
import { INITIAL_RATES, ASSET_TYPES } from './constants';
import * as FinanceService from './services/financeService';
import DashboardCard from './components/DashboardCard';
import AssetTable from './components/AssetTable';
import EditModal from './components/EditModal';
import ChartsSection from './components/ChartsSection';
import { Plus, RefreshCw, DollarSign, TrendingUp, Wallet } from 'lucide-react';

const App: React.FC = () => {
  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [rates, setRates] = useState<ExchangeRates>(INITIAL_RATES);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form State
  const [newAssetType, setNewAssetType] = useState<AssetType>('tw_stock');
  const [newSymbol, setNewSymbol] = useState('');
  const [newQuantity, setNewQuantity] = useState('');
  const [newCost, setNewCost] = useState('');

  // Modal State
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Initialize from LocalStorage
  useEffect(() => {
    const savedAssets = localStorage.getItem('assets');
    if (savedAssets) {
      try {
        setAssets(JSON.parse(savedAssets));
      } catch (e) {
        console.error("Failed to parse assets", e);
      }
    }
  }, []);

  // Persist to LocalStorage
  useEffect(() => {
    localStorage.setItem('assets', JSON.stringify(assets));
  }, [assets]);

  // Derived Statistics
  const stats = useMemo(() => {
    let netWorthTWD = 0;
    let profitTWD = 0;

    assets.forEach(a => {
      const price = a.currentPrice || a.cost || 0;
      let currency = 'TWD';
      if (a.type === 'us_stock' || a.type === 'crypto') currency = 'USD';
      else if (a.type === 'cash') currency = a.symbol;

      const rate = rates[currency] || 1;
      const marketValue = (a.type === 'cash') ? a.quantity * price : a.quantity * price * rate;
      const costValue = a.quantity * a.cost * (rates[currency] || 1);

      netWorthTWD += marketValue;
      profitTWD += (marketValue - costValue);
    });

    return {
      netWorthTWD,
      netWorthUSD: netWorthTWD / (rates.USD || 32),
      profitTWD
    };
  }, [assets, rates]);

  // Handlers
  const handleAddAsset = () => {
    if (!newSymbol || !newQuantity || !newCost) {
      alert("請填寫完整資訊");
      return;
    }
    const qty = parseFloat(newQuantity);
    const cost = parseFloat(newCost);
    
    if (isNaN(qty) || isNaN(cost)) {
      alert("數量與成本必須為數字");
      return;
    }

    const newAsset: Asset = {
      id: Date.now(),
      type: newAssetType,
      symbol: newSymbol.toUpperCase().trim(),
      quantity: qty,
      cost: cost,
      currentPrice: 0 // Will be updated on refresh
    };

    setAssets(prev => [...prev, newAsset]);
    setNewSymbol('');
    setNewQuantity('');
    setNewCost('');
  };

  const handleUpdatePrices = useCallback(async () => {
    setIsLoading(true);
    try {
      const newRates = await FinanceService.fetchExchangeRates();
      setRates(prev => ({ ...prev, ...newRates }));
      
      const updatedAssets = await FinanceService.fetchAssetPrices(assets, { ...rates, ...newRates });
      setAssets(updatedAssets);
    } catch (e) {
      console.error("Update failed", e);
      alert("更新失敗，請檢查網路連線");
    } finally {
      setIsLoading(false);
    }
  }, [assets, rates]);

  const handleDelete = (id: number) => {
    if (window.confirm("確定要刪除這筆資產嗎？")) {
      setAssets(prev => prev.filter(a => a.id !== id));
    }
  };

  const handleEditSave = (id: number, quantity: number, cost: number) => {
    setAssets(prev => prev.map(a => a.id === id ? { ...a, quantity, cost } : a));
    setEditingAsset(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2] p-4 md:p-8 font-sans text-gray-800">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center text-white mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Wallet size={32} />
              全球資產配置
              <span className="text-sm font-normal bg-white/20 px-3 py-1 rounded-full">台幣計價</span>
            </h1>
          </div>
          <div className="mt-4 md:mt-0 text-right opacity-90 text-sm">
            <div>USD: {rates.USD?.toFixed(2)}</div>
            <div>JPY: {rates.JPY?.toFixed(4)}</div>
            <div>CHF: {rates.CHF?.toFixed(2)}</div>
          </div>
        </header>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard title="總淨值 (TWD)" value={`$${Math.round(stats.netWorthTWD).toLocaleString()}`} />
          <DashboardCard title="總淨值 (USD)" value={`$${Math.round(stats.netWorthUSD).toLocaleString()}`} />
          <DashboardCard title="今日總損益 (TWD)" value={`${stats.profitTWD >= 0 ? '+' : ''}$${Math.round(stats.profitTWD).toLocaleString()}`} isProfit />
        </div>

        {/* Action Bar & Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold mb-4 text-gray-700 flex items-center gap-2">
            <Plus size={20} /> 新增資產
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">類別</label>
              <select 
                value={newAssetType}
                onChange={(e) => setNewAssetType(e.target.value as AssetType)}
                className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">代號</label>
              <input 
                type="text" 
                placeholder="例如: QQQ, BTC" 
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">數量</label>
              <input 
                type="number" 
                step="0.0001"
                placeholder="0.00"
                value={newQuantity}
                onChange={(e) => setNewQuantity(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">成本 (原幣)</label>
              <input 
                type="number" 
                step="0.01"
                placeholder="0.00"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1">
              <button 
                onClick={handleAddAsset}
                className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors shadow-lg shadow-blue-200"
              >
                新增
              </button>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-white text-sm opacity-80 flex items-center gap-2">
            <TrendingUp size={16} /> 
            <span>資產列表自動計算</span>
          </div>
          <button 
            onClick={handleUpdatePrices}
            disabled={isLoading}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? '更新中...' : '更新報價與匯率'}
          </button>
        </div>

        {/* Table */}
        <AssetTable 
          assets={assets} 
          rates={rates} 
          onEdit={setEditingAsset} 
          onDelete={handleDelete} 
        />

        {/* Charts */}
        <ChartsSection assets={assets} rates={rates} />

        {/* Modals */}
        <EditModal 
          isOpen={!!editingAsset} 
          asset={editingAsset} 
          onClose={() => setEditingAsset(null)} 
          onSave={handleEditSave} 
        />
        
      </div>
    </div>
  );
};

export default App;
