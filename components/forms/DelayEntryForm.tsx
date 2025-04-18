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
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { supabase } from "@/lib/supabaseClient"
import {
  Clock, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Filter, 
  ChevronDown,
  ChevronUp, 
  History,
  RotateCw,
  AlertTriangle, 
  FileText, 
  Activity, 
  ClipboardList, 
  Command, 
  ClipboardX, 
  ClipboardCheck, 
  PackageCheck, 
  PackageOpen, 
  FlaskConical
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
  entryType?: 'same_production' | 'grade_change' | 'trial' | null;
  wasteItems?: { amount: number; reason: string; remarks: string }[];
  productionDataId?: string;
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
  setProductionDataId?: (id: string) => void;
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
  selectedDate,
  setProductionDataId
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
  const [shiftTiming, setShiftTiming] = useState<string>('');
  const [activeProductionId, setActiveProductionId] = useState<string>(productionDataId || '');
  const [showRecentProductions, setShowRecentProductions] = useState(true); 
  const [recentProductions, setRecentProductions] = useState<any[]>([]);
  const [recentDelayEntries, setRecentDelayEntries] = useState<Record<string, any[]>>({});
  const [isLoadingRecent, setIsLoadingRecent] = useState(false);

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

  const [newWasteItem, setNewWasteItem] = useState({ amount: 0, reason: "", remarks: "" });
  const [showWasteDetailsDialog, setShowWasteDetailsDialog] = useState(false);
  const [editingWasteItemIndex, setEditingWasteItemIndex] = useState<number | null>(null);

  // State for entry dialog
  const [showEntryTypeDialog, setShowEntryTypeDialog] = useState(false);
  const [entryType, setEntryType] = useState<'same_production' | 'grade_change' | 'trial' | null>(null);
  const [showProductionDetailsDialog, setShowProductionDetailsDialog] = useState(false);
  const [currentProductionDataId, setCurrentProductionDataId] = useState<string | null>(null);

  // States for new production data
  const [newProductionData, setNewProductionData] = useState<any>({
    line_id: '',
    size: '',
    product_id: '',
    machine_speed_id: '',
    shift_id: '',
    date: new Date().toISOString().split('T')[0],
    operator_id: '',
    assistant_operator_id: '',
    rm_operator1_id: '',
    rm_operator2_id: '',
    shift_incharge_id: '',
    quality_operator_id: ''
  });

  // States for production form options
  const [products, setProducts] = useState<any[]>([]);
  const [machineSpeeds, setMachineSpeeds] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([]);

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
          .select()
          .single();
          
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

      // Fetch products, machine speeds, lines, operators, and shifts for dropdown options
      const [productsResponse, machineSpeedsResponse, linesResponse, operatorsResponse, shiftsResponse] = await Promise.all([
        supabase.from('product_details').select('*').order('product_code'),
        supabase.from('machine_speed').select('*').order('size'),
        supabase.from('line').select('*').order('name'),
        supabase.from('operator').select('*').order('operator_name'),
        supabase.from('shifts').select('*').order('shift_name')
      ]);
      
      if (productsResponse.error) {
        console.error('Error fetching products:', productsResponse.error);
      } else {
        console.log('Products fetched:', productsResponse.data?.length);
        setProducts(productsResponse.data || []);
      }
      
      if (machineSpeedsResponse.error) {
        console.error('Error fetching machine speeds:', machineSpeedsResponse.error);
      } else {
        console.log('Machine speeds fetched:', machineSpeedsResponse.data?.length);
        setMachineSpeeds(machineSpeedsResponse.data || []);
      }
      
      if (linesResponse.error) {
        console.error('Error fetching lines:', linesResponse.error);
      } else {
        console.log('Lines fetched:', linesResponse.data?.length);
        setLines(linesResponse.data || []);
      }
      
      if (operatorsResponse.error) {
        console.error('Error fetching operators:', operatorsResponse.error);
      } else {
        console.log('Operators fetched:', operatorsResponse.data?.length);
        setOperators(operatorsResponse.data || []);
      }
      
      if (shiftsResponse.error) {
        console.error('Error fetching shifts:', shiftsResponse.error);
      } else {
        console.log('Shifts fetched:', shiftsResponse.data?.length);
        setShifts(shiftsResponse.data || []);
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
          
          // Pre-fill new production data with current data
          setNewProductionData({
            line_id: productionData.line_id || '',
            size: productionData.size || '',
            product_id: productionData.product_id || '',
            machine_speed_id: productionData.machine_speed_id || '',
            shift_id: productionData.shift_id || '',
            date: productionData.date || new Date().toISOString().split('T')[0],
            // Pre-fill other fields as needed
            operator_id: productionData.operator_id || '',
            assistant_operator_id: productionData.assistant_operator_id || '',
            rm_operator1_id: productionData.rm_operator1_id || '',
            rm_operator2_id: productionData.rm_operator2_id || '',
            shift_incharge_id: productionData.shift_incharge_id || '',
            quality_operator_id: productionData.quality_operator_id || ''
          });
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

  // Fetch shift timing when production data changes
  useEffect(() => {
    const fetchShiftTiming = async () => {
      if (productionData && productionData.shift_id) {
        try {
          const { data: shiftData, error } = await supabase
            .from('shifts')
            .select('shift_name, shift_timing')
            .eq('id', productionData.shift_id)
            .single();
          
          if (error) {
            console.error('Error fetching shift timing:', error);
          } else if (shiftData) {
            setShiftTiming(`${shiftData.shift_name} (${shiftData.shift_timing})`);
            console.log('Shift timing loaded:', shiftData);
          }
        } catch (error) {
          console.error('Error in fetchShiftTiming:', error);
        }
      }
    };
    
    fetchShiftTiming();
  }, [productionData]);

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
    console.log("Starting to save entries to database. Production ID:", activeProductionId || productionDataId);
    console.log("Delay entries to save:", delayEntries);

    try {
      // Use the active production ID (which will be the new one for grade changes/trials)
      const currentProductionId = activeProductionId || productionDataId;
      
      if (!currentProductionId) {
        toast.error("No production data ID provided.");
        setIsSubmitting(false);
        return;
      }

      // Count entries with downtimes
      const entriesWithDowntimes = delayEntries.filter(entry => 
        entry.downtimes && entry.downtimes.length > 0
      );
      
      if (entriesWithDowntimes.length === 0) {
        toast.error("No downtime entries found to save. Please add downtime details by clicking the 'Downtime' button for each entry.");
        setIsSubmitting(false);
        return;
      }
      
      // Track successful saves
      let successCount = 0;
      
      // Process each delay entry
      for (const entry of entriesWithDowntimes) {
        console.log(`Processing entry with ${entry.downtimes?.length} downtime records`);
        console.log("Full entry data:", entry);
        
        // Determine which production data ID to use - prioritize the entry's ID if it has one
        let targetProductionId = entry.productionDataId || currentProductionId;
        
        console.log(`Using production ID: ${targetProductionId} for this entry`);
        
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
        
        // Prepare waste data arrays
        const finalWasteCount: number[] = [];
        const finalWasteReason: string[] = [];
        const finalWasteRemarks: string[] = []; // Add array for remarks
        
        // Extract data from wasteItems if available
        if (entry.wasteItems && entry.wasteItems.length > 0) {
          entry.wasteItems.forEach(item => {
            finalWasteCount.push(item.amount);
            finalWasteReason.push(item.reason);
            finalWasteRemarks.push(item.remarks || ''); // Add remarks to array
          });
          
          console.log("Final waste data arrays:", {
            finalWasteCount,
            finalWasteReason,
            finalWasteRemarks
          });
        } else {
          // If no waste items but finalWaste exists, use it as a single item
          if (finalWasteValue > 0) {
            finalWasteCount.push(finalWasteValue);
            finalWasteReason.push(entry.wasteReason || 'Not specified');
            finalWasteRemarks.push(''); // Add empty remark for backward compatibility
            
            console.log("Using fallback waste data:", {
              finalWasteCount,
              finalWasteReason,
              finalWasteRemarks
            });
          }
        }
        
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
            
            try {
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
              const durationMinutes = Math.floor(durationMs / (1000 * 60)); // Ensure integer
              
              // Format duration as PostgreSQL interval string
              const durationString = `${durationMinutes} minutes`;
              
              // Prepare the downtime payload with only fields that exist in the database schema
              const downtimePayload = {
                start_time: startDate.toISOString(),
                end_time: endDate.toISOString(),
                duration: durationString, // PostgreSQL interval format
                delay_reason_id: delayReasonId,
                is_planned: downtime.typeOfDT === 'Planned'
              };
              
              // Store remarks in a separate variable in case we need it later
              const remarks = downtime.remarks || '';
              
              console.log("Creating downtime record with payload:", downtimePayload);
              
              const { data: downtimeData, error: downtimeError } = await supabase
                .from('downtime')
                .insert(downtimePayload)
                .select()
                .single();
              
              if (downtimeError) {
                console.error('Error creating downtime record:', downtimeError);
                toast.error(`Failed to create downtime record: ${downtimeError.message}`);
              } else if (downtimeData && downtimeData.id) {
                console.log("Created downtime with ID:", downtimeData.id);
                downtimeIds.push(downtimeData.id);
              } else {
                console.error('Failed to get downtime ID after insert');
              }
            } catch (error) {
              console.error('Error processing downtime entry:', error);
              toast.error(`Error processing downtime: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
        }
        
        // Continue only if we successfully created at least one downtime record
        if (downtimeIds.length > 0) {
          let finalWasteId = null;
          
          // First save waste data to the final_waste table if we have waste items
          if (finalWasteCount.length > 0) {
            try {
              // Check Supabase table structure by logging
              const { data: tableInfo, error: tableError } = await supabase
                .from('final_waste')
                .select('*')
                .limit(1);
              
              if (tableError) {
                console.error('Error checking final_waste table:', tableError);
              } else {
                console.log('Final waste table structure:', tableInfo);
              }
              
              const finalWastePayload = {
                final_waste_count: finalWasteCount,     // Try different column name format
                final_waste_reason: finalWasteReason,   // Try different column name format
                final_waste_remarks: finalWasteRemarks  // Add remarks array to payload
              };
              
              console.log("Creating final waste record with payload:", finalWastePayload);
              
              const { data: finalWasteData, error: finalWasteError } = await supabase
                .from('final_waste')
                .insert(finalWastePayload)
                .select()
                .single();
              
              if (finalWasteError) {
                console.error('Error creating final waste record:', finalWasteError);
                toast.error(`Failed to save waste data: ${finalWasteError.message}`);
                
                // Try alternative column names if first attempt failed
                const alternativeFinalWastePayload = {
                  final_waste_count: finalWasteCount, 
                  final_waste_reason: finalWasteReason,
                  final_waste_remarks: finalWasteRemarks  // Add remarks array to alternative payload
                };
                
                console.log("Trying alternative column names:", alternativeFinalWastePayload);
                
                const { data: altFinalWasteData, error: altFinalWasteError } = await supabase
                  .from('final_waste')
                  .insert(alternativeFinalWastePayload)
                  .select()
                  .single();
                
                if (altFinalWasteError) {
                  console.error('Error creating final waste record with alternative column names:', altFinalWasteError);
                } else if (altFinalWasteData && altFinalWasteData.id) {
                  console.log("Successfully saved waste data with alternative column names, ID:", altFinalWasteData.id);
                  finalWasteId = altFinalWasteData.id;
                }
              } else if (finalWasteData && finalWasteData.id) {
                console.log("Successfully saved waste data with ID:", finalWasteData.id);
                finalWasteId = finalWasteData.id;
              } else {
                console.error('Failed to get final_waste ID after insert');
              }
            } catch (error) {
              console.error('Error saving final waste data:', error);
              toast.error(`Error saving waste data: ${error instanceof Error ? error.message : String(error)}`);
            }
          }
          
          try {
            const delayEntryPayload: any = {
              start_time: entry.startTime,
              end_time: entry.endTime,
              tpc: tpcValue,
              machine_waste: machineWasteValue || (tpcValue - gpcValue),
              final_waste: finalWasteValue,
              gpc: gpcValue,
              waste_reason: entry.wasteReason || 'Not specified',
              production_data_id: targetProductionId, // Use the appropriate production data ID
              downtime_id: downtimeIds[0], // Link to the first downtime record
              created_at: new Date().toISOString()
            };
            
            // Only include final_waste_id if we have one
            if (finalWasteId) {
              delayEntryPayload.final_waste_id = finalWasteId;
            }
            
            console.log("Creating delay entry with payload:", delayEntryPayload);
            
            const { data: delayEntryData, error: delayEntryError } = await supabase
              .from('delay_entries')
              .insert(delayEntryPayload)
              .select()
              .single();
            
            if (delayEntryError) {
              console.error('Error creating delay entry:', delayEntryError);
              toast.error(`Failed to create delay entry: ${delayEntryError.message}`);
            } else if (delayEntryData && delayEntryData.id) {
              console.log("Created delay entry with ID:", delayEntryData.id);
              successCount++;
              
              // Now link all downtime records to this delay entry
              for (const downtimeId of downtimeIds) {
                const { error: updateError } = await supabase
                  .from('downtime')
                  .update({ delay_entry_id: delayEntryData.id })
                  .eq('id', downtimeId);
                
                if (updateError) {
                  console.error(`Error updating downtime ${downtimeId} with delay entry ID:`, updateError);
                } else {
                  console.log(`Successfully linked downtime ${downtimeId} to delay entry ${delayEntryData.id}`);
                }
              }
              
              // If we have a final waste record, link it to this delay entry
              if (finalWasteId) {
                const { error: updateFinalWasteError } = await supabase
                  .from('final_waste')
                  .update({ delay_entry_id: delayEntryData.id })
                  .eq('id', finalWasteId);
                
                if (updateFinalWasteError) {
                  console.error('Error updating final waste with delay entry ID:', updateFinalWasteError);
                } else {
                  console.log(`Successfully linked final waste ${finalWasteId} to delay entry ${delayEntryData.id}`);
                }
              }
            } else {
              console.error('Failed to get delay_entries ID after insert');
              toast.error('Failed to get delay entry ID after creation');
            }
          } catch (error) {
            console.error('Error creating delay entry:', error);
            toast.error(`Error creating delay entry: ${error instanceof Error ? error.message : String(error)}`);
          }
        } else {
          toast.error("Failed to create any downtime records. Check the console for details.");
        }
      }
      
      if (successCount > 0) {
        toast.success(`Successfully saved ${successCount} delay entries!`);
        
        // Refresh the recent productions list to show the newly saved data
        fetchRecentProductions();
      } else {
        toast.error("No delay entries were saved. Check the console for details.");
      }
      
      // Reset form or redirect as needed
      setIsSubmitting(false);
      
    } catch (error) {
      console.error("Error saving delay entries:", error);
      toast.error(`An unexpected error occurred while saving delay entries: ${error instanceof Error ? error.message : String(error)}`);
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

  // Function to handle opening the waste details dialog
  const handleOpenWasteDetails = (index: number) => {
    setCurrentEntryIndex(index);
    setShowWasteDetailsDialog(true);
    
    // Initialize waste items if they don't exist
    if (!delayEntries[index].wasteItems) {
      const updatedEntries = [...delayEntries];
      updatedEntries[index] = {
        ...updatedEntries[index],
        wasteItems: []
      };
      setDelayEntries(updatedEntries);
    }
  };

  // Function to add a waste item
  const addWasteItem = useCallback(() => {
    if (currentEntryIndex === null) return;
    
    if (!newWasteItem.amount || !newWasteItem.reason) {
      toast.error("Please enter amount and reason");
      return;
    }
    
    const updatedEntries = [...delayEntries];
    if (!updatedEntries[currentEntryIndex].wasteItems) {
      updatedEntries[currentEntryIndex].wasteItems = [];
    }
    
    if (editingWasteItemIndex !== null) {
      // Update existing item
      updatedEntries[currentEntryIndex].wasteItems[editingWasteItemIndex] = { ...newWasteItem };
      setEditingWasteItemIndex(null);
      toast.success("Waste item updated");
    } else {
      // Add new item
      updatedEntries[currentEntryIndex].wasteItems.push({ ...newWasteItem });
      toast.success("Waste item added");
    }
    
    // Calculate total final waste
    const totalFinalWaste = updatedEntries[currentEntryIndex].wasteItems.reduce(
      (sum, item) => sum + item.amount, 0
    );
    updatedEntries[currentEntryIndex].finalWaste = totalFinalWaste;
    
    setDelayEntries(updatedEntries);
    setNewWasteItem({ amount: 0, reason: "", remarks: "" });
  }, [currentEntryIndex, delayEntries, newWasteItem, editingWasteItemIndex]);

  // Function to edit a waste item
  const editWasteItem = useCallback((index: number) => {
    if (currentEntryIndex === null) return;
    
    const item = delayEntries[currentEntryIndex].wasteItems?.[index];
    if (item) {
      setNewWasteItem({ 
        amount: item.amount, 
        reason: item.reason,
        remarks: item.remarks || ""
      });
      setEditingWasteItemIndex(index);
    }
  }, [currentEntryIndex, delayEntries]);

  // Function to cancel editing a waste item
  const cancelEditWasteItem = useCallback(() => {
    setNewWasteItem({ amount: 0, reason: "", remarks: "" });
    setEditingWasteItemIndex(null);
  }, []);

  // Function to remove a waste item
  const removeWasteItem = (itemIndex: number) => {
    if (currentEntryIndex === null) return;
    
    const updatedEntries = [...delayEntries];
    const entry = updatedEntries[currentEntryIndex];
    const wasteItems = [...(entry.wasteItems || [])];
    
    wasteItems.splice(itemIndex, 1);
    
    // Calculate total waste
    const totalWaste = wasteItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Update the entry
    updatedEntries[currentEntryIndex] = {
      ...entry,
      wasteItems,
      finalWaste: totalWaste
    };
    
    setDelayEntries(updatedEntries);
  };

  // Function to handle adding a new entry
  const handleAddEntry = (type: 'same_production' | 'grade_change' | 'trial') => {
    setEntryType(type);
    
    if (type === 'same_production') {
      // Add entry with current production ID
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      // Ensure we're using the most current production ID
      const currentId = activeProductionId || productionDataId;
      console.log("Adding entry with current production ID:", currentId);
      
      const newEntry: DelayEntry = {
        startTime: currentTime,
        endTime: "",
        tpc: 0,
        machineWaste: 0,
        finalWaste: 0,
        gpc: 0,
        wasteReason: "",
        downtimes: [],
        isSaved: false,
        entryType: type,
        productionDataId: currentId
      };
      
      setDelayEntries([...delayEntries, newEntry]);
      setEditMode(delayEntries.length); // Set edit mode to the new entry
      setShowEntryTypeDialog(false);
    } else {
      // For grade change or trial, show production details dialog
      setShowProductionDetailsDialog(true);
    }
  };

  // Function to handle production details submission
  const handleProductionDetailsSubmit = async () => {
    // Validate required fields
    if (!newProductionData.product_id) {
      toast.error('Please select a product');
      return;
    }
    
    if (!newProductionData.size) {
      toast.error('Please select a size');
      return;
    }
    
    try {
      // Create a new production record
      const { data: newProduction, error } = await supabase
        .from('production_data')
        .insert([{
          line_id: newProductionData.line_id,
          size: newProductionData.size,
          product_id: newProductionData.product_id,
          machine_speed_id: newProductionData.machine_speed_id,
          operator_id: newProductionData.operator_id,
          assistant_operator_id: newProductionData.assistant_operator_id,
          rm_operator1_id: newProductionData.rm_operator1_id,
          rm_operator2_id: newProductionData.rm_operator2_id,
          shift_incharge_id: newProductionData.shift_incharge_id,
          quality_operator_id: newProductionData.quality_operator_id,
          shift_id: newProductionData.shift_id,
          date: newProductionData.date,
          grade_change: entryType === 'grade_change',
          trial: entryType === 'trial'
        }])
        .select();
        
      if (error) {
        console.error('Error creating new production:', error);
        toast.error('Failed to create new production record');
        return;
      }
      
      if (newProduction && newProduction.length > 0) {
        console.log('New production created:', newProduction[0]);
        
        // Add new entry with new production ID
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
            isSaved: false,
            entryType: entryType,
            productionDataId: newProduction[0].id
          },
          ...delayEntries
        ]);
        
        toast.success(`New ${entryType === 'grade_change' ? 'grade change' : 'trial'} production created successfully`);
      }
    } catch (error) {
      console.error('Error in handleProductionDetailsSubmit:', error);
      toast.error('Failed to create new production');
    } finally {
      setShowProductionDetailsDialog(false);
      setShowEntryTypeDialog(false);
      setEntryType(null);
    }
  };
  
  // Function to get entry badge
  const getEntryTypeBadge = (entry: DelayEntry) => {
    if (entry.entryType === 'grade_change') {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full border border-amber-300">
          Grade Change
        </span>
      );
    } else if (entry.entryType === 'trial') {
      return (
        <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full border border-purple-300">
          Trial
        </span>
      );
    }
    return null;
  };

  // Handle size change for machine speed
  const handleSizeChange = (size: string) => {
    const machineSpeed = machineSpeeds.find(ms => ms.size === size);
    if (machineSpeed) {
      setNewProductionData(prev => ({
        ...prev,
        size,
        machine_speed_id: machineSpeed.id
      }));
    } else {
      setNewProductionData(prev => ({
        ...prev,
        size
      }));
    }
  };

  // Handle entry type selection
  const handleEntryTypeSelect = (type: 'same_production' | 'grade_change' | 'trial' | null) => {
    setEntryType(type);
    
    if (type === 'grade_change' || type === 'trial') {
      // Pre-populate with current production data
      if (productionData) {
        setNewProductionData({
          line_id: productionData.line_id || '',
          size: productionData.size || '',
          product_id: productionData.product_id || '',
          machine_speed_id: productionData.machine_speed_id || '',
          shift_id: productionData.shift_id || '',
          date: productionData.date || new Date().toISOString().split('T')[0],
          operator_id: productionData.operator_id || '',
          assistant_operator_id: productionData.assistant_operator_id || '',
          rm_operator1_id: productionData.rm_operator1_id || '',
          rm_operator2_id: productionData.rm_operator2_id || '',
          shift_incharge_id: productionData.shift_incharge_id || '',
          quality_operator_id: productionData.quality_operator_id || ''
        });
      }
      
      // Show the production details dialog
      setShowProductionDetailsDialog(true);
    } else {
      // For same production, just close the dialog
      setShowEntryTypeDialog(false);
      
      // Add a new empty entry
      handleAddEntry(type);
    }
  };
  
  // Handle creating new production data for grade change or trial
  const handleCreateNewProduction = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate required fields based on entry type
      if (entryType === 'trial') {
        // For trials, validate all required fields
        if (!newProductionData.line_id) {
          toast.error('Please select a production line');
          setIsSubmitting(false);
          return;
        }
        
        if (!newProductionData.shift_id) {
          toast.error('Please select a shift');
          setIsSubmitting(false);
          return;
        }
      }
      
      // For both grade change and trial, validate product and size
      if (!newProductionData.product_id) {
        toast.error('Please select a product');
        setIsSubmitting(false);
        return;
      }
      
      if (!newProductionData.size) {
        toast.error('Please select a size');
        setIsSubmitting(false);
        return;
      }
      
      // Create a new production data record with the correct column names
      const newProdRecord = {
        ...newProductionData,
        grade_change: entryType === 'grade_change',
        trial: entryType === 'trial',
        created_at: new Date().toISOString()
      };
      
      console.log("Creating new production data for", entryType, ":", newProdRecord);
      
      const { data: newProdData, error } = await supabase
        .from('production_data')
        .insert(newProdRecord)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating new production record:', error);
        toast.error(`Failed to create new production: ${error.message}`);
        setIsSubmitting(false);
        return;
      }
      
      console.log('Created new production data with ID:', newProdData.id);
      toast.success(`Created new ${entryType} production record`);
      
      // Store the new production data ID
      const newProductionDataId = newProdData.id;
      
      // Set the production data state to reflect the new production
      setProductionData(newProdData);
      
      // Reset all delay entries and create a new one with the new production ID
      // This is critical - we want to start fresh with the new production
      setDelayEntries([]);
      
      // Close dialogs
      setShowProductionDetailsDialog(false);
      setShowEntryTypeDialog(false);
      
      // Add a new empty entry with the new production ID
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const newEntry: DelayEntry = {
        startTime: currentTime,
        endTime: "",
        tpc: 0,
        machineWaste: 0,
        finalWaste: 0,
        gpc: 0,
        wasteReason: "",
        downtimes: [],
        isSaved: false,
        entryType: entryType,
        productionDataId: newProductionDataId
      };
      
      setDelayEntries([newEntry]);
      setEditMode(0); // Set edit mode to the first entry
      
      // Update the active production ID in the UI
      setActiveProductionId(newProductionDataId);
      
      // Update the current production data ID that will be used for all future operations
      if (setProductionDataId) {
        setProductionDataId(newProductionDataId);
      }
      
      // Also update the state variable we use internally
      setCurrentProductionDataId(newProductionDataId);
      
      // Call fetchRecentProductions to update the recent productions list
      fetchRecentProductions();
      
      setIsSubmitting(false);
      
      // Show success notification with the new production ID
      toast.success(`Switched to new production ID: ${newProductionDataId}`);
    } catch (error) {
      console.error('Error in handleCreateNewProduction:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
      setIsSubmitting(false);
    }
  };

  // Function to open entry type selection dialog before adding a new entry
  const handleNewEntryClick = () => {
    setEntryType(null);
    setShowEntryTypeDialog(true);
  };

  // Update active production ID when productionDataId changes
  useEffect(() => {
    if (productionDataId) {
      console.log("Production data ID from props changed to:", productionDataId);
      setActiveProductionId(productionDataId);
    }
  }, [productionDataId]);

  // Add a debugging effect to log when activeProductionId changes
  useEffect(() => {
    console.log("Active production ID updated:", activeProductionId);
    
    // When active production ID changes, fetch its details to update the productionData state
    if (activeProductionId) {
      const fetchProductionData = async () => {
        const { data, error } = await supabase
          .from('production_data')
          .select('*')
          .eq('id', activeProductionId)
          .single();
          
        if (error) {
          console.error('Error fetching production data details:', error);
        } else if (data) {
          console.log('Fetched production data details:', data);
          setProductionData(data);
        }
      };
      
      fetchProductionData();
    }
  }, [activeProductionId]);

  // Function to fetch recent productions and their delay entries
  const fetchRecentProductions = async () => {
    setIsLoadingRecent(true);
    try {
      // Fetch the 5 most recent production records
      const { data: productions, error } = await supabase
        .from('production_data')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent productions:', error);
        toast.error(`Failed to fetch recent productions: ${error.message}`);
        setIsLoadingRecent(false);
        return;
      }

      setRecentProductions(productions || []);
      
      // Fetch delay entries for each production
      const delayEntriesByProduction: Record<string, any[]> = {};
      
      for (const production of productions || []) {
        const { data: entries, error: entriesError } = await supabase
          .from('delay_entries')
          .select(`
            *,
            downtime:downtime_id(
              *,
              delay_reason:delay_reason_id(*)
            )
          `)
          .eq('production_data_id', production.id);
          
        if (entriesError) {
          console.error(`Error fetching delay entries for production ${production.id}:`, entriesError);
        } else {
          delayEntriesByProduction[production.id] = entries || [];
        }
      }
      
      setRecentDelayEntries(delayEntriesByProduction);
    } catch (error) {
      console.error('Error in fetchRecentProductions:', error);
      toast.error(`An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoadingRecent(false);
    }
  };

  // Toggle the recent productions section
  const toggleRecentProductions = () => {
    const newState = !showRecentProductions;
    setShowRecentProductions(newState);
    
    // Fetch data when showing the section
    if (newState && recentProductions.length === 0) {
      fetchRecentProductions();
    }
  };

  // Load the recent productions data when the component mounts
  useEffect(() => {
    fetchRecentProductions();
  }, []);

  return (
    <>
      <Card className="mb-3 overflow-hidden border-0 shadow-lg sticky top-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Production Data
              </h2>
              
              {/* Production ID indicator - cleaner, more compact format */}
              {activeProductionId && (
                <div className="mt-1.5 flex items-center flex-wrap gap-2">
                  <div className="bg-white/20 py-0.5 px-2 rounded inline-flex items-center text-white text-xs">
                    <span className="font-medium mr-1">ID:</span>
                    <span className="font-mono">{activeProductionId.slice(0, 8)}...</span>
                  </div>
                  {productionData?.grade_change && (
                    <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs font-medium">Grade Change</span>
                  )}
                  {productionData?.trial && (
                    <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md text-xs font-medium">Trial</span>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs h-8 px-3 rounded-md shadow-sm transition-all duration-200 flex items-center"
                onClick={() => setShowEntryTypeDialog(true)}
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
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Type</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">TPC</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">GPC</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Final Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Machine Waste</th>
                <th className="py-2 px-2 text-xs font-semibold text-gray-600 text-left border-b border-gray-200">Actual Prod.</th>
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
                    {getEntryTypeBadge(entry)}
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      min={0}
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
                      min={0}
                      value={entry.gpc?.toString() || ''}
                      onChange={(e) => handleEntryChange(index, 'gpc', Number(e.target.value))}
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="GPC"
                      disabled={entry.isSaved && editMode !== index}
                    />
                  </td>
                  <td className="p-1">
                    <div className="relative w-full">
                      <Input
                        type="number"
                        value={entry.finalWaste?.toString() || ''}
                        readOnly
                        className="h-8 text-xs w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        placeholder="Waste"
                        disabled={entry.isSaved && editMode !== index}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-8 w-8 p-0 text-gray-500 hover:text-blue-500"
                        onClick={() => handleOpenWasteDetails(index)}
                        disabled={entry.isSaved && editMode !== index}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                  <td className="p-1">
                    <Input
                      type="number"
                      min={0}
                      value={(entry.tpc - entry.gpc) || ''}
                      readOnly
                      className="h-8 text-xs px-2 w-full rounded-md border-gray-200 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="Machine Waste"
                      disabled={true}
                    />
                  </td>
                  <td className="p-1">
                    <div className="h-8 text-xs px-2 w-full flex items-center justify-center rounded-md border border-gray-200 bg-gray-50">
                      {(entry.tpc - (entry.tpc - entry.gpc) - entry.finalWaste) > 0 ? (entry.tpc - (entry.tpc - entry.gpc) - entry.finalWaste) : 0}
                    </div>
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
                            <Edit className="h-3.5 w-3.5" />
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
      
      {/* Recent Productions Section */}
      <Card className="mb-3 overflow-hidden border-0 shadow-lg">
        <div 
          className="bg-slate-50 p-3 flex justify-between items-center cursor-pointer"
          onClick={toggleRecentProductions}
        >
          <h2 className="text-lg font-semibold text-slate-700 flex items-center">
            <History className="h-5 w-5 mr-2 text-slate-500" />
            Recent Productions
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-500"
          >
            {showRecentProductions ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        {showRecentProductions && (
          <div className="p-4">
            {isLoadingRecent ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : recentProductions.length > 0 ? (
              <div className="space-y-6">
                {recentProductions.map((production) => (
                  <div key={production.id} className="border rounded-lg overflow-hidden">
                    <div className="bg-slate-100 p-3">
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded border">
                              {production.id.slice(0, 8)}
                            </div>
                            <h3 className="font-medium text-slate-800">
                              {production.size} - {production.product_id ? 'Product ID: ' + production.product_id.slice(0, 8) : 'No Product'}
                            </h3>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(production.created_at).toLocaleDateString()} {new Date(production.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {production.grade_change && (
                            <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md text-xs">Grade Change</span>
                          )}
                          {production.trial && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md text-xs">Trial</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm mb-2">
                        <span className="font-medium">Size:</span> {production.size}
                      </div>
                      {/* Delay entries for this production */}
                      {recentDelayEntries[production.id]?.length > 0 ? (
                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-2">Delay Entries:</h4>
                          <div className="border rounded overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TPC</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPC</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waste</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Downtime</th>
                                </tr>
                              </thead>
                              <tbody className="bg-white divide-y divide-gray-200">
                                {recentDelayEntries[production.id].map((entry) => (
                                  <tr key={entry.id}>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                                      {entry.start_time && entry.start_time.includes('T') 
                                        ? new Date(entry.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                        : entry.start_time
                                      } - 
                                      {entry.end_time && entry.end_time.includes('T')
                                        ? new Date(entry.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
                                        : entry.end_time
                                      }
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.tpc}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.gpc}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">{entry.final_waste}</td>
                                    <td className="px-3 py-2 whitespace-nowrap text-xs">
                                      {entry.downtime?.delay_reason?.delaydescription || 'N/A'}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">No delay entries for this production</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recent productions found
              </div>
            )}
            <div className="mt-4 flex justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchRecentProductions}
                disabled={isLoadingRecent}
              >
                <RotateCw className="h-4 w-4 mr-1" /> Refresh Data
              </Button>
            </div>
          </div>
        )}
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
                  <div>
                    <h3 className="text-lg font-bold">Downtime Entries</h3>
                    {shiftTiming && (
                      <p className="text-sm text-gray-500">Shift: {shiftTiming}</p>
                    )}
                  </div>
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
                          
                          // Get shift from production line details
                          const shift = updatedEntries[currentEntryIndex].shift || "";
                          
                          updatedEntries[currentEntryIndex] = {
                            ...updatedEntries[currentEntryIndex],
                            downtimes: [
                              ...updatedEntries[currentEntryIndex].downtimes,
                              {
                                dtStart: currentTime,
                                dtEnd: "",
                                dtInMin: 0,
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
                                        <Edit className="h-3.5 w-3.5" />
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
      
      {/* Entry Type Dialog */}
      <Dialog open={showEntryTypeDialog} onOpenChange={setShowEntryTypeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Entry Type</DialogTitle>
            <DialogDescription>
              Choose the type of production entry you want to create
            </DialogDescription>
          </DialogHeader>
            
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button 
              variant="outline" 
              className="justify-start p-6 h-auto" 
              onClick={() => handleEntryTypeSelect('same_production')}
            >
              <PackageCheck className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Same Production</span>
                <span className="text-xs text-muted-foreground">Continue with the current production setup</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start p-6 h-auto" 
              onClick={() => handleEntryTypeSelect('grade_change')}
            >
              <PackageOpen className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Grade Change</span>
                <span className="text-xs text-muted-foreground">Change to a different product grade or size</span>
              </div>
            </Button>
            
            <Button 
              variant="outline" 
              className="justify-start p-6 h-auto" 
              onClick={() => handleEntryTypeSelect('trial')}
            >
              <FlaskConical className="mr-2 h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="font-medium">Trial Production</span>
                <span className="text-xs text-muted-foreground">Set up for a trial or test run</span>
              </div>
            </Button>
          </div>
            
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEntryTypeDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Production Details Dialog for Grade Change or Trial */}
      {showProductionDetailsDialog && (
        <Dialog open={showProductionDetailsDialog} onOpenChange={setShowProductionDetailsDialog}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {entryType === 'grade_change' ? 'Grade Change Details' : 'Trial Production Details'}
              </DialogTitle>
              <DialogDescription>
                {entryType === 'grade_change'
                  ? 'Update product and size for this grade change. All other settings will remain the same.'
                  : 'Enter all details for the trial production.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              {/* Product */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="product_id" className="font-semibold">Product <span className="text-red-500">*</span></Label>
                <Select
                  value={newProductionData.product_id}
                  onValueChange={(value) => setNewProductionData({...newProductionData, product_id: value})}
                >
                  <SelectTrigger id="product_id" className="h-10">
                    <SelectValue placeholder="Select product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.product_name || product.product_code} {product.product_code ? `(${product.product_code})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Required for grade change</p>
              </div>
              
              {/* Size */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="size" className="font-semibold">Size <span className="text-red-500">*</span></Label>
                <Select
                  value={newProductionData.size}
                  onValueChange={(value) => {
                    setNewProductionData({...newProductionData, size: value});
                    
                    // Find matching machine speed and set it
                    const matchingSpeed = machineSpeeds.find(ms => ms.size === value);
                    if (matchingSpeed) {
                      setNewProductionData(prev => ({...prev, machine_speed_id: matchingSpeed.id}));
                    }
                  }}
                >
                  <SelectTrigger id="size" className="h-10">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {machineSpeeds.map((speed) => (
                      <SelectItem key={speed.id} value={speed.size}>
                        {speed.size} {speed.speed ? `(${speed.speed} m/min)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Required for grade change</p>
              </div>
              
              {/* Fields ONLY for Trial - show all production data fields */}
              {entryType === 'trial' && (
                <>
                  {/* Line */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="line_id">Production Line <span className="text-red-500">*</span></Label>
                    <Select
                      value={newProductionData.line_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, line_id: value})}
                    >
                      <SelectTrigger id="line_id">
                        <SelectValue placeholder="Select line" />
                      </SelectTrigger>
                      <SelectContent>
                        {lines.map((line) => (
                          <SelectItem key={line.id} value={line.id}>
                            {line.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Shift */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="shift_id">Shift <span className="text-red-500">*</span></Label>
                    <Select
                      value={newProductionData.shift_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, shift_id: value})}
                    >
                      <SelectTrigger id="shift_id">
                        <SelectValue placeholder="Select shift" />
                      </SelectTrigger>
                      <SelectContent>
                        {shifts.map((shift) => (
                          <SelectItem key={shift.id} value={shift.id}>
                            {shift.shift_name} ({shift.shift_timing})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Machine Speed */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="machine_speed_id">Machine Speed</Label>
                    <Select
                      value={newProductionData.machine_speed_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, machine_speed_id: value})}
                    >
                      <SelectTrigger id="machine_speed_id">
                        <SelectValue placeholder="Select machine speed" />
                      </SelectTrigger>
                      <SelectContent>
                        {machineSpeeds.map((speed) => (
                          <SelectItem key={speed.id} value={speed.id}>
                            {speed.size} - {speed.speed}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Operator */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="operator_id">Operator</Label>
                    <Select
                      value={newProductionData.operator_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, operator_id: value})}
                    >
                      <SelectTrigger id="operator_id">
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Assistant Operator */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="assistant_operator_id">Assistant Operator</Label>
                    <Select
                      value={newProductionData.assistant_operator_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, assistant_operator_id: value})}
                    >
                      <SelectTrigger id="assistant_operator_id">
                        <SelectValue placeholder="Select assistant operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* RM Operator 1 */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rm_operator1_id">RM Operator 1</Label>
                    <Select
                      value={newProductionData.rm_operator1_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, rm_operator1_id: value})}
                    >
                      <SelectTrigger id="rm_operator1_id">
                        <SelectValue placeholder="Select RM operator 1" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* RM Operator 2 */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="rm_operator2_id">RM Operator 2</Label>
                    <Select
                      value={newProductionData.rm_operator2_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, rm_operator2_id: value})}
                    >
                      <SelectTrigger id="rm_operator2_id">
                        <SelectValue placeholder="Select RM operator 2" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Shift Incharge */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="shift_incharge_id">Shift Incharge</Label>
                    <Select
                      value={newProductionData.shift_incharge_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, shift_incharge_id: value})}
                    >
                      <SelectTrigger id="shift_incharge_id">
                        <SelectValue placeholder="Select shift incharge" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Quality Operator */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="quality_operator_id">Quality Operator</Label>
                    <Select
                      value={newProductionData.quality_operator_id}
                      onValueChange={(value) => setNewProductionData({...newProductionData, quality_operator_id: value})}
                    >
                      <SelectTrigger id="quality_operator_id">
                        <SelectValue placeholder="Select quality operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {operators.map((operator) => (
                          <SelectItem key={operator.id} value={operator.id}>
                            {operator.operator_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Date */}
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      type="date"
                      value={newProductionData.date ? new Date(newProductionData.date).toISOString().split('T')[0] : ''}
                      onChange={(e) => setNewProductionData({...newProductionData, date: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowProductionDetailsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNewProduction} disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create New Production'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Waste Details Dialog */}
      {showWasteDetailsDialog && currentEntryIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Waste Breakdown</h3>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowWasteDetailsDialog(false);
                  setEditingWasteItemIndex(null);
                  setNewWasteItem({ amount: 0, reason: "", remarks: "" });
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold">
                  Total Waste: {delayEntries[currentEntryIndex].finalWaste || 0}
                </p>
              </div>
              
              <div className="grid grid-cols-12 gap-2 mb-2">
                <div className="col-span-3">
                  <Input
                    type="number"
                    value={newWasteItem.amount || ''}
                    onChange={(e) => setNewWasteItem({ ...newWasteItem, amount: Number(e.target.value) })}
                    className="w-full h-8 text-xs"
                    placeholder="Amount"
                  />
                </div>
                <div className="col-span-4">
                  <Select 
                    value={newWasteItem.reason}
                    onValueChange={(value) => setNewWasteItem({ ...newWasteItem, reason: value })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select reason" />
                    </SelectTrigger>
                    <SelectContent>
                      {machineWasteReasons.map((reason) => (
                        <SelectItem key={reason} value={reason}>
                          {reason}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-3">
                  <Input
                    type="text"
                    value={newWasteItem.remarks || ''}
                    onChange={(e) => setNewWasteItem({ ...newWasteItem, remarks: e.target.value })}
                    className="w-full h-8 text-xs"
                    placeholder="Remarks"
                  />
                </div>
                <div className="col-span-2 flex gap-1">
                  {editingWasteItemIndex !== null ? (
                    <>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-full bg-blue-100 hover:bg-blue-200 border-blue-200"
                        onClick={addWasteItem}
                      >
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-full"
                        onClick={cancelEditWasteItem}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full h-8 bg-green-100 hover:bg-green-200 border-green-200"
                      onClick={addWasteItem}
                    >
                      Add
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                {delayEntries[currentEntryIndex].wasteItems?.length > 0 ? (
                  <table className="w-full border-collapse text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="p-1 text-left border border-gray-200">Amount</th>
                        <th className="p-1 text-left border border-gray-200">Reason</th>
                        <th className="p-1 text-left border border-gray-200">Remarks</th>
                        <th className="p-1 text-center border border-gray-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {delayEntries[currentEntryIndex].wasteItems?.map((item, idx) => (
                        <tr key={idx} className="border-b">
                          <td className="p-1 border border-gray-200">{item.amount}</td>
                          <td className="p-1 border border-gray-200">{item.reason}</td>
                          <td className="p-1 border border-gray-200">{item.remarks || "-"}</td>
                          <td className="p-1 border border-gray-200">
                            <div className="flex justify-center gap-1">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-100"
                                onClick={() => editWasteItem(idx)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
                                onClick={() => removeWasteItem(idx)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No waste items added yet.
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setShowWasteDetailsDialog(false);
                    setEditingWasteItemIndex(null);
                    setNewWasteItem({ amount: 0, reason: "", remarks: "" });
                  }}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Planned Shutdown Dialog */}
      <Dialog open={showPlannedShutdownDialog} onOpenChange={setShowPlannedShutdownDialog}>
        {/* Dialog content remains the same */}
      </Dialog>
    </>
  )
}
