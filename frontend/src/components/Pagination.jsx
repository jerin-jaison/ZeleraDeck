import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}

export default function Pagination({ currentPage, totalPages, totalItems, pageSize, onPageChange, isLoading }) {
  if (totalPages <= 1) return null

  const start = (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)
  const pages = getPageRange(currentPage, totalPages)

  return (
    <div className="flex items-center justify-between mt-6 px-1">
      <p className="text-xs text-[#737373]">
        Showing {start}–{end} of {totalItems}
      </p>

      <div className="flex items-center gap-1.5">
        {/* Previous */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E5E5E5] bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8F8] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page pills */}
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm text-[#A3A3A3]">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={isLoading}
              className={`w-9 h-9 rounded-xl text-sm transition-colors ${
                p === currentPage
                  ? 'bg-[#0A0A0A] text-white font-medium'
                  : 'bg-white border border-[#E5E5E5] text-[#737373] hover:bg-[#F8F8F8]'
              }`}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="w-9 h-9 rounded-xl flex items-center justify-center border border-[#E5E5E5] bg-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#F8F8F8] transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
