import { cn } from "@/lib/utils";

interface FrontPageSkeletonProps {
  className?: string;
}

export function FrontPageSkeleton({ className }: FrontPageSkeletonProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {/* Lead story skeleton */}
      <div className="space-y-4">
        {/* Headline */}
        <div className="skeleton-pulse h-8 w-3/4 rounded-sm" />
        {/* Subheadline */}
        <div className="skeleton-pulse h-5 w-1/2 rounded-sm" />
        {/* Lead image placeholder */}
        <div className="skeleton-pulse h-64 w-full rounded-sm" />
        {/* Body text lines */}
        <div className="space-y-2">
          <div className="skeleton-pulse h-4 w-full rounded-sm" />
          <div className="skeleton-pulse h-4 w-11/12 rounded-sm" />
          <div className="skeleton-pulse h-4 w-4/5 rounded-sm" />
          <div className="skeleton-pulse h-4 w-full rounded-sm" />
          <div className="skeleton-pulse h-4 w-3/5 rounded-sm" />
        </div>
      </div>

      {/* Stat strip skeleton */}
      <div className="flex gap-px bg-paper3 rounded-sm overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 px-4 py-3 text-center space-y-2">
            <div className="skeleton-pulse h-6 w-12 mx-auto rounded-sm" />
            <div className="skeleton-pulse h-3 w-16 mx-auto rounded-sm" />
          </div>
        ))}
      </div>

      {/* Secondary stories grid + sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* 3-column stories */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              {/* Story image */}
              <div className="skeleton-pulse h-36 w-full rounded-sm" />
              {/* Headline */}
              <div className="skeleton-pulse h-5 w-5/6 rounded-sm" />
              <div className="skeleton-pulse h-5 w-2/3 rounded-sm" />
              {/* Body lines */}
              <div className="space-y-1.5">
                <div className="skeleton-pulse h-3 w-full rounded-sm" />
                <div className="skeleton-pulse h-3 w-11/12 rounded-sm" />
                <div className="skeleton-pulse h-3 w-3/4 rounded-sm" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar: rankings skeleton */}
        <div className="space-y-3">
          {/* Rankings title */}
          <div className="skeleton-pulse h-5 w-24 rounded-sm" />
          <div className="skeleton-pulse h-px w-full rounded-sm" />
          {/* Ranking rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton-pulse h-4 w-5 rounded-sm" />
              <div className="skeleton-pulse h-4 flex-1 rounded-sm" />
              <div className="skeleton-pulse h-3 w-10 rounded-sm" />
            </div>
          ))}

          {/* Score card skeleton */}
          <div className="mt-6 space-y-2">
            <div className="skeleton-pulse h-3 w-16 rounded-sm" />
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="flex-1 space-y-2 flex flex-col items-center">
                <div className="skeleton-pulse h-4 w-20 rounded-sm" />
                <div className="skeleton-pulse h-8 w-10 rounded-sm" />
              </div>
              <div className="skeleton-pulse h-3 w-4 rounded-sm" />
              <div className="flex-1 space-y-2 flex flex-col items-center">
                <div className="skeleton-pulse h-4 w-20 rounded-sm" />
                <div className="skeleton-pulse h-8 w-10 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
