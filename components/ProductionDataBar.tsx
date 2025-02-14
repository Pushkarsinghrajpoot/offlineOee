import { Progress } from "@/components/ui/progress"

interface ProductionDataBarProps {
  data: {
    actual: number
    target: number
    waste: number
  }
}

export function ProductionDataBar({ data }: ProductionDataBarProps) {
  const actualPercentage = (data.actual / data.target) * 100
  const wastePercentage = (data.waste / data.target) * 100

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Actual: {data.actual}</span>
        <span>Target: {data.target}</span>
      </div>
      <div className="relative h-4">
        <Progress value={actualPercentage} className="h-4 bg-gray-200" indicatorColor="bg-green-500" />
        <Progress value={wastePercentage} className="h-4 absolute top-0 left-0" indicatorColor="bg-red-500" />
      </div>
      <div className="text-sm">Waste: {data.waste}</div>
    </div>
  )
}

