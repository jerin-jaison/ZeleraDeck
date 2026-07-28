/**
 * ProAdminAboutPage
 * Matches the Stitch "admin_about_page_editor" design.
 * - List of content blocks (heading + body + image thumbnail + order)
 * - Drag-to-reorder (via up/down buttons — accessible, no DnD library needed)
 * - Add / Edit (modal) / Delete per block
 * - Image upload per block → Cloudinary via backend
 */
import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import imageCompression from 'browser-image-compression'
import api from '../../api/axios'
import AiPromptHelperButton from '../../components/AiPromptHelperButton'

function BlockModal({ block, onClose, onSave, isSaving }) {
  const [heading, setHeading] = useState(block?.heading || '')
  const [body, setBody] = useState(block?.body || '')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(block?.image_url || '')

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    try {
      const c = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1600, useWebWorker: true })
      setImageFile(c)
      setImagePreview(URL.createObjectURL(c))
    } catch {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSave = () => {
    const fd = new FormData()
    fd.append('heading', heading)
    fd.append('body', body)
    if (imageFile) fd.append('image', imageFile)
    onSave(fd)
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm">
      <div className="bg-white border border-[#e2e2e2] shadow-2xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-5 border-b border-[#e2e2e2] flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="font-serif text-xl text-black uppercase tracking-wider">
            {block?.id ? 'Edit Story Block' : 'Add Story Block'}
          </h2>
          <button
            onClick={onClose}
            className="material-symbols-outlined text-[#4c4546] hover:text-black transition-colors text-[20px]"
          >
            close
          </button>
        </div>

        {/* Form */}
        <div className="p-8 space-y-7">

          {/* Section Title */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-1">
              Section Title <span className="text-[#ba1a1a]">*</span>
            </label>
            <p className="text-[11px] text-[#7e7576] mb-2 font-sans">
              The main headline for this section — e.g. "Our Heritage", "How We Started", "The Craft".
            </p>
            <input
              type="text"
              value={heading}
              onChange={e => setHeading(e.target.value)}
              placeholder="e.g. Our Heritage"
              required
              className="w-full py-2 bg-transparent border-b border-black text-lg font-serif focus:outline-none placeholder:text-[#cfc4c5]"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold mb-1">
              Story Text <span className="text-[#ba1a1a]">*</span>
            </label>
            <p className="text-[11px] text-[#7e7576] mb-2 font-sans">
              2–4 sentences about this aspect of your brand. This appears as the main body text next to your image.
            </p>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={5}
              required
              placeholder="Write your brand story here..."
              className="w-full py-2 bg-transparent border-b border-black text-sm text-[#4c4546] resize-none focus:outline-none placeholder:text-[#cfc4c5]"
            />
          </div>

          {/* Image */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[12px] uppercase tracking-[0.1em] text-[#4c4546] font-semibold">
                Section Image
              </label>
              <AiPromptHelperButton
                slotName="About Story Image"
                dimensions="800×1000"
                aspectRatio="4:5 portrait"
                contextText={heading}
              />
            </div>
            <p className="text-[11px] text-[#7e7576] mb-3 font-sans">
              This image appears full-height beside your story text on the public About page.
              <br />
              <strong className="text-[#1a1c1c]">Recommended: 800×1000 px, portrait (4:5 ratio).</strong>{' '}
              Taller images (e.g. 900×1200, 3:4) also work well. Landscape photos will be cropped.
              <br />
              <span className="text-[#cfc4c5]">Optional — a text-only block still looks great.</span>
            </p>
            <label className="w-full h-48 border-2 border-dashed border-[#cfc4c5] flex flex-col items-center justify-center gap-2 hover:bg-[#f3f3f3] transition-colors cursor-pointer group relative overflow-hidden">
              <input type="file" accept="image/*" className="hidden" onChange={handleImagePick} />
              {imagePreview ? (
                <img src={imagePreview} alt="preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              ) : null}
              <span className="relative material-symbols-outlined text-[#cfc4c5] group-hover:text-black text-[36px] transition-colors">cloud_upload</span>
              <p className="relative text-[11px] text-[#7e7576] group-hover:text-black transition-colors">
                {imagePreview ? 'Click to change image' : 'Click or drag & drop to upload'}
              </p>
              {!imagePreview && (
                <p className="relative text-[10px] text-[#cfc4c5] font-sans">PNG, JPG, WEBP · Max 10 MB</p>
              )}
            </label>
            {imagePreview && (
              <button
                type="button"
                onClick={() => { setImageFile(null); setImagePreview('') }}
                className="mt-2 text-[11px] text-[#7e7576] hover:text-[#ba1a1a] transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Remove image
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-[#f3f3f3]">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 border border-black text-black text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#f3f3f3] transition-all"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !heading.trim() || !body.trim()}
              className="px-10 py-3 bg-black text-white text-[12px] uppercase tracking-[0.1em] font-semibold hover:bg-[#333] transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Save Block
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlockCard({ block, onEdit, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="bg-white border border-[#e2e2e2] p-3 sm:p-5 flex items-center gap-3 sm:gap-5 group hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200">
      {/* Reorder arrows */}
      <div className="flex flex-col gap-1 flex-shrink-0">
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="w-7 h-7 flex items-center justify-center border border-[#e2e2e2] bg-[#fafafa] hover:bg-black hover:text-white text-[#4c4546] rounded transition-all disabled:opacity-20 disabled:hover:bg-[#fafafa] disabled:hover:text-[#4c4546]"
          title="Move up"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
        </button>
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="w-7 h-7 flex items-center justify-center border border-[#e2e2e2] bg-[#fafafa] hover:bg-black hover:text-white text-[#4c4546] rounded transition-all disabled:opacity-20 disabled:hover:bg-[#fafafa] disabled:hover:text-[#4c4546]"
          title="Move down"
        >
          <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
        </button>
      </div>

      {/* Thumbnail */}
      <div className="w-16 sm:w-28 h-14 sm:h-20 bg-[#f3f3f3] flex-shrink-0 overflow-hidden rounded border border-[#e2e2e2]">
        {block.image_url ? (
          <img src={block.image_url} alt={block.heading} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[#cfc4c5] text-[20px] sm:text-[24px]">image</span>
          </div>
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 px-1 sm:px-4">
        <h3 className="font-serif text-base sm:text-xl text-black truncate">{block.heading}</h3>
        <p className="text-xs sm:text-sm text-[#4c4546] line-clamp-1 mt-0.5">{block.body}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onEdit}
          className="px-2.5 sm:px-3 py-1.5 border border-[#e2e2e2] bg-[#fafafa] hover:bg-black hover:text-white text-[#1a1c1c] rounded transition-all flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
          title="Edit Block"
        >
          <span className="material-symbols-outlined text-[15px]">edit</span>
          <span className="hidden sm:inline">Edit</span>
        </button>
        <button
          onClick={onDelete}
          className="px-2.5 sm:px-3 py-1.5 border border-[#ffdad6] bg-[#fff0f0] hover:bg-[#ba1a1a] hover:text-white text-[#ba1a1a] rounded transition-all flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider"
          title="Delete Block"
        >
          <span className="material-symbols-outlined text-[15px]">delete</span>
          <span className="hidden sm:inline">Delete</span>
        </button>
      </div>
    </div>
  )
}

export default function ProAdminAboutPage() {
  const { slug } = useParams()
  const qc = useQueryClient()
  const [modal, setModal] = useState(null) // null | 'add' | block object (for edit)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ['pro-admin-about', slug],
    queryFn: () => api.get('pro/admin/about/').then(r => r.data),
  })

  const createMutation = useMutation({
    mutationFn: (fd) => api.post('pro/admin/about/', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pro-admin-about'] }); setModal(null); showToast('Block added.') },
    onError: () => showToast('Failed to save. Try again.', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }) => api.patch(`pro/admin/about/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pro-admin-about'] }); setModal(null); showToast('Block updated.') },
    onError: () => showToast('Failed to update. Try again.', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`pro/admin/about/${id}/`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pro-admin-about'] }); showToast('Block deleted.') },
    onError: () => showToast('Failed to delete. Try again.', 'error'),
  })

  const reorderMutation = useMutation({
    mutationFn: (order) => api.post('pro/admin/about/reorder/', { order }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pro-admin-about'] }),
  })

  const move = (idx, direction) => {
    const reordered = [...blocks]
    const target = direction === 'up' ? idx - 1 : idx + 1
    ;[reordered[idx], reordered[target]] = [reordered[target], reordered[idx]]
    const orderPayload = reordered.map((b, i) => ({ id: b.id, order: i }))
    reorderMutation.mutate(orderPayload)
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSave = (fd) => {
    if (modal === 'add') {
      fd.append('order', blocks.length)
      createMutation.mutate(fd)
    } else {
      updateMutation.mutate({ id: modal.id, fd })
    }
  }

  return (
    <div className="px-4 py-8 md:px-8 lg:px-16 lg:py-12">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[100] px-5 py-3 text-[12px] uppercase tracking-[0.1em] font-semibold shadow-lg ${
          toast.type === 'error' ? 'bg-[#ba1a1a] text-white' : 'bg-black text-white'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <BlockModal
          block={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 lg:mb-12">
        <div>
          <h2 className="font-serif text-2xl sm:text-[32px] sm:leading-[40px] font-normal text-black">
            About Page Editor
          </h2>
          <p className="text-sm sm:text-base text-[#4c4546] mt-1 sm:mt-2 max-w-lg">
            Build your brand story block by block. Each block appears as a full editorial section on your
            public About page — with your heading, text, and an optional portrait image side by side.
            Drag the arrows to change the order.
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="bg-black text-white px-6 sm:px-8 py-3 text-[11px] sm:text-[12px] uppercase tracking-[0.1em] font-semibold flex items-center justify-center gap-2 hover:bg-[#333] transition-all active:scale-95 self-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Block
        </button>
      </div>

      {/* Block list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : blocks.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-[#e2e2e2]">
          <span className="material-symbols-outlined text-[48px] text-[#cfc4c5]">article</span>
          <p className="text-[#7e7576] text-sm uppercase tracking-[0.1em] mt-3">No content blocks yet</p>
          <button
            onClick={() => setModal('add')}
            className="mt-4 text-black underline text-sm"
          >
            Add your first block
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {blocks.map((block, idx) => (
            <BlockCard
              key={block.id}
              block={block}
              onEdit={() => setModal(block)}
              onDelete={() => deleteMutation.mutate(block.id)}
              onMoveUp={() => move(idx, 'up')}
              onMoveDown={() => move(idx, 'down')}
              isFirst={idx === 0}
              isLast={idx === blocks.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
