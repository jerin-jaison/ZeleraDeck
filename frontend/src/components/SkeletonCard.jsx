export default function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border border-[#F0F0F0] bg-white">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/2 skeleton rounded" />
        <div className="h-8 w-full skeleton rounded-xl mt-1" />
      </div>
    </div>
  )
}
