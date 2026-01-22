import { CheckCircle2, Loader2 } from "lucide-react"

interface ProcessingStepProps {
  step: {
    id: string
    name: string
    description: string
  }
  isCompleted: boolean
  isActive: boolean
}

export default function ProcessingStep({ step, isCompleted, isActive }: ProcessingStepProps) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        isCompleted ? "bg-green-500/10" : isActive ? "bg-orange-500/10" : "bg-muted"
      }`}
    >
      {isCompleted ? (
        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
      ) : isActive ? (
        <Loader2 className="w-5 h-5 text-orange-500 animate-spin flex-shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 flex-shrink-0" />
      )}
      <div>
        <p className="text-sm font-medium text-foreground">{step.name}</p>
        <p className="text-xs text-muted-foreground">{step.description}</p>
      </div>
    </div>
  )
}
