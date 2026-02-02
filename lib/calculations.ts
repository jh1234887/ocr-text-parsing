import type { ProductionPlan, ProductionCheck, ProductionStatus, ExtensionStatus } from "./types"

// 기본 상수
export const WORK_START_TIME = "08:30"
export const WORK_END_TIME = "17:30"
export const TOTAL_WORK_MINUTES = 540 // 총 근무시간(분): 08:30~17:30 = 9시간 = 540분
export const LUNCH_BREAK_MINUTES = 60 // 점심시간(분): 12:30~13:30
export const REST_BREAK_MINUTES = 20 // 쉬는시간(분): 10:30~10:40(10분) + 15:30~15:40(10분)
export const EXCLUDED_MINUTES = LUNCH_BREAK_MINUTES + REST_BREAK_MINUTES // 제외시간: 80분

// 실 가동시간(분): 540 - 80 = 460분
export const EFFECTIVE_WORK_MINUTES = TOTAL_WORK_MINUTES - EXCLUDED_MINUTES // 460분

/**
 * 시간 문자열을 분으로 변환
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number)
  return hours * 60 + minutes
}

/**
 * 분을 시간 문자열로 변환
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
}

/**
 * 점검시각까지의 가동시간 계산 (제외시간 고려)
 */
export function calculateOperatingMinutes(checkTime: string): number {
  const checkMinutes = timeToMinutes(checkTime)
  const startMinutes = timeToMinutes(WORK_START_TIME)
  
  let operatingMinutes = checkMinutes - startMinutes
  
  // 오전 휴식 (10:30-10:40) - 10분 제외
  const morningBreakStart = timeToMinutes("10:30")
  const morningBreakEnd = timeToMinutes("10:40")
  if (checkMinutes > morningBreakEnd) {
    operatingMinutes -= 10
  } else if (checkMinutes > morningBreakStart) {
    operatingMinutes -= (checkMinutes - morningBreakStart)
  }
  
  // 중식 (12:30-13:30) - 60분 제외
  const lunchStart = timeToMinutes("12:30")
  const lunchEnd = timeToMinutes("13:30")
  if (checkMinutes > lunchEnd) {
    operatingMinutes -= 60
  } else if (checkMinutes > lunchStart) {
    operatingMinutes -= (checkMinutes - lunchStart)
  }
  
  // 오후 휴식 (15:30-15:40) - 10분 제외
  const afternoonBreakStart = timeToMinutes("15:30")
  const afternoonBreakEnd = timeToMinutes("15:40")
  if (checkMinutes > afternoonBreakEnd) {
    operatingMinutes -= 10
  } else if (checkMinutes > afternoonBreakStart) {
    operatingMinutes -= (checkMinutes - afternoonBreakStart)
  }
  
  return Math.max(operatingMinutes, 1) // 최소 1분
}

/**
 * 진행 BPM 계산 (점검시각 내 생산수량 / 가동시간)
 */
export function calculateCurrentBPM(producedQuantity: number, checkTime: string): number {
  const operatingMinutes = calculateOperatingMinutes(checkTime)
  return Math.round(producedQuantity / operatingMinutes)
}

/**
 * 설계 BPM 계산 (계획수량 / 근무시간)
 */
export function calculateDesignBPM(plannedQuantity: number): number {
  return Math.round(plannedQuantity / EFFECTIVE_WORK_MINUTES)
}

/**
 * 추정 BPM 계산 (진행 BPM과 설계 BPM의 평균)
 */
export function calculateEstimatedBPM(currentBPM: number, designBPM: number): number {
  return Math.round((currentBPM + designBPM) / 2)
}

/**
 * 생산잔량 계산
 */
export function calculateRemainingQuantity(plannedQuantity: number, producedQuantity: number): number {
  return Math.max(plannedQuantity - producedQuantity, 0)
}

/**
 * 생산종료 필요시간(시) 계산
 */
export function calculateRequiredHours(remainingQuantity: number, estimatedBPM: number): number {
  if (estimatedBPM <= 0) return 0
  return Number((remainingQuantity / estimatedBPM / 60).toFixed(1))
}

/**
 * 종료예상 시간 계산
 */
export function calculateEstimatedEndTime(checkTime: string, requiredHours: number): string {
  const checkMinutes = timeToMinutes(checkTime)
  const additionalMinutes = requiredHours * 60
  
  let totalMinutes = checkMinutes + additionalMinutes
  
  // 점검 후 남은 휴식시간 추가
  const checkMins = timeToMinutes(checkTime)
  
  // 오전 휴식 미경과 시
  if (checkMins < timeToMinutes("10:30")) {
    totalMinutes += 10
  }
  
  // 중식 미경과 시
  if (checkMins < timeToMinutes("12:30")) {
    totalMinutes += 60
  }
  
  // 오후 휴식 미경과 시
  if (checkMins < timeToMinutes("15:30")) {
    totalMinutes += 10
  }
  
  return minutesToTime(totalMinutes)
}

/**
 * 연장예상 상태 판단
 */
export function determineExtensionStatus(estimatedEndTime: string): ExtensionStatus {
  const endMinutes = timeToMinutes(estimatedEndTime)
  const normalEnd = timeToMinutes("17:30")
  const warningEnd = timeToMinutes("18:00")
  const cautionEnd = timeToMinutes("19:30")
  
  if (endMinutes <= normalEnd) {
    return "normal" // 정상 (초록)
  } else if (endMinutes <= warningEnd) {
    return "warning" // 주의 (노랑)
  } else if (endMinutes <= cautionEnd) {
    return "caution" // 경고 (주황)
  } else {
    return "critical" // 위험 (빨강)
  }
}

/**
 * 연장예상 표시 문자
 */
export function getExtensionSymbol(status: ExtensionStatus): string {
  switch (status) {
    case "normal":
      return "O"
    case "warning":
      return "△"
    case "caution":
      return "▲"
    case "critical":
      return "X"
  }
}

/**
 * 전체 생산 상태 계산
 */
export function calculateProductionStatus(
  plan: ProductionPlan,
  check: ProductionCheck | null
): ProductionStatus {
  if (!check) {
    return {
      plan,
      check: null,
      remainingQuantity: plan.plannedQuantity,
      currentBPM: 0,
      estimatedBPM: 0,
      requiredHours: 0,
      estimatedEndTime: "--:--",
      extensionStatus: "normal",
    }
  }
  
  const remainingQuantity = calculateRemainingQuantity(plan.plannedQuantity, check.producedQuantity)
  const currentBPM = calculateCurrentBPM(check.producedQuantity, check.checkTime)
  const designBPM = calculateDesignBPM(plan.plannedQuantity)
  const estimatedBPM = calculateEstimatedBPM(currentBPM, designBPM)
  const requiredHours = calculateRequiredHours(remainingQuantity, estimatedBPM)
  const estimatedEndTime = calculateEstimatedEndTime(check.checkTime, requiredHours)
  const extensionStatus = determineExtensionStatus(estimatedEndTime)
  
  return {
    plan,
    check,
    remainingQuantity,
    currentBPM,
    estimatedBPM,
    requiredHours,
    estimatedEndTime,
    extensionStatus,
  }
}
