import React, { useMemo, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Asset, ExchangeRates, ChartDataPoint } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface ChartsSectionProps {
  assets: Asset[];
  rates: ExchangeRates;
}

type FilterType = 'all' | 'tw_stock' | 'us_stock' | 'crypto' | 'cash_positive';

const ChartsSection: React.FC<ChartsSectionProps> = ({ assets, rates }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const { positiveData, negativeData } = useMemo(() => {
    const pos: ChartDataPoint[] = [];
    const neg: ChartDataPoint[] = [];

    assets.forEach(a => {
      const price = a.currentPrice || a.cost || 0;
      let currency = 'TWD';
      if (a.type === 'us_stock' || a.type === 'crypto') currency = 'USD';
      else if (a.type === 'cash') currency = a.symbol;

      const rate = rates[currency] || 1;
      const marketValueTWD = (a.type === 'cash') ? a.quantity * price : a.quantity * price * rate;
      
      const catLabel = a.type === 'tw_stock' ? '台股' :
                       a.type === 'us_stock' ? '美/英股' :
                       a.type === 'crypto' ? '虛擬幣' : '現金/負債';

      const item = {
        name: a.symbol,
        value: Math.abs(marketValueTWD),
        category: catLabel,
        color: CATEGORY_COLORS[catLabel] || CATEGORY_COLORS['Default']
      };

      if (marketValueTWD > 0) {
        // Only add significant amounts
        if (item.value > 100) pos.push(item);
      } else {
        neg.push(item);
      }
    });

    return { positiveData: pos, negativeData: neg };
  }, [assets, rates]);

  const filteredData = useMemo(() => {
    if (filter === 'all') {
      // Group by category for 'all' view
      const grouped: Record<string, number> = {};
      positiveData.forEach(p => {
        grouped[p.category] = (grouped[p.category] || 0) + p.value;
      });
      return Object.entries(grouped).map(([key, val]) => ({
        name: key,
        value: val,
        category: key,
        color: CATEGORY_COLORS[key]
      }));
    }

    let targetCategory = '';
    switch (filter) {
      case 'tw_stock': targetCategory = '台股'; break;
      case 'us_stock': targetCategory = '美/英股'; break;
      case 'crypto': targetCategory = '虛擬幣'; break;
      case 'cash_positive': targetCategory = '現金/負債'; break;
    }

    // Return individual items for specific categories
    return positiveData.filter(p => p.category === targetCategory);
  }, [filter, positiveData]);

  const filterButtons: { id: FilterType; label: string }[] = [
    { id: 'all', label: '總資產類別' },
    { id: 'tw_stock', label: '台股細項' },
    { id: 'us_stock', label: '美/英股細項' },
    { id: 'crypto', label: '虛擬幣細項' },
    { id: 'cash_positive', label: '現金細項' },
  ];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
  
    return percent > 0.05 ? (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  const ChartCard = ({ title, data, showFilter = false }: { title: string, data: ChartDataPoint[], showFilter?: boolean }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg flex flex-col items-center w-full max-w-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4">{title}</h3>
      
      {showFilter && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {filterButtons.map(btn => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`px-3 py-1 text-sm rounded-full transition-all ${
                filter === btn.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      )}

      <div className="w-full h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || CATEGORY_COLORS['Default']} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => `NT$${Math.round(value).toLocaleString()}`}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            無資料
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-wrap justify-center gap-8 mt-8">
      <ChartCard title="正資產配置" data={filteredData} showFilter={true} />
      <ChartCard title="負債配置" data={negativeData} />
    </div>
  );
};

export default ChartsSection;
