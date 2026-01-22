"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface DetectionChartProps {
  detections: Array<{
    type: string
    count: number
    confidence: number
  }>
}

export default function DetectionChart({ detections }: DetectionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={detections} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
        <XAxis dataKey="type" stroke="hsl(var(--color-muted-foreground))" />
        <YAxis stroke="hsl(var(--color-muted-foreground))" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--color-background))",
            border: "1px solid hsl(var(--color-border))",
          }}
        />
        <Legend />
        <Bar dataKey="count" fill="#f97316" name="Count" />
        <Bar dataKey="confidence" fill="#0ea5e9" name="Confidence" yAxisId="right" />
      </BarChart>
    </ResponsiveContainer>
  )
}
