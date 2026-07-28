import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/axios';

export function useProProduct(slug, displayId) {
  return useQuery({
    queryKey: ['pro-product', slug, displayId],
    queryFn: async () => {
      if (!slug || !displayId) throw new Error('Store slug and product display ID are required');
      const response = await publicApi.get(`pro/${slug}/products/${displayId}/`);
      return response.data;
    },
    enabled: !!slug && !!displayId,
    staleTime: 60 * 1000,
  });
}
