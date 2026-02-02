"use client"

import type { OCRResult, ProductionPlan } from "@/lib/types"
import { calculateProducedQuantity, getUnitCount } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, AlertTriangle, Edit2, Calculator } from "lucide-react"
import { useState, useMemo, useEffect } from "react"

interface OCRResultCardProps {
  result: OCRResult
  plans: ProductionPlan[]
  onConfirm: (planId: string, checkTime: string, quantity: number) => void
  onCancel: () => void
}

export function OCRResultCard({ result, plans, onConfirm, onCancel }: OCRResultCardProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>("")
  const [editedTime, setEditedTime] = useState(result.checkTime)
  const [editedBatchCount, setEditedBatchCount] = useState(result.batchCount.toString())
  const [isEditing, setIsEditing] = useState(false)

  const confidencePercent = Math.round(result.confidence * 100)
  const isLowConfidence = result.confidence < 0.8

  // 라인에 맞는 플랜 자동 선택
  const matchingPlan = plans.find((p) => p.line === result.line)
  
  useEffect(() => {
    if (matchingPlan && !selectedPlanId) {
      setSelectedPlanId(matchingPlan.id)
    }
  }, [matchingPlan, selectedPlanId])

  // 선택된 플랜의 규격 정보
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)
  const specification = selectedPlan?.specification || ""
  const unitCount = getUnitCount(specification)

  // 계산된 생산수량 (배치카운트 * 입수)
  const calculatedQuantity = useMemo(() => {
    const batchCount = Number.parseInt(editedBatchCount, 10) || 0
    return calculateProducedQuantity(batchCount, specification)
  }, [editedBatchCount, specification])

  const handleConfirm = () => {
    if (!selectedPlanId) return
    onConfirm(selectedPlanId, editedTime, calculatedQuantity)
  }

  return (
    <Card className="border-primary/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">OCR 인식 결과</CardTitle>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              isLowConfidence
                ? "bg-[var(--status-yellow)] text-foreground"
                : "bg-[var(--status-green)] text-white"
            }`}
          >
            신뢰도: {confidencePercent}%
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLowConfidence && (
          <div className="flex items-center gap-2 p-3 bg-[var(--status-yellow)]/20 rounded-lg text-sm">
            <AlertTriangle className="h-4 w-4 text-[var(--status-orange)]" />
            <span>인식 신뢰도가 낮습니다. 데이터를 확인해 주세요.</span>
          </div>
        )}

        {/* 인식된 라인 정보 */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">인식된 라인</span>
            <Badge variant="outline" className="text-lg font-bold">
              {result.line}라인
            </Badge>
          </div>
        </div>

        <div className="grid gap-4">
          {/* 생산 라인 선택 */}
          <div className="space-y-2">
            <Label htmlFor="plan-select">생산 라인 선택</Label>
            <Select value={selectedPlanId} onValueChange={setSelectedPlanId}>
              <SelectTrigger id="plan-select">
                <SelectValue placeholder="라인을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {plans.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.line}라인 - {plan.productName} ({plan.specification || "규격 없음"})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 점검 시각 & 배치 카운트 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="check-time">점검 시각</Label>
                {!isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit2 className="h-3 w-3 mr-1" />
                    수정
                  </Button>
                )}
              </div>
              <Input
                id="check-time"
                type="time"
                value={editedTime}
                onChange={(e) => setEditedTime(e.target.value)}
                disabled={!isEditing}
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batch-count">배치 제품 카운트</Label>
              <Input
                id="batch-count"
                type="number"
                value={editedBatchCount}
                onChange={(e) => setEditedBatchCount(e.target.value)}
                disabled={!isEditing}
                className="font-mono text-lg font-bold"
              />
            </div>
          </div>

          {/* 생산수량 계산 결과 */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-primary" />
              <span className="font-medium">생산수량 계산</span>
            </div>
            <div className="grid grid-cols-3 gap-2 items-center text-center">
              <div>
                <div className="text-2xl font-bold font-mono">{editedBatchCount || 0}</div>
                <div className="text-xs text-muted-foreground">배치 카운트</div>
              </div>
              <div className="text-xl text-muted-foreground">×</div>
              <div>
                <div className="text-2xl font-bold font-mono">{unitCount}</div>
                <div className="text-xs text-muted-foreground">
                  {specification ? `규격 (${specification})` : "입수"}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">계산된 생산수량</span>
                <span className="text-2xl font-bold text-primary font-mono">
                  {calculatedQuantity.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onCancel}>
            취소
          </Button>
          <Button className="flex-1" onClick={handleConfirm} disabled={!selectedPlanId}>
            <Check className="h-4 w-4 mr-2" />
            확인
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
