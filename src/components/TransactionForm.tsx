import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import {
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  PenTool,
  Check,
  Briefcase,
  Sparkles,
  Laptop,
  Plus,
  Utensils,
  Car,
  FileText,
  ShoppingBag,
  Film,
  HeartPulse,
  Wallet,
  HelpCircle,
  Camera,
  Image,
  X
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  CategoryOption
} from '../types';

interface TransactionFormProps {
  onSave: (tx: Omit<Transaction, 'id'> & { id?: string }) => void;
  editingTransaction: Transaction | null;
  onCancelEdit: () => void;
  selectedMonth: string; // YYYY-MM to pre-fill the transaction date correctly
}

export default function TransactionForm({
  onSave,
  editingTransaction,
  onCancelEdit,
  selectedMonth
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Get current date formatted as YYYY-MM-DD
  const getTodayDateString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Sync state if editing a transaction
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(editingTransaction.amount.toString());
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description);
      setImageUrl(editingTransaction.imageUrl || '');
    } else {
      // Set default date matching the active month
      const today = getTodayDateString();
      if (today.startsWith(selectedMonth)) {
        setDate(today);
      } else {
        setDate(`${selectedMonth}-01`);
      }
      resetForm();
    }
  }, [editingTransaction, selectedMonth]);

  // Set default category when switching transaction types
  useEffect(() => {
    if (!editingTransaction) {
      const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      setCategory(activeCategories[0]?.name || '');
    }
  }, [type, editingTransaction]);

  const resetForm = () => {
    setAmount('');
    setDescription('');
    setImageUrl('');
    setError('');
    if (!editingTransaction) {
      const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
      setCategory(activeCategories[0]?.name || '');
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedAmount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Masukkan jumlah nominal uang yang valid (lebih besar dari 0)');
      return;
    }

    if (!category) {
      setError('Pilih salah satu kategori transaksi');
      return;
    }

    if (!date) {
      setError('Silakan pilih tanggal transaksi');
      return;
    }

    onSave({
      ...(editingTransaction ? { id: editingTransaction.id } : {}),
      type,
      amount: parsedAmount,
      category,
      date,
      description: description.trim() || `${type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Kategori ${category}`,
      imageUrl: imageUrl || undefined,
    });

    resetForm();
  };

  // Helper to format numeric input key-presses nicely
  const handleAmountChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, '');
    setAmount(digitsOnly);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB size limit
        setError('Ukuran gambar terlalu besar. Maksimal adalah 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const activeCategories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Render Category Icon dynamically
  const renderCategoryIcon = (iconName: string) => {
    const props = { className: 'w-4 h-4' };
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

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
      <div className="border-b border-slate-100 pb-3 mb-5">
        <h3 className="font-bold text-slate-800 text-sm font-sans">
          {editingTransaction ? 'Edit Catatan Transaksi' : 'Catat Transaksi Baru'}
        </h3>
        <p className="text-xs text-slate-400 font-sans mt-0.5">
          {editingTransaction 
            ? 'Ubah informasi detail transaksi yang telah tercatat' 
            : 'Masukkan data pemasukan atau pengeluaran harian Anda'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selection Tabs */}
        {!editingTransaction && (
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'expense'
                  ? 'bg-white text-rose-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                type === 'income'
                  ? 'bg-white text-emerald-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              Pemasukan
            </button>
          </div>
        )}

        {/* Display Badge if editing */}
        {editingTransaction && (
          <div className={`p-2 rounded-lg text-xs font-bold text-center border ${
            type === 'income' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}>
            Memperbarui {type === 'income' ? '🟢 PEMASUKAN' : '🔴 PENGELUARAN'}
          </div>
        )}

        {/* Nominal Amount Input */}
        <div>
          <label htmlFor="tx-amount" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 font-sans">
            Jumlah Nominal (Rupiah) <span className="text-rose-500">*</span>
          </label>
          <div className="relative rounded-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <span className="text-sm font-bold text-slate-400 font-mono">Rp</span>
            </div>
            <input
              id="tx-amount"
              type="text"
              required
              value={amount ? parseInt(amount, 10).toLocaleString('id-ID') : ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="Contoh: 50.000"
              className="block w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono font-bold text-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Dynamic Category Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">
            Pilih Kategori <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            {activeCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.name)}
                  className={`flex items-center gap-2 p-2.5 border rounded-xl text-left text-xs font-semibold transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 text-indigo-700'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  <span className={`p-1 rounded-md shrink-0 ${cat.color}`}>
                    {renderCategoryIcon(cat.icon)}
                  </span>
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Input */}
        <div>
          <label htmlFor="tx-date" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 font-sans">
            Tanggal Transaksi <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              id="tx-date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Notes/Description */}
        <div>
          <label htmlFor="tx-desc" className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 font-sans">
            Catatan / Keterangan
          </label>
          <input
            id="tx-desc"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contoh: Beli makan siang, bonus proyek..."
            className="block w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm font-medium placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          />
        </div>

        {/* Upload Gambar (Optional) */}
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 font-sans">
            Upload Gambar / Kuitansi (Opsional)
          </label>
          {imageUrl ? (
            <div className="relative rounded-xl border border-slate-200 p-2 bg-slate-50 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={imageUrl}
                  alt="Bukti transaksi"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-slate-700 block truncate">Gambar Bukti Transaksi</span>
                  <span className="text-[10px] text-emerald-600 font-semibold block">Gambar berhasil dimuat</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer animate-pulse"
                title="Hapus Gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-xl p-4 bg-slate-50/50 hover:bg-indigo-50/10 transition-all flex flex-col items-center justify-center text-center cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Camera className="w-6 h-6 text-slate-400 mb-1.5" />
              <p className="text-xs font-semibold text-slate-600">Klik atau seret gambar di sini</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Format: JPG, PNG, WEBP (Maksimal 2MB)</p>
            </div>
          )}
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-xl flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          {editingTransaction && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 py-2 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl text-xs transition-colors"
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className={`flex-1 py-2.5 px-4 font-bold rounded-xl text-xs text-white transition-all shadow-xs flex items-center justify-center gap-1.5 ${
              type === 'income'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-rose-500 hover:bg-rose-600'
            }`}
          >
            {editingTransaction ? 'Simpan Perubahan' : 'Catat Sekarang'}
          </button>
        </div>
      </form>
    </div>
  );
}
