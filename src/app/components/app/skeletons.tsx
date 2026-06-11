function SkeletonBox({ w = "100%", h = 14, r = 6 }: { w?: string | number; h?: number; r?: number }) {
  return (
    <div className="skeleton-box" style={{
      width: w, height: h, borderRadius: r, flexShrink: 0,
    }} />
  );
}

export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--g300)] bg-[var(--paper)] px-5 py-4">
      <SkeletonBox w={44} h={44} r={44} />
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <SkeletonBox w={120} h={14} />
          <SkeletonBox w={52} h={18} r={12} />
        </div>
        <div className="flex gap-3">
          <SkeletonBox w={80} h={11} />
          <SkeletonBox w={60} h={11} />
        </div>
      </div>
      <SkeletonBox w={64} h={22} r={4} />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="rounded-xl border border-[var(--g300)] bg-[var(--paper)] p-5" style={{ height: 220 }}>
      <div className="flex justify-between mb-4">
        <div className="space-y-2">
          <SkeletonBox w={140} h={16} />
          <SkeletonBox w={180} h={11} />
        </div>
        <SkeletonBox w={160} h={14} />
      </div>
      <SkeletonBox w="100%" h={150} r={8} />
    </div>
  );
}
