export default function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#F0F0F0] overflow-hidden bg-white">
      {/* Image area */}
      <div className="aspect-square skeleton" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="h-3 skeleton rounded-full w-3/4" />
        <div className="h-3 skeleton rounded-full w-1/2" />
        <div className="h-8 skeleton rounded-xl mt-1" />
      </div>
    </div>
  )
}
