export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string; // format: YYYY-MM-DD
  description: string;
  imageUrl?: string; // Base64 Data URL for optional receipts/images
}

export interface CategoryBudget {
  category: string;
  limit: number;
}

export interface SalaryConfig {
  baseSalary: number;
  period: string; // format: YYYY-MM
}

export interface CategoryOption {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export const INCOME_CATEGORIES: CategoryOption[] = [
  { id: 'gaji', name: 'Gaji Pokok', color: 'bg-emerald-500 text-white', icon: 'Briefcase' },
  { id: 'bonus', name: 'Bonus & THR', color: 'bg-teal-500 text-white', icon: 'Sparkles' },
  { id: 'investasi_in', name: 'Investasi & Dividen', color: 'bg-cyan-500 text-white', icon: 'TrendingUp' },
  { id: 'sampingan', name: 'Proyek Sampingan', color: 'bg-indigo-500 text-white', icon: 'Laptop' },
  { id: 'lain_in', name: 'Lain-lain', color: 'bg-slate-500 text-white', icon: 'PlusCircle' },
];

export const EXPENSE_CATEGORIES: CategoryOption[] = [
  { id: 'makanan', name: 'Makanan & Minuman', color: 'bg-amber-500 text-white', icon: 'Utensils' },
  { id: 'transportasi', name: 'Transportasi', color: 'bg-blue-500 text-white', icon: 'Car' },
  { id: 'tagihan', name: 'Tagihan & Listrik', color: 'bg-red-500 text-white', icon: 'FileText' },
  { id: 'belanja', name: 'Belanja & Kebutuhan', color: 'bg-pink-500 text-white', icon: 'ShoppingBag' },
  { id: 'hiburan', name: 'Hiburan & Rekreasi', color: 'bg-purple-500 text-white', icon: 'Film' },
  { id: 'kesehatan', name: 'Kesehatan & Medis', color: 'bg-rose-500 text-white', icon: 'HeartPulse' },
  { id: 'tabungan', name: 'Investasi & Tabungan', color: 'bg-emerald-600 text-white', icon: 'Wallet' },
  { id: 'lain_out', name: 'Lain-lain', color: 'bg-slate-600 text-white', icon: 'HelpCircle' },
];
