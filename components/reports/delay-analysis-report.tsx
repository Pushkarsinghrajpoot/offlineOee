"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const delayData = [
  {
    srNo: 1,
    application: "Machine Operator",
    delayReason: "Material Jam",
    totalDT: 120,
    frequency: 5,
    oeeLoss: 2.5,
  },
  {
    srNo: 2,
    application: "Maintenance",
    delayReason: "Preventive Maintenance",
    totalDT: 240,
    frequency: 2,
    oeeLoss: 5.0,
  },
  {
    srNo: 3,
    application: "Quality",
    delayReason: "Quality Check",
    totalDT: 90,
    frequency: 3,
    oeeLoss: 1.8,
  },
]

const productDowntimeData = [
  { name: "Product Type 1", value: 50 },
  { name: "Product Type 2", value: 45 },
  { name: "Product Type 3", value: 40 },
  { name: "Product Type 4", value: 30 },
  { name: "Product Type 5", value: 25 },
  { name: "Product Type 6", value: 20 },
  { name: "Product Type 7", value: 15 },
  { name: "Product Type 8", value: 10 },
  { name: "Product Type 9", value: 10 },
  { name: "Product Type 10", value: 5 },
]

const downtimeDistributionData = [
  { name: "Maintenance", value: 80, color: "#f59e0b" },
  { name: "Repairs", value: 70, color: "#3b82f6" },
  { name: "Setup", value: 50, color: "#ec4899" },
  { name: "Adjustment", value: 30, color: "#06b6d4" },
  { name: "Unexpected breakdown", value: 20, color: "#ef4444" },
]

export function DelayAnalysisReport() {
  const [isTopDowntimesDialogOpen, setIsTopDowntimesDialogOpen] = useState(false)
  const [isDowntimeDistributionDialogOpen, setIsDowntimeDistributionDialogOpen] = useState(false)
  return (
    <div className="space-y-8">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2">Sr. No</TableHead>
              <TableHead className="py-2">Application</TableHead>
              <TableHead className="py-2">Delay Reason</TableHead>
              <TableHead className="py-2">Total DT</TableHead>
              <TableHead className="py-2">Frequency</TableHead>
              <TableHead className="py-2">% OEE Loss</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {delayData.map((row) => (
              <TableRow key={row.srNo}>
                <TableCell className="py-1">{row.srNo}</TableCell>
                <TableCell className="py-1">{row.application}</TableCell>
                <TableCell className="py-1">{row.delayReason}</TableCell>
                <TableCell className="py-1">{row.totalDT}</TableCell>
                <TableCell className="py-1">{row.frequency}</TableCell>
                <TableCell className="py-1">{row.oeeLoss}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Top 10 Downtimes</h3>
          <div className="h-[calc(50vh-10rem)]" onClick={() => setIsTopDowntimesDialogOpen(true)}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productDowntimeData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-semibold">Downtime Distribution</h3>
          <div
            className="h-[calc(50vh-10rem)] flex items-center justify-center"
            onClick={() => setIsDowntimeDistributionDialogOpen(true)}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={downtimeDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius="60%"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}h`}
                >
                  {downtimeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <Dialog open={isTopDowntimesDialogOpen} onOpenChange={setIsTopDowntimesDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>Top 10 Downtimes</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productDowntimeData}
                layout="vertical"
                margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDowntimeDistributionDialogOpen} onOpenChange={setIsDowntimeDistributionDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>Downtime Distribution</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={downtimeDistributionData}
                  cx="50%"
                  cy="50%"
                  outerRadius="60%"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}h`}
                >
                  {downtimeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

