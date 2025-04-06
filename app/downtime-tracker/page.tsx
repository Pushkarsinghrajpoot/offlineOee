"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
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

import { supabase } from "@/lib/supabaseClient"
import ProductionDataForm from "../components/ProductionDataForm"
import DelayEntryForm, { DelayEntry, DowntimeEntry } from "@/components/forms/DelayEntryForm"

// Dropdown options
const machineWasteReasons = [
  "Material Issue",
  "Machine Breakdown",
  "Quality Issue",
  "Process Setup",
  "Power Failure",
  "Other"
]

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

interface MetricCardProps {
  Icon: LucideIcon;
  title: string;
  value: number | string;
  color: string;
}

const MetricCard = ({ Icon, title, value, color }: MetricCardProps) => (
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

  // State variables for delay data from Supabase
  const [dtTypes, setDtTypes] = useState<string[]>([])
  const [delayHeads, setDelayHeads] = useState<string[]>([])
  const [delayReasons, setDelayReasons] = useState<string[]>([])

  // Fetch delay data from Supabase
  useEffect(() => {
    // Setup Supabase tables if they don't exist
    const setup = async () => {
      await setupSupabaseTables();
    };
    
    setup();
    
    const fetchDelayTypes = async () => {
      try {
        console.log('Fetching delay types...');
        const { data, error } = await supabase
          .from('Delay_reasons')
          .select('delayType')
          .order('delayType');
        
        console.log('Delay types response:', data, error);
        
        if (error) {
          console.error('Error fetching delay types:', error);
        } else if (data && data.length > 0) {
          console.log('Delay types data:', data);
          // Extract unique delay types
          const uniqueTypes = [...new Set(data.map(item => item.delayType))];
          setDtTypes(uniqueTypes);
        } else {
          console.log('No delay types found, using default values');
          setDtTypes(['Planned', 'Unplanned', 'Breakdown', 'Setup', 'Changeover']);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to default values
        setDtTypes(['Planned', 'Unplanned', 'Breakdown', 'Setup', 'Changeover']);
      }
    };
    
    const fetchDelayHeads = async () => {
      try {
        console.log('Fetching delay heads...');
        const { data, error } = await supabase
          .from('Delay_reasons')
          .select('delayHead')
          .order('delayHead');
        
        console.log('Delay heads response:', data, error);
        
        if (error) {
          console.error('Error fetching delay heads:', error);
        } else if (data && data.length > 0) {
          console.log('Delay heads data:', data);
          // Extract unique delay heads
          const uniqueHeads = [...new Set(data.map(item => item.delayHead))];
          setDelayHeads(uniqueHeads);
        } else {
          console.log('No delay heads found, using default values');
          setDelayHeads(['Mechanical', 'Electrical', 'Process', 'Material', 'Operator']);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to default values
        setDelayHeads(['Mechanical', 'Electrical', 'Process', 'Material', 'Operator']);
      }
    };
    
    const fetchDelayReasons = async () => {
      try {
        console.log('Fetching delay reasons...');
        const { data, error } = await supabase
          .from('Delay_reasons')
          .select('delayDescription')
          .order('delayDescription');
        
        console.log('Delay reasons response:', data, error);
        
        if (error) {
          console.error('Error fetching delay reasons:', error);
        } else if (data && data.length > 0) {
          console.log('Delay reasons data:', data);
          // Extract unique delay descriptions
          const uniqueDescriptions = [...new Set(data.map(item => item.delayDescription))];
          setDelayReasons(uniqueDescriptions);
        } else {
          console.log('No delay reasons found, using default values');
          setDelayReasons(['Machine Breakdown', 'Power Failure', 'Material Shortage', 'Quality Issue', 'Scheduled Maintenance']);
        }
      } catch (error) {
        console.error('Error:', error);
        // Fallback to default values
        setDelayReasons(['Machine Breakdown', 'Power Failure', 'Material Shortage', 'Quality Issue', 'Scheduled Maintenance']);
      }
    };
    
    fetchDelayTypes();
    fetchDelayHeads();
    fetchDelayReasons();
  }, []);

  // Define the type for the downtime entry
  type DowntimeEntry = {
    dtStart: string;
    dtEnd: string;
    dtInMin: number;
    typeOfDT: string;
    applicator: string;
    delayHead: string;
    delayReason: string;
    remarks: string;
    shift: string;
    isEditable: boolean;
  };

  // Define the type for delay entries
  type DelayEntry = {
    startTime: string;
    endTime: string;
    tpc: number;
    machineWaste: number;
    finalWaste: number;
    gpc: number;
    wasteReason: string;
    downtimes: DowntimeEntry[];
    isSaved: boolean;
  };

  const [delayEntries, setDelayEntries] = useState<DelayEntry[]>([
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

  // Setup a helper function to check if an entry is valid (has start and end times)
  const isEntryValid = useCallback((entry: DelayEntry): boolean => {
    return entry.startTime && entry.endTime ? true : false;
  }, []);

  const handleAddNewEntry = useCallback(() => {
    const newEntry: DelayEntry = {
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

  const getShiftFromTime = useCallback((time) => {
    const hour = parseInt(time.split(':')[0]);
    if (hour >= 6 && hour < 14) return "A";
    if (hour >= 14 && hour < 22) return "B";
    return "C";
  }, []);

  // State to store the production data ID
  const [productionDataId, setProductionDataId] = useState<string | null>(null);

  // Function to handle production data creation/selection
  const handleProductionDataSelected = useCallback((id: string) => {
    console.log("Production data selected with ID:", id);
    setProductionDataId(id);
    // Optionally load existing delay entries related to this production data
    const loadDelayEntries = async () => {
      try {
        // Fetch downtime entries related to this production data
        const { data: downtimeData, error } = await supabase
          .from('downtime')
          .select(`
            *,
            delay_reason:delay_reason_id(delayhead, delaydescription, delaytype)
          `)
          .eq('production_data_id', id)
          .order('start_time');
          
        if (error) {
          console.error('Error fetching downtime data:', error);
          return;
        }
        
        if (downtimeData && downtimeData.length > 0) {
          // Convert the downtime data to DelayEntry format
          // First, group by hour or appropriate interval
          const downtimeGroups = downtimeData.reduce((groups: Record<string, any[]>, item: any) => {
            const startTime = new Date(item.start_time);
            const hourKey = `${startTime.getHours().toString().padStart(2, '0')}:00`;
            
            if (!groups[hourKey]) {
              groups[hourKey] = [];
            }
            
            groups[hourKey].push(item);
            return groups;
          }, {});
          
          // Create delay entries from the grouped downtimes
          const entries: DelayEntry[] = Object.keys(downtimeGroups).map(hourKey => {
            const items = downtimeGroups[hourKey];
            
            // Get the next hour for end time
            const [hours] = hourKey.split(':').map(Number);
            const endHour = (hours + 1) % 24;
            const endTime = `${endHour.toString().padStart(2, '0')}:00`;
            
            // Convert downtimes to our DowntimeEntry format
            const downtimes: DowntimeEntry[] = items.map(item => {
              const startTime = new Date(item.start_time);
              const endTime = new Date(item.end_time);
              
              return {
                dtStart: `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`,
                dtEnd: `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`,
                dtInMin: item.duration || Math.round((endTime.getTime() - startTime.getTime()) / 60000),
                typeOfDT: item.delay_reason?.delaytype || (item.is_planned ? 'Planned' : 'Unplanned'),
                applicator: '', // This may need to come from operator data
                delayHead: item.delay_reason?.delayhead || '',
                delayReason: item.delay_reason?.delaydescription || '',
                remarks: '',
                shift: selectedShift || '',
                isEditable: false // Loaded entries are not editable by default
              };
            });
            
            return {
              startTime: hourKey,
              endTime: endTime,
              tpc: 0, // These values would need to come from production data
              machineWaste: 0,
              finalWaste: 0,
              gpc: 0,
              wasteReason: '',
              downtimes: downtimes,
              isSaved: true // Mark as saved since they're from the database
            };
          });
          
          // Update the delay entries state
          setDelayEntries(entries);
        }
      } catch (error) {
        console.error('Error loading delay entries:', error);
      }
    };
    
    loadDelayEntries();
  }, [selectedShift]);

  return (
    <div className="space-y-4">
      {/* Production Data Form */}
      <ProductionDataForm 
        onProductionDataCreated={handleProductionDataSelected}
      />
      
      {/* Debug information - remove after testing */}
      {productionDataId ? (
        <div className="bg-green-100 p-2 rounded border border-green-300 mb-2">
          <p className="text-sm text-green-800">Production Data ID: {productionDataId}</p>
        </div>
      ) : (
        <div className="bg-yellow-100 p-2 rounded border border-yellow-300 mb-2">
          <p className="text-sm text-yellow-800">No Production Data ID selected yet. Please create production data first.</p>
        </div>
      )}

      {/* Delay Entry Form */}
      <DelayEntryForm
        delayEntries={delayEntries}
        setDelayEntries={setDelayEntries}
        isEntryValid={isEntryValid}
        productionDataId={productionDataId || undefined}
        selectedShift={selectedShift}
        selectedLine={selectedLine}
        selectedDate={selectedDate}
      />
    </div>
  );
}