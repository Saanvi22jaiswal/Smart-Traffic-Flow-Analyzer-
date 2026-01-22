"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import ProcessingStep from "./processing-step"
import ApiKeyError from "./api-key-error"

interface ProcessingPipelineProps {
  videoFile: File
  videoPreview: string
  onProcessComplete: (results: any) => void
  isProcessing: boolean
  setIsProcessing: (value: boolean) => void
}

export default function ProcessingPipeline({
  videoFile,
  videoPreview,
  onProcessComplete,
  isProcessing,
  setIsProcessing,
}: ProcessingPipelineProps) {
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [apiKeyError, setApiKeyError] = useState<{ error: string; setupLink?: string } | null>(null)

  const steps = [
    {
      id: "extraction",
      name: "Frame Extraction",
      description: "Extracting frames from video...",
    },
    {
      id: "denoising",
      name: "Denoising",
      description: "Reducing noise and artifacts...",
    },
    {
      id: "unblurring",
      name: "Motion Deblurring",
      description: "Enhancing motion clarity...",
    },
    {
      id: "contrast",
      name: "Contrast Enhancement",
      description: "Improving visual quality...",
    },
    {
      id: "detection",
      name: "Object Detection",
      description: "Detecting vehicles and elements...",
    },
    {
      id: "insights",
      name: "AI Analysis",
      description: "Generating traffic insights...",
    },
  ]

  const processVideo = async () => {
    setIsProcessing(true)
    setError(null)
    setApiKeyError(null)
    setCompletedSteps([])
    setProgress(0)

    try {
      const frames = await extractVideoFrames(videoFile, 5) // Extract 5 key frames
      const framesBase64 = frames.map((canvas) => canvas.toDataURL("image/jpeg", 0.7)).map((url) => url.split(",")[1])

      // Step 1: Extract and prepare video
      await new Promise((resolve) => setTimeout(resolve, 800))
      setCompletedSteps((prev) => [...prev, steps[0].id])
      setProgress(16.67)

      // Step 2-5: Simulate processing steps
      for (let i = 1; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 600))
        setCompletedSteps((prev) => [...prev, steps[i].id])
        setProgress(((i + 1) / steps.length) * 100)
      }

      setCompletedSteps((prev) => [...prev, steps[5].id])
      setProgress(100)

      const response = await fetch("/api/analyze-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frames: framesBase64,
          fileName: videoFile.name,
          fileSize: videoFile.size,
          duration: videoFile.type,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}`,
        }))

        if (response.status === 500 && errorData.setupLink) {
          setApiKeyError({
            error: errorData.error,
            setupLink: errorData.setupLink,
          })
          throw new Error("API key not configured")
        }

        if (response.status === 401 && errorData.setupLink) {
          setApiKeyError({
            error: errorData.error,
            setupLink: errorData.setupLink,
          })
          throw new Error("Invalid API key")
        }

        if (response.status === 413) {
          throw new Error("Video file is too large. Please upload a video smaller than 20MB.")
        }

        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const results = await response.json()
      console.log("[v0] Analysis complete with Gemini results:", results)
      onProcessComplete(results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred"
      console.error("[v0] Processing error:", errorMessage)
      setError(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    if (!isProcessing) {
      processVideo()
    }
  }, [])

  return (
    <div className="space-y-8">
      {apiKeyError && <ApiKeyError error={apiKeyError.error} setupLink={apiKeyError.setupLink} />}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video src={videoPreview} className="w-full h-full object-cover" muted crossOrigin="anonymous" />
          </div>
        </Card>

        <Card className="md:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-4">Processing Pipeline</h3>
          <div className="space-y-3">
            {steps.map((step) => (
              <ProcessingStep
                key={step.id}
                step={step}
                isCompleted={completedSteps.includes(step.id)}
                isActive={completedSteps.length === steps.indexOf(step)}
              />
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-500">Error: {error}</p>
        </Card>
      )}

      {!isProcessing && (
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={processVideo}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            Process Again
          </Button>
        </div>
      )}
    </div>
  )
}

async function extractVideoFrames(file: File, frameCount: number): Promise<HTMLCanvasElement[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video")
    video.preload = "metadata"

    const frames: HTMLCanvasElement[] = []

    video.onloadedmetadata = () => {
      const duration = video.duration
      const interval = duration / frameCount

      let framesExtracted = 0

      video.onseeked = () => {
        const canvas = document.createElement("canvas")
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.drawImage(video, 0, 0)
          frames.push(canvas)
          framesExtracted++

          if (framesExtracted < frameCount) {
            video.currentTime = interval * framesExtracted
          } else {
            resolve(frames)
          }
        }
      }

      video.onerror = () => reject(new Error("Failed to load video for frame extraction"))

      // Start extraction
      video.currentTime = 0
    }

    video.src = URL.createObjectURL(file)
  })
}
