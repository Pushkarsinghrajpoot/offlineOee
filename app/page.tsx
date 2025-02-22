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
import { Activity, AlertTriangle, Droplets, Power, TrendingUp, Clock, Target, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { withRoleCheck } from "@/components/auth/with-role-check"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

const ProductionRateCard = () => {
  const [currentSpeed, setCurrentSpeed] = useState(0)
  const targetSpeed = 400

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSpeed((prev) => {
        const change = Math.random() * 20 - 10
        return Math.max(0, Math.min(targetSpeed, prev + change))
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const percentage = (currentSpeed / targetSpeed) * 100
  const needleRotation = (percentage / 100) * 180 - 90

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-500" />
          <CardTitle className="text-lg font-semibold">Line Speed</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-full h-48">
            <svg viewBox="0 0 200 100" className="w-full h-full drop-shadow-lg">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="rgba(148, 163, 184, 0.2)"
                strokeWidth="12"
                strokeLinecap="round"
              />
              <path
                d="M20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(percentage * 2.8)}, ${280}`}
                filter="url(#glow)"
              />
              <g transform={`rotate(${needleRotation}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="30"
                  stroke="#ef4444"
                  strokeWidth="3"
                  filter="url(#glow)"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="#ef4444"
                  filter="url(#glow)"
                />
              </g>
              <text 
                x="100" 
                y="75" 
                textAnchor="middle" 
                className="text-2xl font-bold fill-current"
              >
                {Math.round(currentSpeed)}
              </text>
              <text 
                x="100" 
                y="90" 
                textAnchor="middle" 
                className="text-sm fill-current opacity-60"
              >
                su/hr
              </text>
            </svg>
          </div>
          <div className="flex items-center justify-center space-x-2 text-sm font-medium text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-4 h-4" />
            <span>Target: {targetSpeed} su/hr</span>
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
  <Card className="p-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
    <CardHeader className="space-y-1">
      <div className="flex items-center space-x-2">
        <Activity className="w-5 h-5 text-indigo-500" />
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col items-center gap-6">
      <div className="relative h-36 w-36">
        <svg className="h-36 w-36 -rotate-90 transform drop-shadow-lg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#22c55e" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <circle 
            className="text-gray-200 dark:text-gray-800 stroke-current" 
            strokeWidth="10" 
            fill="transparent" 
            r="63" 
            cx="72" 
            cy="72" 
          />
          <circle
            className="stroke-blue-500"
            strokeWidth="10"
            strokeLinecap="round"
            fill="transparent"
            r="63"
            cx="72"
            cy="72"
            strokeDasharray={`${2 * Math.PI * 63}`}
            strokeDashoffset={`${2 * Math.PI * 63 * (1 - data.oee / 100)}`}
            style={{
              transition: "stroke-dashoffset 0.5s ease",
              filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.5))"
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <span className="text-4xl font-bold text-blue-500">{data.oee}%</span>
            <p className="text-sm text-gray-500 dark:text-gray-400">OEE</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5  w-full">
        {[
          { 
            label: "Availability", 
            shortLabel: "AVA",
            value: data.availability, 
            lightColor: "#10b981",
            darkColor: "#34d399",
            gradientClass: "from-emerald-500 to-teal-400"
          },
          { 
            label: "Efficiency", 
            shortLabel: "EFF",
            value: data.efficiency, 
            lightColor: "#f59e0b",
            darkColor: "#fbbf24",
            gradientClass: "from-amber-500 to-yellow-400"
          },
          { 
            label: "Quality", 
            shortLabel: "QUA",
            value: data.quality, 
            lightColor: "#6366f1",
            darkColor: "#818cf8",
            gradientClass: "from-indigo-500 to-blue-400"
          }
        ].map((metric) => (
          <div 
            key={metric.label} 
            className="flex flex-col items-center w-24 h-24  rounded-lg bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <div className="relative h-14 w-14">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full bg-gray-100 dark:bg-gray-700"></div>
              
              {/* Main circle with gradient */}
              <svg className="h-14 w-14 -rotate-90 transform relative z-10">
                {/* Background ring */}
                <circle 
                  className="text-gray-200 dark:text-gray-600 stroke-current"
                  strokeWidth="4" 
                  fill="none" 
                  r="25" 
                  cx="28" 
                  cy="28" 
                />
                
                {/* Progress ring */}
                <circle
                  className="transition-all duration-1000 ease-out"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  r="25"
                  cx="28"
                  cy="28"
                  strokeDasharray={`${2 * Math.PI * 25}`}
                  strokeDashoffset={`${2 * Math.PI * 25 * (1 - metric.value / 100)}`}
                  style={{
                    color: `var(--metric-color, ${metric.lightColor})`,
                    filter: "drop-shadow(0 0 2px currentColor)"
                  }}
                />
              </svg>
              
              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span 
                  className="text-base font-bold leading-none"
                  style={{
                    color: `var(--metric-color, ${metric.lightColor})`
                  }}
                >
                  {metric.value}%
                </span>
                <span className="text-[9px] font-medium text-gray-600 dark:text-gray-300">
                  {metric.shortLabel}
                </span>
              </div>
            </div>
            
            <span className="text-[10px] font-medium text-gray-700 dark:text-gray-200 mt-1.5">
              {metric.label}
            </span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
)

function KPIDashboard() {
  const { checkAccess } = useAuth();
  const canExport = checkAccess('reports');

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
        <DialogContent className="max-w-[90vw] w-[900px] h-[700px] flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-6 h-6 text-blue-500" />
              <DialogTitle className="text-xl font-semibold">{selectedChart}</DialogTitle>
            </div>
          </DialogHeader>
          <div ref={chartRef} className="flex-1 p-8">
            {selectedChart === "Linewise Performance" && (
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={linewiseData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    dataKey="line" 
                    stroke="currentColor" 
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    yAxisId="left" 
                    orientation="left"
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    domain={[0, 5]}
                    tickFormatter={(value) => `${value}%`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => `${value}%`}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                  <Bar 
                    yAxisId="left" 
                    dataKey="oee" 
                    fill="url(#barGradient)" 
                    name="OEE" 
                    barSize={40}
                    radius={[4, 4, 0, 0]}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="waste"
                    stroke="#eab308"
                    name="Waste"
                    strokeWidth={3}
                    dot={{ fill: '#eab308', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Downtime Contribution" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {downtimeData.map((entry, index) => (
                      <linearGradient key={index} id={`pieGradient${index}`} x1="0%" y1="0%" x2="0%" y2="1">
                        <stop offset="0%" stopColor={entry.color} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={entry.color} stopOpacity={0.3}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(window.innerWidth * 0.25, window.innerHeight * 0.25)}
                    innerRadius={Math.min(window.innerWidth * 0.15, window.innerHeight * 0.15)}
                    paddingAngle={2}
                    dataKey="value"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {downtimeData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={`url(#pieGradient${index})`}
                        stroke={entry.color}
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Energy & Utilities" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    dataKey="hour" 
                    domain={[0, 23]}
                    tickFormatter={(value) => `${value}:00`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend 
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{
                      paddingTop: '20px'
                    }}
                  />
                  <defs>
                    <linearGradient id="powerGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#eab308" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#eab308" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="waterGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="airGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    data={energyData.power} 
                    name="Power" 
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{ fill: '#eab308', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    fill="url(#powerGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    data={energyData.water} 
                    name="Water" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    fill="url(#waterGradient)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    data={energyData.air} 
                    name="Air" 
                    stroke="#22c55e"
                    strokeWidth={3}
                    dot={{ fill: '#22c55e', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    fill="url(#airGradient)"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
          <DialogFooter className="border-t pt-4">
            <div className="flex justify-end gap-2 w-full">
              <Button 
                onClick={handlePrint} 
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Print Chart
              </Button>
              {canExport && (
                <Button 
                  onClick={handleExportToExcel} 
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Export to Excel
                </Button>
              )}
              <Button 
                onClick={() => setSelectedChart(null)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
              >
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
    <div className="flex flex-col gap-6 p-6">
      <div className="grid gap-6 md:grid-cols-4">
        <OEECard title="Current Performance" data={oeeData.current} />
        <OEECard title="Month-to-Date" data={oeeData.mtd} />
        <OEECard title="Year-to-Date" data={oeeData.ytd} />
        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" onClick={() => setSelectedChart("Linewise Performance")}>
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold">Linewise OEE & Waste</CardTitle>
            </div>
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
        {[1, 2, 3].map((_, i) => (
          <ProductionRateCard key={i} />
        ))}
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <CardTitle className="text-lg font-semibold">Safe Days</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-6xl font-bold mb-2">300</div>
            </div>
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Downtime Contribution Charts */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card 
            key={i} 
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-rose-500" />
                  <CardTitle className="text-base font-semibold">Downtime {i + 1}</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {downtimeData[i]?.value}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0 h-[160px]">
              <div className="cursor-pointer h-full" onClick={() => setSelectedChart("Downtime Contribution")}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={50}
                      innerRadius={25}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {downtimeData.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.color}
                          stroke="none"
                          className="hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Contribution']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Energy & Utilities Card */}
        <Card 
          className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer" 
          onClick={() => setSelectedChart("Energy & Utilities")}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-base font-semibold">Energy & Utilities</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Power className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-medium">Power</span>
                </div>
                <span className="text-xs font-medium text-gray-500">24h Usage</span>
              </div>
              <div className="h-[40px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData.power}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                    <YAxis hide domain={[0, "dataMax + 20"]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-medium">Water</span>
                </div>
                <span className="text-xs font-medium text-gray-500">24h Usage</span>
              </div>
              <div className="h-[40px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={energyData.water}>
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <YAxis hide domain={[0, "dataMax + 20"]} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {renderChartDialog()}
    </div>
  )
}

export default withRoleCheck(KPIDashboard, {
  feature: 'kpiDashboard',
  requiredAccess: true
});
