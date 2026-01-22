"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Upload, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface VideoUploaderProps {
  onUpload: (file: File, preview: string) => void
}

export default function VideoUploader({ onUpload }: VideoUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [browserCompatibility, setBrowserCompatibility] = useState<string>("")
  const [fileSizeError, setFileSizeError] = useState<string | null>(null)

  const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB limit

  const checkBrowserSupport = useCallback(() => {
    const userAgent = navigator.userAgent
    if (userAgent.includes("Trident") || userAgent.includes("MSIE")) {
      setBrowserCompatibility("Internet Explorer is not supported. Please use Chrome, Firefox, Safari, or Edge.")
      return false
    }
    return true
  }, [])

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) {
      alert("Please upload a video file")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileSizeError(
        `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds 20MB limit. Please upload a smaller video.`,
      )
      return
    }

    setFileSizeError(null)
    setSelectedFile(file)
    if (typeof URL !== "undefined" && typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(file)
      setPreview(url)
    } else {
      // Fallback for browsers that don't support createObjectURL
      const reader = new FileReader()
      reader.onload = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = "copy"
    }
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    if (file) handleFile(file)
  }

  const handleUpload = () => {
    if (selectedFile && preview) {
      onUpload(selectedFile, preview)
    }
  }

  return (
    <div className="space-y-8">
      {browserCompatibility && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-600 text-sm">
          {browserCompatibility}
        </div>
      )}

      {fileSizeError && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm">
          {fileSizeError}
        </div>
      )}

      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Upload Traffic Video</h2>
        <p className="text-lg text-muted-foreground">Support for MP4, WebM, AVI, MOV and more</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card
          className={`relative border-2 transition-all cursor-pointer ${
            isDragging ? "border-orange-500 bg-orange-500/5" : "border-dashed border-border hover:border-orange-500/50"
          } p-8 flex flex-col items-center justify-center min-h-80`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
        >
          <input
            type="file"
            accept="video/*"
            onChange={handleFileInput}
            className="absolute inset-0 opacity-0 cursor-pointer"
            aria-label="Upload video file"
          />
          <Upload className="w-12 h-12 text-orange-500 mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Drag & drop your video</h3>
          <p className="text-sm text-muted-foreground text-center">or click to browse</p>
        </Card>

        {preview && (
          <Card className="p-4 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <video src={preview} className="w-full h-full object-cover" controls crossOrigin="anonymous" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            </div>
            <p className="text-sm text-muted-foreground text-center">{selectedFile?.name}</p>
          </Card>
        )}
      </div>

      {selectedFile && (
        <div className="flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFile(null)
              setPreview(null)
            }}
            size="lg"
          >
            Clear
          </Button>
          <Button
            onClick={handleUpload}
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <Play className="w-4 h-4 mr-2" />
            Analyze Video
          </Button>
        </div>
      )}
    </div>
  )
}
