import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {AccountWithBalance, CreateAccountInput} from '../types';
import {useAuth} from './useAuth';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: async (): Promise<AccountWithBalance[]> => {
      const {data, error} = await supabase
        .from('account_balances')
        .select('*')
        .order('created_at', {ascending: true});
      if (error) throw error;
      return data as AccountWithBalance[];
    },
  });
}

export function useLocalAccounts() {
  return useQuery({
    queryKey: ['accounts', 'local'],
    queryFn: async (): Promise<AccountWithBalance[]> => {
      const {data, error} = await supabase
        .from('account_balances')
        .select('*')
        .eq('type', 'local')
        .order('created_at', {ascending: true});
      if (error) throw error;
      return data as AccountWithBalance[];
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (input: CreateAccountInput) => {
      const {data, error} = await supabase
        .from('accounts')
        .insert({...input, created_by: user?.id})
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['accounts']});
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (accountId: string) => {
      // Delete all transactions for this account first
      const {error: txError} = await supabase
        .from('transactions')
        .delete()
        .eq('account_id', accountId);
      if (txError) throw txError;

      // Delete the account
      const {error} = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['accounts']});
      queryClient.invalidateQueries({queryKey: ['transactions']});
      queryClient.invalidateQueries({queryKey: ['dashboard']});
    },
  });
}
