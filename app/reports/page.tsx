"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DelayAnalysisReport } from "@/components/reports/delay-analysis-report"
import { OEEReport } from "@/components/reports/oee-report"
import { FileSpreadsheet, Filter, BarChart2, Users, Activity, Clock, Calendar, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { withRoleCheck } from "@/components/auth/with-role-check"

const reports = [
  { id: "oee", name: "OEE Report", icon: Activity, isPDF: false },
  { id: "delay", name: "Delay Analysis", icon: Clock, isPDF: false },
  { id: "waste", name: "Waste Analysis", icon: BarChart2, isPDF: false },
  { id: "production", name: "Production Report", icon: Activity, isPDF: false },
  { id: "shift", name: "Shift Report", icon: Clock, isPDF: true },
  { id: "daily", name: "Daily Production", icon: Calendar, isPDF: true },
  { id: "team", name: "Team Performance", icon: Users, isPDF: false },
  { id: "linewise", name: "Line Performance", icon: BarChart2, isPDF: false }
]

function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("oee")
  const [selectedLine, setSelectedLine] = useState("Line 1")
  const [startDate, setStartDate] = useState("")
  const [startShift, setStartShift] = useState("")
  const [endDate, setEndDate] = useState("")
  const [endShift, setEndShift] = useState("")
  const [reportType, setReportType] = useState("")

  const handleExportToXLS = () => console.log("Exporting to XLS...")
  const handleDownloadPDF = (reportId: string) => console.log(`Downloading ${reportId} PDF...`)

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-48 border-r bg-gradient-to-b from-gray-50/50 to-gray-100/50 dark:from-gray-900/50 dark:to-gray-800/50 p-1">
        <h2 className="text-xs font-semibold px-2 py-1">Reports</h2>
        <div className="space-y-0.5 mt-1">
          {reports.map((report) => {
            const Icon = report.icon
            return (
              <button
                key={report.id}
                onClick={() => report.isPDF ? handleDownloadPDF(report.id) : setSelectedReport(report.id)}
                className={cn(
                  "w-full text-left p-1.5 rounded text-xs transition-all duration-200 group flex items-center gap-1.5",
                  selectedReport === report.id
                    ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-primary"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
              >
                <Icon className="w-3 h-3 text-gray-500 group-hover:text-primary" />
                <span className="flex-1 truncate">{report.name}</span>
                {report.isPDF && <Download className="w-2.5 h-2.5 text-gray-400" />}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Card className="m-1 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-1.5">
            <div className="flex flex-wrap gap-1.5 items-end text-xs">
              <div className="w-28">
                <label className="text-xs mb-0.5 block text-gray-600 dark:text-gray-400">Line</label>
                <Select value={selectedLine} onValueChange={setSelectedLine}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Select line" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Line 1">Line 1</SelectItem>
                    <SelectItem value="Line 2">Line 2</SelectItem>
                    <SelectItem value="Line 3">Line 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <label className="text-xs mb-0.5 block text-gray-600 dark:text-gray-400">Start Date</label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="w-24">
                <label className="text-xs mb-0.5 block text-gray-600 dark:text-gray-400">Start Shift</label>
                <Select value={startShift} onValueChange={setStartShift}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-28">
                <label className="text-xs mb-0.5 block text-gray-600 dark:text-gray-400">End Date</label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-7 text-xs" />
              </div>
              <div className="w-24">
                <label className="text-xs mb-0.5 block text-gray-600 dark:text-gray-400">End Shift</label>
                <Select value={endShift} onValueChange={setEndShift}>
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="Shift" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                    <SelectItem value="night">Night</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-1">
                <Button variant="outline" onClick={handleExportToXLS} size="sm" className="h-7 text-xs px-2">
                  <FileSpreadsheet className="w-3 h-3" />
                  <span className="ml-1">Export</span>
                </Button>
                <Button size="sm" className="h-7 text-xs px-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Filter className="w-3 h-3" />
                  <span className="ml-1">Apply</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 p-1 overflow-auto">
          {selectedReport === "oee" && (
            <OEEReport
              line={selectedLine}
              startDate={startDate}
              endDate={endDate}
              shift={startShift}
              reportType={reportType}
            />
          )}
          {selectedReport === "delay" && (
            <DelayAnalysisReport
              line={selectedLine}
              startDate={startDate}
              endDate={endDate}
              shift={startShift}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default withRoleCheck(ReportsPage, {
  feature: 'reports',
  requiredAccess: true
});
