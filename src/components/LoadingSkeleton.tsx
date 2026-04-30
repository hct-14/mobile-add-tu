import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      {/* Banner Skeleton */}
      <div className="w-full aspect-[21/9] bg-gray-200 rounded-xl"></div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-3 border border-gray-100 space-y-3">
            <div className="aspect-square bg-gray-200 rounded-md"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="w-1/2 h-4 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
