import {useQuery} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {getCurrentMonth, getLast6Months} from '../utils/format';
import dayjs from 'dayjs';

export interface DashboardData {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  expenseByCategory: {name: string; amount: number; color: string}[];
  monthlyTrend: {month: string; income: number; expense: number}[];
}

const CHART_COLORS = [
  '#4F46E5', '#0EA5E9', '#22C55E', '#F59E0B', '#EF4444',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async (): Promise<DashboardData> => {
      const {start: monthStart, end: monthEnd} = getCurrentMonth();
      const {start: trendStart, end: trendEnd} = getLast6Months();

      // 1. Total balance from local accounts only
      const {data: balances} = await supabase
        .from('account_balances')
        .select('balance')
        .eq('type', 'local');

      const totalBalance = (balances || []).reduce(
        (sum, a) => sum + Number(a.balance),
        0,
      );

      // 2. This month's income and expenses (local accounts only)
      const {data: monthlyTx} = await supabase
        .from('transactions')
        .select('type, amount, account:accounts!inner(type)')
        .gte('date', monthStart)
        .lte('date', monthEnd)
        .eq('account.type', 'local');

      let monthlyIncome = 0;
      let monthlyExpense = 0;
      (monthlyTx || []).forEach((tx: any) => {
        if (tx.type === 'income') monthlyIncome += Number(tx.amount);
        else monthlyExpense += Number(tx.amount);
      });

      // 3. Expense by category (current month, local accounts)
      const {data: catExpenses} = await supabase
        .from('transactions')
        .select('amount, category:categories(name), account:accounts!inner(type)')
        .eq('type', 'expense')
        .eq('account.type', 'local')
        .gte('date', monthStart)
        .lte('date', monthEnd);

      const categoryMap = new Map<string, number>();
      (catExpenses || []).forEach((tx: any) => {
        const name = tx.category?.name || 'Other';
        categoryMap.set(name, (categoryMap.get(name) || 0) + Number(tx.amount));
      });

      const expenseByCategory = Array.from(categoryMap.entries())
        .map(([name, amount], i) => ({
          name,
          amount,
          color: CHART_COLORS[i % CHART_COLORS.length],
        }))
        .sort((a, b) => b.amount - a.amount);

      // 4. Monthly trend (last 6 months, local accounts)
      const {data: trendTx} = await supabase
        .from('transactions')
        .select('type, amount, date, account:accounts!inner(type)')
        .eq('account.type', 'local')
        .gte('date', trendStart)
        .lte('date', trendEnd);

      const trendMap = new Map<string, {income: number; expense: number}>();
      // Initialize all 6 months
      for (let i = 5; i >= 0; i--) {
        const key = dayjs().subtract(i, 'month').format('MMM YY');
        trendMap.set(key, {income: 0, expense: 0});
      }
      (trendTx || []).forEach((tx: any) => {
        const key = dayjs(tx.date).format('MMM YY');
        const entry = trendMap.get(key);
        if (entry) {
          if (tx.type === 'income') entry.income += Number(tx.amount);
          else entry.expense += Number(tx.amount);
        }
      });

      const monthlyTrend = Array.from(trendMap.entries()).map(
        ([month, data]) => ({month, ...data}),
      );

      return {
        totalBalance,
        monthlyIncome,
        monthlyExpense,
        expenseByCategory,
        monthlyTrend,
      };
    },
  });
}
