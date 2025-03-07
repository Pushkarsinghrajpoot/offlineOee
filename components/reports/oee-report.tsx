"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "@/components/ui/chart"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const waterfallData = [
  { name: "Total Time", value: 40.0 },
  { name: "Unscheduled", value: 7.0 },
  { name: "Available Time", value: 33.0 },
  { name: "Breakdown", value: 5.8 },
  { name: "External Cause", value: 3.3 },
  { name: "Preventive Maintenance", value: 0.0 },
  { name: "Changeovers", value: 0.0 },
  { name: "Operating Time", value: 23.9 },
  { name: "Minor Stops", value: 0.0 },
  { name: "Speed Loss", value: 5.2 },
  { name: "Unknown", value: 0.0 },
  { name: "Running Time", value: 18.7 },
  { name: "Waste", value: 6.5 },
  { name: "Effective Time", value: 12.1 },
]

export function OEEReport() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  return (
    <div className="space-y-4">
      {/* <div className="text-sm text-muted-foreground">
        PixwingAi/Kimberly Clark Lever, Pune./Diaper//Zuko2
        <br />
        01/Feb/2011 11:15 PM through 03/Feb/2011 3:15 PM
        <br />
        Shift: - all -
        <br />
        Hours: - all -
      </div> */}
      <div className="h-[calc(100vh-20rem)] w-full" onClick={() => setIsDialogOpen(true)}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-sm text-muted-foreground text-right">
        OEE1 = 30.3%
        <br />
        OEE2 = 36.7%
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[90vw] w-[800px] h-[600px]">
          <DialogHeader>
            <DialogTitle>OEE Waterfall Chart</DialogTitle>
          </DialogHeader>
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={waterfallData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} interval={0} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

