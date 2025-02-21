"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  Tooltip,
  Legend,
} from "@/components/ui/chart"

// Sample data generation for the charts
const generateChartData = () => {
  return Array.from({ length: 19 }, (_, i) => {
    const hour = 8 + Math.floor(i / 2)
    const minute = (i % 2) * 30
    const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
    return {
      time,
      temperature: 40 + Math.random() * 10, // Random value between 40-50
      torque: 20 + Math.random() * 5, // Random value between 20-25
    }
  })
}

interface ChartProps {
  title: string
  data: Array<{ time: string; temperature: number; torque: number }>
  onClick: () => void
}

const SmallChart = ({ title, data, onClick }: ChartProps) => (
  <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
    <h3 className="text-sm font-medium mb-3">{title}</h3>
    <div className="h-[150px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 10 }} interval={2} tickFormatter={(value) => value.split(":")[0]} />
          <YAxis yAxisId="left" domain={[30, 70]} tick={{ fontSize: 10 }} />
          <YAxis yAxisId="right" orientation="right" domain={[15, 30]} tick={{ fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={50} stroke="red" strokeDasharray="3 3" />
          <ReferenceLine yAxisId="left" y={40} stroke="red" strokeDasharray="3 3" />
          <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#2563eb" dot={false} strokeWidth={2} />
          <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#22c55e" dot={false} strokeWidth={2} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: "10px" }} />
          <Tooltip
            contentStyle={{ fontSize: "10px" }}
            labelStyle={{ fontSize: "10px" }}
            itemStyle={{ fontSize: "10px" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
)

const LargeChart = ({ title, data }: Omit<ChartProps, "onClick">) => (
  <div className="w-full h-full min-h-[400px]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 30, bottom: 30, left: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis yAxisId="left" domain={[30, 70]} />
        <YAxis yAxisId="right" orientation="right" domain={[15, 30]} />
        <ReferenceLine yAxisId="left" y={50} stroke="red" strokeDasharray="3 3" />
        <ReferenceLine yAxisId="left" y={40} stroke="red" strokeDasharray="3 3" />
        <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#2563eb" dot={false} strokeWidth={2} />
        <Line yAxisId="right" type="monotone" dataKey="torque" stroke="#22c55e" dot={false} strokeWidth={2} />
        <Legend />
        <Tooltip
          contentStyle={{
            background: "rgba(255, 255, 255, 0.8)",
            border: "none",
            borderRadius: "4px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

const machines = [{ name: "Panel Bonder" }, { name: "Forming Drum" }, { name: "Mat Cutter" }, { name: "Insert Cutter" }]

export default function ServoMonitoring() {
  const [selectedChart, setSelectedChart] = useState<{
    title: string
    data: Array<{ time: string; temperature: number; torque: number }>
  } | null>(null)

  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current && selectedChart) {
      const canvas = await html2canvas(chartRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 100)
      pdf.save(`${selectedChart.title.toLowerCase().replace(/\s+/g, '_')}.pdf`)
    }
  }

  const handleExportToExcel = () => {
    if (selectedChart) {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(selectedChart.data)
      XLSX.utils.book_append_sheet(wb, ws, 'Chart Data')
      XLSX.writeFile(wb, `${selectedChart.title.toLowerCase().replace(/\s+/g, '_')}.xlsx`)
    }
  }

  // Generate data for all charts
  const chartData = machines.reduce(
    (acc, machine) => {
      acc[machine.name] = generateChartData()
      return acc
    },
    {} as Record<string, Array<{ time: string; temperature: number; torque: number }>>,
  )

  return (
    <div className="space-y-6">
      {/* Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {machines.map((machine) => (
          <div key={machine.name} className="bg-white p-4 rounded-lg shadow">
            <SmallChart
              title={`${machine.name} Temperature & Torque`}
              data={chartData[machine.name]}
              onClick={() =>
                setSelectedChart({
                  title: `${machine.name} Temperature & Torque`,
                  data: chartData[machine.name],
                })
              }
            />
          </div>
        ))}
      </div>

      {/* Dialog for enlarged chart */}
      <Dialog open={!!selectedChart} onOpenChange={() => setSelectedChart(null)}>
        <DialogContent className="max-w-[90vw] w-[1200px] h-[80vh] p-0 overflow-hidden">
          <div className="relative h-full flex flex-col">
            {/* Header with only one close button */}
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="text-2xl font-bold">{selectedChart?.title}</DialogTitle>
            </DialogHeader>

            {/* Chart Content */}
            <div ref={chartRef} className="flex-grow p-6 pt-2 overflow-auto">
              {selectedChart && <LargeChart title={selectedChart.title} data={selectedChart.data} />}
            </div>

            {/* Footer with Print and Export buttons */}
            <DialogFooter className="p-6 pt-2 border-t">
              <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600">
                Print Chart
              </Button>
              <Button onClick={handleExportToExcel} className="bg-green-500 hover:bg-green-600">
                Export to Excel
              </Button>
              <Button onClick={() => setSelectedChart(null)}>Close</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
