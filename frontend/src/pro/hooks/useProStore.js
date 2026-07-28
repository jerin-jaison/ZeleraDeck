import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/axios';

export function useProStore(slug) {
  return useQuery({
    queryKey: ['pro-store', slug],
    queryFn: async () => {
      if (!slug) throw new Error('Store slug is required');
      const response = await publicApi.get(`pro/${slug}/`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 60 * 1000,
  });
}
