"use client"

import type { ProductionStatus } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Factory, Clock, TrendingUp, AlertTriangle } from "lucide-react"

interface StatusSummaryProps {
  statuses: ProductionStatus[]
}

export function StatusSummary({ statuses }: StatusSummaryProps) {
  const activeLines = statuses.filter((s) => s.check !== null).length
  const totalLines = statuses.length

  const criticalCount = statuses.filter((s) => s.extensionStatus === "critical").length
  const cautionCount = statuses.filter((s) => s.extensionStatus === "caution").length
  const warningCount = statuses.filter((s) => s.extensionStatus === "warning").length

  const avgBPM =
    statuses.filter((s) => s.currentBPM > 0).reduce((acc, s) => acc + s.currentBPM, 0) /
      statuses.filter((s) => s.currentBPM > 0).length || 0

  const latestCheckTime =
    statuses
      .filter((s) => s.check)
      .map((s) => s.check!.checkTime)
      .sort()
      .pop() || "--:--"

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Factory className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">가동 라인</p>
              <p className="text-2xl font-bold">
                {activeLines}
                <span className="text-base font-normal text-muted-foreground">/{totalLines}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">최근 점검</p>
              <p className="text-2xl font-bold font-mono">{latestCheckTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">평균 BPM</p>
              <p className="text-2xl font-bold font-mono">
                {avgBPM > 0 ? Math.round(avgBPM).toLocaleString() : "-"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">연장 예상</p>
              <div className="flex items-center gap-2">
                {criticalCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--status-red)] text-white">
                    {criticalCount}
                  </span>
                )}
                {cautionCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--status-orange)] text-white">
                    {cautionCount}
                  </span>
                )}
                {warningCount > 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--status-yellow)] text-foreground">
                    {warningCount}
                  </span>
                )}
                {criticalCount === 0 && cautionCount === 0 && warningCount === 0 && (
                  <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--status-green)] text-white">
                    정상
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
