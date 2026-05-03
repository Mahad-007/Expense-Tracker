import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {supabase} from '../lib/supabase';
import {Category} from '../types';

export function useCategories(type?: 'income' | 'expense') {
  return useQuery({
    queryKey: ['categories', type],
    queryFn: async (): Promise<Category[]> => {
      let query = supabase.from('categories').select('*').order('name');
      if (type) {
        query = query.eq('type', type);
      }
      const {data, error} = await query;
      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {name: string; type: 'income' | 'expense'}) => {
      const {data, error} = await supabase
        .from('categories')
        .insert({name: input.name, type: input.type})
        .select()
        .single();
      if (error) throw error;
      return data as Category;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['categories']});
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const {error} = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['categories']});
    },
  });
}
