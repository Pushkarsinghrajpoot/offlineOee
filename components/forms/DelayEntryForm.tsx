"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  Trash2, 
  Pencil, 
  X, 
  AlertTriangle, 
  Settings2,
  FileText,
  Save,
  Info
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

// Types
export type DowntimeEntry = {
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

export type DelayEntry = {
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

interface DelayEntryFormProps {
  delayEntries: DelayEntry[];
  setDelayEntries: (entries: DelayEntry[]) => void;
  openDowntimeDetails?: (index: number) => void;
  isEntryValid: (entry: DelayEntry) => boolean;
  productionDataId?: string;
  selectedShift?: string;
  selectedLine?: string;
  selectedDate?: Date;
}

// Machine waste reasons constant
const machineWasteReasons = [
  "Material Jam",
  "Machine Breakdown",
  "Setup Issues",
  "Power Failure",
  "Quality Issues",
  "Other"
]

export default function DelayEntryForm({ 
  delayEntries, 
  setDelayEntries, 
  openDowntimeDetails, 
  isEntryValid,
  productionDataId,
  selectedShift,
  selectedLine,
  selectedDate
}: DelayEntryFormProps) {
  // State for editing
  const [editMode, setEditMode] = useState<number | null>(null);
  
  // States for downtime dialog functionality
  const [showDowntimeDetailsDialog, setShowDowntimeDetailsDialog] = useState(false);
  const [currentEntryIndex, setCurrentEntryIndex] = useState<number | null>(null);
  const [currentDowntimeIndex, setCurrentDowntimeIndex] = useState<number | null>(null);
  const [isEditingDowntime, setIsEditingDowntime] = useState(false);
  const [filteredDowntimeType, setFilteredDowntimeType] = useState('all');
  const [showPlannedShutdownDialog, setShowPlannedShutdownDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productionData, setProductionData] = useState<any>(null);

  // State variables for delay data from Supabase
  const [dtTypes, setDtTypes] = useState<string[]>([]);
  const [delayHeads, setDelayHeads] = useState<string[]>([]);
  const [delayReasons, setDelayReasons] = useState<any[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [shifts, setShifts] = useState<any[]>([]);

  const [newDowntime, setNewDowntime] = useState<DowntimeEntry>({
    dtStart: "",
    dtEnd: "",
    dtInMin: 0,
    typeOfDT: "",
    applicator: "",
    delayHead: "",
    delayReason: "",
    remarks: "",
    shift: "",
    isEditable: true
  });

  // Fetch reference data from Supabase
  const fetchReferenceData = useCallback(async () => {
    console.log('Fetching reference data...');
    try {
      // Fetch delay reasons from database
      const { data: delayReasonsData, error: delayReasonsError } = await supabase
        .from('delay_reasons')
        .select('*');

      if (delayReasonsError) {
        console.error('Error fetching delay reasons:', delayReasonsError);
        return;
      }

      console.log('Delay reasons from database:', delayReasonsData);

      if (delayReasonsData && delayReasonsData.length > 0) {
        // Extract unique delay types
        const uniqueDelayTypes = Array.from(new Set(delayReasonsData.map(item => item.delaytype)));
        setDtTypes(uniqueDelayTypes);
        console.log('Unique delay types:', uniqueDelayTypes);

        // Extract unique delay heads
        const uniqueDelayHeads = Array.from(new Set(delayReasonsData.map(item => item.delayhead)));
        setDelayHeads(uniqueDelayHeads);
        console.log('Unique delay heads:', uniqueDelayHeads);

        // Store full delay reasons data for reference
        setDelayReasons(delayReasonsData);
      } else {
        console.log('No delay reasons found in database, creating default data...');
        
        // Create default delay reasons if none exist
        const defaultDelayReasons = [
          { delaytype: 'Planned', delayhead: 'Maintenance', delaydescription: 'Scheduled Maintenance', is_planned: true },
          { delaytype: 'Planned', delayhead: 'Changeover', delaydescription: 'Product Changeover', is_planned: true },
          { delaytype: 'Planned', delayhead: 'Meeting', delaydescription: 'Production Meeting', is_planned: true },
          { delaytype: 'Unplanned', delayhead: 'Breakdown', delaydescription: 'Machine Failure', is_planned: false },
          { delaytype: 'Unplanned', delayhead: 'Breakdown', delaydescription: 'Electrical Issue', is_planned: false },
          { delaytype: 'Unplanned', delayhead: 'Breakdown', delaydescription: 'Mechanical Issue', is_planned: false },
          { delaytype: 'Unplanned', delayhead: 'Material Shortage', delaydescription: 'Raw Material Shortage', is_planned: false },
          { delaytype: 'Unplanned', delayhead: 'Quality Issue', delaydescription: 'Product Quality Issue', is_planned: false }
        ];
        
        // Insert default data
        const { data: insertedData, error: insertError } = await supabase
          .from('delay_reasons')
          .insert(defaultDelayReasons)
          .select();
          
        if (insertError) {
          console.error('Error creating default delay reasons:', insertError);
          // Fallback to using the default values without inserting to DB
          setDtTypes(['Planned', 'Unplanned']);
          setDelayHeads(['Maintenance', 'Breakdown', 'Changeover', 'Material Shortage', 'Quality Issue']);
          setDelayReasons(defaultDelayReasons);
        } else {
          console.log('Successfully created default delay reasons:', insertedData);
          
          // Use the created data
          const uniqueDelayTypes = Array.from(new Set(defaultDelayReasons.map(item => item.delaytype)));
          const uniqueDelayHeads = Array.from(new Set(defaultDelayReasons.map(item => item.delayhead)));
          
          setDtTypes(uniqueDelayTypes);
          setDelayHeads(uniqueDelayHeads);
          setDelayReasons(insertedData || defaultDelayReasons);
        }
      }

      // If there's a production data ID, fetch the related production data
      if (productionDataId) {
        const { data: productionData, error: productionDataError } = await supabase
          .from('production_data')
          .select('*')
          .eq('id', productionDataId)
          .single();

        if (productionDataError) {
          console.error('Error fetching production data:', productionDataError);
        } else if (productionData) {
          setProductionData(productionData);
          console.log('Production data loaded:', productionData);
        }
      }
    } catch (error) {
      console.error('Error in fetchReferenceData:', error);
    }
  }, [productionDataId]);

  // Load dropdown data on component mount
  useEffect(() => {
    fetchReferenceData();
  }, [fetchReferenceData]);

  // Function to handle opening the downtime details dialog
  const handleOpenDowntimeDetails = (index: number) => {
    setCurrentEntryIndex(index);
    setShowDowntimeDetailsDialog(true);
  };

  // Function to reset the downtime form
  const resetDowntimeForm = () => {
    setNewDowntime({
      dtStart: "",
      dtEnd: "",
      dtInMin: 0,
      typeOfDT: "",
      applicator: "",
      delayHead: "",
      delayReason: "",
      remarks: "",
      shift: "",
      isEditable: true
    });
  };

  // Handle entry changes
  const handleEntryChange = (index: number, field: keyof DelayEntry, value: any) => {
    const updatedEntries = [...delayEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      [field]: value
    };
    setDelayEntries(updatedEntries);
  };

  // Handle saving an entry
  const handleSaveEntry = (index: number) => {
    if (!isEntryValid(delayEntries[index])) {
      toast.error("Please fill all required fields");
      return;
    }

    const updatedEntries = [...delayEntries];
    updatedEntries[index] = {
      ...updatedEntries[index],
      isSaved: true
    };
    setDelayEntries(updatedEntries);
    setEditMode(null);
    toast.success("Entry saved");
  };

  // Handle editing an entry
  const handleEditEntry = (index: number) => {
    setEditMode(index);
  };

  // Handle deleting an entry
  const handleDeleteEntry = (index: number) => {
    const updatedEntries = [...delayEntries];
    updatedEntries.splice(index, 1);
    setDelayEntries(updatedEntries);
    toast.success("Entry deleted");
  };

  // Save all delay entries to the database
  const saveAllEntriesToDatabase = async () => {
    setIsSubmitting(true);
    console.log("Starting to save entries to database. Production Data ID:", productionDataId);
    console.log("Delay entries to save:", delayEntries);

    // Count entries with downtimes
    const entriesWithDowntimes = delayEntries.filter(entry => 
      entry.downtimes && entry.downtimes.length > 0
    );
    
    if (entriesWithDowntimes.length === 0) {
      toast.error("No downtime entries found to save. Please add downtime details by clicking the 'Downtime' button for each entry.");
      setIsSubmitting(false);
      return;
    }
    
    try {
      if (!productionDataId) {
        toast.error("No production data ID provided.");
        setIsSubmitting(false);
        return;
      }
      
      // Process each delay entry
      for (const entry of entriesWithDowntimes) {
        console.log(`Processing entry with ${entry.downtimes?.length} downtime records`);
        console.log("Full entry data:", entry);
        
        // Parse numeric values with fallbacks - using the correct field names from the form
        const tpcValue = parseInt(String(entry.tpc || '0'));
        const machineWasteValue = parseInt(String(entry.machineWaste || '0'));
        const finalWasteValue = parseInt(String(entry.finalWaste || '0'));
        const gpcValue = parseInt(String(entry.gpc || '0'));
        
        console.log("Parsed values:", {
          tpc: tpcValue,
          machineWaste: machineWasteValue,
          finalWaste: finalWasteValue,
          gpc: gpcValue
        });
        
        // First, create all downtime records
        const downtimeIds: string[] = [];
        
        if (entry.downtimes && entry.downtimes.length > 0) {
          for (const downtime of entry.downtimes) {
            if (!downtime.typeOfDT || !downtime.delayHead || !downtime.delayReason) {
              console.warn("Skipping incomplete downtime entry:", downtime);
              continue;
            }
            
            // Find the delay reason ID from our list of delay reasons
            let delayReasonId = null;
            for (const reason of delayReasons) {
              if (reason.delaytype === downtime.typeOfDT && 
                  reason.delayhead === downtime.delayHead && 
                  reason.delaydescription === downtime.delayReason) {
                delayReasonId = reason.id;
                break;
              }
            }
            
            if (!delayReasonId) {
              console.error(`Could not find delay reason ID for: ${downtime.typeOfDT} - ${downtime.delayHead} - ${downtime.delayReason}`);
              continue;
            }
            
            // Parse time strings into Date objects and calculate duration
            const startHour = parseInt(downtime.dtStart.split(':')[0]);
            const startMinute = parseInt(downtime.dtStart.split(':')[1]);
            const endHour = parseInt(downtime.dtEnd.split(':')[0]);
            const endMinute = parseInt(downtime.dtEnd.split(':')[1]);
            
            // Use selected date (or current date if not provided) for the timestamps
            const selectedDateObj = selectedDate ? new Date(selectedDate) : new Date();
            
            const startDate = new Date(selectedDateObj);
            startDate.setHours(startHour, startMinute, 0, 0);
            
            const endDate = new Date(selectedDateObj);
            endDate.setHours(endHour, endMinute, 0, 0);
            
            // Handle overnight shifts
            if (endDate < startDate) {
              endDate.setDate(endDate.getDate() + 1);
            }
            
            // Calculate duration in minutes
            const durationMs = endDate.getTime() - startDate.getTime();
            const durationMinutes = durationMs / (1000 * 60);
            
            // Format duration as PostgreSQL interval string
            const durationString = `${durationMinutes} minutes`;
            
            // Prepare the downtime payload
            const downtimePayload = {
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              duration: durationString, // PostgreSQL interval format
              delay_reason_id: delayReasonId,
              is_planned: downtime.typeOfDT === 'Planned'
            };
            
            console.log("Creating downtime record with payload:", downtimePayload);
            
            const { data: downtimeData, error: downtimeError } = await supabase
              .from('downtime')
              .insert(downtimePayload)
              .select()
              .single();
            
            if (downtimeError) {
              console.error('Error creating downtime record:', downtimeError);
              toast.error(`Failed to create downtime record: ${downtimeError.message}`);
            } else {
              console.log("Created downtime with ID:", downtimeData.id);
              downtimeIds.push(downtimeData.id);
            }
          }
        }
        
        // Now create the delay_entry record with the first downtime_id
        if (downtimeIds.length > 0) {
          const delayEntryPayload = {
            start_time: entry.startTime,
            end_time: entry.endTime,
            tpc: tpcValue,
            machine_waste: machineWasteValue,
            final_waste: finalWasteValue,
            gpc: gpcValue,
            waste_reason: entry.wasteReason || 'Not specified',
            production_data_id: productionDataId,
            downtime_id: downtimeIds[0] // Link to the first downtime record
          };
          
          console.log("Creating delay entry with payload:", delayEntryPayload);
          
          const { data: delayEntryData, error: delayEntryError } = await supabase
            .from('delay_entries')
            .insert(delayEntryPayload)
            .select()
            .single();
          
          if (delayEntryError) {
            console.error('Error creating delay entry:', delayEntryError);
            toast.error(`Failed to create delay entry: ${delayEntryError.message}`);
          } else {
            console.log("Created delay entry with ID:", delayEntryData.id);
            
            // If there are multiple downtime records, update them to link back to this delay entry
            if (downtimeIds.length > 1) {
              // Skip the first one as it's already linked
              for (let i = 1; i < downtimeIds.length; i++) {
                const { error: updateError } = await supabase
                  .from('downtime')
                  .update({ delay_entry_id: delayEntryData.id })
                  .eq('id', downtimeIds[i]);
                
                if (updateError) {
                  console.error(`Error updating downtime ${downtimeIds[i]} with delay entry ID:`, updateError);
                }
              }
            }
          }
        } else {
          toast.error("Failed to create any downtime records. Check the console for details.");
        }
      }
      
      toast.success("Successfully saved all delay entries!");
      // Reset form or redirect as needed
      setIsSubmitting(false);
      
    } catch (error) {
      console.error("Error saving delay entries:", error);
      toast.error("An unexpected error occurred while saving delay entries.");
      setIsSubmitting(false);
    }
  };

  // Function to filter delay reasons based on selected type and head
  const getFilteredDelayReasons = (selectedType: string, selectedHead: string) => {
    console.log("Filtering delay reasons with type:", selectedType, "and head:", selectedHead);
    console.log("Available delay reasons:", delayReasons);
    
    if (!selectedType || !selectedHead) {
      console.log("Missing type or head, returning empty array");
      return [];
    }
    
    // Use case-insensitive matching for more flexibility
    const filtered = delayReasons.filter(reason => 
      reason.delaytype?.toLowerCase() === selectedType?.toLowerCase() && 
      reason.delayhead?.toLowerCase() === selectedHead?.toLowerCase()
    );
    
    // If no matches found, return all reasons as a fallback
    if (filtered.length === 0) {
      console.log("No matching delay reasons found, showing all as fallback");
      return delayReasons;
    }
    
    console.log("Filtered delay reasons:", filtered);
    return filtered;
  };

  return (
    <>
      <Card className="mb-3 overflow-hidden border-0 shadow-lg sticky top-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Delay Entries
          </h2>
          <div className="flex gap-2">
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
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 text-white text-xs h-8 px-3 rounded-md shadow-sm transition-all duration-200 flex items-center"
              onClick={saveAllEntriesToDatabase}
              disabled={isSubmitting}
            >
              <Save className="mr-1 h-4 w-4" /> Save to Database {isSubmitting && '...'}
            </Button>
          </div>
        </div>
        
        {/* Debug info */}
        {productionDataId ? (
          <div className="bg-green-100 p-2 text-xs">
            <span className="font-medium">Production Data ID:</span> {productionDataId}
          </div>
        ) : (
          <div className="bg-red-100 p-2 text-xs">
            <span className="font-medium">Warning:</span> No production data ID provided. You must create production data first.
          </div>
        )}
        
        <div className="relative max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 bg-white sticky top-75">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 bg-white z-10">
              <tr>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Start</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">End</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">TPC</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">M.Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">F.Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Actual Prod.</th>
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
                      value={(entry.tpc - entry.gpc) || ''}
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
                    <div className="h-8 text-xs px-2 w-full flex items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                      {(entry.tpc - entry.machineWaste - entry.finalWaste) > 0 ? (entry.tpc - entry.machineWaste - entry.finalWaste) : 0}
                    </div>
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
                        onClick={() => {
                          if (openDowntimeDetails) {
                            openDowntimeDetails(index);
                          } else {
                            handleOpenDowntimeDetails(index);
                          }
                        }}
                        disabled={entry.isSaved && editMode !== index}
                        className={`h-8 text-xs bg-green-500 text-white hover:bg-green-600 border-green-500 blink-green transition-all duration-200 w-full`}
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
        <DialogContent className="max-w-[950px] max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-lg">Downtime Details</DialogTitle>
            <DialogDescription className="text-xs">
              View and manage downtime details for this delay period.
            </DialogDescription>
          </DialogHeader>
          {currentEntryIndex !== null && (
            <>
              {/* Shift Summary */}
              <div className="bg-gray-50 p-3">
                <div className="grid grid-cols-2 gap-3">
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
                        // Reset the form and add a new editable entry
                        resetDowntimeForm();
                        setIsEditingDowntime(false);
                        setCurrentDowntimeIndex(null);
                        
                        // Add a new editable downtime entry to the current entry's downtimes
                        if (currentEntryIndex !== null) {
                          const updatedEntries = [...delayEntries];
                          const now = new Date();
                          const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                          const thirtyMinLater = new Date(now.getTime() + 30 * 60000);
                          const endTime = `${String(thirtyMinLater.getHours()).padStart(2, '0')}:${String(thirtyMinLater.getMinutes()).padStart(2, '0')}`;
                          
                          // Get shift from production line details
                          const shift = updatedEntries[currentEntryIndex].shift || "";
                          
                          updatedEntries[currentEntryIndex] = {
                            ...updatedEntries[currentEntryIndex],
                            downtimes: [
                              ...updatedEntries[currentEntryIndex].downtimes,
                              {
                                dtStart: currentTime,
                                dtEnd: endTime,
                                dtInMin: 30,
                                typeOfDT: "",
                                applicator: "",
                                delayHead: "",
                                delayReason: "",
                                remarks: "",
                                shift: shift,
                                isEditable: true
                              }
                            ]
                          };
                          setDelayEntries(updatedEntries);
                        }
                      }}
                      className="h-8 text-xs bg-green-500 text-white hover:bg-green-600"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Downtime
                    </Button>
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
                  <div className="overflow-y-auto" style={{ maxHeight: "180px" }}>
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0 bg-white z-10">
                        <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <th className="py-2 px-2">Start Time</th>
                          <th className="py-2 px-2">Duration (min)</th>
                          <th className="py-2 px-2">End Time</th>
                          <th className="py-2 px-2">Delay Type</th>
                          <th className="py-2 px-2">Delay Head</th>
                          <th className="py-2 px-2">Delay Description</th>
                          <th className="py-2 px-2 text-right">Actions</th>
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
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="py-2 px-2">
                                  {dt.isEditable ? (
                                    <Input
                                      type="time"
                                      value={dt.dtStart}
                                      onChange={(e) => {
                                        const updatedEntries = [...delayEntries];
                                        updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                          ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                          dtStart: e.target.value
                                        };
                                        setDelayEntries(updatedEntries);
                                      }}
                                      className="h-8 text-xs w-full"
                                    />
                                  ) : (
                                    dt.dtStart
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  {dt.isEditable ? (
                                    <Input
                                      type="number"
                                      value={dt.dtInMin}
                                      onChange={(e) => {
                                        const duration = parseInt(e.target.value);
                                        if (isNaN(duration) || duration <= 0) return;
                                        
                                        // Calculate end time based on start time and duration
                                        const [startHours, startMinutes] = dt.dtStart.split(':').map(Number);
                                        const startTotalMinutes = startHours * 60 + startMinutes;
                                        const endTotalMinutes = startTotalMinutes + duration;
                                        
                                        const endHours = Math.floor(endTotalMinutes / 60) % 24;
                                        const endMinutes = endTotalMinutes % 60;
                                        const endTime = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
                                        
                                        const updatedEntries = [...delayEntries];
                                        updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                          ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                          dtInMin: duration,
                                          dtEnd: endTime
                                        };
                                        setDelayEntries(updatedEntries);
                                      }}
                                      className="h-8 text-xs w-full"
                                      min="1"
                                    />
                                  ) : (
                                    dt.dtInMin
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  {dt.dtEnd}
                                </td>
                                <td className="py-2 px-2">
                                  {dt.isEditable ? (
                                    <Select
                                      value={dt.typeOfDT}
                                      onValueChange={(value) => {
                                        const updatedEntries = [...delayEntries];
                                        updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                          ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                          typeOfDT: value
                                        };
                                        setDelayEntries(updatedEntries);
                                      }}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {dtTypes.map((type) => (
                                          <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    dt.typeOfDT
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  {dt.isEditable ? (
                                    <Select
                                      value={dt.delayHead}
                                      onValueChange={(value) => {
                                        const updatedEntries = [...delayEntries];
                                        updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                          ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                          delayHead: value
                                        };
                                        setDelayEntries(updatedEntries);
                                      }}
                                      disabled={!dt.typeOfDT}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select head" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {dt.typeOfDT && delayHeads.map((head) => (
                                          <SelectItem key={head} value={head}>{head}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    dt.delayHead || "-"
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  {dt.isEditable ? (
                                    <Select
                                      value={dt.delayReason}
                                      onValueChange={(value) => {
                                        const updatedEntries = [...delayEntries];
                                        updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                          ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                          delayReason: value
                                        };
                                        setDelayEntries(updatedEntries);
                                      }}
                                      disabled={!dt.typeOfDT || !dt.delayHead}
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue placeholder="Select reason" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {getFilteredDelayReasons(dt.typeOfDT, dt.delayHead).map((reason) => (
                                          <SelectItem key={reason.id} value={reason.delaydescription}>{reason.delaydescription}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    dt.delayReason || "-"
                                  )}
                                </td>
                                <td className="py-2 px-2">
                                  <div className="flex gap-1 justify-end">
                                    {dt.isEditable ? (
                                      <>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Validate the entry
                                            if (!dt.dtStart || !dt.dtInMin || !dt.typeOfDT || !dt.delayHead || !dt.delayReason) {
                                              toast.error('Please fill in all required fields.');
                                              return;
                                            }

                                            // Save the entry and make it non-editable
                                            const updatedEntries = [...delayEntries];
                                            updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                              ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                              isEditable: false
                                            };
                                            setDelayEntries(updatedEntries);
                                          }}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Save className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => {
                                            // Delete the entry
                                            const updatedEntries = [...delayEntries];
                                            updatedEntries[currentEntryIndex].downtimes = updatedEntries[currentEntryIndex].downtimes.filter((_, i) => i !== originalIndex);
                                            setDelayEntries(updatedEntries);
                                          }}
                                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          // Make the entry editable again
                                          const updatedEntries = [...delayEntries];
                                          updatedEntries[currentEntryIndex].downtimes[originalIndex] = {
                                            ...updatedEntries[currentEntryIndex].downtimes[originalIndex],
                                            isEditable: true
                                          };
                                          setDelayEntries(updatedEntries);
                                        }}
                                        className="h-7 w-7 p-0"
                                      >
                                        <Pencil className="h-3.5 w-3.5" />
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

              {/* Footer with Close Button */}
              <div className="flex justify-end p-4 border-t border-gray-200">
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
        {/* Dialog content remains the same */}
      </Dialog>
    </>
  )
}
