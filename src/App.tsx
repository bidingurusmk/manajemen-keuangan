import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  History,
  Settings,
  PieChart,
  PlusCircle,
  HelpCircle,
  Sparkles,
  RefreshCw,
  Info,
  Cloud,
  CloudLightning,
  CloudOff,
  Loader2
} from 'lucide-react';
import { Transaction, CategoryBudget } from './types';
import { getInitialTransactions, getInitialBudgets, formatRupiah, formatMonthName } from './utils';
import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import CategoryBudgets from './components/CategoryBudgets';
import TransactionList from './components/TransactionList';

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');

  // Keep track of the active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'budgets' | 'history'>('dashboard');
  
  // Set default selected month to July 2026 matching our initial mock data
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-07');

  // Track transaction currently being edited
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load transactions and budgets from Firestore in real-time
  useEffect(() => {
    setDbStatus('connecting');
    const unsubscribeTxs = onSnapshot(
      collection(db, 'transactions'),
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore is empty, seed it with initial defaults
          try {
            const initialTxs = getInitialTransactions();
            for (const tx of initialTxs) {
              await setDoc(doc(db, 'transactions', tx.id), tx);
            }
          } catch (err) {
            console.error("Gagal menyemai transaksi awal:", err);
          }
        } else {
          const list: Transaction[] = [];
          snapshot.forEach((docSnap) => {
            list.push({ id: docSnap.id, ...docSnap.data() } as Transaction);
          });
          setTransactions(list);
          setDbStatus('connected');
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Firestore transactions sync error:", err);
        setDbStatus('error');
        setIsLoading(false);
      }
    );

    const unsubscribeBudgets = onSnapshot(
      collection(db, 'budgets'),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed budgets
          try {
            const initialBudgets = getInitialBudgets();
            for (const b of initialBudgets) {
              await setDoc(doc(db, 'budgets', b.category), b);
            }
          } catch (err) {
            console.error("Gagal menyemai budget awal:", err);
          }
        } else {
          const list: CategoryBudget[] = [];
          snapshot.forEach((docSnap) => {
            list.push(docSnap.data() as CategoryBudget);
          });
          setBudgets(list);
        }
      },
      (err) => {
        console.error("Firestore budgets sync error:", err);
      }
    );

    return () => {
      unsubscribeTxs();
      unsubscribeBudgets();
    };
  }, []);

  // Extract all distinct months (YYYY-MM) available in current transactions to populate select dropdown
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    // Guarantee that the current active months (2026-07, 2026-06) are always present
    months.add('2026-07');
    months.add('2026-06');
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        months.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  // Handle adding or editing a transaction
  const handleSaveTransaction = async (savedTx: Omit<Transaction, 'id'> & { id?: string }) => {
    try {
      const id = savedTx.id || `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const txData = {
        ...savedTx,
        id,
      };
      await setDoc(doc(db, 'transactions', id), txData);
      setEditingTransaction(null);
      // Automatically switch to dashboard view after saving
      setActiveTab('dashboard');
    } catch (err) {
      console.error("Gagal menyimpan transaksi ke Firestore:", err);
      alert("Gagal menyimpan data ke database cloud. Silakan coba lagi.");
    }
  };

  // Handle deleting a transaction
  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'transactions', id));
      if (editingTransaction?.id === id) {
        setEditingTransaction(null);
      }
    } catch (err) {
      console.error("Gagal menghapus transaksi dari Firestore:", err);
      alert("Gagal menghapus data dari database cloud.");
    }
  };

  // Enter edit mode
  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setActiveTab('transactions');
  };

  // Handle saving customized category budget
  const handleSaveBudget = async (category: string, limit: number) => {
    try {
      await setDoc(doc(db, 'budgets', category), { category, limit });
    } catch (err) {
      console.error("Gagal menyimpan limit anggaran ke Firestore:", err);
      alert("Gagal memperbarui anggaran ke database cloud.");
    }
  };

  // Clear data back to mock defaults
  const handleResetToDefaults = async () => {
    if (window.confirm('Apakah Anda yakin ingin meriset semua data keuangan kembali ke contoh bawaan di database cloud?')) {
      try {
        setDbStatus('connecting');
        setIsLoading(true);
        // Delete all current transactions
        const txSnap = await getDocs(collection(db, 'transactions'));
        for (const docSnap of txSnap.docs) {
          await deleteDoc(doc(db, 'transactions', docSnap.id));
        }
        // Delete all budgets
        const bSnap = await getDocs(collection(db, 'budgets'));
        for (const docSnap of bSnap.docs) {
          await deleteDoc(doc(db, 'budgets', docSnap.id));
        }

        // Re-seed transactions
        const initialTxs = getInitialTransactions();
        for (const tx of initialTxs) {
          await setDoc(doc(db, 'transactions', tx.id), tx);
        }

        // Re-seed budgets
        const initialBudgets = getInitialBudgets();
        for (const b of initialBudgets) {
          await setDoc(doc(db, 'budgets', b.category), b);
        }

        setSelectedMonth('2026-07');
        setActiveTab('dashboard');
        setEditingTransaction(null);
        setDbStatus('connected');
        setIsLoading(false);
      } catch (err) {
        console.error("Gagal meriset data:", err);
        setDbStatus('error');
        setIsLoading(false);
      }
    }
  };

  // Calculate current month's dynamic summary in the header banner
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((tx) => tx.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return currentMonthTransactions
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentMonthTransactions]);

  const totalExpense = useMemo(() => {
    return currentMonthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [currentMonthTransactions]);

  const netSavings = totalIncome - totalExpense;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Upper Navigation Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-black tracking-tight text-slate-800 uppercase font-sans">
                Manajemen Keuangan Gaji
              </h1>
              <span className="text-[10px] sm:text-xs text-slate-400 block font-semibold leading-none">
                Pencatat & Pelapor Otomatis
              </span>
            </div>
          </div>

          {/* User Email Info / Default Branding */}
          <div className="flex items-center gap-4">
            {/* Database Connection Status badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-bold">
              {dbStatus === 'connecting' && (
                <>
                  <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
                  <span className="text-amber-600 hidden xs:inline">Sinkronisasi Cloud...</span>
                </>
              )}
              {dbStatus === 'connected' && (
                <>
                  <Cloud className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 hidden xs:inline">Database Terhubung</span>
                </>
              )}
              {dbStatus === 'error' && (
                <>
                  <CloudOff className="w-3 h-3 text-red-500" />
                  <span className="text-red-600 hidden xs:inline">Database Offline</span>
                </>
              )}
            </div>

            <div className="hidden md:block text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Akun Aktif</span>
              <span className="text-xs font-semibold text-slate-600">zainul@smktelkom-mlg.sch.id</span>
            </div>
            <button
              onClick={handleResetToDefaults}
              className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
              title="Reset ke Contoh Bawaan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Hero Welcome Banner */}
      <section className="bg-white border-b border-slate-100 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Ringkasan Saldo Berjalan</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight font-sans">
                Selamat Datang, Zainul
              </h2>
              <p className="text-slate-500 text-sm max-w-xl">
                Pantau sisa pendapatan Anda bulan ini secara efisien. Catat setiap pengeluaran untuk menghindari deficit anggaran.
              </p>
            </div>

            {/* Quick Header Widget Panel */}
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 min-w-[280px]">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Sisa Saldo ({formatMonthName(selectedMonth)})
                </span>
                <span className={`text-xl font-extrabold tracking-tight font-mono ${netSavings >= 0 ? 'text-indigo-600' : 'text-rose-500'}`}>
                  {formatRupiah(netSavings)}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-semibold">
                  <span>Pemasukan:</span>
                  <span className="text-emerald-600">{formatRupiah(totalIncome)}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Main Multi-Tab Navigation Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col gap-6">
        
        {/* Core Tab Selector Menu */}
        <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-px">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-3 px-4 flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Dashboard Visual
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-4 flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'transactions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {editingTransaction ? 'Edit Catatan' : 'Catat Transaksi'}
          </button>

          <button
            onClick={() => setActiveTab('budgets')}
            className={`py-3 px-4 flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'budgets'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <Settings className="w-4 h-4" />
            Alokasi Anggaran
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`py-3 px-4 flex items-center gap-2 text-xs sm:text-sm font-bold border-b-2 transition-all shrink-0 cursor-pointer ${
              activeTab === 'history'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <History className="w-4 h-4" />
            Riwayat Lengkap
          </button>
        </div>

        {/* Tab Views Render Stage */}
        <main className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 font-sans gap-3 bg-white rounded-2xl border border-slate-100 shadow-xs">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <div className="text-center">
                <p className="font-semibold text-sm text-slate-700">Sinkronisasi Database Cloud</p>
                <p className="text-xs text-slate-400 mt-0.5">Memuat catatan keuangan terbaru Anda secara aman...</p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + selectedMonth}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
                className="h-full"
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    transactions={transactions}
                    budgets={budgets}
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    availableMonths={availableMonths}
                  />
                )}

                {activeTab === 'transactions' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <TransactionForm
                        onSave={handleSaveTransaction}
                        editingTransaction={editingTransaction}
                        onCancelEdit={() => {
                          setEditingTransaction(null);
                          setActiveTab('dashboard');
                        }}
                        selectedMonth={selectedMonth}
                      />
                    </div>
                    
                    {/* Sidebar Tip Card */}
                    <div className="space-y-4">
                      <div className="bg-indigo-900 text-indigo-100 p-6 rounded-2xl shadow-xs relative overflow-hidden">
                        <div className="relative z-10 space-y-3">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest bg-indigo-800 text-indigo-200 px-2 py-0.5 rounded-md">
                            Tips Cerdas Keuangan
                          </span>
                          <h4 className="font-bold text-sm font-sans">Formula Budgeting 50/30/20</h4>
                          <p className="text-xs text-indigo-200 leading-relaxed">
                            Alokasikan pendapatan bulanan Anda dengan rasio seimbang:
                          </p>
                          <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between border-b border-indigo-800 pb-1">
                              <span>🏠 Kebutuhan Pokok (Sewa, Tagihan)</span>
                              <span className="font-bold">50%</span>
                            </div>
                            <div className="flex justify-between border-b border-indigo-800 pb-1">
                              <span>🛍️ Keinginan Pribadi (Hiburan, Kopi)</span>
                              <span className="font-bold">30%</span>
                            </div>
                            <div className="flex justify-between">
                              <span>📈 Tabungan & Investasi</span>
                              <span className="font-bold">20%</span>
                            </div>
                          </div>
                        </div>
                        <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
                          <Wallet className="w-40 h-40" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'budgets' && (
                  <CategoryBudgets
                    budgets={budgets}
                    onSaveBudget={handleSaveBudget}
                    transactions={transactions}
                    selectedMonth={selectedMonth}
                  />
                )}

                {activeTab === 'history' && (
                  <TransactionList
                    transactions={transactions}
                    onEdit={handleEditTransaction}
                    onDelete={handleDeleteTransaction}
                    selectedMonth={selectedMonth}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </main>

      </div>

      {/* Footer Branding Area */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="text-xs text-slate-400 font-semibold font-sans">
            Manajemen Keuangan Gaji © 2026. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <p className="text-[10px] text-slate-400 font-sans max-w-md mx-auto">
            Aplikasi ini mendata pengeluaran secara real-time dan aman langsung ke database cloud Firestore Anda untuk kemudahan akses.
          </p>
        </div>
      </footer>

    </div>
  );
}
