"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {Gauge} from "lucide-react"
import dynamic from 'next/dynamic';

export const ProductionRateCard = ({ 
  timeframe = "current", 
  lineId = "Overall",
  staticSpeed = null,
  staticRate = null
}) => {
  const [currentSpeed, setCurrentSpeed] = useState(staticSpeed || 0)
  const [productionRate, setProductionRate] = useState(staticRate || 23000)
  const targetSpeed = 400

  useEffect(() => {
    // Only animate for current performance
    if (timeframe === "current") {
      const interval = setInterval(() => {
        setCurrentSpeed((prev) => {
          const change = Math.random() * 20 - 10
          return Math.max(0, Math.min(targetSpeed, prev + change))
        })
        
        setProductionRate((prev) => {
          const change = Math.floor(Math.random() * 200) - 100
          return Math.max(22000, Math.min(24000, prev + change))
        })
      }, 1000)

      return () => clearInterval(interval)
    } else {
      // For MTD and YTD, we use static values based on the selected line
      // This would typically come from an API call with the lineId
      if (lineId) {
        // Simulating different values based on timeframe and lineId
        // In a real app, this would be replaced with API data
        if (timeframe === "mtd") {
          if (lineId === "Overall") {
            setCurrentSpeed(360)
            setProductionRate(21500)
          } else if (lineId === "Line 1") {
            setCurrentSpeed(380)
            setProductionRate(22500)
          } else if (lineId === "Line 2") {
            setCurrentSpeed(350)
            setProductionRate(21000)
          } else if (lineId === "Line 3") {
            setCurrentSpeed(370)
            setProductionRate(22000)
          } else if (lineId === "Line 4") {
            setCurrentSpeed(330)
            setProductionRate(20000)
          } else if (lineId === "Line 5") {
            setCurrentSpeed(390)
            setProductionRate(23000)
          } else if (lineId === "Line 6") {
            setCurrentSpeed(340)
            setProductionRate(20500)
          } else if (lineId === "Line 7") {
            setCurrentSpeed(360)
            setProductionRate(21500)
          } else if (lineId === "Line 8") {
            setCurrentSpeed(380)
            setProductionRate(22500)
          } else if (lineId === "Line 9") {
            setCurrentSpeed(350)
            setProductionRate(21000)
          } else if (lineId === "Line 10") {
            setCurrentSpeed(370)
            setProductionRate(22000)
          }
        } else if (timeframe === "ytd") {
          if (lineId === "Overall") {
            setCurrentSpeed(350)
            setProductionRate(21000)
          } else if (lineId === "Line 1") {
            setCurrentSpeed(365)
            setProductionRate(21800)
          } else if (lineId === "Line 2") {
            setCurrentSpeed(340)
            setProductionRate(20500)
          } else if (lineId === "Line 3") {
            setCurrentSpeed(375)
            setProductionRate(22200)
          } else if (lineId === "Line 4") {
            setCurrentSpeed(335)
            setProductionRate(20200)
          } else if (lineId === "Line 5") {
            setCurrentSpeed(395)
            setProductionRate(23200)
          } else if (lineId === "Line 6") {
            setCurrentSpeed(345)
            setProductionRate(20700)
          } else if (lineId === "Line 7") {
            setCurrentSpeed(365)
            setProductionRate(21800)
          } else if (lineId === "Line 8") {
            setCurrentSpeed(385)
            setProductionRate(22700)
          } else if (lineId === "Line 9") {
            setCurrentSpeed(355)
            setProductionRate(21200)
          } else if (lineId === "Line 10") {
            setCurrentSpeed(375)
            setProductionRate(22200)
          }
        }
      }
    }
  }, [timeframe, lineId, targetSpeed, staticSpeed, staticRate])

  const percentage = (currentSpeed / targetSpeed) * 100
  const needleRotation = (percentage / 100) * 180 - 90

  // Determine title based on timeframe
  const getTitle = () => {
    switch (timeframe) {
      case "mtd":
        return "MTD Speed"
      case "ytd":
        return "YTD Speed"
      default:
        return "Current Speed"
    }
  }

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="space-y-1 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="w-4 h-4 text-blue-500" />
            <CardTitle className="text-sm font-semibold">{getTitle()}</CardTitle>
          </div>
          <div className="flex items-center">
            <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
              {productionRate.toLocaleString()} su/hr
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-full h-32">
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
                className="text-xl font-bold fill-current"
              >
                {Math.round(currentSpeed)}
              </text>
              <text 
                x="100" 
                y="90" 
                textAnchor="middle" 
                className="text-sm fill-current opacity-60"
              >
                PPM
              </text>
            </svg>
          </div>
          <div className="flex justify-end space-x-2 text-xs font-medium text-gray-600 dark:text-gray-300">
            <TrendingUp className="w-3.5 h-3.5 justify-end" />
            <span>Target: {targetSpeed} PPM</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function OEECard({ title, data }: { title: string, data: any }) {
  const [showPopup, setShowPopup] = useState(false);
  
  const getPopupMessage = () => {
    switch (title) {
      case "Current Performance":
        return "Showing performance for today since 12 am";
      case "Month-to-Date":
        return "Showing performance for current month since 1st day of the month";
      case "Year-to-Date":
        return "Showing performance for current year since 1st day of January";
      default:
        return "";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="py-2 px-3">
        <div className="flex items-center space-x-1">
          <Activity className="w-4 h-4 text-indigo-500" />
          <div className="relative">
            <CardTitle 
              className="text-sm font-semibold cursor-help"
              onMouseEnter={() => setShowPopup(true)}
              onMouseLeave={() => setShowPopup(false)}
            >
              {title}
            </CardTitle>
            {showPopup && (
              <div className="absolute z-50 left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800/90 text-white rounded text-xs max-w-[740px] shadow-md border border-slate-700">
                <p>
                  {getPopupMessage()}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="flex items-start gap-2">
          {/* OEE Gauge */}
          <div className="relative h-24 w-24 flex-shrink-0">
            <svg className="h-24 w-24 -rotate-90 transform">
              <circle 
                className="text-gray-200 dark:text-gray-800 stroke-current" 
                strokeWidth="8" 
                fill="transparent" 
                r="42" 
                cx="48" 
                cy="48" 
              />
              <circle
                className="stroke-blue-500"
                strokeWidth="8"
                strokeLinecap="round"
                fill="transparent"
                r="42"
                cx="48"
                cy="48"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - data.oee / 100)}`}
                style={{
                  transition: "stroke-dashoffset 0.5s ease",
                  filter: "drop-shadow(0 0 4px rgba(59, 130, 246, 0.5))"
                }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-500">{data.oee}%</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">OEE</p>
              </div>
            </div>
          </div>
          
          {/* Metrics */}
          <div className="flex-1 space-y-2">
            {[
              { 
                label: "AVA", 
                value: data.availability, 
                color: "#10b981",
                bgColor: "bg-emerald-100 dark:bg-emerald-900/20"
              },
              { 
                label: "EFF", 
                value: data.efficiency, 
                color: "#f59e0b",
                bgColor: "bg-amber-100 dark:bg-amber-900/20"
              },
              { 
                label: "QUA", 
                value: data.quality, 
                color: "#6366f1",
                bgColor: "bg-indigo-100 dark:bg-indigo-900/20"
              }
            ].map((metric) => (
              <div key={metric.label} className="flex items-center space-x-1">
                <div className="w-8 text-xs font-medium">{metric.label}</div>
                <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${metric.value}%`,
                      backgroundColor: metric.color
                    }}
                  ></div>
                </div>
                <div 
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${metric.bgColor}`}
                  style={{ color: metric.color }}
                >
                  {metric.value}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function KPIDashboard() {
  const { checkAccess } = useAuth();
  const canExport = checkAccess('reports');
  const lines = [
    "Line 1", "Line 2", "Line 3", "Line 4", "Line 5",
    "Line 6", "Line 7", "Line 8", "Line 9", "Line 10"
  ]

  const getStoredLine = (key: string) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key) || "Line 1"
    }
    return "Line 1"
  }

  const [selectedCurrentLine, setSelectedCurrentLine] = useState(getStoredLine('selectedCurrentLine'))
  const [selectedMTDLine, setSelectedMTDLine] = useState(getStoredLine('selectedMTDLine'))
  const [selectedYTDLine, setSelectedYTDLine] = useState(getStoredLine('selectedYTDLine'))

  useEffect(() => {
    localStorage.setItem('selectedCurrentLine', selectedCurrentLine)
  }, [selectedCurrentLine])

  useEffect(() => {
    localStorage.setItem('selectedMTDLine', selectedMTDLine)
  }, [selectedMTDLine])

  useEffect(() => {
    localStorage.setItem('selectedYTDLine', selectedYTDLine)
  }, [selectedYTDLine])

  const [selectedChart, setSelectedChart] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const [selectedDowntimeCategory, setSelectedDowntimeCategory] = useState<string | null>(null);

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

    if (selectedChart === "Linewise Performance") {
      data = linewiseData.map(item => ({
        Line: item.line,
        'OEE (%)': item.oee,
        'Waste (%)': item.waste
      }));
    } else if (selectedChart === "Downtime Contribution") {
      data = downtimeData.map(item => ({
        'Downtime Category': item.name,
        'Percentage (%)': item.value
      }));
    } else if (selectedChart === "Energy & Utilities") {
      // Combine power and water data
      const combinedData: any[] = [];
      energyData.power.forEach(item => {
        combinedData.push({
          'Hour': `${item.hour}:00`,
          'Type': 'Power',
          'Value': item.value
        });
      });
      energyData.water.forEach(item => {
        combinedData.push({
          'Hour': `${item.hour}:00`,
          'Type': 'Water',
          'Value': item.value
        });
      });
      data = combinedData;
    } else if (selectedChart === "Power Usage") {
      data = energyData.power.map(item => ({
        'Hour': `${item.hour}:00`,
        'Power Usage (kWh)': item.value
      }));
    } else if (selectedChart === "Water Usage") {
      data = energyData.water.map(item => ({
        'Hour': `${item.hour}:00`,
        'Water Usage (m³)': item.value
      }));
    }

    import('@/utils/chart-export').then(({ exportChartToExcel }) => {
      exportChartToExcel({
        title: selectedChart,
        data: data,
        chartRef: chartRef,
        clientName: "PixWingAi Client"
      });
    });
  }

  const renderChartDialog = () => {
    // Prepare data for export based on the selected chart
    let exportData: any[] = [];
    
    if (selectedChart === "Linewise Performance") {
      exportData = linewiseData.map(item => ({
        Line: item.line,
        'OEE (%)': item.oee,
        'Waste (%)': item.waste
      }));
    } else if (selectedChart === "Downtime Contribution") {
      exportData = downtimeData.map(item => ({
        'Downtime Category': item.name,
        'Percentage (%)': item.value
      }));
    } else if (selectedChart === "Energy & Utilities") {
      // Combine power and water data
      const combinedData: any[] = [];
      energyData.power.forEach(item => {
        combinedData.push({
          'Hour': `${item.hour}:00`,
          'Type': 'Power',
          'Value': item.value
        });
      });
      energyData.water.forEach(item => {
        combinedData.push({
          'Hour': `${item.hour}:00`,
          'Type': 'Water',
          'Value': item.value
        });
      });
      exportData = combinedData;
    } else if (selectedChart === "Power Usage") {
      exportData = energyData.power.map(item => ({
        'Hour': `${item.hour}:00`,
        'Power Usage (kWh)': item.value
      }));
    } else if (selectedChart === "Water Usage") {
      exportData = energyData.water.map(item => ({
        'Hour': `${item.hour}:00`,
        'Water Usage (m³)': item.value
      }));
    }
    
    // Import the ChartExportDialog component dynamically to avoid circular dependencies
    const ChartExportDialog = dynamic(() => import('@/components/chart-export-dialog').then(mod => mod.ChartExportDialog), {
      ssr: false,
      loading: () => <div className="flex items-center justify-center h-full">Loading chart...</div>
    });
    
    return (
      <Dialog open={!!selectedChart} onOpenChange={() => {
        setSelectedChart(null);
        setSelectedDowntimeCategory(null);
      }}>
        <DialogContent className="max-w-[90vw] w-[900px] h-[700px] flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0">
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Activity className="w-6 h-6 text-blue-500" />
                <DialogTitle className="text-xl font-semibold">
                  {selectedDowntimeCategory ? `${selectedDowntimeCategory} Breakdown` : selectedChart}
                </DialogTitle>
              </div>
              {selectedDowntimeCategory && (
                <Button
                  variant="ghost"
                  onClick={() => setSelectedDowntimeCategory(null)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to Overview
                </Button>
              )}
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
                  <RechartsTooltip 
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
            {selectedChart === "Downtime" && !selectedDowntimeCategory && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={downtimeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={Math.min(window.innerWidth * 0.2, window.innerHeight * 0.2)}
                    innerRadius={Math.min(window.innerWidth * 0.12, window.innerHeight * 0.12)}
                    paddingAngle={2}
                    dataKey="value"
                    onClick={(data) => setSelectedDowntimeCategory(data.name)}
                    className="cursor-pointer"
                    label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
                      const RADIAN = Math.PI / 180;
                      // Calculate position for the text
                      const radius = outerRadius * 1.2;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      
                      // Calculate position for the line
                      const lineEnd = {
                        x: cx + (outerRadius + 10) * Math.cos(-midAngle * RADIAN),
                        y: cy + (outerRadius + 10) * Math.sin(-midAngle * RADIAN),
                      };
                      
                      // Determine text anchor based on position
                      const textAnchor = x > cx ? 'start' : 'end';
                      
                      return (
                        <g>
                          {/* Line from segment to label */}
                          <path
                            d={`M ${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${cy + outerRadius * Math.sin(-midAngle * RADIAN)}
                               L ${lineEnd.x},${lineEnd.y}
                               L ${x},${y}`}
                            stroke="currentColor"
                            strokeWidth={1}
                            fill="none"
                            strokeOpacity={0.7}
                          />
                          {/* Label text */}
                          <text
                            x={x}
                            y={y}
                            textAnchor={textAnchor}
                            fill="currentColor"
                            dominantBaseline="central"
                            className="text-xs font-medium"
                          >
                            {`${name}: ${value}%`}
                          </text>
                        </g>
                      );
                    }}
                    labelLine={false}
                  >
                    {downtimeData.map((entry, index) => (
                      <Cell 
                        key={index} 
                        fill={entry.color}
                        stroke={entry.color}
                        strokeWidth={2}
                        className="hover:opacity-80 transition-opacity"
                      />
                    ))}
                  </Pie>
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    formatter={(value, entry) => {
                      const item = downtimeData.find(d => d.name === value);
                      return `${value}: ${item?.value}%`;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Downtime" && selectedDowntimeCategory && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {detailedDowntimeData[selectedDowntimeCategory].map((item, index) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow-md"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-sm">{item.reason}</h3>
                        <Badge variant="secondary">{item.percentage}%</Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ 
                            width: `${(item.percentage / Math.max(...detailedDowntimeData[selectedDowntimeCategory].map(i => i.percentage))) * 100}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">{item.duration} hours</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {selectedChart === "Energy & Utilities" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    dataKey="hour" 
                    domain={[0, 24]}
                    tickFormatter={(value) => `${value}:00`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <RechartsTooltip 
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
                </LineChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Power Usage" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    dataKey="hour" 
                    domain={[0, 24]}
                    tickFormatter={(value) => `${value}:00`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => `${value} kW`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    data={energyData.power} 
                    name="Power Usage" 
                    stroke="#eab308"
                    strokeWidth={3}
                    dot={{ fill: '#eab308', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            {selectedChart === "Water Usage" && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis 
                    dataKey="hour" 
                    domain={[0,24]}
                    tickFormatter={(value) => `${value}:00`}
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <YAxis 
                    stroke="currentColor"
                    tick={{ fill: 'currentColor' }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderRadius: '8px',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => `${value} m³`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    data={energyData.water} 
                    name="Water Usage" 
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
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
    );
  }

  const currentLineData = {
    "Line 1": { oee: 78, availability: 92, efficiency: 85, quality: 96 },
    "Line 2": { oee: 72, availability: 88, efficiency: 83, quality: 93 },
    "Line 3": { oee: 80, availability: 93, efficiency: 86, quality: 95 },
    "Line 4": { oee: 75, availability: 90, efficiency: 84, quality: 94 },
    "Line 5": { oee: 82, availability: 94, efficiency: 87, quality: 97 },
    "Line 6": { oee: 70, availability: 87, efficiency: 82, quality: 92 },
    "Line 7": { oee: 76, availability: 91, efficiency: 84, quality: 95 },
    "Line 8": { oee: 79, availability: 93, efficiency: 86, quality: 96 },
    "Line 9": { oee: 71, availability: 88, efficiency: 83, quality: 93 },
    "Line 10": { oee: 77, availability: 92, efficiency: 85, quality: 95 },
    "Overall": { oee: 75, availability: 90, efficiency: 84, quality: 94 }
  };

  const mtdLineData = {
    "Line 1": { oee: 75, availability: 90, efficiency: 83, quality: 94 },
    "Line 2": { oee: 73, availability: 89, efficiency: 82, quality: 93 },
    "Line 3": { oee: 78, availability: 92, efficiency: 85, quality: 95 },
    "Line 4": { oee: 80, availability: 93, efficiency: 86, quality: 96 },
    "Line 5": { oee: 77, availability: 91, efficiency: 84, quality: 95 },
    "Line 6": { oee: 72, availability: 88, efficiency: 82, quality: 93 },
    "Line 7": { oee: 74, availability: 89, efficiency: 83, quality: 94 },
    "Line 8": { oee: 76, availability: 90, efficiency: 84, quality: 95 },
    "Line 9": { oee: 73, availability: 89, efficiency: 82, quality: 93 },
    "Line 10": { oee: 75, availability: 90, efficiency: 83, quality: 94 },
    "Overall": { oee: 74, availability: 89, efficiency: 83, quality: 94 }
  };

  const ytdLineData = {
    "Line 1": { oee: 77, availability: 92, efficiency: 85, quality: 96 },
    "Line 2": { oee: 75, availability: 90, efficiency: 84, quality: 94 },
    "Line 3": { oee: 79, availability: 93, efficiency: 86, quality: 95 },
    "Line 4": { oee: 78, availability: 93, efficiency: 86, quality: 95 },
    "Line 5": { oee: 80, availability: 94, efficiency: 87, quality: 97 },
    "Line 6": { oee: 74, availability: 89, efficiency: 84, quality: 93 },
    "Line 7": { oee: 76, availability: 91, efficiency: 85, quality: 94 },
    "Line 8": { oee: 79, availability: 93, efficiency: 86, quality: 96 },
    "Line 9": { oee: 75, availability: 90, efficiency: 84, quality: 94 },
    "Line 10": { oee: 77, availability: 92, efficiency: 85, quality: 95 },
    "Overall": { oee: 76, availability: 91, efficiency: 84, quality: 95 }
  };

  const performanceData = {
    current: currentLineData[selectedCurrentLine],
    mtd: mtdLineData[selectedMTDLine],
    ytd: ytdLineData[selectedYTDLine]
  };

  const linewiseData = [
    { line: "Line 1", oee: 78, waste: 2.5 },
    { line: "Line 2", oee: 72, waste: 3.2 },
    { line: "Line 3", oee: 54, waste: 3.0 },
    { line: "Line 4", oee: 76, waste: 2.1 },
    { line: "Line 5", oee: 82, waste: 2.8 },
    { line: "Line 6", oee: 45, waste: 3.3 },
    { line: "Line 7", oee: 85, waste: 2.0 },
    { line: "Line 8", oee: 82, waste: 2.7 },
    { line: "Line 9", oee: 45, waste: 3.4 },
    { line: "Line 10", oee: 85, waste: 2.2 }
  ]

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
    power: Array.from({ length: 25 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 100) + 50,
    })),
    water: Array.from({ length: 25 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 50) + 20,
    })),
    air: Array.from({ length: 25 }, (_, i) => ({
      hour: i,
      value: Math.floor(Math.random() * 30) + 70,
    })),
  }

  const detailedDowntimeData = {
    "Downtime": [
      { reason: "Machine Breakdown", duration: 12, percentage: 12 },
      { reason: "Equipment Failure", duration: 8, percentage: 8 },
      { reason: "System Error", duration: 4, percentage: 4 },
      { reason: "Power Outage", duration: 3, percentage: 3 },
      { reason: "Software Issues", duration: 2, percentage: 2 },
      { reason: "Sensor Malfunction", duration: 1, percentage: 1 },
      { reason: "Control System Error", duration: 0.8, percentage: 0.8 },
      { reason: "Network Issues", duration: 0.5, percentage: 0.5 },
      { reason: "PLC Failure", duration: 0.4, percentage: 0.4 },
      { reason: "HMI Issues", duration: 0.3, percentage: 0.3 }
    ],
    "Maintenance": [
      { reason: "Scheduled Maintenance", duration: 5, percentage: 5 },
      { reason: "Preventive Maintenance", duration: 3, percentage: 3 },
      { reason: "Filter Change", duration: 1, percentage: 1 },
      { reason: "Lubrication", duration: 0.8, percentage: 0.8 },
      { reason: "Belt Replacement", duration: 0.5, percentage: 0.5 },
      { reason: "Calibration", duration: 0.4, percentage: 0.4 },
      { reason: "Safety Check", duration: 0.4, percentage: 0.4 },
      { reason: "Cleaning", duration: 0.4, percentage: 0.4 },
      { reason: "Parts Replacement", duration: 0.3, percentage: 0.3 },
      { reason: "Inspection", duration: 0.2, percentage: 0.2 }
    ],
    "White Time": [
      { reason: "Shift Change", duration: 10, percentage: 10 },
      { reason: "Break Time", duration: 5, percentage: 5 },
      { reason: "Team Meeting", duration: 3, percentage: 3 },
      { reason: "Training", duration: 2, percentage: 2 },
      { reason: "Documentation", duration: 1, percentage: 1 },
      { reason: "Safety Briefing", duration: 0.8, percentage: 0.8 },
      { reason: "Quality Review", duration: 0.5, percentage: 0.5 },
      { reason: "Planning Session", duration: 0.3, percentage: 0.3 },
      { reason: "Handover", duration: 0.2, percentage: 0.2 },
      { reason: "Audit", duration: 0.2, percentage: 0.2 }
    ],
    "External Cause": [
      { reason: "Material Shortage", duration: 10, percentage: 10 },
      { reason: "Supplier Delay", duration: 5, percentage: 5 },
      { reason: "Weather Conditions", duration: 3, percentage: 3 },
      { reason: "Power Supply Issues", duration: 2, percentage: 2 },
      { reason: "External Quality Issues", duration: 1, percentage: 1 },
      { reason: "Transportation Delay", duration: 0.8, percentage: 0.8 },
      { reason: "Regulatory Inspection", duration: 0.5, percentage: 0.5 },
      { reason: "External Audit", duration: 0.3, percentage: 0.3 },
      { reason: "Utility Supply Issues", duration: 0.2, percentage: 0.2 },
      { reason: "Local Restrictions", duration: 0.2, percentage: 0.2 }
    ],
    "Grade Change": [
      { reason: "Product Changeover", duration: 2, percentage: 2 },
      { reason: "Setup Time", duration: 1, percentage: 1 },
      { reason: "Recipe Change", duration: 0.5, percentage: 0.5 },
      { reason: "Material Change", duration: 0.4, percentage: 0.4 },
      { reason: "Quality Adjustment", duration: 0.3, percentage: 0.3 },
      { reason: "Parameter Setup", duration: 0.3, percentage: 0.3 },
      { reason: "Testing Time", duration: 0.2, percentage: 0.2 },
      { reason: "Validation", duration: 0.1, percentage: 0.1 },
      { reason: "Documentation Update", duration: 0.1, percentage: 0.1 },
      { reason: "System Update", duration: 0.1, percentage: 0.1 }
    ],
    "Speed Loss": [
      { reason: "Minor Stoppages", duration: 2, percentage: 2 },
      { reason: "Reduced Speed", duration: 1, percentage: 1 },
      { reason: "Process Variation", duration: 0.5, percentage: 0.5 },
      { reason: "Equipment Wear", duration: 0.4, percentage: 0.4 },
      { reason: "Material Issues", duration: 0.3, percentage: 0.3 },
      { reason: "Operator Adjustment", duration: 0.2, percentage: 0.2 },
      { reason: "Environmental Factors", duration: 0.2, percentage: 0.2 },
      { reason: "Quality Checks", duration: 0.2, percentage: 0.2 },
      { reason: "Process Control", duration: 0.1, percentage: 0.1 },
      { reason: "Minor Adjustments", duration: 0.1, percentage: 0.1 }
    ]
  };

  return (
    <div className="flex flex-col gap-1.5 p-0.5">
      <div className="grid gap-1.5 md:grid-cols-4 pt-2">
        <div>
          <div className="mb-1.5">
            <Select value={selectedCurrentLine} onValueChange={setSelectedCurrentLine}>
              <SelectTrigger className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border border-blue-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Select line" />
              </SelectTrigger>
              <SelectContent>
                {lines.map((line) => (
                  <SelectItem key={line} value={line} className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700">
                    {line}
                  </SelectItem>
                ))}
                <SelectItem value="divider" className="h-px bg-gray-200 dark:bg-gray-700 my-1" disabled />
                <SelectItem value="Overall" className="cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 font-semibold">
                  Overall Performance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <OEECard title="Current Performance" data={performanceData.current} />
        </div>

        <div>
          <div className="mb-1.5">
            <Select value={selectedMTDLine} onValueChange={setSelectedMTDLine}>
              <SelectTrigger className="w-full bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 border border-green-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Select line" />
              </SelectTrigger>
              <SelectContent>
                {lines.map((line) => (
                  <SelectItem key={line} value={line} className="cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700">
                    {line}
                  </SelectItem>
                ))}
                <SelectItem value="divider" className="h-px bg-gray-200 dark:bg-gray-700 my-1" disabled />
                <SelectItem value="Overall" className="cursor-pointer hover:bg-green-50 dark:hover:bg-gray-700 font-semibold">
                  Overall Performance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <OEECard title="Month-to-Date" data={performanceData.mtd} />
        </div>

        <div>
          <div className="mb-1.5">
            <Select value={selectedYTDLine} onValueChange={setSelectedYTDLine}>
              <SelectTrigger className="w-full bg-gradient-to-r from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-700 border border-purple-200 dark:border-gray-600 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
                <SelectValue placeholder="Select line" />
              </SelectTrigger>
              <SelectContent>
                {lines.map((line) => (
                  <SelectItem key={line} value={line} className="cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700">
                    {line}
                  </SelectItem>
                ))}
                <SelectItem value="divider" className="h-px bg-gray-200 dark:bg-gray-700 my-1" disabled />
                <SelectItem value="Overall" className="cursor-pointer hover:bg-purple-50 dark:hover:bg-gray-700 font-semibold">
                  Overall Performance
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <OEECard title="Year-to-Date" data={performanceData.ytd} />
        </div>

        <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800" onClick={() => setSelectedChart("Linewise Performance")}>
          <CardHeader className="py-1 px-2">
            <div className="flex items-center space-x-1">
              <Target className="w-3.5 h-3.5 text-blue-500" />
              <CardTitle className="text-xs font-semibold">Linewise OEE & Waste</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-1">
            <ResponsiveContainer width="100%" height={150}>
              <ComposedChart data={linewiseData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
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
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => `${value}%`}
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
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-1.5 md:grid-cols-4">
        <ProductionRateCard 
          timeframe="current" 
          lineId={selectedCurrentLine} 
        />
        <ProductionRateCard 
          timeframe="mtd" 
          lineId={selectedMTDLine} 
        />
        <ProductionRateCard 
          timeframe="ytd" 
          lineId={selectedYTDLine} 
        />
        <Card className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="space-y-1 p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <CardTitle className="text-sm font-semibold">Safe Days</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-2">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">300</div>
            </div>
            <div className="grid gap-1">
              <div className="flex justify-between items-center bg-blue-500 text-white p-1.5 rounded-md text-xs">
                <span>Number of First Aids</span>
                <span className="pr-1">2</span>
              </div>
              <div className="flex justify-between items-center bg-blue-500 text-white p-1.5 rounded-md text-xs">
                <span>Lost Time Injury</span>
                <span className="pr-1 text-center">0</span>
              </div>
              <div className="flex justify-between items-center bg-blue-500 text-white p-1.5 rounded-md text-xs">
                <span>Major Incident</span>
                <span className="pr-1 text-center">0</span>
              </div>
              <div className="flex justify-between items-center bg-blue-500 text-white p-1.5 rounded-md text-xs">
                <span>Minor Incident</span>
                <span className="pr-1 text-center">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-2 md:grid-cols-4">
        {/* Downtime Contribution Charts */}
        {Array.from({ length: 3 }).map((_, i) => (
          <Card 
            key={i} 
            className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setSelectedChart("Downtime")}
          >
            <CardHeader className="pb-1 pt-1 px-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <CardTitle className="text-xs font-semibold">Downtime</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                  {downtimeData[i]?.value}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-1 p-1">
              <div className="h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={downtimeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      innerRadius={30}
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
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: '1px solid rgba(148, 163, 184, 0.2)',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      formatter={(value: number, name: string, props: any) => {
                        // Get the actual name from the data
                        const entry = downtimeData.find(item => item.value === value);
                        return [`${value}%`, entry ? entry.name : name];
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col justify-center space-y-1">
                {downtimeData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-xs">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Energy & Utilities Card */}
        <div className="w-full bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg shadow-lg">
          <div className="p-1.5 border-b">
            <div className="flex items-center space-x-1">
              <h2 className="text-sm font-semibold">Energy & Utilities Usage</h2>
            </div>
          </div>
          
          {/* Power Usage Section */}
          <div 
            className="p-1.5 border-b hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            onClick={() => setSelectedChart("Power Usage")}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                  <Power className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-xs font-semibold">Power Usage</h3>
                    <p className="text-xs text-gray-500">24h Consumption</p>
                  </div>
                  <div className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 rounded-md">
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">{energyData.power[energyData.power.length - 1].value} kW</span>
                  </div>
                </div>
              </div>
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

          {/* Water Usage Section */}
          <div 
            className="p-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200"
            onClick={() => setSelectedChart("Water Usage")}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center space-x-3">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <div>
                    <h3 className="text-xs font-semibold">Water Usage</h3>
                    <p className="text-xs text-gray-500">24h Consumption</p>
                  </div>
                  <div className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{energyData.water[energyData.water.length - 1].value} m³</span>
                  </div>
                </div>
              </div>
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
        </div>

      </div>

      {renderChartDialog()}
    </div>
  )
}

export default withRoleCheck(KPIDashboard, {
  feature: 'kpiDashboard',
  requiredAccess: true
});
