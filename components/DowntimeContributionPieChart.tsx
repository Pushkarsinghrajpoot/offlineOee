import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "@/components/ui/chart"

interface DowntimeContributionPieChartProps {
  data: Array<{
    name: string
    value: number
  }>
}

export function DowntimeContributionPieChart({ data }: DowntimeContributionPieChartProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  )
}

