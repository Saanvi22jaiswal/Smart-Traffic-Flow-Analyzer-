"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { RotateCcw, Download } from "lucide-react"
import StatCard from "./stat-card"
import DetectionChart from "./detection-chart"

interface ResultsDashboardProps {
  results: any
  videoPreview: string
  onReset: () => void
}

export default function ResultsDashboard({ results, videoPreview, onReset }: ResultsDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Traffic Analysis Results</h2>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => console.log("Downloading...")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={onReset}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <StatCard title="Total Vehicles" value={results.vehicleCount} unit="detected" color="bg-blue-500" />
        <StatCard title="Traffic Density" value={results.trafficDensity} unit="level" color="bg-orange-500" />
        <StatCard title="Avg Speed" value={results.averageSpeed} unit="km/h" color="bg-green-500" />
        <StatCard title="Congestion" value={`${results.congestionLevel}%`} unit="level" color="bg-red-500" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Vehicle Detection</h3>
            <DetectionChart detections={results.detectedVehicles} />
          </Card>
        </div>

        <Card className="p-6">
          <div className="aspect-video bg-black rounded-lg overflow-hidden mb-4">
            <video src={videoPreview} className="w-full h-full object-cover" controls />
          </div>
          <p className="text-xs text-muted-foreground">Processed video</p>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Flow Metrics</h3>
          <div className="space-y-3">
            <div className="flex justify-between pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Flow Rate</span>
              <span className="font-medium">{results.flowRate} veh/min</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-border">
              <span className="text-sm text-muted-foreground">Processed Frames</span>
              <span className="font-medium">{results.enhancedFrames}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Processing Quality</span>
              <span className="font-medium">{results.processingQuality}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Detected Anomalies</h3>
          <div className="space-y-2">
            {results.anomalies.map((anomaly: string, idx: number) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm p-2 bg-red-500/10 rounded border border-red-500/20"
              >
                <span className="text-red-500 font-bold mt-0.5">!</span>
                <span className="text-foreground">{anomaly}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
