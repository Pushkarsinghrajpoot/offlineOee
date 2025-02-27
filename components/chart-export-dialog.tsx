"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Activity } from "lucide-react"
import { exportChartToPDF, exportChartToExcel } from "@/utils/chart-export"

interface ChartExportDialogProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  data: any[]
  clientName?: string
  canExport?: boolean
}

/**
 * A reusable dialog component for displaying and exporting charts
 * with consistent company branding, disclaimer, and timestamp
 */
export function ChartExportDialog({
  title,
  isOpen,
  onClose,
  children,
  data,
  clientName = "PixWingAi Client",
  canExport = true
}: ChartExportDialogProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current) {
      exportChartToPDF({
        title,
        data,
        chartRef,
        clientName
      })
    }
  }

  const handleExportToExcel = () => {
    exportChartToExcel({
      title,
      data,
      chartRef,
      clientName
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[900px] h-[700px] flex flex-col bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-0">
        <DialogHeader className="border-b pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <DialogTitle className="text-xl font-semibold">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div ref={chartRef} className="flex-1 p-8">
          {children}
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
              onClick={onClose}
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
