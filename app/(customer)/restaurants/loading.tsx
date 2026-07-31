import React from "react";

export default function LoadingRestaurants() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl animate-pulse">
      {/* Header Skeleton */}
      <div className="h-10 w-64 bg-foreground/10 rounded-xl mb-4" />
      <div className="h-5 w-96 bg-foreground/5 rounded-lg mb-8" />

      {/* Category Pills Skeleton */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-28 bg-foreground/10 rounded-full shrink-0" />
        ))}
      </div>

      {/* Restaurant Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="rounded-3xl border border-border bg-background p-4 flex flex-col gap-4 shadow-sm"
          >
            <div className="h-44 w-full bg-foreground/10 rounded-2xl" />
            <div className="space-y-2">
              <div className="h-6 w-3/4 bg-foreground/10 rounded-lg" />
              <div className="h-4 w-1/2 bg-foreground/5 rounded-lg" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="h-4 w-20 bg-foreground/10 rounded-md" />
              <div className="h-8 w-24 bg-foreground/10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
