import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/axios';

export function useProProducts(slug, params = {}) {
  const { search, category, min_price, max_price, in_stock, sort, page } = params;

  return useQuery({
    queryKey: ['pro-products', slug, { search, category, min_price, max_price, in_stock, sort, page }],
    queryFn: async () => {
      if (!slug) throw new Error('Store slug is required');

      const queryParams = new URLSearchParams();
      if (search) queryParams.set('search', search);
      if (category) queryParams.set('category', category);
      if (min_price) queryParams.set('min_price', min_price);
      if (max_price) queryParams.set('max_price', max_price);
      if (in_stock !== undefined) queryParams.set('in_stock', in_stock);
      if (sort) queryParams.set('sort', sort);
      if (page) queryParams.set('page', page);

      const response = await publicApi.get(`pro/${slug}/products/?${queryParams.toString()}`);
      return response.data;
    },
    enabled: !!slug,
    staleTime: 30 * 1000,
  });
}
