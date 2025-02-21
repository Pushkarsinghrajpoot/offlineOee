"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus } from "lucide-react"

// Dropdown options
const machineWasteReasons = [
  "Material Jam",
  "Machine Breakdown",
  "Setup Issues",
  "Power Failure",
  "Quality Issues",
  "Other"
]

const dtTypes = [
  "Planned",
  "Unplanned",
  "Maintenance",
  "Quality Check"
]

const applicatorsByDtType = {
  "Planned": ["Production Manager", "Shift Supervisor", "Line Leader"],
  "Unplanned": ["Machine Operator", "Maintenance Team", "Quality Inspector"],
  "Maintenance": ["Maintenance Team", "External Technician"],
  "Quality Check": ["Quality Inspector", "Production Manager"]
}

const delayReasonsByDtType = {
  "Planned": ["Scheduled Maintenance", "Shift Change", "Break Time", "Team Meeting"],
  "Unplanned": ["Machine Breakdown", "Material Shortage", "Power Failure", "Emergency"],
  "Maintenance": ["Preventive Maintenance", "Repair Work", "Part Replacement", "Calibration"],
  "Quality Check": ["Product Testing", "Quality Audit", "Sample Inspection", "Parameter Adjustment"]
}

// Types
interface DowntimeEntry {
  dtStart: string
  dtEnd: string
  dtInMin: number
  typeOfDT: string
  applicator: string
  delayReason: string
  remarks: string
}

interface DelayEntry {
  startTime: string
  endTime: string
  scheduleTime: string
  shift: string
  tpc: number
  machineWaste: number
  finalWaste: number
  gpc: number
  wasteReason: string
  downtimes: DowntimeEntry[]
  isSaved?: boolean
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

const tableStyles = {
  input: "w-full h-10",
  select: "w-full h-10",
  cell: "min-w-[120px] p-2"
}

export default function DowntimeTracker() {
  const [selectedLine, setSelectedLine] = useState("Line 1")
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
  const [showDowntimeDialog, setShowDowntimeDialog] = useState(false)
  const [showDowntimeDetailsDialog, setShowDowntimeDetailsDialog] = useState(false)
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null)
  const [currentDowntimeIndex, setCurrentDowntimeIndex] = useState<number | null>(null)
  const [isEditingDowntime, setIsEditingDowntime] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newDowntime, setNewDowntime] = useState<DowntimeEntry>({
    dtStart: "",
    dtEnd: "",
    dtInMin: 0,
    typeOfDT: "",
    applicator: "",
    delayReason: "",
    remarks: ""
  })
  const [delayEntries, setDelayEntries] = useState<DelayEntry[]>([
    {
      startTime: "08:00",
      endTime: "08:30",
      scheduleTime: "08:00",
      shift: "A",
      tpc: 1000,
      machineWaste: 20,
      finalWaste: 10,
      gpc: 100,
      wasteReason: "Material Jam",
      downtimes: [],
      isSaved: false
    }
  ])
  const [newEntry, setNewEntry] = useState<DelayEntry>({
    startTime: "",
    endTime: "",
    scheduleTime: "",
    shift: "",
    tpc: 0,
    machineWaste: 0,
    finalWaste: 0,
    gpc: 0,
    wasteReason: "",
    downtimes: [],
    isSaved: false
  })

  const [metrics, setMetrics] = useState({
    diligenceScore: 90,
    delayCount: 0,
    wasteReasonCount: 2,
    speedLoss: 0,
    totalDT: 0,
    avgSpeed: 600,
    totalProduct: 165000,
    wasteProduct: 15000,
    goodProduct: 150000,
  })

  const [showReport, setShowReport] = useState(false)

  const [editMode, setEditMode] = useState<number | null>(null)

  const resetDowntimeForm = useCallback(() => {
    setNewDowntime({
      dtStart: "",
      dtEnd: "",
      dtInMin: 0,
      typeOfDT: "",
      applicator: "",
      delayReason: "",
      remarks: ""
    })
    setIsEditingDowntime(false)
    setCurrentDowntimeIndex(null)
    setIsSubmitting(false)
  }, [])

  const handleDowntimeChange = useCallback((field: keyof DowntimeEntry, value: string | number) => {
    setNewDowntime(prev => {
      const updated = { ...prev, [field]: value }
      
      if ((field === 'dtStart' || field === 'dtEnd') && updated.dtStart && updated.dtEnd) {
        const [startHours, startMinutes] = updated.dtStart.toString().split(':').map(Number)
        const [endHours, endMinutes] = updated.dtEnd.toString().split(':').map(Number)
        
        let startTotalMinutes = startHours * 60 + startMinutes
        let endTotalMinutes = endHours * 60 + endMinutes
        
        if (endTotalMinutes < startTotalMinutes) {
          endTotalMinutes += 24 * 60
        }
        
        updated.dtInMin = endTotalMinutes - startTotalMinutes
      }
      
      return updated
    })
  }, [])

  const closeDowntimeDialog = useCallback(() => {
    setShowDowntimeDialog(false)
    resetDowntimeForm()
  }, [resetDowntimeForm])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (currentEntryIndex === null || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Validate that all required fields are filled
      if (!newDowntime.dtStart || !newDowntime.dtEnd || !newDowntime.typeOfDT || !newDowntime.applicator || !newDowntime.delayReason) {
        alert('Please fill in all required fields.')
        setIsSubmitting(false)
        return
      }

      // Validate that end time is after start time
      const [startHours, startMinutes] = newDowntime.dtStart.split(':').map(Number)
      const [endHours, endMinutes] = newDowntime.dtEnd.split(':').map(Number)
      let startTotalMinutes = startHours * 60 + startMinutes
      let endTotalMinutes = endHours * 60 + endMinutes
      
      if (endTotalMinutes < startTotalMinutes) {
        endTotalMinutes += 24 * 60
      }
      
      if (endTotalMinutes <= startTotalMinutes) {
        alert('End time must be after start time.')
        setIsSubmitting(false)
        return
      }

      // Check for duplicates
      const isDuplicate = delayEntries[currentEntryIndex].downtimes.some(dt => 
        dt.dtStart === newDowntime.dtStart && 
        dt.dtEnd === newDowntime.dtEnd &&
        (!isEditingDowntime || (currentDowntimeIndex !== null && dt !== delayEntries[currentEntryIndex].downtimes[currentDowntimeIndex]))
      )

      if (isDuplicate) {
        alert('A downtime entry with these start and end times already exists.')
        setIsSubmitting(false)
        return
      }

      setDelayEntries(prev => {
        const updated = [...prev]
        const newEntry = { ...newDowntime }
        
        if (isEditingDowntime && currentDowntimeIndex !== null) {
          updated[currentEntryIndex] = {
            ...updated[currentEntryIndex],
            downtimes: updated[currentEntryIndex].downtimes.map((dt, idx) => 
              idx === currentDowntimeIndex ? newEntry : dt
            )
          }
        } else {
          updated[currentEntryIndex] = {
            ...updated[currentEntryIndex],
            downtimes: [...updated[currentEntryIndex].downtimes, newEntry]
          }
        }
        
        return updated
      })

      closeDowntimeDialog()
    } catch (error) {
      console.error('Error adding downtime:', error)
      alert('An error occurred while adding the downtime entry.')
    } finally {
      setIsSubmitting(false)
    }
  }, [currentEntryIndex, isSubmitting, newDowntime, isEditingDowntime, currentDowntimeIndex, delayEntries, closeDowntimeDialog])

  const openDowntimeDialog = useCallback((index: number) => {
    setCurrentEntryIndex(index)
    resetDowntimeForm()
    setShowDowntimeDialog(true)
  }, [resetDowntimeForm])

  const editDowntime = useCallback((entryIndex: number, downtimeIndex: number) => {
    setCurrentEntryIndex(entryIndex)
    setCurrentDowntimeIndex(downtimeIndex)
    setIsEditingDowntime(true)
    setNewDowntime({ ...delayEntries[entryIndex].downtimes[downtimeIndex] })
    setShowDowntimeDialog(true)
  }, [delayEntries])

  const handleUpdate = () => {
    // Calculate metrics based on current delay entries
    const newMetrics = {
      delayCount: delayEntries.length,
      wasteReasonCount: new Set(delayEntries.map(entry => entry.wasteReason)).size,
      totalDT: delayEntries.reduce((sum, entry) => sum + entry.downtimes.reduce((sum, dt) => sum + dt.dtInMin, 0), 0),
      totalProduct: delayEntries.reduce((sum, entry) => sum + entry.tpc, 0),
      wasteProduct: delayEntries.reduce((sum, entry) => sum + entry.machineWaste + entry.finalWaste, 0),
      goodProduct: delayEntries.reduce((sum, entry) => sum + (entry.tpc - entry.machineWaste - entry.finalWaste), 0),
      avgSpeed: delayEntries.length > 0 
        ? Math.round(delayEntries.reduce((sum, entry) => sum + entry.tpc, 0) / delayEntries.length) 
        : 0,
      speedLoss: delayEntries.length > 0 
        ? Math.round((delayEntries.reduce((sum, entry) => sum + entry.downtimes.reduce((sum, dt) => sum + dt.dtInMin, 0), 0) / (8 * 60)) * 100) 
        : 0,
      diligenceScore: Math.round(Math.random() * 20 + 80) // Placeholder calculation
    }
    setMetrics(newMetrics)
  }

  const handleAddNewEntry = () => {
    const newEntry: DelayEntry = {
      startTime: "",
      endTime: "",
      scheduleTime: "",
      shift: "",
      tpc: 0,
      machineWaste: 0,
      finalWaste: 0,
      gpc: 0,
      wasteReason: "",
      downtimes: [],
      isSaved: false
    }
    setDelayEntries([...delayEntries, newEntry])
    setEditMode(delayEntries.length) // Set edit mode to the new entry
  }

  const getShiftFromTime = (time: string) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 14) return "A";
    if (hour >= 14 && hour < 22) return "B";
    return "C";
  };

  const handleEntryChange = (index: number, field: keyof DelayEntry, value: any) => {
    const updatedEntries = [...delayEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    // Automatically update shift when startTime changes
    if (field === 'startTime' && value) {
      updatedEntries[index].shift = getShiftFromTime(value);
    }

    setDelayEntries(updatedEntries);
  }

  const handleSaveEntry = (index: number) => {
    const updatedEntries = [...delayEntries]
    updatedEntries[index] = {
      ...updatedEntries[index],
      isSaved: true
    }
    setDelayEntries(updatedEntries)
    setEditMode(null)
  }

  const handleEditEntry = (index: number) => {
    setEditMode(index)
  }

  const handleDeleteEntry = (index: number) => {
    const updatedEntries = delayEntries.filter((_, i) => i !== index)
    setDelayEntries(updatedEntries)
  }

  const isEntryValid = (entry: DelayEntry) => {
    return (
      entry.startTime !== "" &&
      entry.endTime !== "" &&
      entry.scheduleTime !== "" &&
      entry.shift !== "" &&
      entry.tpc > 0 &&
      entry.machineWaste >= 0 &&
      entry.finalWaste >= 0 &&
      entry.gpc > 0 &&
      entry.wasteReason !== "" &&
      entry.downtimes.length > 0
    );
  };

  const deleteDowntime = (entryIndex: number, downtimeIndex: number) => {
    setDelayEntries(prev => {
      const updated = [...prev]
      updated[entryIndex].downtimes = updated[entryIndex].downtimes.filter((_, index) => index !== downtimeIndex)
      return updated
    })
  }

  const openDowntimeDetails = (index: number) => {
    setCurrentEntryIndex(index)
    setShowDowntimeDetailsDialog(true)
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
          <Button variant="default" className="bg-gray-800 hover:bg-gray-900" onClick={handleUpdate}>
            Update
          </Button>
          <Button variant="default" className="bg-blue-500 hover:bg-blue-600" onClick={() => setShowReport(true)}>
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
              onClick={() => {
                setDelayEntries([
                  {
                    startTime: "",
                    endTime: "",
                    scheduleTime: "",
                    shift: "",
                    tpc: 0,
                    machineWaste: 0,
                    finalWaste: 0,
                    gpc: 0,
                    wasteReason: "",
                    downtimes: [],
                    isSaved: false
                  },
                  ...delayEntries
                ]);
              }}
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
                  <TableHead>Shift</TableHead>
                  <TableHead>TPC</TableHead>
                  <TableHead>Machine Waste</TableHead>
                  <TableHead>Final Waste</TableHead>
                  <TableHead>GPC</TableHead>
                  <TableHead>Waste Reason</TableHead>
                  <TableHead>Downtimes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {delayEntries.map((entry, index) => (
                  <TableRow key={index} className="h-16">
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="time"
                        value={entry.startTime}
                        onChange={(e) => handleEntryChange(index, 'startTime', e.target.value)}
                        className={tableStyles.input}
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="time"
                        value={entry.endTime}
                        onChange={(e) => handleEntryChange(index, 'endTime', e.target.value)}
                        className={tableStyles.input}
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="time"
                        value={entry.scheduleTime}
                        onChange={(e) => handleEntryChange(index, 'scheduleTime', e.target.value)}
                        className={tableStyles.input}
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Select
                        value={entry.shift}
                        onValueChange={(value) => handleEntryChange(index, 'shift', value)}
                        className={tableStyles.select}
                        disabled={entry.isSaved && editMode !== index}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select shift" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="B">B</SelectItem>
                          <SelectItem value="C">C</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="number"
                        value={entry.tpc?.toString() || ''}
                        onChange={(e) => handleEntryChange(index, 'tpc', Number(e.target.value))}
                        className={tableStyles.input}
                        placeholder="Enter TPC"
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="number"
                        value={entry.machineWaste?.toString() || ''}
                        onChange={(e) => handleEntryChange(index, 'machineWaste', Number(e.target.value))}
                        className={tableStyles.input}
                        placeholder="Enter waste"
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="number"
                        value={entry.finalWaste?.toString() || ''}
                        onChange={(e) => handleEntryChange(index, 'finalWaste', Number(e.target.value))}
                        className={tableStyles.input}
                        placeholder="Enter waste"
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Input
                        type="number"
                        value={entry.gpc?.toString() || ''}
                        onChange={(e) => handleEntryChange(index, 'gpc', Number(e.target.value))}
                        className={tableStyles.input}
                        placeholder="Enter GPC"
                        disabled={entry.isSaved && editMode !== index}
                      />
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <Select
                        value={entry.wasteReason}
                        onValueChange={(value) => handleEntryChange(index, 'wasteReason', value)}
                        className={tableStyles.select}
                        disabled={entry.isSaved && editMode !== index}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {machineWasteReasons.map((reason) => (
                            <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={tableStyles.cell}>
                      <div className="flex flex-col gap-1">
                        {entry.downtimes.map((dt, dtIndex) => (
                          <div key={dtIndex} className="text-sm flex items-center gap-2 p-1 hover:bg-gray-100 rounded">
                            <button 
                              onClick={() => editDowntime(index, dtIndex)}
                              className="flex-1 text-left"
                            >
                              {dt.dtStart}-{dt.dtEnd} ({dt.typeOfDT})
                            </button>
                            <button
                              onClick={() => deleteDowntime(index, dtIndex)}
                              className="text-red-500 hover:text-red-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDowntimeDialog(index)}
                            disabled={entry.isSaved && editMode !== index}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add Downtime
                          </Button>
                          {entry.downtimes.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDowntimeDetails(index)}
                            >
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="flex gap-2 min-w-[200px]">
                      {!entry.isSaved ? (
                        // New entry - show Save and Delete
                        <>
                          <Button
                            onClick={() => handleSaveEntry(index)}
                            className={`${isEntryValid(entry) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={!isEntryValid(entry)}
                            title={!isEntryValid(entry) ? "Please fill all required fields" : ""}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </>
                      ) : editMode === index ? (
                        // Editing saved entry - show Save and Delete
                        <>
                          <Button
                            onClick={() => handleSaveEntry(index)}
                            className={`${isEntryValid(entry) ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
                            disabled={!isEntryValid(entry)}
                            title={!isEntryValid(entry) ? "Please fill all required fields" : ""}
                          >
                            Save
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        // Saved entry (not in edit mode) - show Edit and Delete
                        <>
                          <Button
                            onClick={() => handleEditEntry(index)}
                            className="bg-blue-500 hover:bg-blue-600"
                          >
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog 
        open={showDowntimeDialog} 
        onOpenChange={(open) => {
          if (!open && !isSubmitting) {
            closeDowntimeDialog()
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{isEditingDowntime ? 'Edit Downtime Entry' : 'Add Downtime Entry'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Start Time</label>
                <Input
                  type="time"
                  value={newDowntime.dtStart}
                  onChange={(e) => handleDowntimeChange('dtStart', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label>End Time</label>
                <Input
                  type="time"
                  value={newDowntime.dtEnd}
                  onChange={(e) => handleDowntimeChange('dtEnd', e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <label>Duration (minutes)</label>
                <Input
                  type="number"
                  value={newDowntime.dtInMin}
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <label>Type of DT</label>
                <Select
                  value={newDowntime.typeOfDT}
                  onValueChange={(value) => handleDowntimeChange('typeOfDT', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dtTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Applicator</label>
                <Select
                  value={newDowntime.applicator}
                  onValueChange={(value) => handleDowntimeChange('applicator', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select applicator" />
                  </SelectTrigger>
                  <SelectContent>
                    {newDowntime.typeOfDT && applicatorsByDtType[newDowntime.typeOfDT]?.map((applicator) => (
                      <SelectItem key={applicator} value={applicator}>
                        {applicator}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label>Delay Reason</label>
                <Select
                  value={newDowntime.delayReason}
                  onValueChange={(value) => handleDowntimeChange('delayReason', value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reason" />
                  </SelectTrigger>
                  <SelectContent>
                    {newDowntime.typeOfDT && delayReasonsByDtType[newDowntime.typeOfDT]?.map((reason) => (
                      <SelectItem key={reason} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <label>Remarks</label>
                <Input
                  value={newDowntime.remarks}
                  onChange={(e) => handleDowntimeChange('remarks', e.target.value)}
                  placeholder="Enter remarks"
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isEditingDowntime ? 'Update' : 'Add'} Downtime
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showDowntimeDetailsDialog} onOpenChange={setShowDowntimeDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Downtime Details for Shift</DialogTitle>
          </DialogHeader>
          {currentEntryIndex !== null && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">Shift Time:</p>
                  <p>{delayEntries[currentEntryIndex].startTime} - {delayEntries[currentEntryIndex].endTime}</p>
                </div>
                <div>
                  <p className="font-semibold">Total Downtimes:</p>
                  <p>{delayEntries[currentEntryIndex].downtimes.length}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Downtime Entries</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration (min)</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Applicator</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Remarks</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {delayEntries[currentEntryIndex].downtimes.map((dt, dtIndex) => (
                      <TableRow key={dtIndex}>
                        <TableCell>{dt.dtStart}</TableCell>
                        <TableCell>{dt.dtEnd}</TableCell>
                        <TableCell>{dt.dtInMin}</TableCell>
                        <TableCell>{dt.typeOfDT}</TableCell>
                        <TableCell>{dt.applicator}</TableCell>
                        <TableCell>{dt.delayReason}</TableCell>
                        <TableCell>{dt.remarks}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                editDowntime(currentEntryIndex, dtIndex)
                                setShowDowntimeDetailsDialog(false)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteDowntime(currentEntryIndex, dtIndex)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="mt-4">
                  <h3 className="font-semibold text-lg mb-2">Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold">Total Downtime Duration:</p>
                      <p>{delayEntries[currentEntryIndex].downtimes.reduce((sum, dt) => sum + dt.dtInMin, 0)} minutes</p>
                    </div>
                    <div>
                      <p className="font-semibold">Most Common Type:</p>
                      <p>{
                        Object.entries(
                          delayEntries[currentEntryIndex].downtimes.reduce((acc, dt) => {
                            acc[dt.typeOfDT] = (acc[dt.typeOfDT] || 0) + 1
                            return acc
                          }, {} as Record<string, number>)
                        ).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A'
                      }</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReport} onOpenChange={setShowReport}>
        <DialogContent className="sm:max-w-[80vw] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Downtime Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Line Details</h3>
                  <div className="space-y-2">
                    <p>Line: {lineDetails.line}</p>
                    <p>Shift: {lineDetails.shift}</p>
                    <p>Production Order: {lineDetails.productionOrder}</p>
                    <p>Production Code: {lineDetails.productionCode}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-2">Personnel</h3>
                  <div className="space-y-2">
                    <p>Main Operator: {lineDetails.mainOperator}</p>
                    <p>Assistant Operator: {lineDetails.assistantOperator}</p>
                    <p>Shift Incharge: {lineDetails.shiftIncharge}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium">Diligence Score</p>
                    <p className="text-2xl">{metrics.diligenceScore}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Downtime</p>
                    <p className="text-2xl">{metrics.totalDT} min</p>
                  </div>
                  <div>
                    <p className="font-medium">Speed Loss</p>
                    <p className="text-2xl">{metrics.speedLoss}%</p>
                  </div>
                  <div>
                    <p className="font-medium">Total Product</p>
                    <p className="text-2xl">{metrics.totalProduct}</p>
                  </div>
                  <div>
                    <p className="font-medium">Good Product</p>
                    <p className="text-2xl">{metrics.goodProduct}</p>
                  </div>
                  <div>
                    <p className="font-medium">Waste Product</p>
                    <p className="text-2xl">{metrics.wasteProduct}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Delay Entries Summary</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type of DT</TableHead>
                      <TableHead>Total Duration (min)</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Waste</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(
                      delayEntries.reduce((acc, entry) => {
                        const key = entry.typeOfDT || 'Unspecified'
                        if (!acc[key]) {
                          acc[key] = { duration: 0, count: 0, waste: 0 }
                        }
                        acc[key].duration += entry.downtimes.reduce((sum, dt) => sum + dt.dtInMin, 0)
                        acc[key].count += 1
                        acc[key].waste += entry.machineWaste + entry.finalWaste
                        return acc
                      }, {} as Record<string, { duration: number; count: number; waste: number }>)
                    ).map(([type, data]) => (
                      <TableRow key={type}>
                        <TableCell>{type}</TableCell>
                        <TableCell>{data.duration}</TableCell>
                        <TableCell>{data.count}</TableCell>
                        <TableCell>{data.waste}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
