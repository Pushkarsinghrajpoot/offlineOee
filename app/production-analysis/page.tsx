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
interface ProductionData {
  id: string;
  size: string;
  line_id: string | null;
  product_id: string | null;
  machine_speed_id: string | null;
  operator_id: string | null;
  assistant_operator_id: string | null;
  rm_operator1_id: string | null;
  rm_operator2_id: string | null;
  shift_incharge_id: string | null;
  quality_operator_id: string | null;
  shift_id: string | null;
  created_at: string;
  line?: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    product_description: string;
  };
  shift?: {
    id: string;
    shift_name: string;
  };
  operator?: {
    id: string;
    operator_name: string;
  };
  assistant_operator?: {
    id: string;
    operator_name: string;
  };
  machine_speed?: {
    id: string;
    speed: number;
  };
}

export default function ProductionAnalysis() {
  const [records, setRecords] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date()); // Default to today
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterLine, setFilterLine] = useState<string>('all');
  const [filterShift, setFilterShift] = useState<string>('all');
  const [filterProductSize, setFilterProductSize] = useState<string>('all');
  const [lines, setLines] = useState<{id: string, name: string}[]>([]);
  const [shifts, setShifts] = useState<{id: string, shift_name: string}[]>([]);
  const [productSizes, setProductSizes] = useState<string[]>([]);
  const [debug, setDebug] = useState<any>(null);

  // Fetch lines, shifts, and product sizes for filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        // Fetch lines
        const { data: lineData, error: lineError } = await supabase
          .from('line')
          .select('id, name')
          .order('name');

        if (lineError) {
          console.error('Error fetching lines:', lineError);
        } else if (lineData) {
          setLines(lineData);
        }

        // Fetch shifts
        const { data: shiftData, error: shiftError } = await supabase
          .from('shifts')
          .select('id, shift_name')
          .order('shift_name');

        if (shiftError) {
          console.error('Error fetching shifts:', shiftError);
        } else if (shiftData) {
          setShifts(shiftData);
        }

        // Fetch distinct product sizes
        const { data: sizeData, error: sizeError } = await supabase
          .from('production_data')
          .select('size')
          .order('size');

        if (sizeError) {
          console.error('Error fetching product sizes:', sizeError);
        } else if (sizeData) {
          // Get unique sizes
          const uniqueSizes = Array.from(new Set(sizeData.map(item => item.size)));
          setProductSizes(uniqueSizes);
        }
      } catch (err) {
        console.error('Exception fetching filters:', err);
      }
    };

    fetchFilters();
  }, []);

  // Fetch production records
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching production records with filters:", {
          date: date ? date.toISOString() : 'none',
          sortField,
          sortOrder,
          filterLine,
          filterShift,
          filterProductSize
        });
        
        // Base query
        let query = supabase
          .from('production_data')
          .select(`
            *,
            line:line_id(id, name),
            product:product_id(id, product_description),
            shift:shift_id(id, shift_name),
            operator:operator_id(id, operator_name),
            assistant_operator:assistant_operator_id(id, operator_name),
            machine_speed:machine_speed_id(id, speed)
          `)
          .order(sortField, { ascending: sortOrder === 'asc' });

        // Apply date filter if selected
        if (date) {
          const selectedDate = new Date(date);
          selectedDate.setHours(0, 0, 0, 0);
          const nextDay = new Date(selectedDate);
          nextDay.setDate(nextDay.getDate() + 1);
          
          query = query
            .gte('created_at', selectedDate.toISOString())
            .lt('created_at', nextDay.toISOString());
        }

        // Apply line filter if not "all"
        if (filterLine !== 'all') {
          query = query.eq('line_id', filterLine);
        }

        // Apply shift filter if not "all"
        if (filterShift !== 'all') {
          query = query.eq('shift_id', filterShift);
        }

        // Apply product size filter if not "all"
        if (filterProductSize !== 'all') {
          query = query.eq('size', filterProductSize);
        }

        // Get the data
        const { data, error, status } = await query;
        
        // Debug info
        setDebug({
          data: data?.length || 0,
          error: error,
          status: status,
          query: "From production_data joining related tables"
        });

        if (error) {
          console.error('Error fetching records:', error);
          setError(`Error fetching records: ${error.message}`);
          return;
        }

        if (!data || data.length === 0) {
          console.log('No production records found');
          setRecords([]);
          setLoading(false);
          return;
        }

        console.log('Raw production data:', data);
        setRecords(data);
      } catch (err) {
        console.error('Exception in fetchRecords:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [date, sortField, sortOrder, filterLine, filterShift, filterProductSize]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Calculate summary metrics
  const calculateSummary = () => {
    if (records.length === 0) return { totalRecords: 0, uniqueProducts: 0, uniqueLines: 0 };
    
    const uniqueProducts = new Set(records.map(record => record.product_id)).size;
    const uniqueLines = new Set(records.map(record => record.line_id)).size;
    
    return {
      totalRecords: records.length,
      uniqueProducts,
      uniqueLines
    };
  };

  const summary = calculateSummary();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Production Analysis</h1>
      
      {/* Debug information */}
      {debug && (
        <div className="mb-4 p-2 bg-yellow-100 rounded">
          <p>Query status: {debug.status}</p>
          <p>Records found: {debug.data}</p>
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

        <Select value={filterLine} onValueChange={setFilterLine}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by line" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lines</SelectItem>
            {lines.map((line) => (
              <SelectItem key={line.id} value={line.id}>
                {line.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterShift} onValueChange={setFilterShift}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by shift" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Shifts</SelectItem>
            {shifts.map((shift) => (
              <SelectItem key={shift.id} value={shift.id}>
                {shift.shift_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterProductSize} onValueChange={setFilterProductSize}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {productSizes.map((size) => (
              <SelectItem key={size} value={size}>
                {size}
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
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalRecords}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.uniqueProducts}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Lines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.uniqueLines}
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
                <Button variant="ghost" onClick={() => handleSort('created_at')}>
                  Date & Time
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Line</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('size')}>
                  Size
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead>Assistant</TableHead>
              <TableHead>Machine Speed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No production records found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {record.created_at ? format(new Date(record.created_at), 'PPp') : '-'}
                  </TableCell>
                  <TableCell>{record.line?.name || '-'}</TableCell>
                  <TableCell>{record.product?.product_description || '-'}</TableCell>
                  <TableCell>{record.size || '-'}</TableCell>
                  <TableCell>{record.shift?.shift_name || '-'}</TableCell>
                  <TableCell>{record.operator?.operator_name || '-'}</TableCell>
                  <TableCell>{record.assistant_operator?.operator_name || '-'}</TableCell>
                  <TableCell>{record.machine_speed?.speed || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
