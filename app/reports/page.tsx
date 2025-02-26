"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { OEEReport } from "@/components/reports/oee-report"
import { DelayAnalysisReport } from "@/components/reports/delay-analysis-report"
import { withRoleCheck } from "@/components/auth/with-role-check"

type ReportType = "oee" | "delay" | "waste" | "production" | "shift-pdf" | "daily-pdf" | "team" | "linewise"

const reports = [
  { id: "oee", name: "OEE Report" },
  { id: "delay", name: "Delay Analysis Report" },
  { id: "waste", name: "Waste Analysis Report" },
  { id: "production", name: "Production Report" },
  { id: "shift-pdf", name: "Shift Report (PDF)" },
  { id: "daily-pdf", name: "Daily Production Report (PDF)" },
  { id: "team", name: "Team Performance Report" },
  { id: "linewise", name: "Linewise Performance Report" },
] as const

function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType>("oee")
  const [selectedLine, setSelectedLine] = useState("Line 1")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [shift, setShift] = useState("")
  const [reportType, setReportType] = useState("")

  const handleExportToXLS = () => {
    // Implement export functionality
    console.log("Exporting to XLS...")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 bg-card border rounded-lg overflow-hidden">
              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Line</label>
                  <Select value={selectedLine} onValueChange={setSelectedLine}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Line 1">Line 1</SelectItem>
                      <SelectItem value="Line 2">Line 2</SelectItem>
                      <SelectItem value="Line 3">Line 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="px-2">
                <div className="space-y-1">
                  {reports.map((report) => (
                    <Button
                      key={report.id}
                      variant={selectedReport === report.id ? "secondary" : "ghost"}
                      className={cn("w-full justify-start", selectedReport === report.id && "bg-blue-50 text-blue-700")}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      {report.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="flex flex-col h-[calc(100vh-2rem)]">
                <Card>
                  <CardHeader className="h-16 flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">
                      {reports.find((r) => r.id === selectedReport)?.name}
                    </CardTitle>
                    <Button onClick={handleExportToXLS} size="sm">
                      Extract Report in XLS
                    </Button>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <div className="flex-grow overflow-auto">
                      <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Start Date</label>
                          <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-blue-100 h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">End Date</label>
                          <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-blue-100 h-7 text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Shift</label>
                          <Select value={shift} onValueChange={setShift}>
                            <SelectTrigger className="bg-blue-100 h-7 text-sm">
                              <SelectValue placeholder="Select shift" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">Morning</SelectItem>
                              <SelectItem value="afternoon">Afternoon</SelectItem>
                              <SelectItem value="night">Night</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Type</label>
                          <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger className="bg-blue-100 h-7 text-sm">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="detailed">Detailed</SelectItem>
                              <SelectItem value="summary">Summary</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium">Select From List</label>
                          <Select>
                            <SelectTrigger className="bg-blue-100 h-7 text-sm">
                              <SelectValue placeholder="Select option" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {selectedReport === "oee" && (
                        <OEEReport
                          line={selectedLine}
                          startDate={startDate}
                          endDate={endDate}
                          shift={shift}
                          reportType={reportType}
                        />
                      )}
                      {selectedReport === "delay" && (
                        <DelayAnalysisReport
                          line={selectedLine}
                          startDate={startDate}
                          endDate={endDate}
                          shift={shift}
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Wrap the component with role check
export default withRoleCheck(ReportsPage, {
  feature: 'reports',
  requiredAccess: true
});
