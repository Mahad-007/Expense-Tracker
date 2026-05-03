import {useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {CreateTransferInput} from '../types';
import {useAuth} from './useAuth';

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  const {user} = useAuth();

  return useMutation({
    mutationFn: async (input: CreateTransferInput) => {
      const {data, error} = await supabase
        .from('transfers')
        .insert({...input, created_by: user?.id})
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
