"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Check, Shield, User, Users, Plus, Pencil, Trash2, ClipboardList, AlertCircle } from "lucide-react"
import type { User as UserType, UserRole, ProductionPlan } from "@/lib/types"

interface SettingsPanelProps {
  currentUser: UserType
  plans: ProductionPlan[]
  onPlansUpdate: (plans: ProductionPlan[]) => void
}

const roleLabels: Record<UserRole, string> = {
  manager: "관리자",
  operator: "담당자",
  viewer: "조회자",
}

const roleDescriptions: Record<UserRole, string> = {
  manager: "모든 기능 접근 가능 (대시보드, 데이터 입력, 설정)",
  operator: "대시보드 조회 및 데이터 입력 가능",
  viewer: "대시보드 조회만 가능",
}

const initialUsers: UserType[] = [
  { id: "user-1", name: "김관리", role: "manager", department: "식품팀" },
  { id: "user-2", name: "이담당", role: "operator", department: "식품팀" },
  { id: "user-3", name: "박담당", role: "operator", department: "식품팀" },
  { id: "user-4", name: "최조회", role: "viewer", department: "품질팀" },
]

const emptyPlan: Omit<ProductionPlan, "id"> = {
  line: "A",
  productName: "",
  specification: "",
  productCode: "",
  lotNumber: "",
  plannedQuantity: 0,
  weekStartDate: new Date().toISOString().split("T")[0],
}

export function SettingsPanel({ currentUser, plans, onPlansUpdate }: SettingsPanelProps) {
  const [users, setUsers] = useState<UserType[]>(initialUsers)
  const [savedMessage, setSavedMessage] = useState(false)
  
  // 생산계획 관리 상태
  const [editingPlans, setEditingPlans] = useState<ProductionPlan[]>(plans)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ProductionPlan | null>(null)
  const [formData, setFormData] = useState<Omit<ProductionPlan, "id">>(emptyPlan)
  const [hasChanges, setHasChanges] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(false)

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    )
  }

  const handleSaveRoles = () => {
    setSavedMessage(true)
    setTimeout(() => setSavedMessage(false), 2000)
  }

  // 생산계획 추가/수정 다이얼로그 열기
  const openAddDialog = () => {
    setEditingPlan(null)
    setFormData(emptyPlan)
    setIsDialogOpen(true)
  }

  const openEditDialog = (plan: ProductionPlan) => {
    setEditingPlan(plan)
    setFormData({
      line: plan.line,
      productName: plan.productName,
      specification: plan.specification,
      productCode: plan.productCode,
      lotNumber: plan.lotNumber,
      plannedQuantity: plan.plannedQuantity,
      weekStartDate: plan.weekStartDate,
    })
    setIsDialogOpen(true)
  }

  const handleFormChange = (field: keyof Omit<ProductionPlan, "id">, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSavePlan = () => {
    if (editingPlan) {
      // 수정
      setEditingPlans((prev) =>
        prev.map((p) => (p.id === editingPlan.id ? { ...p, ...formData } : p))
      )
    } else {
      // 추가
      const newPlan: ProductionPlan = {
        id: `plan-${Date.now()}`,
        ...formData,
      }
      setEditingPlans((prev) => [...prev, newPlan])
    }
    setHasChanges(true)
    setIsDialogOpen(false)
  }

  const handleDeletePlan = (planId: string) => {
    setEditingPlans((prev) => prev.filter((p) => p.id !== planId))
    setHasChanges(true)
  }

  // 확정 버튼 클릭 - 대시보드에 반영
  const handleConfirmPlans = () => {
    onPlansUpdate(editingPlans)
    setHasChanges(false)
    setConfirmMessage(true)
    setTimeout(() => setConfirmMessage(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 주단위 생산계획 등록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-primary" />
              <CardTitle>주단위 생산계획 등록</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog} size="sm" className="gap-1">
                  <Plus className="h-4 w-4" />
                  계획 추가
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>{editingPlan ? "생산계획 수정" : "생산계획 추가"}</DialogTitle>
                  <DialogDescription>
                    라인별 주단위 생산계획 정보를 입력하세요.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="line">라인</Label>
                      <Select
                        value={formData.line}
                        onValueChange={(value) => handleFormChange("line", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A 라인</SelectItem>
                          <SelectItem value="B">B 라인</SelectItem>
                          <SelectItem value="C">C 라인</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="weekStartDate">주차 시작일</Label>
                      <Input
                        id="weekStartDate"
                        type="date"
                        value={formData.weekStartDate}
                        onChange={(e) => handleFormChange("weekStartDate", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="productName">제품명</Label>
                    <Input
                      id="productName"
                      placeholder="예: 비타500ACE(20입)"
                      value={formData.productName}
                      onChange={(e) => handleFormChange("productName", e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="specification">규격</Label>
                      <Input
                        id="specification"
                        placeholder="예: 20입, 100입"
                        value={formData.specification}
                        onChange={(e) => handleFormChange("specification", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="plannedQuantity">계획수량</Label>
                      <Input
                        id="plannedQuantity"
                        type="number"
                        placeholder="460000"
                        value={formData.plannedQuantity || ""}
                        onChange={(e) => handleFormChange("plannedQuantity", parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="productCode">제품코드</Label>
                      <Input
                        id="productCode"
                        placeholder="71053"
                        value={formData.productCode}
                        onChange={(e) => handleFormChange("productCode", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lotNumber">Lot-No.</Label>
                      <Input
                        id="lotNumber"
                        placeholder="26006"
                        value={formData.lotNumber}
                        onChange={(e) => handleFormChange("lotNumber", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    취소
                  </Button>
                  <Button onClick={handleSavePlan}>
                    {editingPlan ? "수정" : "추가"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>주단위 생산 계획을 등록하고 관리합니다. 확정 버튼을 클릭하면 대시보드에 반영됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 변경사항 알림 */}
          {hasChanges && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>변경된 내용이 있습니다. 확정 버튼을 클릭하여 대시보드에 반영하세요.</span>
            </div>
          )}

          {/* 생산계획 테이블 */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-16">라인</TableHead>
                  <TableHead>제품명</TableHead>
                  <TableHead className="w-20">규격</TableHead>
                  <TableHead className="w-24">제품코드</TableHead>
                  <TableHead className="w-24">Lot-No.</TableHead>
                  <TableHead className="w-28 text-right">계획수량</TableHead>
                  <TableHead className="w-24 text-right">관리</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editingPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      등록된 생산계획이 없습니다. 계획 추가 버튼을 클릭하여 추가하세요.
                    </TableCell>
                  </TableRow>
                ) : (
                  editingPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {plan.line}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">{plan.productName}</TableCell>
                      <TableCell>{plan.specification || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{plan.productCode || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{plan.lotNumber || "-"}</TableCell>
                      <TableCell className="text-right font-mono">
                        {plan.plannedQuantity.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEditDialog(plan)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* 확정 버튼 */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">
              확정된 계획은 대시보드에서 실시간으로 모니터링됩니다.
            </p>
            <div className="flex items-center gap-2">
              {confirmMessage && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  대시보드에 반영되었습니다
                </span>
              )}
              <Button onClick={handleConfirmPlans} disabled={!hasChanges && editingPlans.length > 0}>
                <Check className="h-4 w-4 mr-1" />
                확정
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 권한 설정 */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>인원별 권한 설정</CardTitle>
          </div>
          <CardDescription>사용자별 접근 권한을 관리합니다.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 권한 레벨 설명 */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(["manager", "operator", "viewer"] as UserRole[]).map((role) => (
              <div
                key={role}
                className="p-3 rounded-lg border bg-muted/30 space-y-1"
              >
                <div className="flex items-center gap-2">
                  {role === "manager" && <Shield className="h-4 w-4 text-red-500" />}
                  {role === "operator" && <User className="h-4 w-4 text-blue-500" />}
                  {role === "viewer" && <Users className="h-4 w-4 text-gray-500" />}
                  <span className="font-medium text-sm">{roleLabels[role]}</span>
                </div>
                <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
              </div>
            ))}
          </div>

          {/* 사용자 목록 */}
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>이름</TableHead>
                  <TableHead>부서</TableHead>
                  <TableHead>현재 권한</TableHead>
                  <TableHead className="text-right">권한 변경</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                      {user.id === currentUser.id && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          나
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{user.department}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "manager"
                            ? "destructive"
                            : user.role === "operator"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Select
                        value={user.role}
                        onValueChange={(value: UserRole) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">관리자</SelectItem>
                          <SelectItem value="operator">담당자</SelectItem>
                          <SelectItem value="viewer">조회자</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              변경된 권한은 저장 후 즉시 적용됩니다.
            </p>
            <div className="flex items-center gap-2">
              {savedMessage && (
                <span className="text-sm text-green-600 flex items-center gap-1">
                  <Check className="h-4 w-4" />
                  저장되었습니다
                </span>
              )}
              <Button onClick={handleSaveRoles}>권한 저장</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 계산 기준 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>계산 기준 정보</CardTitle>
          <CardDescription>생산량 계산에 사용되는 기준 정보입니다.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">생산시작 기준시간</span>
                <span className="font-mono font-medium">08:30</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">1일 표준근무시각</span>
                <span className="font-mono font-medium">08:30 ~ 17:30</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">총 근무시간</span>
                <span className="font-mono font-medium">460분</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">제외시간</span>
                <span className="font-mono font-medium">80분</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">중식시간</span>
                <span className="font-mono font-medium">12:30 ~ 13:30</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">휴식시간</span>
                <span className="font-mono font-medium">오전/오후 각 10분</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
