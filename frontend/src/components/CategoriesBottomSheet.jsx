import { useState, useEffect, useRef } from 'react'
import { X, Pencil, Trash2, Check, Tag } from 'lucide-react'
import api from '../api/axios'
import { useToast } from '../context/ToastContext'

export default function CategoriesBottomSheet({ isOpen, onClose }) {
  const showToast = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editError, setEditError] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const editInputRef = useRef()
  const addInputRef = useRef()

  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      setNewName('')
      setAddError('')
      setEditingId(null)
      setDeletingId(null)
    }
  }, [isOpen])

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const r = await api.get('shop/categories/')
      setCategories(r.data)
    } catch {
      showToast('Failed to load categories', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setAddError('Category name cannot be empty')
      return
    }
    setAdding(true)
    setAddError('')
    try {
      const r = await api.post('shop/categories/', { name: trimmed })
      setCategories((prev) => [...prev, r.data].sort((a, b) => a.name.localeCompare(b.name)))
      setNewName('')
      showToast('Category added')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to add'
      setAddError(msg)
    } finally {
      setAdding(false)
    }
  }

  const handleEdit = async (cat) => {
    const trimmed = editName.trim()
    if (!trimmed) return
    setEditError('')
    try {
      const r = await api.patch(`shop/categories/${cat.id}/`, { name: trimmed })
      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? r.data : c)).sort((a, b) => a.name.localeCompare(b.name))
      )
      setEditingId(null)
      showToast('Renamed')
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to rename'
      setEditError(msg)
    }
  }

  const handleDelete = async (cat) => {
    setDeleteLoading(true)
    try {
      await api.delete(`shop/categories/${cat.id}/`)
      setCategories((prev) => prev.filter((c) => c.id !== cat.id))
      setDeletingId(null)
      if (cat.product_count > 0) {
        showToast(`${cat.product_count} products are now uncategorized`)
      } else {
        showToast('Category deleted')
      }
    } catch {
      showToast('Failed to delete', 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[199]"
        onClick={onClose}
        style={{ animation: 'fadeIn 0.15s ease-out' }}
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[200] bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto max-w-md mx-auto"
        style={{ animation: 'slideUp 0.25s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-[#F0F0F0] z-10">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-[#0A0A0A]">My Categories</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-[#F8F8F8] flex items-center justify-center"
            >
              <X className="w-4 h-4 text-[#737373]" />
            </button>
          </div>
        </div>

        {/* Add New Category */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            <input
              ref={addInputRef}
              type="text"
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setAddError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Sarees, Fiction, Hardware..."
              maxLength={80}
              className="flex-1 border border-[#E5E5E5] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0A0A]"
            />
            <button
              onClick={handleAdd}
              disabled={adding}
              className="bg-[#0A0A0A] text-white rounded-xl px-4 py-3 text-sm font-medium min-w-[60px] disabled:opacity-50 flex items-center justify-center"
            >
              {adding ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Add'
              )}
            </button>
          </div>
          {addError && (
            <p className="text-xs text-[#EF4444] mt-1.5">{addError}</p>
          )}
        </div>

        {/* Categories List */}
        <div className="px-6 pb-6 mt-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 skeleton rounded-xl" />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="w-10 h-10 text-[#D4D4D4] mx-auto" />
              <p className="text-sm font-semibold mt-3">No categories yet</p>
              <p className="text-xs text-[#737373] mt-1">Add your first category above</p>
            </div>
          ) : (
            categories.map((cat) => (
              <div key={cat.id}>
                {deletingId === cat.id ? (
                  /* Delete confirmation */
                  <div className="bg-[#FEE2E2] rounded-xl p-3 my-1" style={{ animation: 'fadeIn 0.15s ease-out' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-[#991B1B]">
                          Delete '{cat.name}'?
                        </p>
                        {cat.product_count > 0 && (
                          <p className="text-[10px] text-[#991B1B] mt-0.5">
                            {cat.product_count} product{cat.product_count !== 1 ? 's' : ''} will become uncategorized
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="text-xs text-[#737373] underline"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          disabled={deleteLoading}
                          className="bg-[#EF4444] text-white text-xs rounded-lg px-3 py-1.5 disabled:opacity-50"
                        >
                          {deleteLoading ? '...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal row */
                  <div className="flex items-center gap-3 py-3 border-b border-[#F8F8F8] last:border-0">
                    {editingId === cat.id ? (
                      /* Edit mode */
                      <>
                        <div className="flex-1">
                          <input
                            ref={editInputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => { setEditName(e.target.value); setEditError('') }}
                            onKeyDown={(e) => e.key === 'Enter' && handleEdit(cat)}
                            maxLength={80}
                            className="w-full border border-[#0A0A0A] rounded-xl px-3 py-2 text-sm focus:outline-none"
                          />
                          {editError && (
                            <p className="text-xs text-[#EF4444] mt-1">{editError}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(cat)}
                            className="w-8 h-8 rounded-xl bg-[#0A0A0A] flex items-center justify-center"
                          >
                            <Check className="w-3.5 h-3.5 text-white" />
                          </button>
                          <button
                            onClick={() => { setEditingId(null); setEditError('') }}
                            className="w-8 h-8 rounded-xl bg-[#F8F8F8] flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5 text-[#737373]" />
                          </button>
                        </div>
                      </>
                    ) : (
                      /* View mode */
                      <>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#0A0A0A]">{cat.name}</p>
                          <p className="text-xs text-[#A3A3A3] mt-0.5">
                            {cat.product_count === 0 ? 'No products' : `${cat.product_count} product${cat.product_count !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingId(cat.id); setEditName(cat.name); setEditError('') }}
                            className="w-8 h-8 rounded-xl bg-[#F8F8F8] flex items-center justify-center"
                          >
                            <Pencil className="w-3.5 h-3.5 text-[#737373]" />
                          </button>
                          <button
                            onClick={() => setDeletingId(cat.id)}
                            className="w-8 h-8 rounded-xl bg-[#FEE2E2] flex items-center justify-center"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#EF4444]" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
