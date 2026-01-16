export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 py-4">
        <div className="container mx-auto px-4">
          <div className="h-8 w-48 bg-white/20 rounded animate-pulse" />
          <div className="flex gap-2 mt-2">
            <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse" />
            <div className="h-6 w-24 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        {/* Brands skeleton */}
        <div className="mb-10">
          <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-shrink-0 flex flex-col items-center">
                <div className="w-16 h-16 bg-gray-200 rounded-xl animate-pulse" />
                <div className="h-3 w-12 bg-gray-200 rounded mt-2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        {/* Deals skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 animate-pulse">
              <div className="flex gap-3">
                <div className="w-24 h-24 bg-gray-200 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
