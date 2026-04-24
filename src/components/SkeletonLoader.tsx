import React, { useState } from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  variant = "rectangular",
}) => {
  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantClasses[variant]} ${className}`}
    />
  );
};

interface SkeletonProductCardProps {
  className?: string;
}

export const SkeletonProductCard: React.FC<SkeletonProductCardProps> = ({
  className = "",
}) => {
  return (
    <div className={`bg-white rounded-lg p-3 border border-gray-100 ${className}`}>
      <div className="aspect-square mb-2 overflow-hidden rounded-md relative">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/2" variant="text" />
      </div>
    </div>
  );
};

interface SkeletonBannerProps {
  className?: string;
}

export const SkeletonBanner: React.FC<SkeletonBannerProps> = ({
  className = "",
}) => {
  return (
    <div className={`bg-gray-200 rounded-xl animate-pulse ${className}`} />
  );
};

interface SkeletonCategoryProps {
  count?: number;
}

export const SkeletonCategories: React.FC<SkeletonCategoryProps> = ({
  count = 6,
}) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 md:grid md:grid-cols-5 lg:grid-cols-8 md:gap-6">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="w-[15%] md:w-auto bg-white rounded-xl p-1 md:p-8 flex flex-col items-center justify-center"
        >
          <Skeleton
            variant="circular"
            className="w-8 h-8 md:w-20 md:h-20 mb-1 md:mb-6"
          />
          <Skeleton className="h-3 w-12 md:h-4 md:w-20" />
        </div>
      ))}
    </div>
  );
};

export const SkeletonProductGrid: React.FC<{ count?: number }> = ({
  count = 10,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
};
