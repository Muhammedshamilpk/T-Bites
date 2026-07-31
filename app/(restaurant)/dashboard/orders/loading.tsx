import React from "react";

export default function LoadingDashboardOrders() {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-8 w-48 bg-foreground/10 rounded-xl mb-2" />
          <div className="h-4 w-64 bg-foreground/5 rounded-lg" />
        </div>
        <div className="h-10 w-36 bg-foreground/10 rounded-xl" />
      </div>

      {/* Order Status Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border bg-background space-y-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-24 bg-foreground/10 rounded-md" />
              <div className="h-6 w-20 bg-foreground/10 rounded-full" />
            </div>
            <div className="space-y-2 border-y border-border/50 py-3">
              <div className="h-4 w-full bg-foreground/5 rounded-md" />
              <div className="h-4 w-3/4 bg-foreground/5 rounded-md" />
            </div>
            <div className="flex justify-end gap-2">
              <div className="h-9 w-24 bg-foreground/10 rounded-xl" />
              <div className="h-9 w-24 bg-foreground/10 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
