import React, { useState, useEffect } from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Grid } from 'lucide-react';
import { useProProducts } from './hooks/useProProducts';
import ProProductCard from './components/ProProductCard';
import ProFilterPanel from './components/ProFilterPanel';
import SEOHead from '../components/SEOHead';
import Pagination from '../components/Pagination';

export default function ProShopPage() {
  const { storeData, slug } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const shopName = storeData?.shop?.name || 'AESTHETE';

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Read filter params from URL Search Params
  const filters = {
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    in_stock: searchParams.get('in_stock') || '',
    sort: searchParams.get('sort') || 'display_order',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const { data: productsData, isLoading, isFetching } = useProProducts(slug, filters);

  const categories = storeData?.categories || [];
  const products = productsData?.results || [];
  const totalPages = productsData?.num_pages || 1;
  const currentPage = productsData?.page || 1;

  // Update query params function
  const updateFilter = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Reset page on search or category filter change
    if (key !== 'page') {
      newParams.set('page', '1');
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams(new URLSearchParams({ sort: 'display_order', page: '1' }));
  };

  return (
    <div className="bg-[var(--pro-background)] py-12">
      <SEOHead 
        title={`Shop Curation — ${shopName}`} 
        description={`Browse our premium catalog of clothing, items, and objects curated by ${shopName}.`}
        url={window.location.href}
      />

      <div className="max-w-7xl mx-auto px-5 md:px-16">
        
        {/* Header Title Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-neutral-200/50 pb-8 mb-10 gap-4">
          <div>
            <h1 className="pro-headline-xl mb-2">Our Collection</h1>
            <p className="pro-body-md text-neutral-400 font-sans">
              Showing {products.length} products
            </p>
          </div>

          {/* Action Row */}
          <div className="flex items-center gap-4 self-end w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="md:hidden flex items-center gap-2 border border-black px-4 py-2 text-xs pro-label-caps"
            >
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="pro-label-caps text-xs text-neutral-400 font-sans">Sort By:</span>
              <select
                value={filters.sort}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="bg-transparent border-0 border-b border-black text-xs pro-label-caps py-1 pr-6 focus:ring-0 focus:border-black rounded-none cursor-pointer"
              >
                <option value="display_order">Default</option>
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex gap-10">
          
          {/* Desktop Filter Panel (Sidebar) */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-28">
              <ProFilterPanel
                categories={categories}
                filters={filters}
                onChange={updateFilter}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Product Cards Grid Area */}
          <div className="flex-grow">
            {isLoading || isFetching ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-neutral-200 aspect-[3/4] mb-4"></div>
                    <div className="h-4 bg-neutral-200 w-2/3 mb-2"></div>
                    <div className="h-4 bg-neutral-200 w-1/4"></div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-neutral-50 border border-neutral-100">
                <p className="pro-headline-sm text-neutral-400 mb-2">No products found</p>
                <p className="pro-body-md text-neutral-400 mb-6">Try adjusting your filters or clearing search search terms.</p>
                <button
                  onClick={clearFilters}
                  className="pro-btn-outline"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((prod) => (
                    <ProProductCard key={prod.display_id} product={prod} slug={slug} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center border-t border-neutral-200/50 pt-8">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      totalItems={productsData?.count || 0}
                      pageSize={24}
                      onPageChange={(page) => updateFilter('page', page)}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 flex justify-end">
          <div className="w-80 max-w-[85vw] bg-white h-full p-6 overflow-y-auto animate-slide-in">
            <ProFilterPanel
              categories={categories}
              filters={filters}
              onChange={updateFilter}
              onClear={clearFilters}
              onClose={() => setMobileFiltersOpen(false)}
              showMobileHeader={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
