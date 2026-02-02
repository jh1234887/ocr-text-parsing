"use client"

import React from "react"

import { useState, useCallback, useRef } from "react"
import { Upload, Camera, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { OCRResult } from "@/lib/types"

interface ImageUploaderProps {
  onOCRComplete: (result: OCRResult) => void
  isProcessing: boolean
  setIsProcessing: (processing: boolean) => void
}

export function ImageUploader({ onOCRComplete, isProcessing, setIsProcessing }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const processImage = useCallback(
    async (file: File) => {
      setIsProcessing(true)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)

      try {
        // Call real OCR API
        const formData = new FormData()
        formData.append("image", file)

        const response = await fetch("/api/ocr", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "OCR processing failed")
        }

        const ocrResult: OCRResult = await response.json()

        // Validate and normalize result
        const validatedResult: OCRResult = {
          line: ocrResult.line.toUpperCase(),
          batchCount: ocrResult.batchCount || 0,
          checkTime: ocrResult.checkTime,
          confidence: ocrResult.confidence,
        }

        onOCRComplete(validatedResult)
      } catch (error) {
        console.error("OCR Error:", error)
        alert(`OCR 처리 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`)
        setPreviewUrl(null)
      } finally {
        setIsProcessing(false)
      }
    },
    [onOCRComplete, setIsProcessing]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processImage(e.dataTransfer.files[0])
      }
    },
    [processImage]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        processImage(e.target.files[0])
      }
    },
    [processImage]
  )

  const clearImage = useCallback(() => {
    setPreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
    if (cameraInputRef.current) cameraInputRef.current.value = ""
  }, [])

  return (
    <Card className="border-2 border-dashed">
      <CardContent className="p-6">
        {previewUrl ? (
          <div className="relative">
            <img
              src={previewUrl || "/placeholder.svg"}
              alt="업로드된 이미지"
              className="w-full max-h-64 object-contain rounded-lg"
            />
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">OCR 처리 중...</p>
                </div>
              </div>
            )}
            {!isProcessing && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-12 rounded-lg transition-colors",
              dragActive ? "bg-primary/10 border-primary" : "bg-muted/30"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">이미지를 드래그하거나 업로드하세요</p>
            <p className="text-sm text-muted-foreground mb-6">
              생산 현황판 사진을 촬영하면 자동으로 데이터를 추출합니다
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                파일 선택
              </Button>
              <Button
                variant="default"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-4 w-4 mr-2" />
                카메라 촬영
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
