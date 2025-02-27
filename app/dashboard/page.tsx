"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link  from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart3, } from "lucide-react"
import { withRoleCheck } from "@/components/auth/with-role-check"
import  {Input} from "@/components/ui/input"
import  {Label} from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { CircularProgressBar } from "@/components/CircularProgressBar"
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
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  Legend,
} from "@/components/ui/chart"
import dynamic from 'next/dynamic'
import { AlertTriangle, Droplets, Power, TrendingUp, Clock, Target, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const ChartExportDialog = dynamic(() => import('@/components/chart-export-dialog').then(mod => mod.ChartExportDialog), {
  ssr: false,
})

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
    { name: "Downtime", value: 25, color: "#FF69B4" },
    { name: "Speed Loss", value: 15, color: "#6C5CE7" },
    { name: "Grade Change", value: 20, color: "#A29BFE" },
    { name: "External Cause", value: 5, color: "#FFD700" },
    { name: "White Time", value: 15, color: "#81ECEC" },
    { name: "Maintenance", value: 20, color: "#74B9FF" },
  ]

  // Calculate total downtime
  const totalDowntime = downtimeData.reduce((total, item) => total + item.value, 0);

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

  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current && selectedChart) {
      const { exportChartToPDF } = await import('@/utils/chart-export');
      exportChartToPDF({
        title: selectedChart,
        data: [], // Not needed for PDF export
        chartRef: chartRef,
        clientName: "PixWingAi Client"
      });
    }
  }

  const handleExportToExcel = () => {
    if (!selectedChart) return;
    
    let data: any[] = [];
    let title = selectedChart;
    
    if (selectedChart === "Downtime") {
      title = "Downtime Contribution";
      data = downtimeData.map(item => ({
        'Downtime Category': item.name,
        'Percentage (%)': item.value
      }));
    } else if (selectedChart === "Time Account") {
      data = timeAccountData.map(item => ({
        'Category': item.name,
        'Minutes': item.minutes
      }));
    } else if (selectedChart === "Hourly Production") {
      data = hourlyProductionData.map(item => ({
        'Hour': item.hour,
        'GPC': item.gpc,
        'Waste': item.waste
      }));
    }
    
    import('@/utils/chart-export').then(({ exportChartToExcel }) => {
      exportChartToExcel({
        title: title,
        data: data,
        chartRef: chartRef,
        clientName: "PixWingAi Client"
      });
    });
  }

  const [chartSize, setChartSize] = useState({ width: 150, height: 80, cardWidth: 60, cardHeight: 30 });

  // Update chart size based on window size
  useEffect(() => {
    const handleResize = () => {
      // For the dialog
      const dialogWidth = Math.min(window.innerWidth * 0.25, 200);
      const dialogHeight = Math.min(window.innerHeight * 0.15, 120);
      
      // For the card
      const cardWidth = 60;
      const cardHeight = 30;
      
      setChartSize({ 
        width: dialogWidth, 
        height: dialogHeight,
        cardWidth: cardWidth,
        cardHeight: cardHeight
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          <Card 
            className="bg-white shadow-sm col-span-3"
            onClick={() => setSelectedChart("Downtime")}
          >
            <CardHeader className="pb-0 pt-2">
              <CardTitle className="text-base font-medium">Downtime Contribution</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 p-4">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={50}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {downtimeData.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={1}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        padding: '4px 8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        const entry = downtimeData.find(item => item.value === value);
                        return [`${value}%`, entry ? entry.name : name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-2">
                {downtimeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600">{item.name}</span>
                  </div>
                ))}
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
            <Link href="/downtime-tracker">
            <Button className="w-full mt-4">Downtime Tracker</Button>
            </Link>
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
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="gpc" fill="#3b82f6" name="GPC" />
                    <Bar dataKey="waste" fill="#ef4444" name="Waste" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          Temperature Chart
        </div>
      </div>

      {/* Chart Dialog */}
      {selectedChart && (
        <Dialog open={!!selectedChart} onOpenChange={(open) => !open && setSelectedChart(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-6 h-6 text-blue-500" />
                  <DialogTitle className="text-xl font-semibold">
                    {selectedChart === "Downtime" ? "Downtime Contribution" : selectedChart}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <div ref={chartRef} className="flex-1 p-8">
              {selectedChart === "Downtime" && (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      innerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {downtimeData.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      iconSize={10}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        padding: '4px 8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        const entry = downtimeData.find(item => item.value === value);
                        return [`${value}%`, entry ? entry.name : name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {selectedChart === "Time Account" && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={timeAccountData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="minutes" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {selectedChart === "Hourly Production" && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={hourlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="gpc" fill="#3b82f6" name="GPC" />
                    <Bar dataKey="waste" fill="#ef4444" name="Waste" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
            <DialogFooter>
              <div className="flex space-x-2">
                <Button
                  onClick={handlePrint}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Print Chart
                </Button>
                <Button
                  onClick={handleExportToExcel}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Export to Excel
                </Button>
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
      )}
    </div>
  )
}
