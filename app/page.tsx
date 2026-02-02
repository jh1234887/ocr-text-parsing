"use client"

import { useState, useCallback, useMemo } from "react"
import { Header } from "@/components/header"
import { StatusSummary } from "@/components/status-summary"
import { ProductionTable } from "@/components/production-table"
import { ImageUploader } from "@/components/image-uploader"
import { OCRResultCard } from "@/components/ocr-result-card"
import { StatusLegend } from "@/components/status-legend"
import { SettingsPanel } from "@/components/settings-panel"
import { mockProductionPlans, mockProductionChecks } from "@/lib/mock-data"
import { calculateProductionStatus } from "@/lib/calculations"
import type { ProductionPlan, ProductionCheck, OCRResult, ProductionStatus, User } from "@/lib/types"
import { getPermissions } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LayoutDashboard, Camera, Settings2, Lock } from "lucide-react"

export default function Home() {
  const [plans, setPlans] = useState<ProductionPlan[]>(mockProductionPlans)
  const [checks, setChecks] = useState<ProductionCheck[]>(mockProductionChecks)
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  // 테스트용: 모든 권한을 가진 관리자로 설정
  const currentUser: User = {
    id: "user-1",
    name: "김관리",
    role: "manager", // manager = 모든 권한
    department: "식품팀",
  }

  const permissions = getPermissions(currentUser.role)

  const productionStatuses = useMemo<ProductionStatus[]>(() => {
    return plans.map((plan) => {
      const latestCheck = checks
        .filter((c) => c.planId === plan.id)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null
      return calculateProductionStatus(plan, latestCheck)
    })
  }, [plans, checks])

  const handleOCRComplete = useCallback((result: OCRResult) => {
    setOcrResult(result)
  }, [])

  const handleConfirmOCR = useCallback(
    (planId: string, checkTime: string, quantity: number) => {
      const newCheck: ProductionCheck = {
        id: `check-${Date.now()}`,
        planId,
        checkTime,
        producedQuantity: quantity,
        createdAt: new Date().toISOString(),
        createdBy: "current-user",
      }
      setChecks((prev) => [...prev, newCheck])
      setOcrResult(null)
    },
    []
  )

  const handleCancelOCR = useCallback(() => {
    setOcrResult(null)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header currentUser={currentUser} />

      <main className="container px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="input" className="gap-2" disabled={!permissions.dataInput}>
              {!permissions.dataInput && <Lock className="h-3 w-3" />}
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">데이터 입력</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2" disabled={!permissions.settings}>
              {!permissions.settings && <Lock className="h-3 w-3" />}
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">설정</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <StatusSummary statuses={productionStatuses} />

            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>생산 현황</CardTitle>
                  <StatusLegend />
                </div>
              </CardHeader>
              <CardContent>
                <ProductionTable statuses={productionStatuses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="input" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg font-semibold">기계 디스플레이 촬영</h2>
                  <p className="text-sm text-muted-foreground">
                    기계 디스플레이의 제품 카운터 화면을 촬영하면 자동으로 데이터를 추출합니다
                  </p>
                  <div className="mt-2 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                    <p className="font-medium mb-1">추출 가능 정보:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>라인: A, B, C</li>
                      <li>배치 제품 카운트 (예: 402)</li>
                      <li>점검 시각</li>
                    </ul>
                    <p className="mt-2 pt-2 border-t border-muted-foreground/20">
                      <span className="font-medium">생산수량 계산:</span> 배치 카운트 × 규격(입수)
                    </p>
                  </div>
                </div>
                <ImageUploader
                  onOCRComplete={handleOCRComplete}
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                />
              </div>

              <div className="space-y-4">
                {ocrResult ? (
                  <OCRResultCard
                    result={ocrResult}
                    plans={plans}
                    onConfirm={handleConfirmOCR}
                    onCancel={handleCancelOCR}
                  />
                ) : (
                  <Card className="h-full min-h-[300px] flex items-center justify-center">
                    <CardContent className="text-center">
                      <Camera className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">
                        사진을 촬영하면 인식 결과가 여기에 표시됩니다
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">최근 입력 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <ProductionTable statuses={productionStatuses} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {permissions.settings ? (
              <SettingsPanel 
                currentUser={currentUser} 
                plans={plans}
                onPlansUpdate={setPlans}
              />
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">
                    설정 페이지는 관리자 권한이 필요합니다.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
