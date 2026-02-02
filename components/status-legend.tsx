"use client"

export function StatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-sm">
      <span className="text-muted-foreground font-medium">연장예상 범례:</span>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--status-green)] text-white text-xs font-bold">
          O
        </span>
        <span className="text-muted-foreground">17:30 이전</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--status-yellow)] text-foreground text-xs font-bold">
          △
        </span>
        <span className="text-muted-foreground">17:30~18:00</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--status-orange)] text-white text-xs font-bold">
          ▲
        </span>
        <span className="text-muted-foreground">18:00~19:30</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--status-red)] text-white text-xs font-bold">
          X
        </span>
        <span className="text-muted-foreground">19:30 이후</span>
      </div>
    </div>
  )
}
