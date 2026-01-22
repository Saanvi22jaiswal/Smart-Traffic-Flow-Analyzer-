"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface ApiKeyErrorProps {
  error: string
  setupLink?: string
}

export default function ApiKeyError({ error, setupLink }: ApiKeyErrorProps) {
  return (
    <Card className="p-6 bg-red-500/10 border border-red-500/20">
      <div className="flex gap-4">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-3 flex-1">
          <p className="text-sm font-semibold text-red-500">Configuration Required</p>
          <p className="text-sm text-red-500/80">{error}</p>
          {setupLink && (
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/20 hover:bg-red-500/5 bg-transparent"
              onClick={() => window.open(setupLink, "_blank")}
            >
              Get Gemini API Key
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
