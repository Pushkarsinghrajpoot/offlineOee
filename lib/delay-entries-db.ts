import { supabase } from '@/lib/supabaseClient';
import { toast } from 'sonner';

// Define the type for the downtime entry
export interface DowntimeEntry {
  id?: string;
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
}

// Define the type for delay entries
export interface DelayEntry {
  id?: string;
  startTime: string;
  endTime: string;
  tpc: number;
  machineWaste: number;
  finalWaste: number;
  gpc: number;
  wasteReason: string;
  downtimes: DowntimeEntry[];
  isSaved: boolean;
}

// Function to create the necessary tables if they don't exist
export const setupDelayEntryTables = async () => {
  try {
    console.log('Setting up delay entry tables...');
    
    // Create delay_entries table
    let delayEntriesError = null;
    try {
      const response = await supabase.rpc('create_delay_entries_table', {}, {
        count: 'exact',
      });
      delayEntriesError = response.error;
    } catch {
      // If RPC doesn't exist, try direct SQL
      delayEntriesError = new Error('RPC not available');
    }
    
    if (delayEntriesError) {
      console.log('Using direct SQL to create tables...');
      
      // Try direct SQL approach
      try {
        await supabase.from('_exec_sql').select('*').eq('query', `
          CREATE TABLE IF NOT EXISTS delay_entries (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            start_time TIME NOT NULL,
            end_time TIME NOT NULL,
            tpc INTEGER NOT NULL,
            machine_waste INTEGER NOT NULL,
            final_waste INTEGER NOT NULL,
            gpc INTEGER NOT NULL,
            waste_reason TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `);
      } catch (err) {
        console.error('Error creating delay_entries table with SQL:', err);
      }
      
      // Create downtimes table
      try {
        await supabase.from('_exec_sql').select('*').eq('query', `
          CREATE TABLE IF NOT EXISTS downtimes (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            delay_entry_id UUID NOT NULL,
            dt_start TIME NOT NULL,
            dt_end TIME NOT NULL,
            dt_in_min INTEGER NOT NULL,
            type_of_dt TEXT NOT NULL,
            applicator TEXT NOT NULL,
            delay_head TEXT NOT NULL,
            delay_reason TEXT NOT NULL,
            remarks TEXT,
            shift TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            FOREIGN KEY (delay_entry_id) REFERENCES delay_entries(id) ON DELETE CASCADE
          );
          
          CREATE INDEX IF NOT EXISTS idx_downtimes_delay_entry_id ON downtimes(delay_entry_id);
        `);
      } catch (err) {
        console.error('Error creating downtimes table with SQL:', err);
      }
    }
    
    console.log('Delay entry tables setup complete');
  } catch (error) {
    console.error('Error setting up delay entry tables:', error);
  }
};

// Function to save a new delay entry to the database
export const saveDelayEntryToDatabase = async (entry: DelayEntry): Promise<{ success: boolean, id?: string }> => {
  try {
    // First save the delay entry
    const { data: delayEntryData, error: delayEntryError } = await supabase
      .from('delay_entries')
      .insert({
        start_time: entry.startTime,
        end_time: entry.endTime,
        tpc: entry.tpc,
        machine_waste: entry.machineWaste,
        final_waste: entry.finalWaste,
        gpc: entry.gpc,
        waste_reason: entry.wasteReason
      })
      .select();

    if (delayEntryError) {
      console.error('Error saving delay entry:', delayEntryError);
      toast.error('Failed to save delay entry');
      return { success: false };
    }

    const delayEntryId = delayEntryData[0].id;

    // Then save all the downtimes associated with this entry
    if (entry.downtimes.length > 0) {
      const downtimesToInsert = entry.downtimes.map(downtime => ({
        delay_entry_id: delayEntryId,
        dt_start: downtime.dtStart,
        dt_end: downtime.dtEnd,
        dt_in_min: downtime.dtInMin,
        type_of_dt: downtime.typeOfDT,
        applicator: downtime.applicator,
        delay_head: downtime.delayHead,
        delay_reason: downtime.delayReason,
        remarks: downtime.remarks,
        shift: downtime.shift
      }));

      const { error: downtimesError } = await supabase
        .from('downtimes')
        .insert(downtimesToInsert);

      if (downtimesError) {
        console.error('Error saving downtimes:', downtimesError);
        toast.error('Failed to save downtimes');
        return { success: false };
      }
    }
    
    toast.success('Delay entry saved successfully');
    return { success: true, id: delayEntryId };
  } catch (error) {
    console.error('Error in saveDelayEntryToDatabase:', error);
    toast.error('An error occurred while saving');
    return { success: false };
  }
};

// Function to update an existing delay entry
export const updateDelayEntryInDatabase = async (entry: DelayEntry): Promise<boolean> => {
  try {
    if (!entry.id) {
      console.error('Cannot update entry without ID');
      return false;
    }

    // Update the delay entry
    const { error: delayEntryError } = await supabase
      .from('delay_entries')
      .update({
        start_time: entry.startTime,
        end_time: entry.endTime,
        tpc: entry.tpc,
        machine_waste: entry.machineWaste,
        final_waste: entry.finalWaste,
        gpc: entry.gpc,
        waste_reason: entry.wasteReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', entry.id);

    if (delayEntryError) {
      console.error('Error updating delay entry:', delayEntryError);
      toast.error('Failed to update delay entry');
      return false;
    }

    // Delete existing downtimes and insert new ones
    const { error: deleteError } = await supabase
      .from('downtimes')
      .delete()
      .eq('delay_entry_id', entry.id);

    if (deleteError) {
      console.error('Error deleting downtimes:', deleteError);
      toast.error('Failed to update downtimes');
      return false;
    }

    // Insert new downtimes
    if (entry.downtimes.length > 0) {
      const downtimesToInsert = entry.downtimes.map(downtime => ({
        delay_entry_id: entry.id,
        dt_start: downtime.dtStart,
        dt_end: downtime.dtEnd,
        dt_in_min: downtime.dtInMin,
        type_of_dt: downtime.typeOfDT,
        applicator: downtime.applicator,
        delay_head: downtime.delayHead,
        delay_reason: downtime.delayReason,
        remarks: downtime.remarks,
        shift: downtime.shift
      }));

      const { error: downtimesError } = await supabase
        .from('downtimes')
        .insert(downtimesToInsert);

      if (downtimesError) {
        console.error('Error saving downtimes:', downtimesError);
        toast.error('Failed to save downtimes');
        return false;
      }
    }
    
    toast.success('Delay entry updated successfully');
    return true;
  } catch (error) {
    console.error('Error in updateDelayEntryInDatabase:', error);
    toast.error('An error occurred while updating');
    return false;
  }
};

// Function to delete a delay entry from the database
export const deleteDelayEntryFromDatabase = async (entryId: string): Promise<boolean> => {
  try {
    // The downtimes will be automatically deleted due to the ON DELETE CASCADE constraint
    const { error } = await supabase
      .from('delay_entries')
      .delete()
      .eq('id', entryId);

    if (error) {
      console.error('Error deleting delay entry:', error);
      toast.error('Failed to delete delay entry');
      return false;
    }
    
    toast.success('Delay entry deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteDelayEntryFromDatabase:', error);
    toast.error('An error occurred while deleting');
    return false;
  }
};

// Function to fetch all delay entries and their downtimes
export const fetchDelayEntries = async (): Promise<DelayEntry[]> => {
  try {
    // Fetch delay entries
    const { data: delayEntriesData, error: delayEntriesError } = await supabase
      .from('delay_entries')
      .select('*')
      .order('created_at', { ascending: false });

    if (delayEntriesError) {
      console.error('Error fetching delay entries:', delayEntriesError);
      toast.error('Failed to fetch delay entries');
      return [];
    }

    // For each delay entry, fetch its downtimes
    const entriesWithDowntimes = await Promise.all(
      delayEntriesData.map(async (entry) => {
        const { data: downtimesData, error: downtimesError } = await supabase
          .from('downtimes')
          .select('*')
          .eq('delay_entry_id', entry.id);

        if (downtimesError) {
          console.error('Error fetching downtimes:', downtimesError);
          return null;
        }

        // Convert database format to component format
        const downtimes = downtimesData.map(dt => ({
          id: dt.id,
          dtStart: dt.dt_start,
          dtEnd: dt.dt_end,
          dtInMin: dt.dt_in_min,
          typeOfDT: dt.type_of_dt,
          applicator: dt.applicator,
          delayHead: dt.delay_head,
          delayReason: dt.delay_reason,
          remarks: dt.remarks,
          shift: dt.shift,
          isEditable: false
        }));

        return {
          id: entry.id,
          startTime: entry.start_time,
          endTime: entry.end_time,
          tpc: entry.tpc,
          machineWaste: entry.machine_waste,
          finalWaste: entry.final_waste,
          gpc: entry.gpc,
          wasteReason: entry.waste_reason,
          downtimes: downtimes,
          isSaved: true
        };
      })
    );

    // Filter out any null entries (in case of errors)
    const validEntries = entriesWithDowntimes.filter(entry => entry !== null) as DelayEntry[];
    
    return validEntries;
  } catch (error) {
    console.error('Error in fetchDelayEntries:', error);
    toast.error('An error occurred while fetching data');
    return [];
  }
};
