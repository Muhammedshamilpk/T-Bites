import React from "react";

export default function LoadingAdminRestaurants() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-56 bg-foreground/10 rounded-xl mb-2" />
          <div className="h-4 w-72 bg-foreground/5 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
        <div className="h-12 bg-foreground/5 border-b border-border" />
        <div className="divide-y divide-border">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-foreground/10" />
                <div className="space-y-1">
                  <div className="h-5 w-40 bg-foreground/10 rounded-md" />
                  <div className="h-3.5 w-28 bg-foreground/5 rounded-md" />
                </div>
              </div>
              <div className="h-6 w-20 bg-foreground/10 rounded-full" />
              <div className="h-9 w-32 bg-foreground/10 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
