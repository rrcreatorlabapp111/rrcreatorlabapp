import { Skeleton } from "@/components/ui/skeleton";

export const AuthLoadingSkeleton = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="orb orb-1" aria-hidden="true" />
      <div className="orb orb-2" aria-hidden="true" />
      <div className="orb orb-3" aria-hidden="true" />
      
      {/* Noise texture overlay */}
      <div className="noise-overlay" aria-hidden="true" />
      
      {/* Grid pattern */}
      <div className="fixed inset-0 grid-pattern opacity-30 pointer-events-none" aria-hidden="true" />

      {/* Main content skeleton */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Logo skeleton */}
        <div className="text-center mb-8 animate-fade-in">
          <Skeleton className="w-20 h-20 rounded-3xl mx-auto mb-6 bg-muted/50" />
          <Skeleton className="h-8 w-48 mx-auto mb-2 bg-muted/50" />
          <Skeleton className="h-5 w-36 mx-auto bg-muted/50" />
        </div>

        {/* Card skeleton */}
        <div className="w-full max-w-sm p-6 rounded-xl glass border border-border/50 animate-slide-up">
          {/* Email field skeleton */}
          <div className="space-y-2 mb-5">
            <Skeleton className="h-4 w-28 bg-muted/50" />
            <Skeleton className="h-12 w-full bg-muted/50" />
          </div>

          {/* Password field skeleton */}
          <div className="space-y-2 mb-5">
            <Skeleton className="h-4 w-20 bg-muted/50" />
            <Skeleton className="h-12 w-full bg-muted/50" />
          </div>

          {/* Button skeleton */}
          <Skeleton className="h-12 w-full bg-muted/50 mb-6" />

          {/* Divider skeleton */}
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="flex-1 h-px bg-muted/30" />
            <Skeleton className="h-4 w-6 bg-muted/50" />
            <Skeleton className="flex-1 h-px bg-muted/30" />
          </div>

          {/* Toggle button skeleton */}
          <Skeleton className="h-12 w-full bg-muted/50" />
        </div>

        {/* Footer skeleton */}
        <Skeleton className="h-4 w-64 mt-8 bg-muted/30" />
      </div>
    </div>
  );
};
