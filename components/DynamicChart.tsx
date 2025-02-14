"use client"

import { useState, useEffect } from "react"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"

interface DynamicChartProps {
  chartType: string
}

export function DynamicChart({ chartType }: DynamicChartProps) {
  const [data, setData] = useState<Array<{ name: string; value: number }>>([])

  useEffect(() => {
    // Simulated data fetching based on chartType
    const fetchData = () => {
      const newData = Array.from({ length: 10 }, (_, i) => ({
        name: `Point ${i + 1}`,
        value: Math.floor(Math.random() * 100),
      }))
      setData(newData)
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}

