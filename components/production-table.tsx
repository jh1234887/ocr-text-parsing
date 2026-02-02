"use client"

import type { ProductionStatus, ExtensionStatus } from "@/lib/types"
import { getExtensionSymbol } from "@/lib/calculations"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ProductionTableProps {
  statuses: ProductionStatus[]
  onRowClick?: (status: ProductionStatus) => void
}

function getStatusColor(status: ExtensionStatus): string {
  switch (status) {
    case "normal":
      return "bg-[var(--status-green)] text-white"
    case "warning":
      return "bg-[var(--status-yellow)] text-foreground"
    case "caution":
      return "bg-[var(--status-orange)] text-white"
    case "critical":
      return "bg-[var(--status-red)] text-white"
  }
}

function getStatusBorderColor(status: ExtensionStatus): string {
  switch (status) {
    case "normal":
      return "border-l-[var(--status-green)]"
    case "warning":
      return "border-l-[var(--status-yellow)]"
    case "caution":
      return "border-l-[var(--status-orange)]"
    case "critical":
      return "border-l-[var(--status-red)]"
  }
}

export function ProductionTable({ statuses, onRowClick }: ProductionTableProps) {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary/10">
              <TableHead className="font-semibold text-center min-w-[60px]">라인</TableHead>
              <TableHead className="font-semibold min-w-[140px]">제품명</TableHead>
              <TableHead className="font-semibold text-center min-w-[70px]">규격</TableHead>
              <TableHead className="font-semibold text-center min-w-[80px]">제품코드</TableHead>
              <TableHead className="font-semibold text-center min-w-[80px]">Lot-No.</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">계획수량</TableHead>
              <TableHead className="font-semibold text-center min-w-[80px]">점검시각</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">생산수량</TableHead>
              <TableHead className="font-semibold text-right min-w-[100px]">생산잔량</TableHead>
              <TableHead className="font-semibold text-right min-w-[90px]">진행 BPM</TableHead>
              <TableHead className="font-semibold text-right min-w-[90px]">추정 BPM</TableHead>
              <TableHead className="font-semibold text-right min-w-[110px]">
                <span className="text-xs leading-tight block">생산종료</span>
                <span className="text-xs leading-tight block">필요시간(h)</span>
              </TableHead>
              <TableHead className="font-semibold text-center min-w-[90px]">
                <span className="text-xs leading-tight block">종료예상</span>
              </TableHead>
              <TableHead className="font-semibold text-center min-w-[90px]">
                <span className="text-xs leading-tight block">연장예상</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statuses.map((status) => (
              <TableRow
                key={status.plan.id}
                className={cn(
                  "border-l-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  getStatusBorderColor(status.extensionStatus)
                )}
                onClick={() => onRowClick?.(status)}
              >
                <TableCell className="text-center font-medium">{status.plan.line}</TableCell>
                <TableCell className="font-medium">{status.plan.productName}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {status.plan.specification || "-"}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {status.plan.productCode || "-"}
                </TableCell>
                <TableCell className="text-center font-mono text-sm">
                  {status.plan.lotNumber || "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.plan.plannedQuantity.toLocaleString()}
                </TableCell>
                <TableCell className="text-center font-mono">
                  {status.check?.checkTime || "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.check?.producedQuantity.toLocaleString() || "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.remainingQuantity > 0 ? status.remainingQuantity.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.currentBPM > 0 ? status.currentBPM.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.estimatedBPM > 0 ? status.estimatedBPM.toLocaleString() : "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {status.requiredHours > 0 ? status.requiredHours.toFixed(1) : "-"}
                </TableCell>
                <TableCell className="text-center font-mono font-medium">
                  {status.estimatedEndTime !== "--:--" ? status.estimatedEndTime : "-"}
                </TableCell>
                <TableCell className="text-center">
                  {status.check ? (
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm",
                        getStatusColor(status.extensionStatus)
                      )}
                    >
                      {getExtensionSymbol(status.extensionStatus)}
                    </span>
                  ) : (
                    "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
