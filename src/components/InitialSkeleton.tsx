/**
 * Initial Loading Skeleton
 * Shows immediately while app loads to prevent white flash
 */

export function InitialSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <header className="bg-[#bdb3b4] text-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-24 h-8 bg-white/20 rounded animate-pulse" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
              <div className="w-10 h-10 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-10 bg-white/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </header>

      {/* Banner Skeleton */}
      <div className="container mx-auto px-4 pt-4">
        <div className="w-full h-48 bg-gray-200 rounded-xl animate-pulse" />
      </div>

      {/* Categories Skeleton */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex gap-3 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse" />
              <div className="w-14 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale Skeleton */}
      <div className="container mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-32 h-6 bg-gray-200 rounded animate-pulse" />
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="w-full h-32 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-full h-4 mt-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-2/3 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
              <div className="w-1/2 h-5 mt-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Products Grid Skeleton */}
      <div className="container mx-auto px-4 pt-6">
        <div className="w-40 h-6 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-3 shadow-sm">
              <div className="w-full h-40 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-full h-4 mt-3 bg-gray-200 rounded animate-pulse" />
              <div className="w-3/4 h-3 mt-2 bg-gray-200 rounded animate-pulse" />
              <div className="flex gap-2 mt-2">
                <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
                <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="w-1/2 h-5 mt-2 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation Skeleton */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around py-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="w-12 h-2 mt-1 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </nav>

      <div className="h-20" />
    </div>
  );
}
