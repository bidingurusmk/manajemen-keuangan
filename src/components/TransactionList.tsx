import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Briefcase,
  Sparkles,
  TrendingUp,
  Laptop,
  PlusCircle,
  Utensils,
  Car,
  FileText,
  ShoppingBag,
  Film,
  HeartPulse,
  Wallet,
  HelpCircle,
  Download,
  AlertCircle,
  Image,
  X
} from 'lucide-react';
import { Transaction, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../types';
import { formatRupiah, formatIndoDate } from '../utils';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  selectedMonth: string;
}

export default function TransactionList({
  transactions,
  onEdit,
  onDelete,
  selectedMonth
}: TransactionListProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Filter transactions for current selected month
  const currentMonthTxs = transactions.filter((tx) => tx.date.startsWith(selectedMonth));

  // Combine categories for filtering dropdown
  const allCategories = [
    ...INCOME_CATEGORIES.map((c) => c.name),
    ...EXPENSE_CATEGORIES.map((c) => c.name)
  ];

  // Apply filters & search query
  const filteredTxs = currentMonthTxs.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(search.toLowerCase()) ||
      tx.category.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === 'all' || tx.type === typeFilter;
    
    const matchesCategory = categoryFilter === 'all' || tx.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  // Apply Sorting
  const sortedTxs = [...filteredTxs].sort((a, b) => {
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    }
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    }
    if (sortBy === 'amount-desc') {
      return b.amount - a.amount;
    }
    if (sortBy === 'amount-asc') {
      return a.amount - b.amount;
    }
    return 0;
  });

  // Render Category Icon
  const getCategoryIcon = (categoryName: string, txType: 'income' | 'expense') => {
    const props = { className: 'w-4 h-4' };
    const list = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const item = list.find((c) => c.name === categoryName);
    const iconName = item?.icon || '';

    switch (iconName) {
      case 'Briefcase': return <Briefcase {...props} />;
      case 'Sparkles': return <Sparkles {...props} />;
      case 'TrendingUp': return <TrendingUp {...props} />;
      case 'Laptop': return <Laptop {...props} />;
      case 'PlusCircle': return <PlusCircle {...props} />;
      case 'Utensils': return <Utensils {...props} />;
      case 'Car': return <Car {...props} />;
      case 'FileText': return <FileText {...props} />;
      case 'ShoppingBag': return <ShoppingBag {...props} />;
      case 'Film': return <Film {...props} />;
      case 'HeartPulse': return <HeartPulse {...props} />;
      case 'Wallet': return <Wallet {...props} />;
      default: return <HelpCircle {...props} />;
    }
  };

  // Render Category Color
  const getCategoryBg = (categoryName: string, txType: 'income' | 'expense') => {
    const list = txType === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    const item = list.find((c) => c.name === categoryName);
    return item?.color || 'bg-slate-500 text-white';
  };

  // Simple Export/Print function to copy text reports
  const handleExportSummary = () => {
    const totalInc = currentMonthTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const totalExp = currentMonthTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);

    let text = `=== LAPORAN KEUANGAN BULANAN - ${selectedMonth} ===\n\n`;
    text += `TOTAL PEMASUKAN: ${formatRupiah(totalInc)}\n`;
    text += `TOTAL PENGELUARAN: ${formatRupiah(totalExp)}\n`;
    text += `SISA SALDO: ${formatRupiah(totalInc - totalExp)}\n\n`;
    text += `RIWAYAT TRANSAKSI:\n`;
    
    currentMonthTxs.forEach((tx, idx) => {
      const typeSign = tx.type === 'income' ? '(+)' : '(-)';
      text += `${idx + 1}. [${formatIndoDate(tx.date)}] [${tx.category}] ${tx.description}: ${typeSign} ${formatRupiah(tx.amount)}\n`;
    });

    navigator.clipboard.writeText(text);
    alert('Laporan bulanan berhasil disalin ke clipboard! Anda bisa langsung menempelkannya di WhatsApp, Email, atau Notepad.');
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100 flex flex-col h-full">
      <div className="border-b border-slate-100 pb-3 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-800 text-sm font-sans">
            Riwayat Transaksi Bulan Ini
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Daftar lengkap pemasukan dan pengeluaran Anda pada periode yang dipilih
          </p>
        </div>

        {currentMonthTxs.length > 0 && (
          <button
            type="button"
            onClick={handleExportSummary}
            className="shrink-0 flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 border border-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Salin Laporan
          </button>
        )}
      </div>

      {/* Filter and Search Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {/* Search Input */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Cari transaksi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={typeFilter}
            onChange={(e: any) => setTypeFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="all">Semua Jenis</option>
            <option value="income">🟢 Pemasukan</option>
            <option value="expense">🔴 Pengeluaran</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <Filter className="w-4 h-4" />
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="all">Semua Kategori</option>
            {allCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-slate-400">
            <ArrowUpDown className="w-4 h-4" />
          </span>
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="date-desc">Terbaru (Tanggal)</option>
            <option value="date-asc">Terlama (Tanggal)</option>
            <option value="amount-desc">Terbesar (Nominal)</option>
            <option value="amount-asc">Terkecil (Nominal)</option>
          </select>
        </div>
      </div>

      {/* Transactions List Registry */}
      <div className="flex-1 overflow-y-auto max-h-[460px] pr-1 space-y-2.5">
        <AnimatePresence initial={false}>
          {sortedTxs.length > 0 ? (
            sortedTxs.map((tx) => {
              const isConfirmingDelete = confirmDeleteId === tx.id;

              return (
                <motion.div
                  key={tx.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-xl transition-all ${
                    tx.type === 'income'
                      ? 'border-emerald-100 hover:border-emerald-200 bg-emerald-50/5 hover:bg-emerald-50/15'
                      : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/30'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Category color circle and inner icon */}
                    <div className={`p-2.5 rounded-xl shrink-0 ${getCategoryBg(tx.category, tx.type)}`}>
                      {getCategoryIcon(tx.category, tx.type)}
                    </div>
                    
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm truncate">{tx.description}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-sm shrink-0 ${
                          tx.type === 'income' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tx.category}
                        </span>
                        {tx.imageUrl && (
                          <button
                            type="button"
                            onClick={() => setSelectedImage(tx.imageUrl || null)}
                            className="inline-flex items-center gap-1.5 text-[10px] bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-sm transition-colors cursor-pointer"
                            title="Lihat Gambar Bukti Transaksi"
                          >
                            <Image className="w-3 h-3" />
                            <span>Kuitansi</span>
                          </button>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-sans block mt-0.5">
                        {formatIndoDate(tx.date)}
                      </span>
                    </div>
                  </div>

                  {/* Right hand pricing & management buttons */}
                  <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-0 pt-2 sm:pt-0 border-slate-100">
                    <span className={`font-mono font-bold text-sm sm:text-base ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isConfirmingDelete ? (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-bold text-red-500 uppercase mr-1">Yakin Hapus?</span>
                          <button
                            type="button"
                            onClick={() => onDelete(tx.id)}
                            className="py-1 px-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md text-[10px] transition-colors cursor-pointer"
                          >
                            Ya
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="py-1 px-2.5 bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold rounded-md text-[10px] transition-colors cursor-pointer"
                          >
                            Tidak
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => onEdit(tx)}
                            className="p-1.5 hover:bg-indigo-50 hover:text-indigo-600 text-slate-400 rounded-lg transition-all cursor-pointer"
                            title="Edit Transaksi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(tx.id)}
                            className="p-1.5 hover:bg-red-50 hover:text-red-500 text-slate-400 rounded-lg transition-all cursor-pointer"
                            title="Hapus Transaksi"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400 font-sans flex flex-col items-center gap-3">
              <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div>
                <p className="font-semibold text-sm">Tidak Ada Transaksi Ditemukan</p>
                <p className="text-xs mt-0.5">Silakan catat atau sesuaikan filter pencarian Anda.</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Lightbox / Image Preview Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Bukti Transaksi / Kuitansi</h4>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 bg-slate-950 flex items-center justify-center min-h-[300px] max-h-[70vh]">
                <img
                  src={selectedImage}
                  alt="Bukti Transaksi"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3 bg-slate-50 text-center">
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
