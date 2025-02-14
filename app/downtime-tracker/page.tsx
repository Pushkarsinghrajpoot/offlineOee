"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

// Types
interface DelayEntry {
  startTime: string
  endTime: string
  scheduleTime: string
  tpc: number
  gpc: number
  waste: number
  wasteReason: string
  count: number
  dtStart: string
  dtEnd: string
  dtInMin: number
  typeOfDT: string
  applicator: string
  delayReason: string
  remarks: string
}

interface LineDetails {
  line: string
  shift: string
  productionOrder: string
  productionCode: string
  productDescription: string
  mainOperator: string
  assistantOperator: string
  shiftIncharge: string
}

export default function DowntimeTracker() {
  const [selectedLine, setSelectedLine] = useState("Line 1")
  const [isNewEntryDialogOpen, setIsNewEntryDialogOpen] = useState(false)
  const [lineDetails, setLineDetails] = useState<LineDetails>({
    line: "Line 1",
    shift: "",
    productionOrder: "",
    productionCode: "",
    productDescription: "",
    mainOperator: "",
    assistantOperator: "",
    shiftIncharge: "",
  })
  const [delayEntries, setDelayEntries] = useState<DelayEntry[]>([
    {
      startTime: "08:00",
      endTime: "08:30",
      scheduleTime: "08:00",
      tpc: 1000,
      gpc: 950,
      waste: 50,
      wasteReason: "Material Jam",
      count: 1,
      dtStart: "08:15",
      dtEnd: "08:25",
      dtInMin: 10,
      typeOfDT: "Unplanned",
      applicator: "Machine Operator",
      delayReason: "Material Jam in Feeder",
      remarks: "Cleared jam and resumed production",
    },
    {
      startTime: "09:45",
      endTime: "10:15",
      scheduleTime: "09:45",
      tpc: 1200,
      gpc: 1150,
      waste: 50,
      wasteReason: "Quality Issue",
      count: 1,
      dtStart: "10:00",
      dtEnd: "10:10",
      dtInMin: 10,
      typeOfDT: "Planned",
      applicator: "Quality Inspector",
      delayReason: "Quality Check",
      remarks: "Adjusted machine settings",
    },
  ])
  const [newEntry, setNewEntry] = useState<DelayEntry>({
    startTime: "",
    endTime: "",
    scheduleTime: "",
    tpc: 0,
    gpc: 0,
    waste: 0,
    wasteReason: "",
    count: 0,
    dtStart: "",
    dtEnd: "",
    dtInMin: 0,
    typeOfDT: "",
    applicator: "",
    delayReason: "",
    remarks: "",
  })

  const metrics = {
    diligenceScore: 90,
    delayCount: 0,
    wasteReasonCount: 2,
    speedLoss: 0,
    totalDT: 0,
    avgSpeed: 600,
    totalProduct: 165000,
    wasteProduct: 15000,
    goodProduct: 150000,
  }

  const handleAddNewEntry = () => {
    setDelayEntries([...delayEntries, newEntry])
    setIsNewEntryDialogOpen(false)
    setNewEntry({
      startTime: "",
      endTime: "",
      scheduleTime: "",
      tpc: 0,
      gpc: 0,
      waste: 0,
      wasteReason: "",
      count: 0,
      dtStart: "",
      dtEnd: "",
      dtInMin: 0,
      typeOfDT: "",
      applicator: "",
      delayReason: "",
      remarks: "",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-medium">Line</span>
            <Select value={selectedLine} onValueChange={setSelectedLine}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Line 1">Line 1</SelectItem>
                <SelectItem value="Line 2">Line 2</SelectItem>
                <SelectItem value="Line 3">Line 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="default" className="bg-green-500 hover:bg-green-600">
            <Plus className="mr-2 h-4 w-4" /> Add New Line
          </Button>
          <Button variant="default" className="bg-gray-800 hover:bg-gray-900">
            Update
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600">
            View Report
          </Button>
        </div>
      </div>

      {/* Line Details */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Line Details</h2>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span>Date</span>
                <Input type="date" className="w-40" />
              </div>
              <div className="flex items-center gap-2">
                <span>Shift Start Time</span>
                <Input type="time" className="w-32" />
              </div>
              <div className="flex items-center gap-2">
                <span>Shift End Time</span>
                <Input type="time" className="w-32" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-4">
            <Input placeholder="Line" value={lineDetails.line} disabled />
            <Input
              placeholder="Shift"
              value={lineDetails.shift}
              onChange={(e) => setLineDetails({ ...lineDetails, shift: e.target.value })}
            />
            <Input
              placeholder="Production Order"
              value={lineDetails.productionOrder}
              onChange={(e) => setLineDetails({ ...lineDetails, productionOrder: e.target.value })}
            />
            <Input
              placeholder="Production Code"
              value={lineDetails.productionCode}
              onChange={(e) => setLineDetails({ ...lineDetails, productionCode: e.target.value })}
            />
            <Input
              placeholder="Product Description"
              value={lineDetails.productDescription}
              onChange={(e) => setLineDetails({ ...lineDetails, productDescription: e.target.value })}
            />
            <Input
              placeholder="Main Operator"
              value={lineDetails.mainOperator}
              onChange={(e) => setLineDetails({ ...lineDetails, mainOperator: e.target.value })}
            />
            <Input
              placeholder="Assistant Operator"
              value={lineDetails.assistantOperator}
              onChange={(e) => setLineDetails({ ...lineDetails, assistantOperator: e.target.value })}
            />
            <Input
              placeholder="Shift Incharge"
              value={lineDetails.shiftIncharge}
              onChange={(e) => setLineDetails({ ...lineDetails, shiftIncharge: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="mb-6 grid grid-cols-9 gap-4">
        <Card className="bg-green-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.diligenceScore}%</div>
            <div className="text-sm">Diligence Score</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.delayCount}</div>
            <div className="text-sm">Delay Count</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.wasteReasonCount}</div>
            <div className="text-sm">Waste Reason Count</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.speedLoss}%</div>
            <div className="text-sm">Speed Loss</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.totalDT} min</div>
            <div className="text-sm">Total DT</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.avgSpeed}</div>
            <div className="text-sm">Avg Speed</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.totalProduct}</div>
            <div className="text-sm">Total Product</div>
          </CardContent>
        </Card>
        <Card className="bg-red-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.wasteProduct}</div>
            <div className="text-sm">Waste Product</div>
          </CardContent>
        </Card>
        <Card className="bg-green-500 text-white">
          <CardContent className="p-6">
            <div className="text-3xl font-bold">{metrics.goodProduct}</div>
            <div className="text-sm">Good Product</div>
          </CardContent>
        </Card>
      </div>

      {/* Delay Entries */}
      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Delay Entries</h2>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600"
              onClick={() => setIsNewEntryDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Delay Entry
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Schedule Time</TableHead>
                  <TableHead>TPC</TableHead>
                  <TableHead>GPC</TableHead>
                  <TableHead>Waste</TableHead>
                  <TableHead>Waste Reason</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>DT Start</TableHead>
                  <TableHead>DT End</TableHead>
                  <TableHead>DT in Min</TableHead>
                  <TableHead>Type of DT</TableHead>
                  <TableHead>Applicator</TableHead>
                  <TableHead>Delay Reason</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayEntries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell>{entry.startTime}</TableCell>
                    <TableCell>{entry.endTime}</TableCell>
                    <TableCell>{entry.scheduleTime}</TableCell>
                    <TableCell>{entry.tpc}</TableCell>
                    <TableCell>{entry.gpc}</TableCell>
                    <TableCell>{entry.waste}</TableCell>
                    <TableCell>{entry.wasteReason}</TableCell>
                    <TableCell>{entry.count}</TableCell>
                    <TableCell>{entry.dtStart}</TableCell>
                    <TableCell>{entry.dtEnd}</TableCell>
                    <TableCell>{entry.dtInMin}</TableCell>
                    <TableCell>{entry.typeOfDT}</TableCell>
                    <TableCell>{entry.applicator}</TableCell>
                    <TableCell>{entry.delayReason}</TableCell>
                    <TableCell>{entry.remarks}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* New Entry Dialog */}
      <Dialog open={isNewEntryDialogOpen} onOpenChange={setIsNewEntryDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Delay Entry</DialogTitle>
          </DialogHeader>
          <div className="flex-grow overflow-y-auto pr-6">
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span>Start Time</span>
                  <Input
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span>End Time</span>
                  <Input
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span>Schedule Time</span>
                <Input
                  type="time"
                  value={newEntry.scheduleTime}
                  onChange={(e) => setNewEntry({ ...newEntry, scheduleTime: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-2">
                  <span>TPC</span>
                  <Input
                    type="number"
                    value={newEntry.tpc}
                    onChange={(e) => setNewEntry({ ...newEntry, tpc: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span>GPC</span>
                  <Input
                    type="number"
                    value={newEntry.gpc}
                    onChange={(e) => setNewEntry({ ...newEntry, gpc: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span>Waste</span>
                  <Input
                    type="number"
                    value={newEntry.waste}
                    onChange={(e) => setNewEntry({ ...newEntry, waste: Number.parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span>Waste Reason</span>
                <Input
                  value={newEntry.wasteReason}
                  onChange={(e) => setNewEntry({ ...newEntry, wasteReason: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span>Count</span>
                <Input
                  type="number"
                  value={newEntry.count}
                  onChange={(e) => setNewEntry({ ...newEntry, count: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <span>DT Start</span>
                  <Input
                    type="time"
                    value={newEntry.dtStart}
                    onChange={(e) => setNewEntry({ ...newEntry, dtStart: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <span>DT End</span>
                  <Input
                    type="time"
                    value={newEntry.dtEnd}
                    onChange={(e) => setNewEntry({ ...newEntry, dtEnd: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span>DT in Min</span>
                <Input
                  type="number"
                  value={newEntry.dtInMin}
                  onChange={(e) => setNewEntry({ ...newEntry, dtInMin: Number.parseInt(e.target.value) })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span>Type of DT</span>
                <Input
                  value={newEntry.typeOfDT}
                  onChange={(e) => setNewEntry({ ...newEntry, typeOfDT: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span>Applicator</span>
                <Input
                  value={newEntry.applicator}
                  onChange={(e) => setNewEntry({ ...newEntry, applicator: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span>Delay Reason</span>
                <Input
                  value={newEntry.delayReason}
                  onChange={(e) => setNewEntry({ ...newEntry, delayReason: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <span>Remarks</span>
                <Input
                  value={newEntry.remarks}
                  onChange={(e) => setNewEntry({ ...newEntry, remarks: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsNewEntryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewEntry}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

