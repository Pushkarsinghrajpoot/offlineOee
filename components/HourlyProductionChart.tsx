import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

interface HourlyProductionChartProps {
  data: Array<{
    hour: string
    goodParts: number
    waste: number
  }>
}

export function HourlyProductionChart({ data }: HourlyProductionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hour" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="goodParts" fill="#22c55e" name="Good Parts" />
        <Bar dataKey="waste" fill="#ef4444" name="Waste" />
      </BarChart>
    </ResponsiveContainer>
  )
}

