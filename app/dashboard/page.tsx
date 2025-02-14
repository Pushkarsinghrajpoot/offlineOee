"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { CircularProgressBar } from "@/components/CircularProgressBar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const ProductionGauge = () => {
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

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-full h-48">
        <svg viewBox="0 0 200 120" className="w-full h-full">
          <defs>
            {/* Gradient for the active path */}
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#22c55e" }} />
              <stop offset="100%" style={{ stopColor: "#22c55e" }} />
            </linearGradient>
            {/* Gradient for the needle */}
            <linearGradient id="needleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{ stopColor: "#ff3366" }} />
              <stop offset="100%" style={{ stopColor: "#dc2626" }} />
            </linearGradient>
          </defs>

          {/* Background arc (gray) */}
          <path d="M20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#374151" strokeWidth="20" strokeLinecap="round" />

          {/* Active arc (green) */}
          <path
            d="M20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#activeGradient)"
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.8}, ${280}`}
          />

          {/* Needle with gradient */}
          <g transform={`rotate(${needleRotation}, 100, 100)`}>
            {/* Needle line */}
            <line x1="100" y1="100" x2="100" y2="40" stroke="url(#needleGradient)" strokeWidth="3" />
            {/* Needle circle */}
            <circle cx="100" cy="100" r="8" fill="url(#needleGradient)" />
          </g>

          {/* Percentage text */}
          <text x="100" y="80" textAnchor="middle" fontSize="24" fontWeight="bold" fill="currentColor">
            {Math.round(percentage)}%
          </text>
        </svg>
      </div>
      <div className="flex justify-between w-full text-sm">
        <span>Actual Speed: {Math.round(currentSpeed)}</span>
        <span>Target Speed: {targetSpeed}</span>
      </div>
    </div>
  )
}

export default function ProductionDashboard() {
  const [selectedPlant, setSelectedPlant] = useState("plant1")
  const [selectedMachine, setSelectedMachine] = useState("machine1")
  const [startTime, setStartTime] = useState("")
  const [endTime, setEndTime] = useState("")
  const [selectedChart, setSelectedChart] = useState<string | null>(null)

  // Sample data
  const kpiData = {
    oee: 65,
    availability: 89,
    efficiency: 79,
    quality: 93,
  }

  const productionData = {
    actualQty: 150000,
    waste: 2500,
    targetQty: 270000,
  }

  const downtimeData = [
    { name: "Speed Loss", value: 5, color: "#4299e1" },
    { name: "Downtime", value: 32, color: "#48bb78" },
    { name: "White Time", value: 23, color: "#a0aec0" },
    { name: "External Cause", value: 23, color: "#f56565" },
    { name: "Grade Change", value: 5, color: "#ed8936" },
    { name: "Maintenance", value: 12, color: "#ecc94b" },
  ]

  const timeAccountData = [
    { name: "Speed Loss", minutes: 15 },
    { name: "Downtime", minutes: 50 },
    { name: "Maintenance", minutes: 30 },
    { name: "White Time", minutes: 10 },
    { name: "Grade Change", minutes: 25 },
    { name: "External Cause", minutes: 50 },
    { name: "Run Time", minutes: 300 },
    { name: "Total Time", minutes: 480 },
  ]

  const hourlyProductionData = Array.from({ length: 8 }, (_, i) => ({
    hour: `${7 + i}:00`,
    gpc: Math.floor(Math.random() * 15000) + 20000,
    waste: Math.floor(Math.random() * 1000) + 500,
  }))

  const renderChartDialog = () => {
    return (
      <Dialog open={!!selectedChart} onOpenChange={() => setSelectedChart(null)}>
        <DialogContent className="max-w-[90vw] w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedChart}</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            {selectedChart === "Down-time Contribution" && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={200}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {downtimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Time Account" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timeAccountData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Hourly Production" && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyProductionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="gpc" fill="#3b82f6" name="GPC" />
                  <Bar dataKey="waste" fill="#ef4444" name="Waste" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-blue-100 p-4 rounded-lg grid grid-cols-4 gap-4">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Plant" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="plant1">Plant 1</SelectItem>
            <SelectItem value="plant2">Plant 2</SelectItem>
            <SelectItem value="plant3">Plant 3</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Machine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="machine1">Machine 1</SelectItem>
            <SelectItem value="machine2">Machine 2</SelectItem>
            <SelectItem value="machine3">Machine 3</SelectItem>
          </SelectContent>
        </Select>
        <Input type="datetime-local" placeholder="Start Time" />
        <Input type="datetime-local" placeholder="End Time" />
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* First Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* KPI Section */}
          <Card className="col-span-5">
            <CardContent className="p-6">
              <div className="flex space-x-4">
                {/* Left half - OEE */}
                <div className="flex-1 flex justify-center items-center">
                  <CircularProgressBar value={kpiData.oee} color="text-blue-500" label="OEE" size={160} />
                </div>

                {/* Right half - AVA, EFF, QUA, and Production Data */}
                <div className="flex-1 flex flex-col">
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <CircularProgressBar value={kpiData.availability} color="text-green-500" label="AVA" size={80} />
                    <CircularProgressBar value={kpiData.efficiency} color="text-yellow-500" label="EFF" size={80} />
                    <CircularProgressBar value={kpiData.quality} color="text-red-500" label="QUA" size={80} />
                  </div>

                  {/* Production Data Bar */}
                  <div>
                    <h3 className="font-medium mb-2">Production Data</h3>
                    <div className="relative h-6 bg-gray-200 rounded">
                      <div
                        className="absolute h-full bg-green-500 rounded"
                        style={{ width: `${(productionData.actualQty / productionData.targetQty) * 100}%` }}
                      />
                      <div
                        className="absolute h-full bg-red-500 rounded"
                        style={{
                          width: `${(productionData.waste / productionData.targetQty) * 100}%`,
                          left: `${(productionData.actualQty / productionData.targetQty) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-sm">
                      <span>Actual Qty: {productionData.actualQty}</span>
                      <span>Waste: {productionData.waste}</span>
                      <span>Target Qty: {productionData.targetQty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Rate Gauge */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Production Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductionGauge />
            </CardContent>
          </Card>

          {/* Downtime Contribution */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Down-time Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => setSelectedChart("Down-time Contribution")}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {downtimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-12 gap-6">
          {/* Time Account */}
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Time Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => setSelectedChart("Time Account")}>
                <div className="space-y-2">
                  {timeAccountData.map((item) => (
                    <div key={item.name} className="flex items-center">
                      <span className="w-32">{item.name}</span>
                      <div className="flex-1 h-6 bg-gray-200 rounded">
                        <div
                          className="h-full bg-blue-500 rounded"
                          style={{ width: `${(item.minutes / 480) * 100}%` }}
                        />
                      </div>
                      <span className="w-12 text-right">{item.minutes}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Production */}
          <Card className="col-span-8">
            <CardHeader>
              <CardTitle>Hourly Production</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="cursor-pointer" onClick={() => setSelectedChart("Hourly Production")}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hourlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="gpc" fill="#3b82f6" name="GPC" />
                    <Bar dataKey="waste" fill="#ef4444" name="Waste" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Temperature Chart */}
        </div>
      </div>

      {renderChartDialog()}
    </div>
  )
}

