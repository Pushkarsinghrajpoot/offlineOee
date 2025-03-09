"use client"

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, Clock, ClipboardList, Gauge, Layers, Settings } from "lucide-react"

const delayData = [
  {
    srNo: 1,
    application: "Machine Operator",
    delayReason: "Material Jam",
    totalDT: 120,
    frequency: 5,
    oeeLoss: 2.5,
    trend: "up",
  },
  {
    srNo: 2,
    application: "Maintenance",
    delayReason: "Preventive Maintenance",
    totalDT: 240,
    frequency: 2,
    oeeLoss: 5.0,
    trend: "down",
  },
  {
    srNo: 3,
    application: "Quality",
    delayReason: "Quality Check",
    totalDT: 90,
    frequency: 3,
    oeeLoss: 1.8,
    trend: "up",
  },
  {
    srNo: 4,
    application: "Machine Operator",
    delayReason: "Setup Time",
    totalDT: 75,
    frequency: 4,
    oeeLoss: 1.5,
    trend: "down",
  },
  {
    srNo: 5,
    application: "Maintenance",
    delayReason: "Equipment Failure",
    totalDT: 180,
    frequency: 1,
    oeeLoss: 3.8,
    trend: "up",
  },
]

const productDowntimeData = [
  { name: "Material Jam", value: 120, color: "#f43f5e" },
  { name: "Preventive Maintenance", value: 240, color: "#3b82f6" },
  { name: "Quality Check", value: 90, color: "#10b981" },
  { name: "Setup Time", value: 75, color: "#8b5cf6" },
  { name: "Equipment Failure", value: 180, color: "#f59e0b" },
  { name: "Power Outage", value: 60, color: "#64748b" },
  { name: "Tool Change", value: 45, color: "#ec4899" },
  { name: "Cleaning", value: 30, color: "#06b6d4" },
  { name: "Shift Change", value: 25, color: "#84cc16" },
  { name: "Material Shortage", value: 20, color: "#6366f1" },
]

const downtimeDistributionData = [
  { name: "Maintenance", value: 280, color: "#3b82f6" },
  { name: "Machine Operation", value: 220, color: "#f43f5e" },
  { name: "Quality", value: 90, color: "#10b981" },
  { name: "Setup", value: 75, color: "#8b5cf6" },
  { name: "External Factors", value: 60, color: "#f59e0b" },
]

interface DelayAnalysisReportProps {
  line?: string;
  startDate?: string;
  endDate?: string;
  shift?: string;
}

export function DelayAnalysisReport({ line, startDate, endDate, shift }: DelayAnalysisReportProps) {
  return (
    <Card className="border-none shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 py-2 px-4 flex flex-row items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-indigo-400" />
          <CardTitle className="text-base font-bold text-white">
            Delay Analysis Report
          </CardTitle>
        </div>
        <Badge variant="outline" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 text-xs py-0.5">
          Last 30 Days
        </Badge>
      </CardHeader>
      
      <CardContent className="p-0">
        {/* KPI Summary - More compact */}
        <div className="grid grid-cols-4 divide-x divide-slate-200 bg-gradient-to-b from-slate-50 to-white">
          <div className="p-2.5 flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
              <Clock className="h-3 w-3 text-indigo-500" />
              Total Downtime
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">865</span>
              <span className="text-xs text-slate-500">min</span>
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowDown className="h-2.5 w-2.5 mr-0.5" /> 12% from last month
            </span>
          </div>
          
          <div className="p-2.5 flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
              <Layers className="h-3 w-3 text-indigo-500" />
              Frequency
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">24</span>
              <span className="text-xs text-slate-500">occ.</span>
            </div>
            <span className="text-xs text-rose-600 flex items-center">
              <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> 8% from last month
            </span>
          </div>
          
          <div className="p-2.5 flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
              <Settings className="h-3 w-3 text-indigo-500" />
              Primary Cause
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-bold text-slate-900 truncate">Preventive Maintenance</span>
            </div>
            <span className="text-xs text-slate-500">27.7% of total downtime</span>
          </div>
          
          <div className="p-2.5 flex flex-col">
            <span className="text-xs font-medium text-slate-500 mb-0.5 flex items-center gap-1">
              <Gauge className="h-3 w-3 text-indigo-500" />
              OEE Impact
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-slate-900">9.3%</span>
              <span className="text-xs text-slate-500">loss</span>
            </div>
            <span className="text-xs text-emerald-600 flex items-center">
              <ArrowDown className="h-2.5 w-2.5 mr-0.5" /> 2.1% from last month
            </span>
          </div>
        </div>
        
        {/* Delay Details Table - More compact */}
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-slate-900 mb-1.5 flex items-center gap-1">
            <ClipboardList className="h-3.5 w-3.5 text-indigo-500" />
            Delay Details
          </h3>
          <div className="border rounded-lg overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-8 py-1.5 text-xs font-semibold text-slate-700">No.</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700">Application</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700">Delay Reason</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700 text-right">Total</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700 text-right">Freq.</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700 text-right">OEE</TableHead>
                  <TableHead className="py-1.5 text-xs font-semibold text-slate-700 text-right">Trend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayData.map((row) => (
                  <TableRow key={row.srNo} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="py-1 text-xs font-medium text-slate-900">{row.srNo}</TableCell>
                    <TableCell className="py-1 text-xs text-slate-700">{row.application}</TableCell>
                    <TableCell className="py-1 text-xs font-medium text-slate-900">{row.delayReason}</TableCell>
                    <TableCell className="py-1 text-xs text-slate-700 text-right">{row.totalDT}</TableCell>
                    <TableCell className="py-1 text-xs text-slate-700 text-right">{row.frequency}</TableCell>
                    <TableCell className="py-1 text-xs text-slate-700 text-right">{row.oeeLoss}%</TableCell>
                    <TableCell className="py-1 text-xs text-right">
                      {row.trend === "up" ? (
                        <Badge className="bg-rose-50 text-rose-600 hover:bg-rose-50 border-rose-100 text-[10px] py-0 px-1.5">
                          <ArrowUp className="h-2.5 w-2.5 mr-0.5" /> Up
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-50 text-emerald-600 hover:bg-emerald-50 border-emerald-100 text-[10px] py-0 px-1.5">
                          <ArrowDown className="h-2.5 w-2.5 mr-0.5" /> Down
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        {/* Charts Section - More compact */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-4 pt-1">
          {/* Top 10 Downtimes */}
          <Card className="border shadow-sm bg-white overflow-hidden">
            <CardHeader className="py-1.5 px-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b">
              <CardTitle className="text-xs font-semibold text-slate-900">Top 10 Downtimes</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={productDowntimeData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      width={80}
                      tick={{ fill: '#475569', fontSize: 10 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        fontSize: '10px',
                      }}
                      formatter={(value) => [`${value} min (${((Number(value) / 865) * 100).toFixed(1)}%)`, 'Duration']}
                    />
                    <Bar dataKey="value">
                      {productDowntimeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Downtime Distribution */}
          <Card className="border shadow-sm bg-white overflow-hidden">
            <CardHeader className="py-1.5 px-3 bg-gradient-to-r from-indigo-50 to-indigo-100/50 border-b">
              <CardTitle className="text-xs font-semibold text-slate-900">Downtime Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="h-[180px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={downtimeDistributionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      dataKey="value"
                      paddingAngle={2}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '2 2' }}
                    >
                      {downtimeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                        fontSize: '10px',
                      }}
                      formatter={(value) => [`${value} min (${((Number(value) / 865) * 100).toFixed(1)}%)`, 'Duration']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
