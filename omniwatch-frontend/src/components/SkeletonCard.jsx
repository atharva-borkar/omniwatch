// Skeleton loading states for all card types

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl bg-white dark:bg-navy-800 overflow-hidden shadow-card">
      <div className="aspect-[2/3] bg-slate-200 dark:bg-navy-700" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-navy-700" />
        <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-navy-700" />
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="animate-pulse w-full h-[420px] md:h-[520px] rounded-2xl bg-slate-200 dark:bg-navy-800" />
  );
}

export function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-64 w-full rounded-2xl bg-slate-200 dark:bg-navy-800" />
      <div className="grid grid-cols-3 gap-6">
        <div className="h-96 rounded-xl bg-slate-200 dark:bg-navy-800" />
        <div className="col-span-2 space-y-4">
          <div className="h-8 w-2/3 rounded bg-slate-200 dark:bg-navy-800" />
          <div className="h-4 w-full rounded bg-slate-200 dark:bg-navy-800" />
          <div className="h-4 w-5/6 rounded bg-slate-200 dark:bg-navy-800" />
        </div>
      </div>
    </div>
  );
}