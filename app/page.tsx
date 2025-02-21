"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "@/components/ui/chart"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ComposedChart } from "recharts"
import { Activity, AlertTriangle, Droplets, Power } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

const ProductionRateCard = () => {
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const targetSpeed = 400

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate changing speed data
      setCurrentSpeed((prev) => {
        const change = Math.random() * 20 - 10 // Random change between -10 and 10
        return Math.max(0, Math.min(targetSpeed, prev + change)) // Ensure speed is between 0 and targetSpeed
      })
    }, 1000) // Update every second

    return () => clearInterval(interval)
  }, [])

  const percentage = (currentSpeed / targetSpeed) * 100
  const needleRotation = (percentage / 100) * 180 - 90 // -90 to 90 degrees

  const getColor = (percent: number) => `hsl(${120 - percent * 1.2}, 100%, 50%)`

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Line Speed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full h-48">
            <svg viewBox="0 0 200 100" className="w-full h-full">
            <defs>
              {/* Gradient for the active path */}
              <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#22c55e' }} />
                <stop offset="100%" style={{ stopColor: '#22c55e' }} />
              </linearGradient>
              {/* Gradient for the needle */}
              <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#ff3366' }} />
                <stop offset="100%" style={{ stopColor: '#dc2626' }} />
              </linearGradient>
            </defs>
              {/* Background arc with gradient */}
              <path
            d="M20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#d1d5db" /* Light gray for visibility on white */
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Active arc (green) */}
          <path
            d="M20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#activeGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${(percentage * 2.8)}, ${280}`}
          />

          {/* Needle with gradient */}
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            {/* Needle line */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="40"
              stroke="url(#needleGradient)"
              strokeWidth="3"
            />
            {/* Needle circle */}
            <circle
              cx="100"
              cy="100"
              r="8"
              fill="url(#needleGradient)"
            />
          </g>

          {/* Percentage text */}
          <text 
            x="100" 
            y="80" 
            textAnchor="middle" 
            fontSize="24" 
            fontWeight="bold" 
            fill="black" /* Changed to black for visibility */
          >
            {Math.round(currentSpeed)} su/hr
          </text>
        </svg>
          </div>
          <div className="flex justify-between w-full text-sm">
            {/* <span>Actual Speed: {Math.round(currentSpeed)}</span> */}
            <span className="text-lg font-medium text-gray-500 text-center">Target Speed: {targetSpeed} su/hr</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const OEECard = ({
  title,
  data,
}: { title: string; data: { oee: number; availability: number; efficiency: number; quality: number } }) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-4">
      <div className="relative h-32 w-32">
        <svg className="h-32 w-32 -rotate-90 transform">
          <circle className="text-muted stroke-current" strokeWidth="12" fill="transparent" r="58" cx="64" cy="64" />
          <circle
            className="stroke-blue-500"
            strokeWidth="12"
            strokeLinecap="round"
            fill="transparent"
            r="58"
            cx="64"
            cy="64"
            strokeDasharray={`${2 * Math.PI * 58}`}
            strokeDashoffset={`${2 * Math.PI * 58 * (1 - data.oee / 100)}`}
            style={{
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl font-bold">{data.oee}%</span>
            <p className="text-sm text-muted-foreground">OEE</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 w-full">
        <div className="text-center">
          <svg className="h-8 w-8 mx-auto -rotate-90 transform">
            <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="12" cx="16" cy="16" />
            <circle
              className="stroke-green-500"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="12"
              cx="16"
              cy="16"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - data.availability / 100)}`}
            />
          </svg>
          <span className="text-sm font-medium">{data.availability}%</span>
          <p className="text-xs text-muted-foreground">AVA</p>
        </div>
        <div className="text-center">
          <svg className="h-8 w-8 mx-auto -rotate-90 transform">
            <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="12" cx="16" cy="16" />
            <circle
              className="stroke-yellow-500"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="12"
              cx="16"
              cy="16"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - data.efficiency / 100)}`}
            />
          </svg>
          <span className="text-sm font-medium">{data.efficiency}%</span>
          <p className="text-xs text-muted-foreground">EFF</p>
        </div>
        <div className="text-center">
          <svg className="h-8 w-8 mx-auto -rotate-90 transform">
            <circle className="text-muted stroke-current" strokeWidth="8" fill="transparent" r="12" cx="16" cy="16" />
            <circle
              className="stroke-blue-500"
              strokeWidth="8"
              strokeLinecap="round"
              fill="transparent"
              r="12"
              cx="16"
              cy="16"
              strokeDasharray={`${2 * Math.PI * 12}`}
              strokeDashoffset={`${2 * Math.PI * 12 * (1 - data.quality / 100)}`}
            />
          </svg>
          <span className="text-sm font-medium">{data.quality}%</span>
          <p className="text-xs text-muted-foreground">QUA</p>
        </div>
      </div>
    </CardContent>
  </Card>
)

export default function KPIDashboard() {
  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current && selectedChart) {
      const canvas = await html2canvas(chartRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('l', 'mm', 'a4') // 'l' for landscape
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // Calculate aspect ratio to fit the chart properly
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
      
      const finalWidth = imgWidth * ratio
      const finalHeight = imgHeight * ratio
      const xOffset = (pageWidth - finalWidth) / 2
      const yOffset = (pageHeight - finalHeight) / 2
      
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight)
      pdf.save(`${selectedChart.toLowerCase().replace(/\s+/g, '_')}.pdf`)
    }
  }

  const handleExportToExcel = () => {
    if (!selectedChart) return

    const wb = XLSX.utils.book_new()
    let data: any[] = []

    if (selectedChart === "Linewise Performance") {
      data = linewiseData.map(item => ({
        Line: item.line,
        'OEE (%)': item.oee,
        'Waste (%)': item.waste
      }))
    } else if (selectedChart === "Downtime Contribution") {
      data = downtimeData.map(item => ({
        'Downtime Type': item.name,
        'Percentage': item.value
      }))
    } else if (selectedChart === "Energy & Utilities") {
      // Combine all utility data into a single row per hour
      data = Array.from({ length: 24 }, (_, hour) => ({
        Hour: hour,
        'Power': energyData.power[hour].value,
        'Water': energyData.water[hour].value,
        'Air': energyData.air[hour].value
      }))
    }

    const ws = XLSX.utils.json_to_sheet(data)
    XLSX.utils.book_append_sheet(wb, ws, 'Chart Data')
    XLSX.writeFile(wb, `${selectedChart.toLowerCase().replace(/\s+/g, '_')}.xlsx`)
  }

  const renderChartDialog = () => {
    return (
      <Dialog open={!!selectedChart} onOpenChange={() => setSelectedChart(null)}>
        <DialogContent className="max-w-[90vw] w-[900px] h-[700px] flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedChart}</DialogTitle>
          </DialogHeader>
          <div ref={chartRef} className="flex-1 p-8">
            {selectedChart === "Linewise Performance" && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={linewiseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="line" />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[0, 5]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                  <Bar 
                    yAxisId="left" 
                    dataKey="oee" 
                    fill="#22c55e" 
                    name="OEE" 
                    barSize={40}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="waste"
                    stroke="#eab308"
                    name="Waste"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Downtime Contribution" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(window.innerWidth * 0.3, window.innerHeight * 0.3)}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {downtimeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Energy & Utilities" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    domain={[0, 23]}
                    tickFormatter={(value) => `${value}:00`}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" data={energyData.power} name="Power" stroke="#eab308" />
                  <Line type="monotone" dataKey="value" data={energyData.water} name="Water" stroke="#3b82f6" />
                  <Line type="monotone" dataKey="value" data={energyData.air} name="Air" stroke="#22c55e" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <div className="flex justify-end gap-2 w-full">
              <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600">
                Print Chart
              </Button>
              <Button onClick={handleExportToExcel} className="bg-green-500 hover:bg-green-600">
                Export to Excel
              </Button>
              <Button onClick={() => setSelectedChart(null)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const oeeData = {
    current: { oee: 65, availability: 89, efficiency: 79, quality: 93 },
    mtd: { oee: 65, availability: 89, efficiency: 79, quality: 93 },
    ytd: { oee: 65, availability: 89, efficiency: 79, quality: 93 },
  }

  const linewiseData = [
    { line: "Line 1", oee: 56, waste: 1 },
    { line: "Line 2", oee: 65, waste: 3 },
    { line: "Line 3", oee: 54, waste: 3 },
    { line: "Line 4", oee: 76, waste: 2 },
    { line: "Line 5", oee: 82, waste: 3 },
    { line: "Line 6", oee: 45, waste: 3 },
    { line: "Line 7", oee: 85, waste: 2 },
  ]

  const productionRate = {
    current: 203,
    target: 400,
  }

  const downtimeData = [
    { name: "Downtime", value: 32, color: "#3b82f6" },
    { name: "Maintenance", value: 12, color: "#eab308" },
    { name: "White Time", value: 23, color: "gray" },
    { name: "External Cause", value: 23, color: "#ef4444" },
    { name: "Grade Change", value: 5, color: "#22c55e" },
    { name: "Speed Loss", value: 5, color: "#8b5cf6" },
  ]

  const safetyData = {
    firstAid: 2,
    incidents: [
      { type: "Critical", count: 1, status: "Open" },
      { type: "Moderate", count: 3, status: "In Progress" },
      { type: "Minor", count: 5, status: "Resolved" },
    ],
  }

  const energyData = {
    power: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 100) + 50,
    })),
    water: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 50) + 20,
    })),
    air: Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 30) + 70,
    })),
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <OEECard title="Current Performance" data={oeeData.current} />
        <OEECard title="Month-to-Date" data={oeeData.mtd} />
        <OEECard title="Year-to-Date" data={oeeData.ytd} />

        {/* Modified Linewise OEE & Waste Card with click handler */}
        <Card className="cursor-pointer" onClick={() => setSelectedChart("Linewise Performance")}>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Linewise OEE & Waste</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={linewiseData} margin={{ top: 10, right: 0, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="line" />
                <YAxis 
                  yAxisId="left" 
                  orientation="left"
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[0, 5]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar 
                  yAxisId="left" 
                  dataKey="oee" 
                  fill="#22c55e" 
                  name="OEE" 
                  barSize={40}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="waste"
                  stroke="#eab308"
                  name="Waste"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Production Rate Cards */}
        {Array.from({ length: 3 }).map((_, i) => (
          <ProductionRateCard key={i} />
        ))}

        {/* Safety & Incident Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Safe Days</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Safe Days Counter */}
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">300</div>
              {/* <div className="text-xl">Safe Days</div> */}
            </div>
            
            {/* Safety Metrics Table */}
            <div className="mt-4">
              <div className="grid gap-2">
                <div className="flex justify-between items-center bg-blue-500 text-white p-2 rounded-md">
                  <span>Number of First Aids</span>
                  <span className="pr-2">2</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-200 p-2 rounded-md">
                  <span>Lost Time Injury</span>
                  <span className="pr-2 text-center">0</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-200 p-2 rounded-md">
                  <span>Major Incident</span>
                  <span className="pr-2 text-center">0</span>
                </div>
                
                <div className="flex justify-between items-center bg-gray-200 p-2 rounded-md">
                  <span>Property Damage</span>
                  <span className="pr-2 text-center">0</span>
                </div>
              </div>
            </div>


          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Downtime Contribution Charts */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <CardTitle className="text-lg font-medium">Downtime Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => setSelectedChart("Downtime Contribution")}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {downtimeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Energy & Utility Consumption */}
        <Card className="cursor-pointer" onClick={() => setSelectedChart("Energy & Utilities")}>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Energy & Utilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Power className="text-yellow-500" />
                <span className="text-sm font-medium">Power Consumption</span>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={energyData.power}>
                  <Line type="monotone" dataKey="value" stroke="#eab308" dot={false} />
                  <YAxis hide domain={[0, "dataMax + 20"]} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Droplets className="text-blue-500" />
                <span className="text-sm font-medium">Water Usage</span>
              </div>
              <ResponsiveContainer width="100%" height={60}>
                <LineChart data={energyData.water}>
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" dot={false} />
                  <YAxis hide domain={[0, "dataMax + 20"]} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {renderChartDialog()}
    </div>
  )
}
