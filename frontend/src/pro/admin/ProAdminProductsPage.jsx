/**
 * ProAdminProductsPage
 * Matches the Stitch "admin_product_management" design:
 * - Table with thumbnail, name (+ display_id), category, price, stock status, edit/delete
 * - Search bar + category filter
 * - Pagination
 * - "Add Product" button → /pro-admin/:slug/products/add
 * 
 * Edit/Add uses the existing shop/products/ endpoints via the catalogue API
 * (same JWT auth, same Cloudinary upload logic as the main dashboard)
 */
import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import ImageCropModal from '../../components/ImageCropModal'
import AiPromptHelperButton from '../../components/AiPromptHelperButton'
import imageCompression from 'browser-image-compression'

function StockBadge({ inStock }) {
  return inStock ? (
    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 border border-green-100">
      In Stock
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-widest bg-[#eeeeee] text-[#7e7576] border border-[#e2e2e2]">
      Out of Stock
    </span>
  )
}

function ConfirmDialog({ productName, onConfirm, onCancel, isDeleting }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-[#e2e2e2] shadow-2xl p-8 max-w-sm w-full mx-4">
        <h3 className="font-serif text-xl text-black mb-2">Delete Product</h3>
        <p className="text-sm text-[#4c4546] mb-6">
          Are you sure you want to permanently delete{' '}
          <strong className="text-black">{productName}</strong>? This will also
          remove all associated images and video from storage.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 border border-[#e2e2e2] text-[12px] uppercase tracking-[0.1em] font-semibold text-[#4c4546] hover:border-black transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-6 py-3 bg-[#ba1a1a] text-white text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#7c1010] transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddCategoryModal({ onSave, onCancel, isSaving }) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [cropSrc, setCropSrc] = useState(null)

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = async (croppedBlob) => {
    setCropSrc(null)
    try {
      const croppedFile = new File([croppedBlob], 'category.jpg', { type: 'image/jpeg' })
      const compressed = await imageCompression(croppedFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true })
      setImageFile(compressed)
      setImagePreview(URL.createObjectURL(compressed))
    } catch {
      const file = new File([croppedBlob], 'category.jpg', { type: 'image/jpeg' })
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const fd = new FormData()
    fd.append('name', name.trim())
    if (imageFile) fd.append('image', imageFile)
    onSave(fd)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-[#e2e2e2] shadow-2xl p-8 max-w-sm w-full mx-4">
        <h3 className="font-serif text-xl text-black mb-2">Add Category</h3>
        <p className="text-sm text-[#4c4546] mb-6">
          Create a new category for your storefront catalog.
        </p>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-2">
              Category Name <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Linen, Footwear..."
              required
              autoFocus
              className="w-full bg-transparent border-b border-black py-2.5 text-sm text-[#1a1c1c] focus:outline-none placeholder:text-[#cfc4c5]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                Category Image <span className="text-[#cfc4c5] font-normal normal-case">(optional)</span>
              </label>
              <AiPromptHelperButton
                slotName="Category Cover"
                dimensions="1200×1200"
                aspectRatio="1:1 square"
                contextText={name}
              />
            </div>
            <label className="w-full h-24 border border-dashed border-[#cfc4c5] hover:border-black flex flex-col items-center justify-center gap-1 cursor-pointer relative overflow-hidden transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-[#cfc4c5] text-[24px]">add_photo_alternate</span>
                  <span className="text-[11px] text-[#7e7576]">Upload category cover photo</span>
                </>
              )}
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview('') }}
                className="mt-1 text-[10px] text-[#7e7576] hover:text-[#ba1a1a] transition-colors"
              >
                Remove photo
              </button>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
              className="flex-1 px-6 py-3 border border-[#e2e2e2] text-[12px] uppercase tracking-[0.1em] font-semibold text-[#4c4546] hover:border-black transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()}
              className="flex-1 px-6 py-3 bg-black text-white text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save Category'
              )}
            </button>
          </div>
        </form>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={1 / 1}
          title="Crop Category Photo (1:1 Square)"
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}

function ManageCategoriesModal({ categories, onUpdate, onDelete, onReorder, onClose, updatingId, deletingId, isReordering }) {
  const [items, setItems] = useState(categories)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState('')
  const [cropSrc, setCropSrc] = useState(null)

  useEffect(() => {
    setItems(categories)
  }, [categories])

  const moveUp = (idx) => {
    if (idx === 0) return
    const newItems = [...items]
    const temp = newItems[idx - 1]
    newItems[idx - 1] = newItems[idx]
    newItems[idx] = temp
    setItems(newItems)
    onReorder(newItems)
  }

  const moveDown = (idx) => {
    if (idx === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[idx + 1]
    newItems[idx + 1] = newItems[idx]
    newItems[idx] = temp
    setItems(newItems)
    onReorder(newItems)
  }

  const startEdit = (cat) => {
    setEditingId(cat.id)
    setEditName(cat.name)
    setEditImageFile(null)
    setEditImagePreview(cat.image_url || '')
  }

  const handleImagePick = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setCropSrc(URL.createObjectURL(file))
  }

  const handleCropComplete = async (croppedBlob) => {
    setCropSrc(null)
    try {
      const croppedFile = new File([croppedBlob], 'category.jpg', { type: 'image/jpeg' })
      const compressed = await imageCompression(croppedFile, { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: true })
      setEditImageFile(compressed)
      setEditImagePreview(URL.createObjectURL(compressed))
    } catch {
      const file = new File([croppedBlob], 'category.jpg', { type: 'image/jpeg' })
      setEditImageFile(file)
      setEditImagePreview(URL.createObjectURL(file))
    }
  }

  const submitEdit = (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    const fd = new FormData()
    fd.append('name', editName.trim())
    if (editImageFile) {
      fd.append('image', editImageFile)
    } else if (!editImagePreview && items.find(c => c.id === editingId)?.image_url) {
      fd.append('clear_image', 'true')
    }
    onUpdate(editingId, fd)
    setEditingId(null)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-[#e2e2e2] shadow-2xl p-8 max-w-lg w-full mx-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif text-xl text-black">Manage Categories</h3>
            <p className="text-[12px] text-[#7e7576] mt-0.5">Use arrow buttons to change display order</p>
          </div>
          <button onClick={onClose} className="text-[#7e7576] hover:text-black transition-colors">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {items.length === 0 ? (
          <p className="text-sm text-[#7e7576] text-center py-8">No categories yet.</p>
        ) : (
          <ul className="overflow-y-auto flex-1 divide-y divide-[#f3f3f3]">
            {items.map((cat, idx) => (
              <li key={cat.id} className="py-4">
                {editingId === cat.id ? (
                  <form onSubmit={submitEdit} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        autoFocus
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Category name"
                        className="flex-1 bg-transparent border-b border-black py-1 text-sm text-[#1a1c1c] focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={updatingId === cat.id}
                        className="px-3 py-1.5 bg-black text-white text-[11px] uppercase tracking-wider font-semibold hover:bg-[#333] transition-colors disabled:opacity-50"
                      >
                        {updatingId === cat.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="text-[#7e7576] hover:text-black transition-colors text-[11px] uppercase tracking-wider"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="flex items-center gap-3 pt-1">
                      <label className="w-12 h-12 bg-[#f3f3f3] border border-[#cfc4c5] relative flex items-center justify-center cursor-pointer overflow-hidden flex-shrink-0">
                        <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
                        {editImagePreview ? (
                          <img src={editImagePreview} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[#cfc4c5] text-[18px]">add_a_photo</span>
                        )}
                      </label>
                      <span className="text-[11px] text-[#7e7576] font-sans">
                        {editImagePreview ? 'Click thumbnail to change photo' : 'Add category photo (optional)'}
                      </span>
                      {editImagePreview && (
                        <button
                          type="button"
                          onClick={() => { setEditImageFile(null); setEditImagePreview('') }}
                          className="text-[10px] text-[#ba1a1a] underline ml-auto"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Reorder Arrows */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          disabled={idx === 0 || isReordering}
                          onClick={() => moveUp(idx)}
                          className="material-symbols-outlined text-[16px] text-[#7e7576] hover:text-black disabled:opacity-25 disabled:hover:text-[#7e7576] transition-colors leading-none"
                          title="Move Up"
                        >
                          keyboard_arrow_up
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1 || isReordering}
                          onClick={() => moveDown(idx)}
                          className="material-symbols-outlined text-[16px] text-[#7e7576] hover:text-black disabled:opacity-25 disabled:hover:text-[#7e7576] transition-colors leading-none"
                          title="Move Down"
                        >
                          keyboard_arrow_down
                        </button>
                      </div>

                      <div className="w-10 h-10 bg-[#f3f3f3] border border-[#e2e2e2] flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {cat.image_url ? (
                          <img src={cat.image_url} alt={cat.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[#cfc4c5] text-[18px]">category</span>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-[#1a1c1c]">{cat.name}</span>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button
                        onClick={() => startEdit(cat)}
                        className="material-symbols-outlined text-[18px] text-[#4c4546] hover:text-black transition-colors"
                        title="Edit category"
                      >
                        edit
                      </button>
                      <button
                        onClick={() => onDelete(cat.id)}
                        disabled={deletingId === cat.id}
                        className="material-symbols-outlined text-[18px] text-[#4c4546] hover:text-[#ba1a1a] transition-colors disabled:opacity-40"
                        title="Delete (products will be uncategorised)"
                      >
                        {deletingId === cat.id ? 'hourglass_empty' : 'delete'}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-[#7e7576] mt-4 border-t border-[#f3f3f3] pt-3">
          Deleting a category moves its products to "No Category" — no products are lost.
        </p>
      </div>

      {cropSrc && (
        <ImageCropModal
          imageSrc={cropSrc}
          aspect={1 / 1}
          title="Crop Category Photo (1:1 Square)"
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc(null)}
        />
      )}
    </div>
  )
}

export default function ProAdminProductsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [page, setPage] = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, display_id, name }
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false)
  const [isCategoryManageOpen, setIsCategoryManageOpen] = useState(false)
  const [renamingCategoryId, setRenamingCategoryId] = useState(null)
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['pro-admin-products', slug, search, categoryFilter, page],
    queryFn: () =>
      api.get('pro/admin/products/', {
        params: {
          search: search || undefined,
          category: categoryFilter || undefined,
          page,
        },
      }).then(r => r.data),
    keepPreviousData: true,
  })

  const deleteMutation = useMutation({
    mutationFn: (display_id) => api.delete(`pro/admin/products/${display_id}/`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      showToast('Product deleted.')
      setDeleteTarget(null)
    },
    onError: () => {
      showToast('Failed to delete product. Try again.', 'error')
      setDeleteTarget(null)
    },
  })

  const addCategoryMutation = useMutation({
    mutationFn: (fd) => api.post('pro/admin/categories/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      qc.invalidateQueries({ queryKey: ['pro-admin-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-store-home'] })
      showToast('Category created.')
      setIsAddCategoryOpen(false)
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to create category.'
      showToast(msg, 'error')
    },
  })

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, fd }) => api.patch(`pro/admin/categories/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onMutate: ({ id }) => setRenamingCategoryId(id),
    onSettled: () => setRenamingCategoryId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      qc.invalidateQueries({ queryKey: ['pro-admin-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-store-home'] })
      showToast('Category updated.')
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to update category.'
      showToast(msg, 'error')
    },
  })

  const deleteCategoryMutation = useMutation({
    mutationFn: (id) => api.delete(`pro/admin/categories/${id}/`),
    onMutate: (id) => setDeletingCategoryId(id),
    onSettled: () => setDeletingCategoryId(null),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      qc.invalidateQueries({ queryKey: ['pro-admin-categories'] })
      showToast('Category deleted. Products moved to No Category.')
    },
    onError: (err) => {
      const msg = err?.response?.data?.error || 'Failed to delete category.'
      showToast(msg, 'error')
    },
  })

  const reorderCategoryMutation = useMutation({
    mutationFn: (orderedItems) =>
      api.post('pro/admin/categories/reorder/', {
        order: orderedItems.map((item, index) => ({ id: item.id, display_order: index })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['pro-admin-products'] })
      qc.invalidateQueries({ queryKey: ['pro-admin-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-categories'] })
      qc.invalidateQueries({ queryKey: ['pro-store-home'] })
      showToast('Category order saved.')
    },
    onError: () => {
      showToast('Failed to save category order.', 'error')
    },
  })

  const products = data?.results || []
  const categories = data?.categories || []
  const numPages = data?.num_pages || 1
  const total = data?.count || 0

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 lg:py-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold shadow-lg transition-all ${
          toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-black text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <ConfirmDialog
          productName={deleteTarget.name}
          onConfirm={() => deleteMutation.mutate(deleteTarget.display_id)}
          onCancel={() => setDeleteTarget(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Add Category Modal */}
      {isAddCategoryOpen && (
        <AddCategoryModal
          onSave={(fd) => addCategoryMutation.mutate(fd)}
          onCancel={() => setIsAddCategoryOpen(false)}
          isSaving={addCategoryMutation.isPending}
        />
      )}

      {/* Manage Categories Modal */}
      {isCategoryManageOpen && (
        <ManageCategoriesModal
          categories={categories}
          onUpdate={(id, fd) => updateCategoryMutation.mutate({ id, fd })}
          onDelete={(id) => deleteCategoryMutation.mutate(id)}
          onReorder={(ordered) => reorderCategoryMutation.mutate(ordered)}
          onClose={() => setIsCategoryManageOpen(false)}
          updatingId={renamingCategoryId}
          deletingId={deletingCategoryId}
          isReordering={reorderCategoryMutation.isPending}
        />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-12">
        <div>
          <h2 className="font-serif text-2xl sm:text-[32px] sm:leading-[40px] font-normal text-black">
            Product Inventory
          </h2>
          <p className="text-sm sm:text-base text-[#4c4546] mt-1 sm:mt-2 max-w-xl">
            Manage your collection. Every listing reflects your storefront's identity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {categories.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCategoryManageOpen(true)}
              className="border border-[#cfc4c5] text-[#4c4546] px-5 sm:px-6 py-3 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-2 hover:border-black hover:text-black transition-all active:scale-95"
              title="Rename or delete categories"
            >
              <span className="material-symbols-outlined text-[18px]">category</span>
              Manage
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="border border-black text-black px-5 sm:px-6 py-3 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Category
          </button>
          <Link
            to={`/pro-admin/${slug}/products/add`}
            className="bg-black text-white px-5 sm:px-6 py-3 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-2 hover:bg-[#333] transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex items-center border-b border-black/20 focus-within:border-black transition-all px-2 flex-1 min-w-[200px] max-w-xs">
          <span className="material-symbols-outlined text-[18px] text-[#7e7576]">search</span>
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search products..."
            className="bg-transparent border-none focus:ring-0 text-sm pl-2 py-2 w-full text-[#1a1c1c] placeholder:text-[#7e7576] outline-none"
          />
        </div>
        {categories.length > 0 && (
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setPage(1) }}
            className="border-b border-black/20 bg-transparent text-sm py-2 px-2 text-[#1a1c1c] outline-none focus:border-black cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table Container with horizontal scroll */}
      <div className="bg-white border border-[#e2e2e2] overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="text-center py-20 text-[#7e7576] text-sm">
            Failed to load products. Please refresh.
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#7e7576] text-sm uppercase tracking-[0.1em]">No products found</p>
            <Link
              to={`/pro-admin/${slug}/products/add`}
              className="mt-4 inline-block text-black underline text-sm"
            >
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#e2e2e2] bg-[#f3f3f3]">
                {['Image', 'Product', 'Category', 'Price', 'Status', ''].map(h => (
                  <th key={h} className="px-6 py-4 text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f3f3f3]">
              {products.map(product => (
                <tr
                  key={product.id}
                  className="hover:bg-[#fafafa] transition-colors"
                >
                  <td className="px-6 py-3">
                    <div className="w-14 h-18 overflow-hidden bg-[#f3f3f3] flex-shrink-0" style={{ height: '72px', width: '58px' }}>
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-[#cfc4c5] text-[24px]">image</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-3">
                    <p className="text-sm font-semibold text-black leading-tight">{product.name}</p>
                    <span className="text-[10px] uppercase tracking-widest text-[#7e7576]">
                      {product.display_id}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[12px] uppercase tracking-[0.08em] text-[#4c4546]">
                    {product.category_name || '—'}
                  </td>
                  <td className="px-6 py-3 text-sm text-[#1a1c1c]">
                    ₹{Number(product.price).toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-3">
                    <StockBadge inStock={product.is_in_stock} />
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex justify-end gap-4">
                      <Link
                        to={`/pro-admin/${slug}/products/edit/${product.id}`}
                        className="material-symbols-outlined text-[#4c4546] hover:text-black transition-colors text-[20px]"
                        title="Edit"
                      >
                        edit
                      </Link>
                      <button
                        onClick={() => setDeleteTarget(product)}
                        className="material-symbols-outlined text-[#4c4546] hover:text-[#ba1a1a] transition-colors text-[20px]"
                        title="Delete"
                      >
                        delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {numPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-[12px] uppercase tracking-[0.1em] text-[#4c4546]">
            Showing page {page} of {numPages} · {total} total
          </p>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="w-10 h-10 border border-[#e2e2e2] flex items-center justify-center hover:bg-[#f3f3f3] transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {Array.from({ length: numPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-10 h-10 border flex items-center justify-center text-[12px] uppercase tracking-[0.1em] font-semibold transition-colors ${
                  n === page
                    ? 'border-black bg-black text-white'
                    : 'border-[#e2e2e2] hover:bg-[#f3f3f3] text-[#1a1c1c]'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page >= numPages}
              onClick={() => setPage(p => p + 1)}
              className="w-10 h-10 border border-[#e2e2e2] flex items-center justify-center hover:bg-[#f3f3f3] transition-colors disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
