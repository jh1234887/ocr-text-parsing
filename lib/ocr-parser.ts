import type { OCRResult } from "./types"

/**
 * 기계 디스플레이 이미지에서 OCR 데이터 추출을 위한 파서
 * 
 * 추출 대상 정보:
 * 1. 라인: A, B, C
 * 2. 배치 제품 카운트: 402, 609 등
 * 3. 점검시각: 9:42, 9:46 등
 */

/**
 * OCR 텍스트에서 라인 정보 추출 (A, B, C)
 */
export function extractLine(text: string): string {
  // A-LINE, A라인, A-LINE OUT, C라인아웃카튼 등에서 라인 문자 추출
  const linePatterns = [
    /([A-C])-?LINE/i,
    /([A-C])라인/,
    /([A-C])-?라인/,
  ]

  for (const pattern of linePatterns) {
    const match = text.match(pattern)
    if (match) {
      return match[1].toUpperCase()
    }
  }

  return "A" // 기본값
}

/**
 * OCR 텍스트에서 점검시각 추출 (HH:MM)
 */
export function extractCheckTime(text: string): string {
  // 오전/오후 9:42 형식
  const timePattern1 = /(?:오전|오후)\s*(\d{1,2}):(\d{2})/
  const match1 = text.match(timePattern1)
  if (match1) {
    let hours = parseInt(match1[1], 10)
    const minutes = match1[2]
    
    // 오후인 경우 12시간 추가 (12시 제외)
    if (text.includes("오후") && hours !== 12) {
      hours += 12
    }
    // 오전 12시는 00시로
    if (text.includes("오전") && hours === 12) {
      hours = 0
    }
    
    return `${hours.toString().padStart(2, "0")}:${minutes}`
  }

  // HH:MM 형식
  const timePattern2 = /(\d{1,2}):(\d{2})/
  const match2 = text.match(timePattern2)
  if (match2) {
    return `${match2[1].padStart(2, "0")}:${match2[2]}`
  }

  // 현재 시간 반환
  const now = new Date()
  return `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
}

/**
 * OCR 텍스트에서 배치 제품 카운트 추출
 */
export function extractBatchCount(text: string): number {
  // "배치 제품 카운트" 또는 "제품 카운터" 다음의 숫자
  const patterns = [
    /(?:배치\s*)?제품\s*카운트?\s*[:\s]*(\d{1,3}(?:,\d{3})*|\d+)/i,
    /제품\s*카운터?\s*[:\s]*(\d{1,3}(?:,\d{3})*|\d+)/i,
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return parseInt(match[1].replace(/,/g, ""), 10)
    }
  }

  // 3자리 숫자 찾기 (카운터로 추정)
  const allNumbers = text.match(/\b\d{3}\b/g)
  if (allNumbers) {
    const counts = allNumbers
      .map((n) => parseInt(n, 10))
      .filter((n) => n >= 100 && n < 1000)
    if (counts.length > 0) {
      return counts[0]
    }
  }

  return 0
}

/**
 * OCR 텍스트에서 전체 결과 파싱
 */
export function parseOCRText(text: string): OCRResult {
  return {
    line: extractLine(text),
    batchCount: extractBatchCount(text),
    checkTime: extractCheckTime(text),
    confidence: 0.85,
  }
}

/**
 * 시뮬레이션용 OCR 결과 생성 (테스트/데모용)
 */
export function simulateOCRResult(lineHint?: string): OCRResult {
  const lines = ["A", "B", "C"]
  const selectedLine = lineHint || lines[Math.floor(Math.random() * lines.length)]

  const now = new Date()
  const checkTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`
  
  return {
    line: selectedLine,
    batchCount: Math.floor(Math.random() * 500) + 100, // 100 ~ 600
    checkTime,
    confidence: 0.85 + Math.random() * 0.15, // 0.85 ~ 1.0
  }
}
