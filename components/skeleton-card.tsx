"use client";

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3 animate-pulse">
      <div className="h-4 w-1/3 rounded bg-muted" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 rounded bg-muted" style={{ width: `${80 - i * 15}%` }} />
      ))}
    </div>
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 py-3 px-2 animate-pulse">
      <div className="h-4 w-4 rounded bg-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/2 rounded bg-muted" />
        <div className="h-2.5 w-1/3 rounded bg-muted" />
      </div>
      <div className="h-4 w-16 rounded bg-muted" />
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border/50 bg-card p-4 animate-pulse">
          <div className="h-2.5 w-16 rounded bg-muted mb-2" />
          <div className="h-6 w-12 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}
