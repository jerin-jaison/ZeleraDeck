export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100">
      {/* Image area */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse" />
      {/* Content */}
      <div className="p-3 space-y-2">
        <div className="h-3.5 bg-gray-200 rounded-full w-4/5 animate-pulse" />
        <div className="h-5 bg-gray-200 rounded-full w-2/5 animate-pulse" />
        <div className="h-9 bg-gray-100 rounded-xl w-full mt-1 animate-pulse" />
      </div>
    </div>
  )
}
