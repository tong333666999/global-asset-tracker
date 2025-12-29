import React, { useState, useEffect } from 'react';
import { Asset } from '../types';

interface EditModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, quantity: number, cost: number) => void;
}

const EditModal: React.FC<EditModalProps> = ({ asset, isOpen, onClose, onSave }) => {
  const [quantity, setQuantity] = useState<string>('');
  const [cost, setCost] = useState<string>('');

  useEffect(() => {
    if (asset) {
      setQuantity(asset.quantity.toString());
      setCost(asset.cost.toString());
    }
  }, [asset]);

  if (!isOpen || !asset) return null;

  const handleSave = () => {
    const q = parseFloat(quantity);
    const c = parseFloat(cost);
    if (!isNaN(q) && !isNaN(c)) {
      onSave(asset.id, q, c);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all scale-100">
        <h3 className="text-xl font-bold text-gray-800 mb-4 text-center border-b pb-3">
          修改資產: <span className="text-blue-600">{asset.symbol}</span>
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">數量</label>
            <input 
              type="number" 
              step="0.0001"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">成本 (原幣)</label>
            <input 
              type="number" 
              step="0.01"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
          >
            取消
          </button>
          <button 
            onClick={handleSave}
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium shadow-md shadow-green-200 transition-colors"
          >
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
