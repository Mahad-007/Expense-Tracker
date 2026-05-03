import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {Transaction, CreateTransactionInput} from '../types';
import {useAuth} from './useAuth';

interface TransactionFilters {
  accountId?: string;
  type?: 'income' | 'expense';
  recurrence?: 'one-time' | 'recurring';
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export function useTransactions(filters: TransactionFilters = {}) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async (): Promise<Transaction[]> => {
      let query = supabase
        .from('transactions')
        .select('*, category:categories(*), account:accounts(*)')
        .order('date', {ascending: false})
        .order('created_at', {ascending: false});

      if (filters.accountId) {
        query = query.eq('account_id', filters.accountId);
      }
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.recurrence) {
        query = query.eq('recurrence', filters.recurrence);
      }
      if (filters.startDate) {
        query = query.gte('date', filters.startDate);
      }
      if (filters.endDate) {
        query = query.lte('date', filters.endDate);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const {data, error} = await query;
      if (error) throw error;
      return data as Transaction[];
    },
  });
}

export function useCreateTransaction() {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      // Get account currency and balance
      const {data: account} = await supabase
        .from('account_balances')
        .select('currency, balance')
        .eq('id', input.account_id)
        .single();

      if (!account) throw new Error('Account not found');

      // Validate: can't expense more than available balance
      if (input.type === 'expense' && input.amount > account.balance) {
        throw new Error(
          `Insufficient balance. Available: ${account.balance.toFixed(2)} ${account.currency}`,
        );
      }

      const {data, error} = await supabase
        .from('transactions')
        .insert({
          ...input,
          currency: account.currency || 'PKR',
          created_by: user?.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['transactions']});
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}

export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const {error} = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['transactions']});
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}
