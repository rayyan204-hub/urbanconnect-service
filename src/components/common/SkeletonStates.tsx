interface SkeletonProps {
  count?: number;
}

/**
 * Skeleton component for Community Feed posts
 */
export function CommunityFeedSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-4 pb-20 animate-pulse" aria-label="Loading community posts">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`feed-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden p-3.5 space-y-3"
        >
          {/* Header: Avatar, Name/Date, Category Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-slate-200" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 bg-slate-200 rounded-md" />
                <div className="h-2 w-20 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
          </div>

          {/* Post Content */}
          <div className="space-y-2">
            <div className="h-4 w-3/4 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-full bg-slate-100 rounded-md" />
            <div className="h-2.5 w-5/6 bg-slate-100 rounded-md" />
          </div>

          {/* Image Placeholder */}
          <div className="w-full h-40 bg-slate-200 rounded-xl" />

          {/* Bottom Action Buttons */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-5 w-12 bg-slate-100 rounded-md" />
              <div className="h-5 w-12 bg-slate-100 rounded-md" />
            </div>
            <div className="h-5 w-14 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Lost & Found items
 */
export function LostFoundSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-3.5 pb-20 animate-pulse" aria-label="Loading lost and found items">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`lost-found-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex gap-3"
        >
          {/* Item Image Thumbnail */}
          <div className="w-20 h-20 rounded-2xl bg-slate-200 flex-shrink-0" />

          {/* Item Details */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="h-4 w-14 bg-slate-200 rounded-full" />
              <div className="h-3 w-16 bg-slate-100 rounded-md" />
            </div>

            <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-full bg-slate-100 rounded-md" />

            <div className="flex items-center justify-between pt-1">
              <div className="h-3 w-24 bg-slate-100 rounded-md" />
              <div className="h-6 w-16 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Blood Donors
 */
export function BloodDonationSkeleton({ count = 5 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-3 pb-20 animate-pulse" aria-label="Loading blood donors">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`donor-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Blood Group Badge */}
            <div className="w-12 h-12 rounded-2xl bg-slate-200 flex-shrink-0" />

            {/* Donor Info */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
                <div className="w-3.5 h-3.5 rounded-full bg-slate-100" />
              </div>
              <div className="h-2.5 w-36 bg-slate-100 rounded-md" />
              <div className="h-3.5 w-20 bg-slate-200 rounded-full" />
            </div>
          </div>

          {/* Action Call Button */}
          <div className="w-9 h-9 rounded-xl bg-slate-200 flex-shrink-0" />
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Volunteer Events
 */
export function VolunteerEventsSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="px-4 pb-8 space-y-4 animate-pulse" aria-label="Loading volunteer events">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`event-skeleton-${idx}`}
          className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs"
        >
          {/* Event Image Banner */}
          <div className="w-full h-40 bg-slate-200 relative p-3 flex justify-between items-start">
            <div className="h-5 w-20 bg-slate-300 rounded-full" />
            <div className="h-5 w-24 bg-slate-300 rounded-full" />
          </div>

          {/* Event Content */}
          <div className="p-4 space-y-3">
            <div className="h-2.5 w-28 bg-slate-200 rounded-md" />
            <div className="h-4 w-48 bg-slate-200 rounded-md" />
            <div className="h-3 w-full bg-slate-100 rounded-md" />
            <div className="h-3 w-4/5 bg-slate-100 rounded-md" />

            {/* Meta chips */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="h-3 w-28 bg-slate-100 rounded-md" />
              <div className="h-3 w-24 bg-slate-100 rounded-md" />
            </div>

            {/* Progress bar and Join button */}
            <div className="pt-2 flex items-center justify-between gap-4">
              <div className="h-2 flex-1 bg-slate-100 rounded-full" />
              <div className="h-9 w-28 bg-slate-200 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Bus Routes
 */
export function BusInfoSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-3.5 pb-8 animate-pulse" aria-label="Loading bus transit lines">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`bus-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
        >
          {/* Header: Bus number + Status + Next Departure */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-16 h-7 rounded-xl bg-slate-200" />
              <div className="w-20 h-5 rounded-full bg-slate-100" />
            </div>
            <div className="space-y-1 text-right">
              <div className="h-3.5 w-24 bg-slate-200 rounded-md ml-auto" />
              <div className="h-2 w-14 bg-slate-100 rounded-md ml-auto" />
            </div>
          </div>

          {/* Route path */}
          <div className="space-y-1.5 pt-1">
            <div className="h-3.5 w-48 bg-slate-200 rounded-md" />
            <div className="h-2.5 w-32 bg-slate-100 rounded-md" />
          </div>

          {/* Route Stop Dots line */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-200" />
              <div className="h-1.5 w-16 bg-slate-100 rounded-full" />
              <div className="w-2 h-2 rounded-full bg-slate-200" />
            </div>
            <div className="h-3 w-16 bg-slate-100 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Train Schedules
 */
export function TrainInfoSkeleton({ count = 4 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-3.5 pb-8 animate-pulse" aria-label="Loading train schedules">
      {/* Live Board skeleton */}
      <div className="bg-slate-900/90 text-white rounded-3xl p-4 shadow-md flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="h-2.5 w-24 bg-slate-700 rounded-md" />
          <div className="h-4 w-40 bg-slate-600 rounded-md" />
        </div>
        <div className="space-y-1.5 text-right">
          <div className="h-3.5 w-16 bg-slate-700 rounded-md ml-auto" />
          <div className="h-2.5 w-24 bg-slate-800 rounded-md ml-auto" />
        </div>
      </div>

      <div className="flex items-center justify-between px-1 pt-1">
        <div className="h-3 w-32 bg-slate-200 rounded-md" />
        <div className="h-3 w-24 bg-slate-100 rounded-md" />
      </div>

      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`train-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-200" />
              <div className="space-y-1">
                <div className="h-3.5 w-32 bg-slate-200 rounded-md" />
                <div className="h-2.5 w-20 bg-slate-100 rounded-md" />
              </div>
            </div>
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-3 w-28 bg-slate-200 rounded-md" />
              <div className="h-2 w-16 bg-slate-100 rounded-md" />
            </div>
            <div className="h-6 w-14 bg-slate-100 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton component for Civic Grievance Tickets
 */
export function ComplaintTrackingSkeleton({ count = 3 }: SkeletonProps) {
  return (
    <div className="p-4 space-y-3.5 pb-8 animate-pulse" aria-label="Loading complaint tickets">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={`ticket-skeleton-${idx}`}
          className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs space-y-3"
        >
          {/* Ticket ID + Status Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-4 w-16 bg-slate-200 rounded-md" />
              <div className="h-4 w-20 bg-slate-100 rounded-md" />
            </div>
            <div className="h-5 w-24 bg-slate-200 rounded-full" />
          </div>

          {/* Title & Department */}
          <div className="space-y-1.5">
            <div className="h-4 w-48 bg-slate-200 rounded-md" />
            <div className="h-3 w-full bg-slate-100 rounded-md" />
            <div className="h-3 w-3/4 bg-slate-100 rounded-md" />
          </div>

          {/* Location and Timeline step dots */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-3 w-32 bg-slate-100 rounded-md" />
            <div className="h-6 w-20 bg-slate-200 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}
