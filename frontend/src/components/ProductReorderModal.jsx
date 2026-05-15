import { useState, useEffect } from 'react'
import { X, GripVertical, Package } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

// ── Single sortable card ───────────────────────────────────────────────────────
function SortableCard({ product, index }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: product.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 bg-white rounded-xl border transition-all ${
        isDragging
          ? 'border-[#C9A84C] shadow-lg scale-[1.02] opacity-90'
          : 'border-[#F0F0F0] shadow-sm'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#A3A3A3] cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      {/* Order badge */}
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#F0F0F0] text-[#0A0A0A] text-xs font-bold flex items-center justify-center">
        {index + 1}
      </span>

      {/* Thumbnail */}
      {product.image_url ? (
        <img
          src={product.image_url}
          alt={product.name}
          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-[#F0F0F0]"
          draggable={false}
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-[#F8F8F8] flex items-center justify-center flex-shrink-0">
          <Package className="w-5 h-5 text-[#D4D4D4]" />
        </div>
      )}

      {/* Name + ID */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#0A0A0A] truncate">{product.name}</p>
        <p className="text-xs text-[#A3A3A3] font-mono">{product.display_id}</p>
      </div>

      {/* Price */}
      <span className="flex-shrink-0 text-sm font-bold text-[#0A0A0A]">
        ₹{Number(product.price).toLocaleString('en-IN')}
      </span>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────
export default function ProductReorderModal({ isOpen, onClose, onSaved }) {
  const showToast = useToast()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  )

  // Fetch ALL products (no pagination for reorder — max 200)
  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    api.get('shop/products/?page_size=200')
      .then(r => setItems(r.data.products ?? []))
      .catch(() => showToast('Failed to load products', 'error'))
      .finally(() => setLoading(false))
  }, [isOpen])

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      setItems((prev) => {
        const oldIndex = prev.findIndex((p) => p.id === active.id)
        const newIndex = prev.findIndex((p) => p.id === over.id)
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api.patch('shop/products/reorder/', {
        order: items.map((p, i) => ({ id: p.id, display_order: i })),
      })
      showToast('Product order updated! Changes are live in your store.')
      onSaved()
      onClose()
    } catch (err) {
      showToast(err?.response?.data?.error || 'Failed to save order', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 flex flex-col justify-end">
      <div
        className="bg-[#F8F8F8] rounded-t-3xl max-h-[92vh] flex flex-col max-w-md mx-auto w-full"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-[#0A0A0A] flex items-center gap-2">
              Arrange Products <span className="text-amber-500">⚡</span>
            </h2>
            <p className="text-xs text-[#737373] mt-0.5">
              Drag to reorder. Saved changes reflect in your store instantly.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F0F0F0] flex items-center justify-center"
          >
            <X className="w-4 h-4 text-[#737373]" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#F0F0F0] mx-5" />

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 skeleton rounded-xl" />
            ))
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Package className="w-12 h-12 text-[#D4D4D4]" />
              <p className="text-sm text-[#737373] mt-3">Add products first to arrange them.</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {items.map((product, index) => (
                  <SortableCard key={product.id} product={product} index={index} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        {!loading && items.length > 0 && (
          <div className="px-4 pt-3 pb-6 flex-shrink-0 border-t border-[#F0F0F0] space-y-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#25D366] text-white rounded-xl py-4 font-semibold text-sm disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Order'
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full text-sm text-[#737373] py-2"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
