"use client"

import { useRef } from "react"
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface ChartDialogProps {
  title: string
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  data: any
}

export function ChartDialog({ title, isOpen, onClose, children, data }: ChartDialogProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const handlePrint = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current)
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF()
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 100)
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}.pdf`)
    }
  }

  const handleExportToExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet([data])
    XLSX.utils.book_append_sheet(wb, ws, title)
    XLSX.writeFile(wb, `${title.toLowerCase().replace(/\s+/g, '_')}.xlsx`)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div ref={chartRef} className="p-6">
          <div className="transform scale-150 origin-top">
            {children}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handlePrint} className="bg-purple-500 hover:bg-purple-600">
            Print Chart
          </Button>
          <Button onClick={handleExportToExcel} className="bg-green-500 hover:bg-green-600">
            Export to Excel
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
