import { Transaction, CategoryBudget } from './types';

// Format number to Rupiah
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Convert month string (e.g., "2026-07") to Indonesian readable month
export function formatMonthName(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const monthIdx = parseInt(month, 10) - 1;
  return `${months[monthIdx] || ''} ${year}`;
}

// Format standard ISO date string to Indonesian readable date
export function formatIndoDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const day = date.getDate();
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
}

// Generate default mock data based on the current local time (2026-07)
export function getInitialTransactions(): Transaction[] {
  const currentYear = 2026;
  const currentMonth = '07';
  const prevMonth = '06';

  const formatDay = (m: string, d: number) => {
    const dayStr = d < 10 ? `0${d}` : `${d}`;
    return `${currentYear}-${m}-${dayStr}`;
  };

  return [
    // Current Month (July 2026)
    {
      id: 'tx-curr-inc-1',
      type: 'income',
      amount: 7500000,
      category: 'Gaji Pokok',
      date: formatDay(currentMonth, 1),
      description: 'Gaji Bulanan Utama PT Teknologi Jaya',
    },
    {
      id: 'tx-curr-inc-2',
      type: 'income',
      amount: 1200000,
      category: 'Proyek Sampingan',
      date: formatDay(currentMonth, 12),
      description: 'Pembuatan Landing Page Freelance',
    },
    {
      id: 'tx-curr-exp-1',
      type: 'expense',
      amount: 1800000,
      category: 'Tagihan & Listrik',
      date: formatDay(currentMonth, 2),
      description: 'Bayar Sewa Kos Bulanan',
    },
    {
      id: 'tx-curr-exp-2',
      type: 'expense',
      amount: 450000,
      category: 'Tagihan & Listrik',
      date: formatDay(currentMonth, 5),
      description: 'Listrik Pintar & Tagihan Air',
    },
    {
      id: 'tx-curr-exp-3',
      type: 'expense',
      amount: 1200000,
      category: 'Belanja & Kebutuhan',
      date: formatDay(currentMonth, 3),
      description: 'Belanja Sembako & Bulanan Carrefour',
    },
    {
      id: 'tx-curr-exp-4',
      type: 'expense',
      amount: 1500000,
      category: 'Investasi & Tabungan',
      date: formatDay(currentMonth, 4),
      description: 'Top up Reksadana Saham & Emas',
    },
    {
      id: 'tx-curr-exp-5',
      type: 'expense',
      amount: 250000,
      category: 'Makanan & Minuman',
      date: formatDay(currentMonth, 6),
      description: 'Makan Malam Weekend Bersama Keluarga',
    },
    {
      id: 'tx-curr-exp-6',
      type: 'expense',
      amount: 180000,
      category: 'Transportasi',
      date: formatDay(currentMonth, 8),
      description: 'Pengisian Saldo e-Toll & Bensin Pertamax',
    },
    {
      id: 'tx-curr-exp-7',
      type: 'expense',
      amount: 125000,
      category: 'Kesehatan & Medis',
      date: formatDay(currentMonth, 10),
      description: 'Beli Vitamin C & Suplemen Kesehatan',
    },
    {
      id: 'tx-curr-exp-8',
      type: 'expense',
      amount: 250000,
      category: 'Hiburan & Rekreasi',
      date: formatDay(currentMonth, 15),
      description: 'Nonton Bioskop & Langganan Netflix',
    },
    {
      id: 'tx-curr-exp-9',
      type: 'expense',
      amount: 65000,
      category: 'Makanan & Minuman',
      date: formatDay(currentMonth, 16),
      description: 'Makan Siang Nasi Padang Sederhana',
    },

    // Previous Month (June 2026) for comparison/trends
    {
      id: 'tx-prev-inc-1',
      type: 'income',
      amount: 7500000,
      category: 'Gaji Pokok',
      date: formatDay(prevMonth, 1),
      description: 'Gaji Bulanan Utama PT Teknologi Jaya',
    },
    {
      id: 'tx-prev-inc-2',
      type: 'income',
      amount: 850000,
      category: 'Bonus & THR',
      date: formatDay(prevMonth, 20),
      description: 'Bonus Pencapaian Kuartal',
    },
    {
      id: 'tx-prev-exp-1',
      type: 'expense',
      amount: 1800000,
      category: 'Tagihan & Listrik',
      date: formatDay(prevMonth, 2),
      description: 'Bayar Sewa Kos Bulanan',
    },
    {
      id: 'tx-prev-exp-2',
      type: 'expense',
      amount: 1000000,
      category: 'Belanja & Kebutuhan',
      date: formatDay(prevMonth, 3),
      description: 'Belanja Kebutuhan Bulanan',
    },
    {
      id: 'tx-prev-exp-3',
      type: 'expense',
      amount: 2000000,
      category: 'Investasi & Tabungan',
      date: formatDay(prevMonth, 5),
      description: 'Investasi Obligasi SBN',
    },
    {
      id: 'tx-prev-exp-4',
      type: 'expense',
      amount: 650000,
      category: 'Makanan & Minuman',
      date: formatDay(prevMonth, 10),
      description: 'Kulineran & Pesan GoFood Mingguan',
    },
    {
      id: 'tx-prev-exp-5',
      type: 'expense',
      amount: 300000,
      category: 'Transportasi',
      date: formatDay(prevMonth, 7),
      description: 'Servis Rutin Motor & Ganti Oli',
    },
    {
      id: 'tx-prev-exp-6',
      type: 'expense',
      amount: 150000,
      category: 'Hiburan & Rekreasi',
      date: formatDay(prevMonth, 22),
      description: 'Tiket Konser Indie Lokal',
    }
  ];
}

export function getInitialBudgets(): CategoryBudget[] {
  return [
    { category: 'Makanan & Minuman', limit: 1200000 },
    { category: 'Transportasi', limit: 500000 },
    { category: 'Tagihan & Listrik', limit: 2500000 },
    { category: 'Belanja & Kebutuhan', limit: 1500000 },
    { category: 'Hiburan & Rekreasi', limit: 500000 },
    { category: 'Kesehatan & Medis', limit: 500000 },
    { category: 'Investasi & Tabungan', limit: 2000000 },
    { category: 'Lain-lain', limit: 500000 },
  ];
}
