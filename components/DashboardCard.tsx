import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  isProfit?: boolean;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, isProfit }) => {
  let valueColor = 'text-white';
  if (isProfit !== undefined) {
    // If it's a number string with symbols
    const numVal = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    if (!isNaN(numVal)) {
        if (numVal > 0) valueColor = 'text-green-300';
        else if (numVal < 0) valueColor = 'text-red-300';
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl text-center shadow-lg transition-transform hover:scale-105">
      <h3 className="text-gray-100 text-sm uppercase tracking-wider mb-2 font-semibold">{title}</h3>
      <div className={`text-3xl font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
};

export default DashboardCard;
