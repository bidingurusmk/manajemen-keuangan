import { useState } from 'react';
import { motion } from 'motion/react';
import { Percent, Edit, Check, Settings, ShieldAlert, CheckCircle, Info } from 'lucide-react';
import { CategoryBudget, EXPENSE_CATEGORIES } from '../types';
import { formatRupiah } from '../utils';

interface CategoryBudgetsProps {
  budgets: CategoryBudget[];
  onSaveBudget: (category: string, limit: number) => void;
  transactions: Transaction[];
  selectedMonth: string;
}

import { Transaction } from '../types';

export default function CategoryBudgets({
  budgets,
  onSaveBudget,
  transactions,
  selectedMonth
}: CategoryBudgetsProps) {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState<string>('');

  const currentMonthTransactions = transactions.filter(
    (tx) => tx.date.startsWith(selectedMonth)
  );

  const startEdit = (category: string, currentLimit: number) => {
    setEditingCategory(category);
    setInputValue(currentLimit.toString());
  };

  const handleSave = (category: string) => {
    const val = parseFloat(inputValue.replace(/\D/g, ''));
    if (!isNaN(val) && val >= 0) {
      onSaveBudget(category, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
      <div className="border-b border-slate-100 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm font-sans flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-indigo-500" />
            Pengaturan Alokasi Anggaran (Limit Bulanan)
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Sesuaikan alokasi budget bulanan maksimal untuk mengontrol pengeluaran berlebih
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {EXPENSE_CATEGORIES.map((cat) => {
          const budgetObj = budgets.find((b) => b.category === cat.name);
          const currentLimit = budgetObj ? budgetObj.limit : 0;
          const isEditing = editingCategory === cat.name;

          // Compute actual expenses for this category in the current month
          const actual = currentMonthTransactions
            .filter((tx) => tx.type === 'expense' && tx.category === cat.name)
            .reduce((sum, tx) => sum + tx.amount, 0);

          const pct = currentLimit > 0 ? (actual / currentLimit) * 100 : 0;
          const isOver = actual > currentLimit && currentLimit > 0;

          return (
            <div
              key={cat.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-100 hover:bg-slate-50/20 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`p-2.5 rounded-xl shrink-0 ${cat.color}`}>
                  {/* Dynamic mini-bar marker */}
                  <span className="w-1.5 h-1.5 rounded-full block bg-white" />
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-slate-700 text-sm block truncate">{cat.name}</span>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400">
                    <span>Terpakai:</span>
                    <span className="font-bold text-slate-600">{formatRupiah(actual)}</span>
                    {currentLimit > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-sm text-[10px] font-semibold ${
                        isOver ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {pct.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inline Editing Control */}
              <div className="flex items-center gap-3 shrink-0">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <span className="absolute inset-y-0 left-3 flex items-center text-xs font-bold text-slate-400 font-mono">Rp</span>
                      <input
                        type="text"
                        value={inputValue ? parseInt(inputValue, 10).toLocaleString('id-ID') : ''}
                        onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
                        className="w-32 pl-8 pr-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        placeholder="Limit"
                        autoFocus
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSave(cat.name)}
                      className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                      title="Simpan"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Batas Maksimal</span>
                      <span className="text-sm font-bold text-slate-700 font-mono">
                        {currentLimit > 0 ? formatRupiah(currentLimit) : 'Belum Atur'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(cat.name, currentLimit)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                      title="Atur Limit"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
