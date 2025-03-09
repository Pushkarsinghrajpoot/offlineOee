"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { withRoleCheck } from "@/components/auth/with-role-check"
import { motion } from "framer-motion"

import DatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import { format } from "date-fns"
import { Plus, Clock, FileText, AlertTriangle, CheckCircle2, Activity, Settings2, Users, BarChart3, Calendar, Clock3, Save, Trash2, Pencil, Eye, X } from "lucide-react"

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
  "Quality Check",
  "Plant Shutdown"
]

const applicatorsByDtType = {
  "Planned": ["Production Manager", "Shift Supervisor", "Line Leader"],
  "Unplanned": ["Machine Operator", "Maintenance Team", "Quality Inspector"],
  "Maintenance": ["Maintenance Team", "External Technician"],
  "Quality Check": ["Quality Inspector", "Production Manager"],
  "Plant Shutdown": ["Production Manager", "Plant Manager", "Maintenance Manager"]
}

const delayReasonsByDtType = {
  "Planned": ["Scheduled Maintenance", "Shift Change", "Break Time", "Team Meeting"],
  "Unplanned": ["Machine Breakdown", "Material Shortage", "Power Failure", "Emergency"],
  "Maintenance": ["Preventive Maintenance", "Repair Work", "Part Replacement", "Calibration"],
  "Quality Check": ["Product Testing", "Quality Audit", "Sample Inspection", "Parameter Adjustment"],
  "Plant Shutdown": ["Power Outage", "Facility Maintenance", "Holiday", "Emergency Shutdown"]
}

// Operator options
const operators = [
  "John Smith",
  "Maria Garcia",
  "David Johnson",
  "Sarah Lee",
  "Michael Brown",
  "Lisa Chen",
  "Robert Wilson",
  "Emily Davis"
]

// RM options
const rmOptions = [
  "RM-101: Plastic Granules",
  "RM-102: Aluminum Foil",
  "RM-103: Cardboard",
  "RM-104: Glass Beads",
  "RM-105: Steel Wire",
  "RM-106: Copper Strips",
  "RM-107: Rubber Compound",
  "RM-108: Textile Fiber"
]

// Shift options
const shifts = ["A", "B", "C"]

const tableStyles = {
  input: "w-full h-10 rounded-lg border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200",
  select: "w-full h-10",
  cell: "min-w-[120px] p-2"
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const MetricCard = ({ icon: Icon, title, value, color }) => (
  <motion.div
    variants={cardVariants}
    initial="hidden"
    animate="visible"
    transition={{ duration: 0.3 }}
    className={`${color} rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300`}
  >
    <CardContent className="p-6">
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-white/10 rounded-lg">
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <div className="text-3xl font-bold text-white">{value}</div>
          <div className="text-sm text-white/80">{title}</div>
        </div>
      </div>
    </CardContent>
  </motion.div>
)

export default function DowntimeTracker() {
  // Add CSS variables for sticky header heights
  useEffect(() => {
    // Function to update CSS variables based on actual element heights
    const updateHeaderHeights = () => {
      const lineDetailsCard = document.querySelector('.line-details-card');
      const metricsCard = document.querySelector('.metrics-card');
      
      if (lineDetailsCard) {
        const lineDetailsHeight = lineDetailsCard.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--header-height', `${lineDetailsHeight}px`);
      }
      
      if (metricsCard) {
        const metricsHeight = metricsCard.getBoundingClientRect().height;
        document.documentElement.style.setProperty('--metrics-height', `${metricsHeight}px`);
      }
    };
    
    // Set initial fallback values
    document.documentElement.style.setProperty('--header-height', '150px');
    document.documentElement.style.setProperty('--metrics-height', '120px');
    
    // Delay the initial measurement to ensure components are fully rendered
    const initialTimer = setTimeout(() => {
      updateHeaderHeights();
    }, 100);
    
    // Update on window resize
    window.addEventListener('resize', updateHeaderHeights);
    
    // Update when content might change
    const observer = new MutationObserver(updateHeaderHeights);
    const lineDetailsCard = document.querySelector('.line-details-card');
    const metricsCard = document.querySelector('.metrics-card');
    
    if (lineDetailsCard && metricsCard) {
      observer.observe(lineDetailsCard, { attributes: true, childList: true, subtree: true });
      observer.observe(metricsCard, { attributes: true, childList: true, subtree: true });
    }
    
    return () => {
      // Clean up
      clearTimeout(initialTimer);
      window.removeEventListener('resize', updateHeaderHeights);
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-height');
      document.documentElement.style.removeProperty('--metrics-height');
    };
  }, []);

  const [selectedLine, setSelectedLine] = useState("Line 1")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [shiftStartTime, setShiftStartTime] = useState(new Date())
  const [shiftEndTime, setShiftEndTime] = useState(new Date())
  const [selectedShift, setSelectedShift] = useState("A")
  const [selectedOperator, setSelectedOperator] = useState(operators[0])
  const [lineDetails, setLineDetails] = useState({
    line: "Line 1",
    shift: "",
    productionOrder: "",
    productionCode: "",
    productDescription: "",
    mainOperator: "",
    assistantOperator: "",
    shiftIncharge: "",
    rm1: "",
    rm2: "",
  })
  const [showDowntimeDialog, setShowDowntimeDialog] = useState(false)
  const [showDowntimeDetailsDialog, setShowDowntimeDetailsDialog] = useState(false)
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null)
  const [currentDowntimeIndex, setCurrentDowntimeIndex] = useState<number | null>(null)
  const [isEditingDowntime, setIsEditingDowntime] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newDowntime, setNewDowntime] = useState({
    dtStart: "",
    dtEnd: "",
    dtInMin: 0,
    typeOfDT: "",
    applicator: "",
    delayReason: "",
    remarks: ""
  })
  const [delayEntries, setDelayEntries] = useState([
    {
      startTime: "07:00",
      endTime: "08:00",
      tpc: 1000,
      machineWaste: 20,
      finalWaste: 10,
      gpc: 100,
      wasteReason: "Material Jam",
      downtimes: [
        {
          dtStart: "07:15",
          dtEnd: "07:30",
          dtInMin: 15,
          typeOfDT: "Unplanned",
          applicator: "Maintenance Team",
          delayReason: "Machine Breakdown",
          remarks: "Unexpected issue with conveyor belt"
        }
      ],
      isSaved: true
    },
    {
      startTime: "08:00",
      endTime: "09:00",
      tpc: 1200,
      machineWaste: 15,
      finalWaste: 8,
      gpc: 120,
      wasteReason: "Setup Issues",
      downtimes: [
        {
          dtStart: "08:10",
          dtEnd: "08:20",
          dtInMin: 10,
          typeOfDT: "Planned",
          applicator: "Production Manager",
          delayReason: "Scheduled Maintenance",
          remarks: "Regular check"
        }
      ],
      isSaved: true
    },
    {
      startTime: "15:00",
      endTime: "16:00",
      tpc: 950,
      machineWaste: 25,
      finalWaste: 12,
      gpc: 95,
      wasteReason: "Power Failure",
      downtimes: [
        {
          dtStart: "15:20",
          dtEnd: "15:45",
          dtInMin: 25,
          typeOfDT: "Unplanned",
          applicator: "Maintenance Team",
          delayReason: "Power Failure",
          remarks: "Unexpected power outage"
        }
      ],
      isSaved: true
    },
    {
      startTime: "23:00",
      endTime: "00:00",
      tpc: 1100,
      machineWaste: 18,
      finalWaste: 9,
      gpc: 110,
      wasteReason: "Material Jam",
      downtimes: [
        {
          dtStart: "23:30",
          dtEnd: "23:45",
          dtInMin: 15,
          typeOfDT: "Maintenance",
          applicator: "Maintenance Team",
          delayReason: "Repair Work",
          remarks: "Quick fix for material feed system"
        }
      ],
      isSaved: true
    }
  ])
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
    // Get current time in HH:MM format
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Calculate end time (15 minutes later)
    const endTime = new Date(now.getTime() + 15 * 60000);
    const endHour = endTime.getHours().toString().padStart(2, '0');
    const endMinute = endTime.getMinutes().toString().padStart(2, '0');
    const endTimeStr = `${endHour}:${endMinute}`;
    
    setNewDowntime({
      dtStart: currentTime,
      dtEnd: endTimeStr,
      dtInMin: 15,
      typeOfDT: "Unplanned",
      applicator: "",
      delayReason: "",
      remarks: ""
    })
    setIsEditingDowntime(false)
    setCurrentDowntimeIndex(null)
    setIsSubmitting(false)
  }, [])

  const handleDowntimeChange = useCallback((field, value) => {
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

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    // Only prevent default if e exists (form submission)
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    
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

  const openDowntimeDialog = useCallback((index) => {
    setCurrentEntryIndex(index)
    resetDowntimeForm()
    setShowDowntimeDialog(true)
  }, [resetDowntimeForm])

  const editDowntime = useCallback((entryIndex, downtimeIndex) => {
    setCurrentEntryIndex(entryIndex)
    setCurrentDowntimeIndex(downtimeIndex)
    setIsEditingDowntime(true)
    setNewDowntime({ ...delayEntries[entryIndex].downtimes[downtimeIndex] })
    setShowDowntimeDialog(true)
  }, [delayEntries])

  const handleUpdate = useCallback(() => {
    // Update lineDetails with the selected values from the header
    setLineDetails({
      ...lineDetails,
      line: selectedLine,
      shift: selectedShift,
      mainOperator: selectedOperator,
      // Keep other fields as they are
    });
    
    // Show success message or notification here if needed
    alert("Line details updated successfully!");
  }, [selectedLine, selectedShift, selectedOperator, lineDetails]);

  const handleEntryChange = useCallback((index, field, value) => {
    const updatedEntries = [...delayEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };

    setDelayEntries(updatedEntries);
  }, [delayEntries])

  const handleSaveEntry = useCallback((index) => {
    const updatedEntries = [...delayEntries]
    updatedEntries[index] = {
      ...updatedEntries[index],
      isSaved: true
    }
    setDelayEntries(updatedEntries)
    setEditMode(null)
  }, [delayEntries])

  const handleEditEntry = useCallback((index) => {
    setEditMode(index)
  }, [])

  const handleDeleteEntry = useCallback((index) => {
    const updatedEntries = delayEntries.filter((_, i) => i !== index)
    setDelayEntries(updatedEntries)
  }, [delayEntries])

  const isEntryValid = useCallback((entry) => {
    return (
      entry.startTime !== "" &&
      entry.endTime !== "" &&
      entry.tpc > 0 &&
      entry.machineWaste >= 0 &&
      entry.finalWaste >= 0 &&
      entry.gpc > 0 &&
      entry.wasteReason !== "" &&
      entry.downtimes.length > 0
    );
  }, []);

  const deleteDowntime = useCallback((entryIndex, downtimeIndex) => {
    setDelayEntries(prev => {
      const updated = [...prev]
      updated[entryIndex].downtimes = updated[entryIndex].downtimes.filter((_, index) => index !== downtimeIndex)
      return updated
    })
  }, [delayEntries])

  const openDowntimeDetails = useCallback((index) => {
    setCurrentEntryIndex(index)
    setShowDowntimeDetailsDialog(true)
  }, [])

  const getShiftFromTime = useCallback((time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 14) return "A";
    if (hour >= 14 && hour < 22) return "B";
    return "C";
  }, []);

  const handleAddNewEntry = useCallback(() => {
    const newEntry = {
      startTime: "",
      endTime: "",
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
  }, [delayEntries]);

  const handlePlannedShutdown = useCallback(() => {
    if (currentEntryIndex === null) return;
    
    // Get current time in HH:MM format
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, '0');
    const currentMinute = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${currentHour}:${currentMinute}`;
    
    // Calculate end time (30 minutes later for planned shutdown)
    const endTime = new Date(now.getTime() + 30 * 60000);
    const endHour = endTime.getHours().toString().padStart(2, '0');
    const endMinute = endTime.getMinutes().toString().padStart(2, '0');
    const endTimeStr = `${endHour}:${endMinute}`;
    
    setNewDowntime({
      dtStart: currentTime,
      dtEnd: endTimeStr,
      dtInMin: 30,
      typeOfDT: "Planned",
      applicator: "",
      delayReason: "",
      remarks: ""
    });
    
    setShowDowntimeDialog(true);
  }, [currentEntryIndex]);

  const [editingDowntimeIndex, setEditingDowntimeIndex] = useState<number | null>(null);

  const editDowntimeReason = (entryIndex: number, downtimeIndex: number) => {
    const downtime = delayEntries[entryIndex].downtimes[downtimeIndex];
    setNewDowntime({
      ...downtime,
      dtInMin: downtime.dtInMin || 0
    });
    setEditingDowntimeIndex(downtimeIndex);
  };

  const saveDowntimeReason = (entryIndex: number, downtimeIndex: number) => {
    const updatedEntries = [...delayEntries];
    updatedEntries[entryIndex].downtimes[downtimeIndex] = {
      ...updatedEntries[entryIndex].downtimes[downtimeIndex],
      delayReason: newDowntime.delayReason
    };
    setDelayEntries(updatedEntries);
    setEditingDowntimeIndex(null);
  };

  const [showPlannedShutdownDialog, setShowPlannedShutdownDialog] = useState(false);

  const [filteredDowntimeType, setFilteredDowntimeType] = useState('all');

  useEffect(() => {
    // Add keyframe animation for blinking
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes blink-green {
        0% { background-color: #22c55e; }
        50% { background-color: #16a34a; }
        100% { background-color: #22c55e; }
      }
      .blink-green {
        animation: blink-green 2s infinite;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Combined Header - More Compact */}
      <Card className="line-details-card mb-3 overflow-hidden border-0 shadow-lg sticky top-0 ">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-2">
          <h2 className="text-lg font-bold text-white">Production Line Details</h2>
        </div>
        <CardContent className="p-3">
          <div className="grid grid-cols-7 gap-2 mb-2">
            {/* Row 1 */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-500" />
                Line
              </Label>
              <Select value={selectedLine} onValueChange={setSelectedLine}>
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Line 1">Line 1</SelectItem>
                  <SelectItem value="Line 2">Line 2</SelectItem>
                  <SelectItem value="Line 3">Line 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-blue-500" />
                Date
              </Label>
              <div className="relative">
                <DatePicker
                  selected={selectedDate}
                  onChange={(date: Date) => setSelectedDate(date)}
                  dateFormat="MM/dd/yyyy"
                  className="w-full h-8 text-sm rounded-md border border-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pl-7"
                />
                <Calendar className="h-3 w-3 text-blue-500 absolute left-2 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-blue-500" />
                Start Time
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  value={format(shiftStartTime, 'HH:mm')}
                  onChange={(e) => setShiftStartTime(new Date('1970-01-01T' + e.target.value + ':00'))}
                  className="w-full h-8 text-sm rounded-md border border-gray-300 pl-7 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Clock3 className="h-3 w-3 text-blue-500 absolute left-2 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Clock3 className="h-3 w-3 text-blue-500" />
                End Time
              </Label>
              <div className="relative">
                <Input
                  type="time"
                  value={format(shiftEndTime, 'HH:mm')}
                  onChange={(e) => setShiftEndTime(new Date('1970-01-01T' + e.target.value + ':00'))}
                  className="w-full h-8 text-sm rounded-md border border-gray-300 pl-7 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <Clock3 className="h-3 w-3 text-blue-500 absolute left-2 top-2.5" />
              </div>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Shift
              </Label>
              <Select value={selectedShift} onValueChange={setSelectedShift}>
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Shift A</SelectItem>
                  <SelectItem value="B">Shift B</SelectItem>
                  <SelectItem value="C">Shift C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-500" />
                Production Order
              </Label>
              <Input
                value={lineDetails.productionOrder}
                onChange={(e) => setLineDetails({ ...lineDetails, productionOrder: e.target.value })}
                className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-500" />
                Production Code
              </Label>
              <Input
                value={lineDetails.productionCode}
                onChange={(e) => setLineDetails({ ...lineDetails, productionCode: e.target.value })}
                className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Row 2 */}
          <div className="grid grid-cols-7 gap-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <FileText className="h-3 w-3 text-blue-500" />
                Product Description
              </Label>
              <Input
                value={lineDetails.productDescription}
                onChange={(e) => setLineDetails({ ...lineDetails, productDescription: e.target.value })}
                className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Main Operator
              </Label>
              <Select
                value={lineDetails.mainOperator}
                onValueChange={(value) => setLineDetails({ ...lineDetails, mainOperator: value })}
              >
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>{operator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Assistant
              </Label>
              <Select
                value={lineDetails.assistantOperator}
                onValueChange={(value) => setLineDetails({ ...lineDetails, assistantOperator: value })}
              >
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>{operator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Users className="h-3 w-3 text-blue-500" />
                Shift Incharge
              </Label>
              <Select
                value={lineDetails.shiftIncharge}
                onValueChange={(value) => setLineDetails({ ...lineDetails, shiftIncharge: value })}
              >
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {operators.map((operator) => (
                    <SelectItem key={operator} value={operator}>{operator}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Settings2 className="h-3 w-3 text-blue-500" />
                RM1
              </Label>
              <Select
                value={lineDetails.rm1}
                onValueChange={(value) => setLineDetails({ ...lineDetails, rm1: value })}
              >
                <SelectTrigger className="w-full h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {rmOptions.map((rm) => (
                    <SelectItem key={rm} value={rm}>{rm}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1 flex flex-col">
              <Label className="text-xs font-medium text-gray-500 flex items-center gap-1">
                <Settings2 className="h-3 w-3 text-blue-500" />
                RM2
              </Label>
              <div className="flex gap-1 h-8">
                <Select
                  value={lineDetails.rm2}
                  onValueChange={(value) => setLineDetails({ ...lineDetails, rm2: value })}
                >
                  <SelectTrigger className="flex-1 h-8 text-sm transition-all duration-200 focus:ring-1 focus:ring-blue-500 focus:border-transparent">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {rmOptions.map((rm) => (
                      <SelectItem key={rm} value={rm}>{rm}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  variant="default" 
                  className="h-8 px-2 bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-xs rounded-md shadow-sm transition-all duration-300"
                  onClick={handleUpdate}
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card className="metrics-card mb-3 overflow-hidden border-0 shadow-lg sticky top-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-2">
          <h2 className="text-lg font-bold text-white flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Performance Metrics
          </h2>
        </div>
        <CardContent className="p-3">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-md p-2 flex flex-col items-center justify-center border border-green-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 mb-1">
                <BarChart3 className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Diligence</div>
              <div className="text-sm font-bold text-green-600">{metrics.diligenceScore}</div>
            </div>
            
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-md p-2 flex flex-col items-center justify-center border border-red-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-red-500 mb-1">
                <AlertTriangle className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Delays</div>
              <div className="text-sm font-bold text-red-600">{metrics.delayCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-md p-2 flex flex-col items-center justify-center border border-blue-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500 mb-1">
                <Settings2 className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Waste Reasons</div>
              <div className="text-sm font-bold text-blue-600">{metrics.wasteReasonCount}</div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-md p-2 flex flex-col items-center justify-center border border-amber-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 mb-1">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Speed Loss</div>
              <div className="text-sm font-bold text-amber-600">{metrics.speedLoss}</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-md p-2 flex flex-col items-center justify-center border border-purple-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-500 mb-1">
                <FileText className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Total DT</div>
              <div className="text-sm font-bold text-purple-600">{metrics.totalDT}</div>
            </div>
            
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-md p-2 flex flex-col items-center justify-center border border-cyan-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-500 mb-1">
                <Activity className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Avg Speed</div>
              <div className="text-sm font-bold text-cyan-600">{metrics.avgSpeed}</div>
            </div>
            
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-md p-2 flex flex-col items-center justify-center border border-indigo-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500 mb-1">
                <Users className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Total Product</div>
              <div className="text-sm font-bold text-indigo-600">{metrics.totalProduct}</div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 rounded-md p-2 flex flex-col items-center justify-center border border-rose-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 mb-1">
                <AlertTriangle className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Waste Product</div>
              <div className="text-sm font-bold text-rose-600">{metrics.wasteProduct}</div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-md p-2 flex flex-col items-center justify-center border border-emerald-200 shadow-sm">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 mb-1">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </div>
              <div className="text-xs font-medium text-gray-600 text-center">Good Product</div>
              <div className="text-sm font-bold text-emerald-600">{metrics.goodProduct}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delay Entries */}
      <Card className="mb-3 overflow-hidden border-0 shadow-lg sticky top-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Delay Entries
          </h2>
          <Button
            variant="default"
            size="sm"
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3 rounded-md shadow-sm transition-all duration-200 flex items-center"
            onClick={() => {
              setDelayEntries([
                {
                  startTime: "",
                  endTime: "",
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
            <Plus className="mr-1 h-4 w-4" /> Add Entry
          </Button>
        </div>
        <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white sticky top-75">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-20 bg-gray-100 shadow-sm">
              <tr>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Start</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">End</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">TPC</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">M.Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">F.Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">GPC</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Reason</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Downtimes</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {delayEntries.map((entry, index) => (
                <tr key={index} className={`h-12 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50`}>
                  <td className="p-1">
                    <Input
                      type="time"
                      value={entry.startTime}
                      onChange={(e) => handleEntryChange(index, 'startTime', e.target.value)}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="time"
                      value={entry.endTime}
                      onChange={(e) => handleEntryChange(index, 'endTime', e.target.value)}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={entry.tpc?.toString() || ''}
                      onChange={(e) => handleEntryChange(index, 'tpc', Number(e.target.value))}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="TPC"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={entry.machineWaste?.toString() || ''}
                      onChange={(e) => handleEntryChange(index, 'machineWaste', Number(e.target.value))}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Waste"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={entry.finalWaste?.toString() || ''}
                      onChange={(e) => handleEntryChange(index, 'finalWaste', Number(e.target.value))}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Waste"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      value={entry.gpc?.toString() || ''}
                      onChange={(e) => handleEntryChange(index, 'gpc', Number(e.target.value))}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="GPC"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <Select
                      value={entry.wasteReason}
                      onValueChange={(value) => handleEntryChange(index, 'wasteReason', value)}
                      disabled={entry.isSaved && editMode !== index}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Reason" />
                      </SelectTrigger>
                      <SelectContent>
                        {machineWasteReasons.map((reason) => (
                          <SelectItem key={reason} value={reason} className="text-xs">{reason}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="p-1">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDowntimeDetails(index)}
                        disabled={entry.isSaved && editMode !== index}
                        className={`h-8 text-xs px-2 py-0 ${
                          entry.downtimes.length === 0 
                            ? 'bg-red-500 text-white hover:bg-red-600 border-red-500' 
                            : 'bg-green-500 text-white hover:bg-green-600 border-green-500 blink-green'
                        } transition-all duration-200 w-full`}
                      >
                        {entry.downtimes.length === 0 
                          ? 'Downtime' 
                          : `Downtimes (${entry.downtimes.length})`
                        }
                      </Button>
                    </div>
                  </td>
                  <td className="p-1">
                    <div className="flex gap-1">
                      {!entry.isSaved ? (
                        // New entry - show Save and Delete
                        <>
                          <Button
                            onClick={() => handleSaveEntry(index)}
                            className={`h-7 text-xs px-2 rounded-md transition-all duration-200 flex items-center justify-center ${isEntryValid(entry) ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            disabled={!isEntryValid(entry)}
                            title={!isEntryValid(entry) ? "Fill required fields" : ""}
                          >
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="h-7 text-xs px-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-all duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : editMode === index ? (
                        // Editing saved entry - show Save and Delete
                        <>
                          <Button
                            onClick={() => handleSaveEntry(index)}
                            className={`h-7 text-xs px-2 rounded-md transition-all duration-200 flex items-center justify-center ${isEntryValid(entry) ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                            disabled={!isEntryValid(entry)}
                            title={!isEntryValid(entry) ? "Fill required fields" : ""}
                          >
                            <Save className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="h-7 text-xs px-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-all duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      ) : (
                        // Saved entry (not in edit mode) - show Edit and Delete
                        <>
                          <Button
                            onClick={() => handleEditEntry(index)}
                            className="h-7 text-xs px-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all duration-200 flex items-center justify-center"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            onClick={() => handleDeleteEntry(index)}
                            className="h-7 text-xs px-2 rounded-md bg-red-500 hover:bg-red-600 text-white transition-all duration-200 flex items-center justify-center"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Downtime Details Dialog */}
      <Dialog open={showDowntimeDetailsDialog} onOpenChange={setShowDowntimeDetailsDialog}>
        <DialogContent className="w-full max-w-[900px] p-0 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <DialogTitle className="text-xl font-bold">
              Downtime Details for Shift
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDowntimeDetailsDialog(false)}
              className="h-8 w-8 p-0 rounded-full"
            >
            </Button>
          </div>

          {currentEntryIndex !== null && (
            <>
              {/* Shift Summary */}
              <div className="bg-gray-50 p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Shift Time:</h3>
                    <p className="text-base font-semibold">
                      {delayEntries[currentEntryIndex]?.startTime || "--:--"} - {delayEntries[currentEntryIndex]?.endTime || "--:--"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Downtimes:</h3>
                    <p className="text-base font-semibold">
                      {delayEntries[currentEntryIndex]?.downtimes?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Downtime Entries */}
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">Downtime Entries</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Filter to show all downtimes
                        setFilteredDowntimeType('all');
                      }}
                      className={`h-8 text-xs ${filteredDowntimeType === 'all' ? 'bg-gray-100' : ''}`}
                    >
                      All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Filter to show only unplanned downtimes
                        setFilteredDowntimeType('Unplanned');
                      }}
                      className={`h-8 text-xs ${filteredDowntimeType === 'Unplanned' ? 'bg-gray-100' : ''}`}
                    >
                      Unplanned
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Filter to show only planned downtimes
                        setFilteredDowntimeType('Planned');
                      }}
                      className={`h-8 text-xs ${filteredDowntimeType === 'Planned' ? 'bg-gray-100' : ''}`}
                    >
                      Planned
                    </Button>
                  </div>
                </div>
                
                {delayEntries[currentEntryIndex]?.downtimes?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Start Time</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">End Time</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Duration (min)</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Reason</th>
                          <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {delayEntries[currentEntryIndex].downtimes
                          .filter(dt => filteredDowntimeType === 'all' || dt.typeOfDT === filteredDowntimeType)
                          .map((dt, idx) => {
                            // Find the actual index in the original array for correct editing
                            const originalIndex = delayEntries[currentEntryIndex].downtimes.findIndex(
                              item => item === dt
                            );
                            return (
                              <tr key={idx} className={`border-b border-gray-100 ${dt.typeOfDT === 'Planned' ? 'bg-amber-50' : ''}`}>
                                <td className="py-3 px-3">{dt.dtStart}</td>
                                <td className="py-3 px-3">{dt.dtEnd}</td>
                                <td className="py-3 px-3">{dt.dtInMin}</td>
                                <td className="py-3 px-3">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    dt.typeOfDT === 'Planned' 
                                      ? 'bg-amber-100 text-amber-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {dt.typeOfDT}
                                  </span>
                                </td>
                                <td className="py-3 px-3">
                                  {editingDowntimeIndex === originalIndex ? (
                                    <Select
                                      value={newDowntime.delayReason}
                                      onValueChange={(value) => handleDowntimeChange('delayReason', value)}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {dt.typeOfDT && delayReasonsByDtType[dt.typeOfDT]?.map((reason) => (
                                          <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    dt.delayReason || "-"
                                  )}
                                </td>
                                <td className="py-3 px-3">
                                  <div className="flex gap-2">
                                    {editingDowntimeIndex === originalIndex ? (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => saveDowntimeReason(currentEntryIndex, originalIndex)}
                                        className="h-8 text-xs font-medium bg-green-500 text-white hover:bg-green-600"
                                      >
                                        Save
                                      </Button>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => editDowntimeReason(currentEntryIndex, originalIndex)}
                                        className="h-8 text-xs font-medium"
                                      >
                                        Edit Reason
                                      </Button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                      <Clock className="h-6 w-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 mb-4">No downtime entries found for this delay period.</p>
                  </div>
                )}
              </div>

              {/* Summary Section */}
              {delayEntries[currentEntryIndex]?.downtimes?.length > 0 && (
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-bold mb-4">Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Total Downtime Duration:</h4>
                      <p className="text-base font-semibold">
                        {delayEntries[currentEntryIndex].downtimes.reduce((total, dt) => total + (dt.dtInMin || 0), 0)} minutes
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Planned Downtime:</h4>
                      <p className="text-base font-semibold">
                        {delayEntries[currentEntryIndex].downtimes
                          .filter(dt => dt.typeOfDT === 'Planned')
                          .reduce((total, dt) => total + (dt.dtInMin || 0), 0)} minutes
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Unplanned Downtime:</h4>
                      <p className="text-base font-semibold">
                        {delayEntries[currentEntryIndex].downtimes
                          .filter(dt => dt.typeOfDT === 'Unplanned')
                          .reduce((total, dt) => total + (dt.dtInMin || 0), 0)} minutes
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer with Planned Shutdown Button */}
              <div className="flex justify-between p-4 border-t border-gray-200">
                <Button
                  onClick={() => {
                    // Pre-fill with current time and set type to Planned
                    const now = new Date();
                    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                    const thirtyMinLater = new Date(now.getTime() + 30 * 60000);
                    const endTime = `${String(thirtyMinLater.getHours()).padStart(2, '0')}:${String(thirtyMinLater.getMinutes()).padStart(2, '0')}`;
                    
                    setNewDowntime({
                      dtStart: currentTime,
                      dtEnd: endTime,
                      dtInMin: 30,
                      typeOfDT: 'Planned',
                      applicator: applicatorsByDtType['Planned'][0] || '',
                      delayReason: '',
                      remarks: ''
                    });
                    
                    setShowPlannedShutdownDialog(true);
                  }}
                  className="h-9 bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Planned Shutdown
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDowntimeDetailsDialog(false)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Planned Shutdown Dialog */}
      <Dialog open={showPlannedShutdownDialog} onOpenChange={setShowPlannedShutdownDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Add Planned Shutdown
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dtStart" className="text-sm font-medium">
                  Start Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dtStart"
                  type="time"
                  value={newDowntime.dtStart}
                  onChange={(e) => handleDowntimeChange('dtStart', e.target.value)}
                  className="h-9"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dtEnd" className="text-sm font-medium">
                  End Time <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dtEnd"
                  type="time"
                  value={newDowntime.dtEnd}
                  onChange={(e) => handleDowntimeChange('dtEnd', e.target.value)}
                  className="h-9"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="delayReason" className="text-sm font-medium">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Select
                value={newDowntime.delayReason}
                onValueChange={(value) => handleDowntimeChange('delayReason', value)}
              >
                <SelectTrigger id="delayReason" className="h-9">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  {delayReasonsByDtType["Planned"]?.map((reason) => (
                    <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="remarks" className="text-sm font-medium">
                Remarks
              </Label>
              <Input
                id="remarks"
                value={newDowntime.remarks}
                onChange={(e) => handleDowntimeChange('remarks', e.target.value)}
                className="h-9"
              />
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPlannedShutdownDialog(false)}
                className="h-9"
              >
                Cancel
              </Button>
              <Button 
                type="button"
                onClick={() => {
                  // Ensure type is set to Planned
                  handleDowntimeChange('typeOfDT', 'Planned');
                  if (!newDowntime.applicator) {
                    handleDowntimeChange('applicator', applicatorsByDtType['Planned'][0] || '');
                  }
                  
                  handleSubmit();
                  setShowPlannedShutdownDialog(false);
                }}
                className="h-9 bg-amber-500 hover:bg-amber-600 text-white"
              >
                Add Planned Shutdown
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
