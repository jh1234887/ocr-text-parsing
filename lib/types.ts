export interface ProductionPlan {
  id: string
  line: string
  productName: string
  specification: string
  productCode: string
  lotNumber: string
  plannedQuantity: number
  weekStartDate: string
}

export interface ProductionCheck {
  id: string
  planId: string
  checkTime: string
  producedQuantity: number
  createdAt: string
  createdBy: string
}

export interface ProductionStatus {
  plan: ProductionPlan
  check: ProductionCheck | null
  remainingQuantity: number
  currentBPM: number
  estimatedBPM: number
  requiredHours: number
  estimatedEndTime: string
  extensionStatus: ExtensionStatus
}

export type ExtensionStatus = "normal" | "warning" | "caution" | "critical"

export interface OCRResult {
  line: string // 라인명 (A, B, C)
  batchCount: number // 배치 제품 카운트 (기계에서 읽은 값)
  checkTime: string // 점검시각 (HH:MM)
  confidence: number // OCR 인식 신뢰도
}

// 규격에서 입수 추출 (예: "20입" -> 20, "100입" -> 100)
export function getUnitCount(specification: string): number {
  const match = specification.match(/(\d+)입/)
  return match ? parseInt(match[1], 10) : 1
}

// 생산수량 계산 (배치카운트 * 입수)
export function calculateProducedQuantity(batchCount: number, specification: string): number {
  const unitCount = getUnitCount(specification)
  return batchCount * unitCount
}

// 권한 설정
// - 대시보드: ALL (모든 사용자)
// - 데이터 입력: 식품팀 담당자 (operator, manager)
// - 설정: 식품팀 관리자 (manager)
export type UserRole = "viewer" | "operator" | "manager"

export interface User {
  id: string
  name: string
  role: UserRole
  department: string
}

export interface Permission {
  dashboard: boolean
  dataInput: boolean
  settings: boolean
}

// 역할별 권한
export function getPermissions(role: UserRole): Permission {
  switch (role) {
    case "manager": // 식품팀 관리자 - 모든 권한
      return { dashboard: true, dataInput: true, settings: true }
    case "operator": // 식품팀 담당자 - 대시보드, 데이터 입력
      return { dashboard: true, dataInput: true, settings: false }
    case "viewer": // 일반 조회자 - 대시보드만
    default:
      return { dashboard: true, dataInput: false, settings: false }
  }
}

// 사용자 목록 (테스트용)
export interface UserWithPermission extends User {
  permissions: Permission
}
