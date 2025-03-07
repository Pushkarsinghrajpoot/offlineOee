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
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, BarChart3, TrendingUp, Target, Clock, ClipboardList } from "lucide-react"
import { withRoleCheck } from "@/components/auth/with-role-check"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { TooltipProvider } from "@/components/ui/tooltip"
import { RadialProgressBar } from "@/components/RadialProgressBar"
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
  ComposedChart,
  Area
} from "recharts"
import dynamic from 'next/dynamic'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300 h-full border border-blue-100 dark:border-blue-900">
      <CardHeader className="p-3">
        <div className="flex items-center">
          <Target className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          <CardTitle className="text-base font-semibold">Speed</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col items-center">
          <div className="relative w-full h-36">
            <svg viewBox="0 0 200 100" className="w-full h-full">
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <linearGradient id="gaugeGradientDark" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="glowDark">
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
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradient)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(percentage * 2.8)}, ${280}`}
                filter="url(#glow)"
                className="dark:hidden"
              />
              <path
                d="M20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gaugeGradientDark)"
                strokeWidth="14"
                strokeLinecap="round"
                strokeDasharray={`${(percentage * 2.8)}, ${280}`}
                filter="url(#glowDark)"
                className="hidden dark:block"
              />
              <g transform={`rotate(${needleRotation}, 100, 100)`}>
                <line
                  x1="100"
                  y1="100"
                  x2="100"
                  y2="40"
                  stroke="#ef4444"
                  strokeWidth="3"
                  filter="url(#glow)"
                  className="dark:stroke-red-400"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="6"
                  fill="#ef4444"
                  filter="url(#glow)"
                  className="dark:fill-red-400"
                />
              </g>
              <text 
                x="100" 
                y="75" 
                textAnchor="middle" 
                className="text-lg font-bold fill-current"
              >
                {Math.round(currentSpeed)}
              </text>
              <text 
                x="100" 
                y="90" 
                textAnchor="middle" 
                className="text-base fill-current opacity-60"
              >
                PPM
              </text>
            </svg>
          </div>
          <div className="flex items-center justify-center text-base font-medium text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
            <span>Target: {targetSpeed} PPM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ChartExportDialog = dynamic(() => import('@/components/chart-export-dialog').then(mod => mod.ChartExportDialog), {
  ssr: false,
})

export default function ProductionDashboard() {
  // Filter states
  const [selectedPlant, setSelectedPlant] = useState("plant1")
  const [selectedLine, setSelectedLine] = useState("line1")
  const [startDate, setStartDate] = useState(new Date())
  const [startShift, setStartShift] = useState("shift1")
  const [endDate, setEndDate] = useState(new Date())
  const [endShift, setEndShift] = useState("shift1")

  // Dummy data for different dates
  const dummyData = {
    current: {
      oee: {
        oee: 78,
        availability: 85,
        performance: 82,
        quality: 92,
      },
      production: [
        { time: '06:00', actual: 150, target: 200 },
        { time: '07:00', actual: 180, target: 200 },
        { time: '08:00', actual: 190, target: 200 },
        { time: '09:00', actual: 170, target: 200 },
      ],
      downtime: [
        { name: 'Mechanical', value: 35, color: '#FF6B6B' },
        { name: 'Electrical', value: 25, color: '#4ECDC4' },
        { name: 'Process', value: 20, color: '#45B7D1' },
        { name: 'Quality', value: 20, color: '#96CEB4' },
      ]
    },
    twoDaysBack: {
      oee: {
        oee: 65,
        availability: 72,
        performance: 75,
        quality: 88,
      },
      production: [
        { time: '06:00', actual: 120, target: 200 },
        { time: '07:00', actual: 140, target: 200 },
        { time: '08:00', actual: 160, target: 200 },
        { time: '09:00', actual: 150, target: 200 },
      ],
      downtime: [
        { name: 'Mechanical', value: 45, color: '#FF6B6B' },
        { name: 'Electrical', value: 20, color: '#4ECDC4' },
        { name: 'Process', value: 25, color: '#45B7D1' },
        { name: 'Quality', value: 10, color: '#96CEB4' },
      ]
    }
  };

  // Dashboard data states
  const [oeeData, setOeeData] = useState(dummyData.current.oee)
  const [productionData, setProductionData] = useState(dummyData.current.production)
  const [downtimeData, setDowntimeData] = useState(dummyData.current.downtime)

  // Function to check if a date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
  }

  // Function to check if a date is 2 days back
  const isTwoDaysBack = (date: Date) => {
    const twoDaysBack = new Date()
    twoDaysBack.setDate(twoDaysBack.getDate() - 2)
    return date.getDate() === twoDaysBack.getDate() &&
      date.getMonth() === twoDaysBack.getMonth() &&
      date.getFullYear() === twoDaysBack.getFullYear()
  }

  // Function to update dashboard data based on filters
  const handleApplyFilters = () => {
    // Determine which data set to use based on the selected date
    let selectedData;
    
    if (isToday(startDate)) {
      selectedData = dummyData.current;
      console.log("Showing current day data");
    } else if (isTwoDaysBack(startDate)) {
      selectedData = dummyData.twoDaysBack;
      console.log("Showing data from 2 days ago");
    } else {
      // For any other date, show a message and use current data
      console.log("No data available for selected date. Showing current data.");
      selectedData = dummyData.current;
    }

    // Apply slight variations based on plant and line selection
    const variation = (selectedPlant === "plant1" ? 1.1 : 0.9) * 
                     (selectedLine === "line1" ? 1.05 : 0.95);

    // Update all dashboard components with the selected data
    setOeeData({
      oee: Math.min(100, Math.floor(selectedData.oee.oee * variation)),
      availability: Math.min(100, Math.floor(selectedData.oee.availability * variation)),
      performance: Math.min(100, Math.floor(selectedData.oee.performance * variation)),
      quality: Math.min(100, Math.floor(selectedData.oee.quality * variation)),
    });

    setProductionData(selectedData.production.map(item => ({
      ...item,
      actual: Math.floor(item.actual * variation)
    })));

    setDowntimeData(selectedData.downtime.map(item => ({
      ...item,
      value: Math.floor(item.value * variation)
    })));

    console.log("Filters applied:", {
      plant: selectedPlant,
      line: selectedLine,
      startDate: startDate.toLocaleDateString(),
      startShift,
      endDate: endDate.toLocaleDateString(),
      endShift
    });
  };

  // Function to update dashboard data based on filters
  const handleApplyFiltersOriginal = () => {
    // In a real app, this would be an API call
    // For demo, we'll generate some random variations
    
    // Calculate a random factor based on selected filters
    const seed = selectedPlant.charCodeAt(0) + selectedLine.charCodeAt(0) + 
                startDate.getDate() + endDate.getDate() + 
                startShift.charCodeAt(0) + endShift.charCodeAt(0);
    const randomFactor = (seed % 20) / 100 + 0.9; // Between 0.9 and 1.1
    
    // Update OEE metrics
    setOeeData({
      oee: Math.min(100, Math.floor(78 * randomFactor)),
      availability: Math.min(100, Math.floor(85 * randomFactor)),
      performance: Math.min(100, Math.floor(82 * randomFactor)),
      quality: Math.min(100, Math.floor(92 * randomFactor)),
    })
    
    // Update production data
    setProductionData(prev => prev.map(item => ({
      ...item,
      actual: Math.floor(item.actual * randomFactor),
      target: item.target
    })))
    
    // Update downtime data
    setDowntimeData(prev => prev.map(item => ({
      ...item,
      value: Math.floor(item.value * randomFactor)
    })))
  }

  const [selectedChart, setSelectedChart] = useState<string | null>(null);
  const [startShifts, setStartShifts] = useState<string>("shift1");
  const [endShifts, setEndShifts] = useState<string>("shift1");
  const [selectedLines, setSelectedLines] = useState<string>("line1");
  const [selectedPlants, setSelectedPlants] = useState<string>("plant1");

  // Sample data
  const kpiData = {
    oee: 65,
    availability: 89,
    efficiency: 79,
    quality: 93,
  }

  const productionDataSample = {
    actualQty: 150000,
    waste: 2500,
    targetQty: 270000,
  }

  const downtimeDataSample = [
    { name: "Downtime", value: 25, color: "#FF69B4" },
    { name: "Speed Loss", value: 15, color: "#6C5CE7" },
    { name: "Grade Change", value: 20, color: "#A29BFE" },
    { name: "External Cause", value: 5, color: "#FFD700" },
    { name: "White Time", value: 15, color: "#81ECEC" },
    { name: "Maintenance", value: 20, color: "#74B9FF" },
  ]

  const totalDowntime = downtimeDataSample.reduce((total, item) => total + item.value, 0);

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
    target: 30000,
  }))

  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current && selectedChart) {
      const { exportChartToPDF } = await import('@/utils/chart-export');
      exportChartToPDF({
        title: selectedChart,
        data: [],
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
      data = downtimeDataSample.map(item => ({
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

  const getColorForIndex = (index: number, opacity: number = 1) => {
    const colors = [
      `rgba(59, 130, 246, ${opacity})`, // blue
      `rgba(16, 185, 129, ${opacity})`, // green
      `rgba(239, 68, 68, ${opacity})`,  // red
      `rgba(245, 158, 11, ${opacity})`, // amber
      `rgba(139, 92, 246, ${opacity})`, // purple
      `rgba(236, 72, 153, ${opacity})`, // pink
      `rgba(20, 184, 166, ${opacity})`, // teal
      `rgba(249, 115, 22, ${opacity})`, // orange
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-1 pb-2 dark:bg-gray-900 dark:text-gray-100">
      {/* Filters - more compact */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-1 rounded-lg shadow-sm mb-2 border border-blue-100 dark:border-blue-900 hover:shadow-md transition-all duration-300">
        <div className="grid grid-cols-7 gap-2 items-end text-sm">
          <div className="">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">Plant</label>
            <Select value={selectedPlants} onValueChange={setSelectedPlants}>
              <SelectTrigger className="h-7 min-h-7 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded">
                <SelectValue placeholder="Select Plant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plant1">Plant 1</SelectItem>
                <SelectItem value="plant2">Plant 2</SelectItem>
                <SelectItem value="plant3">Plant 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-0.5">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">Line</label>
            <Select value={selectedLines} onValueChange={setSelectedLines}>
              <SelectTrigger className="h-7 min-h-7 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded">
                <SelectValue placeholder="Select Line" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line1">Line 1</SelectItem>
                <SelectItem value="line2">Line 2</SelectItem>
                <SelectItem value="line3">Line 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-0.5">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">Start Date</label>
            <div className="relative">
              <DatePicker 
                selected={startDate} 
                onChange={(date: Date) => setStartDate(date)} 
                dateFormat="MM/dd/yyyy"
                className="w-full h-7 pl-7 pr-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
              />
              <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">Start Shift</label>
            <Select value={startShifts} onValueChange={setStartShifts}>
              <SelectTrigger className="h-7 min-h-7 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shift1">Shift A</SelectItem>
                <SelectItem value="shift2">Shift B</SelectItem>
                <SelectItem value="shift3">Shift C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-0.5">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">End Date</label>
            <div className="relative">
              <DatePicker 
                selected={endDate} 
                onChange={(date: Date) => setEndDate(date)} 
                dateFormat="MM/dd/yyyy"
                className="w-full h-7 pl-7 pr-1 py-0.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded"
              />
              <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <label className="font-medium text-gray-700 dark:text-gray-300 text-xs">End Shift</label>
            <Select value={endShifts} onValueChange={setEndShifts}>
              <SelectTrigger className="h-7 min-h-7 text-sm bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded">
                <SelectValue placeholder="Select Shift" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shift1">Shift A</SelectItem>
                <SelectItem value="shift2">Shift B</SelectItem>
                <SelectItem value="shift3">Shift C</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end justify-end">
            <button 
              onClick={handleApplyFilters}
              className="px-3 py-0.5 h-7 bg-blue-600 hover:bg-blue-700 text-white rounded shadow-sm transition-colors flex items-center text-sm dark:bg-blue-700 dark:hover:bg-blue-800 dark:shadow-blue-900/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Apply
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - More compact grid with smaller gaps */}
      <div className="space-y-1">
        {/* First Row */}
        <div className="grid grid-cols-12 gap-4">
          {/* KPI Section */}
          <Card className="col-span-5 p-0 border-blue-100 dark:border-blue-900 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 shadow-md hover:shadow-lg transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex space-x-4">
                {/* Left half - OEE */}
                <div className="flex-1 flex justify-center items-center">
                  <RadialProgressBar value={oeeData.oee} color="blue-500" label="OEE" size={140} />
                </div>

                {/* Right half - AVA, EFF, QUA, and Production Data */}
                <div className="flex-1 flex flex-col">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <RadialProgressBar value={oeeData.availability} color="green-500" label="AVA" size={70} />
                    <RadialProgressBar value={oeeData.performance} color="yellow-500" label="PER" size={70} />
                    <RadialProgressBar value={oeeData.quality} color="red-500" label="QUA" size={70} />
                  </div>

                  {/* Production Data Bar */}
                  <div>
                    <h3 className="text-base font-medium mb-2">Production Data</h3>
                    <div className="relative h-6 bg-gray-200 rounded">
                      <div
                        className="absolute h-full bg-green-500 rounded"
                        style={{ width: `${(productionDataSample.actualQty / productionDataSample.targetQty) * 100}%` }}
                      />
                      <div
                        className="absolute h-full bg-red-500 rounded"
                        style={{
                          width: `${(productionDataSample.waste / productionDataSample.targetQty) * 100}%`,
                          left: `${(productionDataSample.actualQty / productionDataSample.targetQty) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-base">
                      <span>Actual: {productionDataSample.actualQty}</span>
                      <span>Waste: {productionDataSample.waste}</span>
                      <span>Target: {productionDataSample.targetQty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Production Rate Gauge */}
          <div className="col-span-3">
            <ProductionRateCard />
          </div>

          {/* Downtime Contribution */}
          <Card 
            className="col-span-4 shadow-sm p-0 border-blue-100 dark:border-blue-900 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow duration-300"
            onClick={() => setSelectedChart("Downtime")}
          >
            <CardHeader className="pb-2 pt-1 px-4 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Downtime Contribution
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 p-2">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <Pie
                      data={downtimeDataSample}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={35}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {downtimeDataSample.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                          className="dark:stroke-gray-800"
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '4px',
                        fontSize: '12px',
                        padding: '2px 4px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        const entry = downtimeDataSample.find(item => item.value === value);
                        return [`${value}%`, entry ? entry.name : name];
                      }}
                      wrapperClassName="!bg-white dark:!bg-gray-800 dark:!text-gray-100 dark:!border dark:!border-gray-700 dark:!shadow-lg"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center">
                {downtimeDataSample.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-12 gap-3">
          {/* Time Account */}
          <Card className="col-span-4 p-0 hover:shadow-md transition-shadow duration-300 border-blue-100 dark:border-blue-900 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900">
            <CardHeader className="p-3 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Time Account
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="cursor-pointer" onClick={() => setSelectedChart("Time Account")}>
                <div className="space-y-3">
                  {timeAccountData.slice(0, 6).map((item, index) => (
                    <div key={item.name} className="flex items-center">
                      <span className="w-32 text-sm truncate font-medium">{item.name}</span>
                      <div className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full relative"
                          style={{ 
                            width: `${(item.minutes / 480) * 100}%`,
                            background: `linear-gradient(90deg, ${getColorForIndex(index, 0.7)}, ${getColorForIndex(index, 0.9)})`,
                            boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.3)'
                          }}
                        >
                          <div className="absolute inset-0 opacity-20 bg-white bg-opacity-20" 
                               style={{ 
                                 backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,.15) 50%, rgba(255,255,255,.15) 75%, transparent 75%, transparent)',
                                 backgroundSize: '1rem 1rem',
                                 animation: 'progress-bar-stripes 1s linear infinite'
                               }}/>
                        </div>
                      </div>
                      <span className="w-14 text-right text-sm ml-2 font-medium">{item.minutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4">
                <Link href="/downtime-tracker">
                  <Button className="w-full h-8 text-sm py-0 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm">
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Downtime Tracker
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Hourly Production */}
          <Card className="col-span-8 overflow-hidden p-0 border-blue-100 dark:border-blue-900 dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 hover:shadow-md transition-shadow duration-300">
            <CardHeader className="p-3 bg-gradient-to-r from-blue-50 to-white dark:from-blue-950 dark:to-gray-900">
              <CardTitle className="flex items-center gap-2 text-base">
                <BarChart3 className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                Hourly Production
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="cursor-pointer" onClick={() => setSelectedChart("Hourly Production")}>
                <ResponsiveContainer width="100%" height={240}>
                  <ComposedChart 
                    data={hourlyProductionData}
                    margin={{ top: 15, right: 30, left: 15, bottom: 15 }}
                  >
                    <defs>
                      <linearGradient id="gpcGradientMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="wasteGradientMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="targetGradientMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                      width={30}
                      label={{ 
                        value: 'GPC', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: 'currentColor',
                        style: { textAnchor: 'middle', fontSize: '11px' }
                      }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: 'currentColor', fontSize: 12 }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                      width={30}
                      label={{ 
                        value: 'Waste', 
                        angle: 90, 
                        position: 'insideRight',
                        fill: 'currentColor',
                        style: { textAnchor: 'middle', fontSize: '11px' }
                      }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      animationDuration={300}
                      wrapperClassName="!bg-white dark:!bg-gray-800 dark:!text-gray-100 dark:!border dark:!border-gray-700 dark:!shadow-lg"
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '5px', fontSize: '12px' }}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="gpc" 
                      fill="url(#gpcGradientMain)" 
                      name="GPC" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      barSize={22}
                      stroke="#3b82f6"
                      strokeWidth={1}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="waste"
                      name="Waste"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ef4444", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart Dialog */}
      {selectedChart && (
        <Dialog open={!!selectedChart} onOpenChange={(open) => !open && setSelectedChart(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:text-gray-100 dark:border-gray-700 shadow-xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  <DialogTitle className="text-lg font-semibold">
                    {selectedChart === "Downtime" ? "Downtime Contribution" : selectedChart}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>
            <div ref={chartRef} className="flex-1 p-4">
              {selectedChart === "Downtime" && (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={downtimeDataSample}
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      innerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {downtimeDataSample.map((entry, index) => (
                        <Cell 
                          key={index} 
                          fill={entry.color}
                          stroke="white"
                          strokeWidth={2}
                          className="dark:stroke-gray-800"
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
                        padding: '4px 8px',
                        fontSize: '12px',
                        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        const entry = downtimeDataSample.find(item => item.value === value);
                        return [`${value}%`, entry ? entry.name : name];
                      }}
                      wrapperClassName="!bg-white dark:!bg-gray-800 dark:!text-gray-100 dark:!border dark:!border-gray-700 dark:!shadow-lg"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {selectedChart === "Time Account" && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={timeAccountData} 
                    layout="vertical" 
                    margin={{ top: 20, right: 30, left: 120, bottom: 20 }}
                  >
                    <defs>
                      {timeAccountData.map((entry, index) => (
                        <linearGradient 
                          key={`gradient-${index}`} 
                          id={`timeGradient${index}`} 
                          x1="0" 
                          y1="0" 
                          x2="1" 
                          y2="0"
                        >
                          <stop offset="0%" stopColor={getColorForIndex(index, 0.7)} />
                          <stop offset="100%" stopColor={getColorForIndex(index, 0.9)} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis 
                      type="number" 
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                      label={{ 
                        value: 'Minutes', 
                        position: 'insideBottom',
                        offset: -10,
                        fill: 'currentColor'
                      }}
                    />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={120}
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number) => [`${value} minutes`, 'Time']}
                      animationDuration={300}
                      wrapperClassName="!bg-white dark:!bg-gray-800 dark:!text-gray-100 dark:!border dark:!border-gray-700 dark:!shadow-lg"
                    />
                    <Bar 
                      dataKey="minutes" 
                      radius={[0, 4, 4, 0]}
                      animationDuration={1200}
                    >
                      {timeAccountData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#timeGradient${index})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {selectedChart === "Hourly Production" && (
                <ResponsiveContainer width="100%" height={400}>
                  <ComposedChart 
                    data={hourlyProductionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <defs>
                      <linearGradient id="gpcGradientDialog" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="wasteGradientDialog" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                        <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4}/>
                      </linearGradient>
                      <linearGradient id="targetGradientDialog" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity={0.4}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis 
                      dataKey="hour" 
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                    />
                    <YAxis 
                      yAxisId="left"
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                      label={{ 
                        value: 'GPC', 
                        angle: -90, 
                        position: 'insideLeft',
                        fill: 'currentColor',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: 'currentColor' }}
                      tickLine={{ stroke: 'currentColor' }}
                      axisLine={{ stroke: 'currentColor' }}
                      label={{ 
                        value: 'Waste', 
                        angle: 90, 
                        position: 'insideRight',
                        fill: 'currentColor',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <RechartsTooltip 
                      cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      animationDuration={300}
                      wrapperClassName="!bg-white dark:!bg-gray-800 dark:!text-gray-100 dark:!border dark:!border-gray-700 dark:!shadow-lg"
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px' }}
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar 
                      yAxisId="left"
                      dataKey="gpc" 
                      fill="url(#gpcGradientDialog)" 
                      name="GPC" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                      barSize={30}
                      stroke="#3b82f6"
                      strokeWidth={1}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="waste"
                      name="Waste"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "#ef4444", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#ef4444", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="target"
                      name="Target"
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 1 }}
                      activeDot={{ r: 6, fill: "#10b981", stroke: "#fff", strokeWidth: 2 }}
                      animationDuration={1500}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </div>
            <DialogFooter>
              <div className="flex space-x-2">
                <Button
                  onClick={handlePrint}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 dark:from-purple-600 dark:to-purple-800 dark:hover:from-purple-700 dark:hover:to-purple-900 dark:shadow-blue-900/20"
                >
                  Print Chart
                </Button>
                <Button
                  onClick={handleExportToExcel}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 dark:from-green-600 dark:to-green-800 dark:hover:from-green-700 dark:hover:to-green-900 dark:shadow-blue-900/20"
                >
                  Export to Excel
                </Button>
                <Button 
                  onClick={() => setSelectedChart(null)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 dark:from-gray-600 dark:to-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-900 dark:shadow-blue-900/20"
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
