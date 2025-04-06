'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define interfaces based on the actual database schema
interface DelayReason {
  id: string;
  delaytype: string;
  delayhead: string;
  delaydescription: string;
  is_planned: boolean;
}

interface Downtime {
  id: string;
  start_time: string;
  end_time: string;
  duration: string;
  is_planned: boolean;
  delay_reason_id: string;
  delay_reason: DelayReason;
}

interface DelayEntry {
  id: string;
  start_time: string;
  end_time: string;
  tpc: number;
  machine_waste: number;
  final_waste: number;
  gpc: number;
  waste_reason: string;
  downtime_id: string;
  production_data_id: string;
  downtime: Downtime;
}

export default function DowntimeAnalysis() {
  const [records, setRecords] = useState<DelayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date()); // Default to today
  const [sortField, setSortField] = useState<string>('start_time');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [delayTypes, setDelayTypes] = useState<string[]>(['all', 'Planned', 'Unplanned']);
  const [debug, setDebug] = useState<any>(null);

  // Fetch delay types for filter
  useEffect(() => {
    const fetchDelayTypes = async () => {
      try {
        const { data, error } = await supabase
          .from('delay_reasons')
          .select('delaytype')
          .distinct();

        if (error) {
          console.error('Error fetching delay types:', error);
          return;
        }

        if (data && data.length > 0) {
          const types = data.map((item: { delaytype: string }) => item.delaytype);
          setDelayTypes(['all', ...types]);
        }
      } catch (err) {
        console.error('Exception fetching delay types:', err);
      }
    };

    fetchDelayTypes();
  }, []);

  // Fetch downtime records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching records with filters:", {
          date: date ? date.toISOString() : 'none',
          sortField,
          sortOrder,
          filterType
        });
        
        // Base query starts from delay_entries
        let query = supabase
          .from('delay_entries')
          .select(`
            *,
            downtime:downtime_id(
              id, 
              start_time, 
              end_time, 
              duration, 
              is_planned,
              delay_reason:delay_reason_id(
                id, 
                delaytype, 
                delayhead, 
                delaydescription
              )
            )
          `);

        // Get the data first
        const { data, error, status } = await query;
        
        // Debug info
        setDebug({
          data: data,
          error: error,
          status: status,
          query: "From delay_entries joining to downtime and delay_reason"
        });

        if (error) {
          console.error('Error fetching records:', error);
          setError(`Error fetching records: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No records found');
          setRecords([]);
          setLoading(false);
          return;
        }

        console.log('Raw data from Supabase:', data);

        // Filter and process the data
        let filteredData = data.filter(entry => 
          // Filter out entries without downtime data
          entry.downtime !== null
        );

        // Apply date filter if selected
        if (date) {
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          const dateString = selectedDate.toISOString().split('T')[0];
          
          filteredData = filteredData.filter(entry => {
            // Check if downtime.start_time contains the selected date
            if (!entry.downtime || !entry.downtime.start_time) return false;
            return entry.downtime.start_time.includes(dateString);
          });
        }

        // Apply type filter if needed
        if (filterType !== 'all') {
          filteredData = filteredData.filter(entry => 
            entry.downtime?.delay_reason?.delaytype === filterType
          );
        }

        // Sort the data
        filteredData.sort((a, b) => {
          const aValue = a.downtime?.[sortField as keyof Downtime];
          const bValue = b.downtime?.[sortField as keyof Downtime];
          
          if (!aValue) return 1;
          if (!bValue) return -1;
          
          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortOrder === 'asc' 
              ? aValue.localeCompare(bValue)
              : bValue.localeCompare(aValue);
          }
          
          return 0;
        });

        console.log('Filtered data:', filteredData);
        setRecords(filteredData);
      } catch (err) {
        console.error('Exception in fetchRecords:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [date, sortField, sortOrder, filterType]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'number') {
      // If duration is stored as minutes
      const hours = Math.floor(duration / 60);
      const minutes = Math.floor(duration % 60);
      return `${hours}h ${minutes}m`;
    }
    
    // Handle string formats
    if (typeof duration === 'string') {
      // Handle "HH:MM:SS" format
      if (duration.includes(':')) {
        return duration.replace(/(\d+):(\d+):(\d+)/, '$1h $2m $3s');
      }
      
      // Handle "X minutes" format
      if (duration.includes('minute')) {
        const match = duration.match(/(\d+)\s*minute/);
        if (match && match[1]) {
          const minutes = parseInt(match[1]);
          if (minutes >= 60) {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return `${hours}h ${remainingMinutes}m`;
          }
          return `${minutes}m`;
        }
      }
    }
    
    return duration || '-';
  };

  const calculateTotalMinutes = (records: DelayEntry[]) => {
    return records.reduce((acc, record) => {
      try {
        if (!record.downtime?.duration) return acc;
        
        const duration = record.downtime.duration;
        
        // If duration is a number (stored as minutes)
        if (typeof duration === 'number') {
          return acc + duration;
        }
        
        // Handle string formats
        if (typeof duration === 'string') {
          // Check if it's HH:MM:SS format
          if (duration.includes(':')) {
            const parts = duration.split(':');
            if (parts.length === 3) {
              return acc + parseInt(parts[0]) * 60 + parseInt(parts[1]);
            }
          } 
          
          // Check if it's "X minutes" format
          if (duration.includes('minute')) {
            const match = duration.match(/(\d+)\s*minute/);
            if (match && match[1]) {
              return acc + parseInt(match[1]);
            }
          }
          
          // Try to parse as a float directly
          const parsed = parseFloat(duration);
          if (!isNaN(parsed)) {
            return acc + parsed;
          }
        }
        
        return acc;
      } catch (e) {
        console.error('Error calculating duration for record:', record, e);
        return acc;
      }
    }, 0);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Downtime Analysis</h1>
      
      {/* Debug information */}
      {debug && (
        <div className="mb-4 p-2 bg-yellow-100 rounded">
          <p>Query status: {debug.status}</p>
          <p>Records found: {debug.data?.length || 0}</p>
          <p>Error: {debug.error ? JSON.stringify(debug.error) : 'None'}</p>
          <p>Query: {debug.query}</p>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {delayTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {date && (
          <Button variant="outline" onClick={() => setDate(undefined)}>
            Clear Date
          </Button>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Downtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {calculateTotalMinutes(records)} minutes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Incidents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {records.length > 0
                ? Math.round(calculateTotalMinutes(records) / records.length)
                : 0} minutes
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Records Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('start_time')}>
                  Start Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('end_time')}>
                  End Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('duration')}>
                  Duration
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Head</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>TPC</TableHead>
              <TableHead>GPC</TableHead>
              <TableHead>Machine Waste</TableHead>
              <TableHead>Final Waste</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-8">
                  No records found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.downtime?.start_time ? format(new Date(record.downtime.start_time), 'PPp') : '-'}
                  </TableCell>
                  <TableCell>
                    {record.downtime?.end_time ? format(new Date(record.downtime.end_time), 'PPp') : '-'}
                  </TableCell>
                  <TableCell>{record.downtime?.duration ? formatDuration(record.downtime.duration) : '-'}</TableCell>
                  <TableCell>{record.downtime?.delay_reason?.delaytype || '-'}</TableCell>
                  <TableCell>{record.downtime?.delay_reason?.delayhead || '-'}</TableCell>
                  <TableCell>{record.downtime?.delay_reason?.delaydescription || '-'}</TableCell>
                  <TableCell>{record.tpc || '-'}</TableCell>
                  <TableCell>{record.gpc || '-'}</TableCell>
                  <TableCell>{record.machine_waste || '-'}</TableCell>
                  <TableCell>{record.final_waste || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
