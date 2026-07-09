import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  Percent,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Transaction, CategoryBudget, EXPENSE_CATEGORIES } from '../types';
import { formatRupiah, formatMonthName } from '../utils';

interface DashboardProps {
  transactions: Transaction[];
  budgets: CategoryBudget[];
  selectedMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export default function Dashboard({
  transactions,
  budgets,
  selectedMonth,
  onMonthChange,
  availableMonths
}: DashboardProps) {
  // Filter transactions for the selected month
  const currentMonthTransactions = transactions.filter(
    (tx) => tx.date.startsWith(selectedMonth)
  );

  // Compute Total Income
  const totalIncome = currentMonthTransactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Compute Total Expenses
  const totalExpense = currentMonthTransactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Sisa Uang / Net Savings
  const netSavings = totalIncome - totalExpense;
  const expensePercentage = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0;

  // Process data for the EXPENSE PIE CHART
  const expenseByCategory = EXPENSE_CATEGORIES.map((cat) => {
    const total = currentMonthTransactions
      .filter((tx) => tx.type === 'expense' && tx.category === cat.name)
      .reduce((sum, tx) => sum + tx.amount, 0);
    return {
      name: cat.name,
      value: total,
      color: cat.id === 'makanan' ? '#F59E0B' :
             cat.id === 'transportasi' ? '#3B82F6' :
             cat.id === 'tagihan' ? '#EF4444' :
             cat.id === 'belanja' ? '#EC4899' :
             cat.id === 'hiburan' ? '#A855F7' :
             cat.id === 'kesehatan' ? '#F43F5E' :
             cat.id === 'tabungan' ? '#059669' : '#475569',
    };
  }).filter((item) => item.value > 0);

  // Process data for MONTHLY TRENDS (last 6 months or all available months)
  const sortedMonths = [...availableMonths].sort();
  const trendData = sortedMonths.slice(-6).map((m) => {
    const monthTxs = transactions.filter((tx) => tx.date.startsWith(m));
    const income = monthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = monthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    
    // Get month name abbreviation
    const [year, month] = m.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const label = `${monthNames[parseInt(month, 10) - 1]} ${year.substring(2)}`;

    return {
      rawMonth: m,
      name: label,
      Pemasukan: income,
      Pengeluaran: expense,
      Sisa: income - expense,
    };
  });

  // Calculate status warning
  const getStatusColorClass = () => {
    if (expensePercentage >= 100) return 'text-red-600 bg-red-50 border-red-200';
    if (expensePercentage >= 85) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getStatusMessage = () => {
    if (totalIncome === 0) return 'Belum ada pemasukan yang tercatat di bulan ini.';
    if (expensePercentage >= 100) {
      return 'Bahaya! Pengeluaran Anda telah melebihi total pemasukan bulan ini (Overbudget).';
    }
    if (expensePercentage >= 85) {
      return 'Peringatan! Pengeluaran Anda hampir mencapai 90% dari total pemasukan. Kurangi belanja non-esensial.';
    }
    if (expensePercentage >= 50) {
      return 'Keuangan sehat. Terus pantau pengeluaran Anda agar tetap di bawah batas aman.';
    }
    return 'Luar biasa! Pengeluaran Anda sangat terkendali. Peluang bagus untuk menambah tabungan atau investasi.';
  };

  // Custom tooltips for Recharts
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-3 border border-slate-200 rounded-xl shadow-lg font-sans">
          <p className="font-semibold text-slate-800 text-sm">{payload[0].name}</p>
          <p className="text-rose-600 font-bold text-sm mt-0.5">
            {formatRupiah(payload[0].value)}
          </p>
          {totalExpense > 0 && (
            <p className="text-slate-500 text-xs mt-1">
              Porsi: {((payload[0].value / totalExpense) * 100).toFixed(1)}% dari pengeluaran
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 border border-slate-200 rounded-xl shadow-lg font-sans">
          <p className="font-bold text-slate-800 border-b border-slate-100 pb-1 mb-2 text-sm">{label}</p>
          <div className="space-y-1.5 text-xs font-semibold">
            <div className="flex items-center justify-between gap-6">
              <span className="text-emerald-600 flex items-center gap-1">🟢 Pemasukan:</span>
              <span className="text-slate-800">{formatRupiah(payload[0].value)}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-rose-500 flex items-center gap-1">🔴 Pengeluaran:</span>
              <span className="text-slate-800">{formatRupiah(payload[1].value)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-1.5 mt-1.5">
              <span className="text-indigo-600 flex items-center gap-1">💼 Sisa Saldo:</span>
              <span className={`font-bold ${payload[0].value - payload[1].value >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                {formatRupiah(payload[0].value - payload[1].value)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Upper Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 font-sans tracking-tight">
            <Calendar className="w-5 h-5 text-indigo-500" />
            Laporan Keuangan Bulanan
          </h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Analisis detail pemasukan, pengeluaran, dan alokasi budget
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="month-select" className="text-xs font-bold text-slate-600 uppercase tracking-wider font-sans">
            Pilih Bulan:
          </label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-50 hover:bg-slate-100 text-slate-800 text-sm font-semibold py-2 px-4 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-colors"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthName(m)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Income Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between relative overflow-hidden"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Total Pemasukan</span>
            <div className="text-2xl font-extrabold text-emerald-600 tracking-tight font-sans">
              {formatRupiah(totalIncome)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className="text-emerald-500 font-semibold flex items-center bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                <ArrowUpRight className="w-3 h-3 inline" /> 100%
              </span>
              <span>Aktif bulan ini</span>
            </div>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Total Expenses Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between relative overflow-hidden"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Total Pengeluaran</span>
            <div className="text-2xl font-extrabold text-rose-500 tracking-tight font-sans">
              {formatRupiah(totalExpense)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className={`font-semibold flex items-center px-1.5 py-0.5 rounded-sm ${
                expensePercentage > 100 ? 'bg-red-50 text-red-500' :
                expensePercentage > 80 ? 'bg-amber-50 text-amber-500' : 'bg-slate-100 text-slate-600'
              }`}>
                <ArrowDownRight className="w-3 h-3 inline" />
                {expensePercentage.toFixed(1)}%
              </span>
              <span>dari pemasukan</span>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${
            expensePercentage > 100 ? 'bg-red-50 text-red-500' :
            expensePercentage > 80 ? 'bg-amber-50 text-amber-500' : 'bg-rose-50 text-rose-500'
          }`}>
            <TrendingDown className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Sisa Saldo / Net Savings Card */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex items-center justify-between relative overflow-hidden"
        >
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Sisa Uang (Tabungan)</span>
            <div className={`text-2xl font-extrabold tracking-tight font-sans ${netSavings >= 0 ? 'text-indigo-600' : 'text-red-500'}`}>
              {formatRupiah(netSavings)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span className={`font-semibold px-1.5 py-0.5 rounded-sm ${netSavings >= 0 ? 'bg-indigo-50 text-indigo-600' : 'bg-red-50 text-red-500'}`}>
                {totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0}%
              </span>
              <span>tersisa dari pendapatan</span>
            </div>
          </div>
          <div className={`p-4 rounded-xl ${netSavings >= 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-red-50 text-red-500'}`}>
            <Wallet className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Warning & Insight Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-start gap-3 p-4 rounded-xl border font-sans text-sm ${getStatusColorClass()}`}
      >
        {expensePercentage >= 85 ? (
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
        )}
        <div>
          <span className="font-bold">Analisis Kesehatan Keuangan:</span>{' '}
          <span>{getStatusMessage()}</span>
        </div>
      </motion.div>

      {/* Visual Charts Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart Card 1: Expense Breakdown Pie Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 font-sans text-sm">Distribusi Pengeluaran</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Pembagian pengeluaran berdasarkan kategori</p>
            </div>
            <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              Grafik Lingkaran
            </div>
          </div>

          <div className="flex-1 min-h-0 flex flex-col sm:flex-row items-center justify-center gap-4">
            {expenseByCategory.length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-48 sm:h-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expenseByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  {/* Absolute Center percentage of largest expense or savings */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Maksimal</span>
                    <span className="text-lg font-black text-slate-700">
                      {expenseByCategory.length > 0
                        ? `${((Math.max(...expenseByCategory.map((e) => e.value)) / totalExpense) * 100).toFixed(0)}%`
                        : '0%'}
                    </span>
                  </div>
                </div>

                {/* Legends with Custom Grid list */}
                <div className="w-full sm:w-1/2 overflow-y-auto max-h-[220px] sm:max-h-full pr-1">
                  <div className="space-y-2">
                    {expenseByCategory.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-2 text-slate-700 truncate mr-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          <span className="truncate">{entry.name}</span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-slate-800 block">{formatRupiah(entry.value)}</span>
                          <span className="text-[10px] text-slate-400">
                            {((entry.value / totalExpense) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 font-sans flex flex-col items-center gap-3">
                <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
                  <Info className="w-8 h-8" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Belum Ada Pengeluaran</p>
                  <p className="text-xs mt-0.5">Silakan catat pengeluaran Anda di panel transaksi.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chart Card 2: Cashflow Monthly Comparison Trends */}
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col h-[400px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div>
              <h3 className="font-bold text-slate-800 font-sans text-sm">Tren Arus Kas (Cashflow)</h3>
              <p className="text-xs text-slate-400 font-sans mt-0.5">Perbandingan pemasukan vs pengeluaran bulanan</p>
            </div>
            <div className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
              Grafik Batang
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={trendData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis
                    dataKey="name"
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}jt`;
                      if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
                      return val;
                    }}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#F8FAFC' }} />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                  />
                  <Bar dataKey="Pemasukan" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Pengeluaran" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs">
                Data historis tidak mencukupi untuk membuat grafik tren.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Budgets Monitor Panel */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div className="border-b border-slate-100 pb-3 mb-5">
          <h3 className="font-bold text-slate-800 font-sans text-sm flex items-center gap-1.5">
            <Percent className="w-4 h-4 text-indigo-500" />
            Pemantauan Alokasi Anggaran (Budget) Bulan Ini
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Kontrol batas pengeluaran berdasarkan budget yang Anda tetapkan
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          {EXPENSE_CATEGORIES.map((cat) => {
            // Find budget limit for this category
            const budgetObj = budgets.find((b) => b.category === cat.name);
            const limit = budgetObj ? budgetObj.limit : 0;
            
            // Calculate actual expense
            const actual = currentMonthTransactions
              .filter((tx) => tx.type === 'expense' && tx.category === cat.name)
              .reduce((sum, tx) => sum + tx.amount, 0);

            const pct = limit > 0 ? (actual / limit) * 100 : 0;
            const isExceeded = actual > limit && limit > 0;

            return (
              <div key={cat.id} className="space-y-1.5 p-2 rounded-lg hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{
                      backgroundColor: cat.id === 'makanan' ? '#F59E0B' :
                                       cat.id === 'transportasi' ? '#3B82F6' :
                                       cat.id === 'tagihan' ? '#EF4444' :
                                       cat.id === 'belanja' ? '#EC4899' :
                                       cat.id === 'hiburan' ? '#A855F7' :
                                       cat.id === 'kesehatan' ? '#F43F5E' :
                                       cat.id === 'tabungan' ? '#059669' : '#475569'
                    }} />
                    <span className="text-slate-700">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-800">{formatRupiah(actual)}</span>
                    <span className="text-slate-400 mx-1">/</span>
                    <span className="text-slate-500 font-normal">
                      {limit > 0 ? formatRupiah(limit) : 'Batas Belum Set'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      limit === 0 ? 'bg-slate-300' :
                      pct >= 100 ? 'bg-red-500' :
                      pct >= 80 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${Math.min(pct || 0, 100)}%` }}
                  />
                </div>

                {/* Warning message if exceeded */}
                {limit > 0 && (
                  <div className="flex items-center justify-between text-[10px] font-sans">
                    <span className={`${isExceeded ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
                      {pct.toFixed(0)}% terpakai
                    </span>
                    {isExceeded && (
                      <span className="text-red-500 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Over budget {formatRupiah(actual - limit)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
