export default function SkeletonListItem() {
  return (
    <div className="bg-white rounded-2xl border border-[#F0F0F0] p-3 flex flex-row items-center gap-3">
      <div className="w-16 h-16 rounded-xl skeleton flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-2 w-12 skeleton rounded" />
        <div className="h-3 w-3/4 skeleton rounded" />
        <div className="h-3 w-1/3 skeleton rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="w-8 h-8 rounded-lg skeleton" />
        <div className="w-8 h-8 rounded-lg skeleton" />
      </div>
    </div>
  )
}
