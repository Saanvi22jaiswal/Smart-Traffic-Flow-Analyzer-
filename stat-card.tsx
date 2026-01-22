import { Card } from "@/components/ui/card"

interface StatCardProps {
  title: string
  value: string | number
  unit: string
  color: string
}

export default function StatCard({ title, value, unit, color }: StatCardProps) {
  return (
    <Card className="p-6 relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-20 h-20 ${color} opacity-10 rounded-full -mr-10 -mt-10`} />
      <p className="text-sm text-muted-foreground mb-2">{title}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{unit}</span>
      </div>
    </Card>
  )
}
