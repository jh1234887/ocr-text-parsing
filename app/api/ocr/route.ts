import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"
import type { OCRResult } from "@/lib/types"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const GEMINI_PROMPT = `당신은 공장 생산 라인의 기계 디스플레이 이미지를 분석하는 OCR 전문가입니다.

**먼저 이미지가 공장 생산 라인 디스플레이인지 확인하세요:**
- 생산 라인 관련 디스플레이, 모니터, 현황판이 아닌 경우
- 일반 사진, 풍경, 사람, 음식 등 관련 없는 이미지인 경우
- 위와 같은 경우 다음 형식으로 반환: {"valid": false}

**관련 이미지인 경우, 다음 정보를 정확히 추출하세요:**

1. **라인 정보** (Line):
   - A, B, 또는 C 중 하나
   - "A라인", "A-LINE", "B라인", "C라인" 등의 상단 바 텍스트에서 추출
   - 대문자 A, B, C로 반환

2. **배치 제품 카운트** (Batch Count):
   - 왼쪽 하단 숫자 (예: 402, 609, 155)
   - "제품 카운트", "카운터", "COUNT" 라벨 근처의 숫자
   - 숫자만 반환 (쉼표 제거)

3. **점검 시각** (Check Time):
   - HH:MM 형식 (24시간 형식)
   - "오전 9:42" -> "09:42"
   - "오후 2:15" -> "14:15"
   - "오후 12:30" -> "12:30" (오후 12시는 그대로)
   - "오전 12:30" -> "00:30" (오전 12시는 00시)

4. **신뢰도** (Confidence):
   - 0.0 ~ 1.0 사이의 값
   - 이미지 품질, 텍스트 명확성을 기반으로 추정

**응답 형식 (JSON만 반환, 다른 텍스트 없이):**

관련 없는 이미지:
{"valid": false}

관련 있는 이미지:
{
  "valid": true,
  "line": "A",
  "batchCount": 402,
  "checkTime": "09:42",
  "confidence": 0.92
}

**중요 규칙:**
- 반드시 JSON 형식으로만 응답
- 한국어 텍스트 인식 주의 ("라인", "오전", "오후")
- 시간은 반드시 HH:MM 24시간 형식
- confidence는 이미지 품질 고려하여 현실적으로 설정
- 정보가 불명확하면 confidence 낮게 설정

이미지를 분석하고 위 JSON 형식으로 결과를 반환하세요.`

function validateOCRResponse(data: any): data is OCRResult {
  return (
    typeof data.line === "string" &&
    /^[ABC]$/i.test(data.line) &&
    typeof data.batchCount === "number" &&
    data.batchCount >= 0 &&
    typeof data.checkTime === "string" &&
    /^\d{2}:\d{2}$/.test(data.checkTime) &&
    typeof data.confidence === "number" &&
    data.confidence >= 0 &&
    data.confidence <= 1
  )
}

export async function POST(request: NextRequest) {
  try {
    // Check API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error("GOOGLE_GEMINI_API_KEY is not configured")
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      )
    }

    // Extract image from FormData
    const formData = await request.formData()
    const file = formData.get("image") as File

    // Validate file exists
    if (!file) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type: ${file.type}. Allowed: JPEG, PNG, WebP, HEIC` },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large: ${Math.round(file.size / 1024 / 1024)}MB. Maximum: 10MB` },
        { status: 400 }
      )
    }

    // Convert image to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString("base64")

    // Prepare image part for Gemini
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: file.type,
      },
    }

    // Initialize Gemini API
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

    // Call Gemini API
    console.log("[OCR] Processing image with Gemini...")
    const result = await model.generateContent([GEMINI_PROMPT, imagePart])
    const response = await result.response
    const text = response.text()

    console.log("[OCR] Gemini response:", text)

    // Parse JSON response
    let ocrData: any
    try {
      // Try to extract JSON from response (in case Gemini adds extra text)
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        ocrData = JSON.parse(jsonMatch[0])
      } else {
        ocrData = JSON.parse(text)
      }
    } catch (parseError) {
      console.error("[OCR] JSON parsing error:", parseError)
      return NextResponse.json(
        { error: "Failed to parse OCR response. Gemini returned invalid JSON." },
        { status: 500 }
      )
    }

    // Check if image is relevant
    if (ocrData.valid === false) {
      console.log("[OCR] Irrelevant image detected")
      return NextResponse.json(
        { error: "관련 없는 이미지입니다. 생산 라인 디스플레이 사진을 업로드해주세요." },
        { status: 400 }
      )
    }

    // Validate response structure
    if (!validateOCRResponse(ocrData)) {
      console.error("[OCR] Invalid response structure:", ocrData)
      return NextResponse.json(
        { error: "Invalid OCR response structure" },
        { status: 500 }
      )
    }

    // Normalize line to uppercase
    ocrData.line = ocrData.line.toUpperCase()

    console.log("[OCR] Success - Line:", ocrData.line, "Count:", ocrData.batchCount, "Confidence:", ocrData.confidence)

    return NextResponse.json(ocrData)

  } catch (error: any) {
    console.error("[OCR] Error:", error)

    // Handle specific error types
    if (error.message?.includes("429") || error.message?.includes("quota")) {
      return NextResponse.json(
        { error: "API rate limit exceeded. Please try again later." },
        { status: 429 }
      )
    }

    if (error.message?.includes("API key") || error.message?.includes("401")) {
      return NextResponse.json(
        { error: "Invalid API key configuration" },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "OCR processing failed", details: error.message },
      { status: 500 }
    )
  }
}
