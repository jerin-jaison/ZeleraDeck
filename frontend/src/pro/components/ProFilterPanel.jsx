import React from 'react';
import { X, Search } from 'lucide-react';

export default function ProFilterPanel({
  categories = [],
  filters,
  onChange,
  onClear,
  onClose,
  showMobileHeader = false,
}) {
  const handleCategoryClick = (catId) => {
    onChange('category', filters.category === catId ? '' : catId);
  };

  const handlePriceChange = (field, val) => {
    onChange(field, val);
  };

  return (
    <div className="flex flex-col gap-8 h-full">
      {/* Mobile Header with Close button */}
      {showMobileHeader && (
        <div className="flex justify-between items-center pb-4 border-b border-neutral-200">
          <h2 className="pro-label-caps text-lg">Filters</h2>
          <button onClick={onClose} aria-label="Close filters">
            <X className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      )}

      {/* Search Input */}
      <div>
        <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Search</h3>
        <div className="relative">
          <input
            type="text"
            placeholder="Type keyword..."
            value={filters.search || ''}
            onChange={(e) => onChange('search', e.target.value)}
            className="w-full bg-transparent border-0 border-b border-black text-black py-2 pr-8 focus:ring-0 focus:border-black placeholder:text-neutral-400 font-sans text-sm rounded-none"
          />
          <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        </div>
      </div>

      {/* Categories list */}
      <div>
        <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Categories</h3>
        <ul className="flex flex-col gap-2">
          {categories.map((cat) => {
            const isSelected = filters.category === cat.id;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`text-left text-sm py-1 font-sans transition-colors duration-200 hover:text-black w-full flex justify-between items-center ${
                    isSelected ? 'font-semibold text-black' : 'text-neutral-500'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded font-mono">
                    {cat.product_count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Price Range (₹)</h3>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={filters.min_price || ''}
            onChange={(e) => handlePriceChange('min_price', e.target.value)}
            className="w-full bg-transparent border border-neutral-300 py-1.5 px-3 focus:outline-none focus:border-black text-sm rounded-none"
          />
          <span className="text-neutral-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.max_price || ''}
            onChange={(e) => handlePriceChange('max_price', e.target.value)}
            className="w-full bg-transparent border border-neutral-300 py-1.5 px-3 focus:outline-none focus:border-black text-sm rounded-none"
          />
        </div>
      </div>

      {/* Availability Toggle */}
      <div>
        <h3 className="pro-label-caps text-xs text-neutral-400 mb-3">Availability</h3>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.in_stock === 'true'}
            onChange={(e) => onChange('in_stock', e.target.checked ? 'true' : '')}
            className="rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
          />
          <span className="text-sm font-sans text-neutral-600">In Stock Only</span>
        </label>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={onClear}
        className="w-full py-3 border border-neutral-300 hover:border-black transition-colors duration-200 text-xs pro-label-caps bg-transparent text-black"
      >
        Clear All
      </button>
    </div>
  );
}
