"use client"

import { useState } from "react"
import VideoUploader from "@/components/video-uploader"
import ProcessingPipeline from "@/components/processing-pipeline"
import ResultsDashboard from "@/components/results-dashboard"
import Header from "@/components/header"

export default function Home() {
  const [uploadedVideo, setUploadedVideo] = useState<{
    file: File
    preview: string
  } | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleVideoUpload = (file: File, preview: string) => {
    setUploadedVideo({ file, preview })
    setAnalysisResults(null)
  }

  const handleProcessComplete = (results: any) => {
    setAnalysisResults(results)
    setIsProcessing(false)
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-slate-950">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {!uploadedVideo ? (
          <VideoUploader onUpload={handleVideoUpload} />
        ) : !analysisResults ? (
          <ProcessingPipeline
            videoFile={uploadedVideo.file}
            videoPreview={uploadedVideo.preview}
            onProcessComplete={handleProcessComplete}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
          />
        ) : (
          <ResultsDashboard
            results={analysisResults}
            videoPreview={uploadedVideo.preview}
            onReset={() => {
              setUploadedVideo(null)
              setAnalysisResults(null)
            }}
          />
        )}
      </div>
    </main>
  )
}
