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
import { CalendarIcon, ArrowUpDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define interfaces
interface DelayReason {
  id: string;
  delaytype: string;
  delayhead: string;
  delaydescription: string;
  is_planned: boolean;
  created_at: string;
  count?: number;
  total_duration?: number;
}

interface TypeSummary {
  type: string;
  count: number;
  totalDuration: number;
}

interface HeadSummary {
  head: string;
  count: number;
  totalDuration: number;
}

export default function DelayReasonsAnalysis() {
  const [delayReasons, setDelayReasons] = useState<DelayReason[]>([]);
  const [delayStats, setDelayStats] = useState<DelayReason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [delayTypes, setDelayTypes] = useState<string[]>(['all']);
  const [sortField, setSortField] = useState<string>('count');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [debug, setDebug] = useState<any>(null);

  // Fetch delay reasons and statistics
  useEffect(() => {
    const fetchDelayReasons = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch distinct delay types
        const { data: typeData, error: typeError } = await supabase
          .rpc('get_distinct_delay_types')
          .select();

        if (typeError) {
          console.error('Error fetching delay types:', typeError);
          
          // Fallback if RPC function doesn't exist
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('delay_reasons')
            .select('delaytype');
            
          if (fallbackError) {
            console.error('Error with fallback query:', fallbackError);
          } else if (fallbackData) {
            // Manually get distinct values
            const uniqueTypes = Array.from(new Set(fallbackData.map(item => item.delaytype)));
            setDelayTypes(['all', ...uniqueTypes]);
          }
        } else if (typeData) {
          const types = typeData.map((item: { delaytype: string }) => item.delaytype);
          setDelayTypes(['all', ...types]);
        }

        // Fetch all delay reasons
        const { data: reasonsData, error: reasonsError } = await supabase
          .from('delay_reasons')
          .select('*')
          .order('delaytype', { ascending: true })
          .order('delayhead', { ascending: true });

        if (reasonsError) {
          console.error('Error fetching delay reasons:', reasonsError);
          setError(`Error fetching delay reasons: ${reasonsError.message}`);
          return;
        }

        setDelayReasons(reasonsData || []);

        // Use RPC function or raw SQL to get statistics (count and total duration)
        // This is a query to count downtimes by delay_reason_id and sum their durations
        const { data: statsData, error: statsError } = await supabase
          .from('downtime')
          .select('delay_reason_id, duration')
          .order('delay_reason_id');

        if (statsError) {
          console.error('Error fetching downtime statistics:', statsError);
          setError(`Error fetching statistics: ${statsError.message}`);
          return;
        }

        // Group and process the statistics
        const statsMap = new Map<string, { count: number, totalDuration: number }>();
        
        statsData?.forEach(item => {
          if (!item.delay_reason_id) return;
          
          const existing = statsMap.get(item.delay_reason_id) || { count: 0, totalDuration: 0 };
          
          // Parse duration - could be a string like "X minutes" or a number
          let durationMinutes = 0;
          if (typeof item.duration === 'number') {
            durationMinutes = item.duration;
          } else if (typeof item.duration === 'string') {
            // Parse formats like "X minutes" or HH:MM:SS
            if (item.duration.includes('minute')) {
              const match = item.duration.match(/(\d+)\s*minute/);
              if (match && match[1]) {
                durationMinutes = parseInt(match[1]);
              }
            } else if (item.duration.includes(':')) {
              const parts = item.duration.split(':');
              if (parts.length === 3) {
                durationMinutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
              }
            } else {
              // Try direct parsing
              const parsed = parseFloat(item.duration);
              if (!isNaN(parsed)) {
                durationMinutes = parsed;
              }
            }
          }
          
          statsMap.set(item.delay_reason_id, {
            count: existing.count + 1,
            totalDuration: existing.totalDuration + durationMinutes
          });
        });
        
        // Merge with delay reasons
        const reasonsWithStats = reasonsData?.map(reason => ({
          ...reason,
          count: statsMap.get(reason.id)?.count || 0,
          total_duration: statsMap.get(reason.id)?.totalDuration || 0
        })) || [];

        setDelayStats(reasonsWithStats);
        
        setDebug({
          reasonsData: reasonsData?.length || 0,
          statsData: statsData?.length || 0,
          statsMap: Object.fromEntries(statsMap),
          reasonsWithStats: reasonsWithStats
        });
      } catch (err) {
        console.error('Exception in fetchDelayReasons:', err);
        setError(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDelayReasons();
  }, []);

  // Filter and sort delay stats
  const filteredStats = delayStats
    .filter(reason => filterType === 'all' || reason.delaytype === filterType)
    .sort((a, b) => {
      const fieldA = a[sortField as keyof DelayReason];
      const fieldB = b[sortField as keyof DelayReason];
      
      if (fieldA === undefined || fieldB === undefined) return 0;
      
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortOrder === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortOrder === 'asc' 
          ? fieldA - fieldB 
          : fieldB - fieldA;
      }
      
      return 0;
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to descending for new sort field
    }
  };

  // Calculate summary by type
  const typesSummary: TypeSummary[] = Object.values(
    delayStats.reduce((acc: Record<string, TypeSummary>, reason) => {
      if (!acc[reason.delaytype]) {
        acc[reason.delaytype] = {
          type: reason.delaytype,
          count: 0,
          totalDuration: 0
        };
      }
      acc[reason.delaytype].count += reason.count || 0;
      acc[reason.delaytype].totalDuration += reason.total_duration || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  // Calculate summary by head
  const headsSummary: HeadSummary[] = Object.values(
    delayStats.reduce((acc: Record<string, HeadSummary>, reason) => {
      const key = `${reason.delaytype}-${reason.delayhead}`;
      if (!acc[key]) {
        acc[key] = {
          head: reason.delayhead,
          count: 0,
          totalDuration: 0
        };
      }
      acc[key].count += reason.count || 0;
      acc[key].totalDuration += reason.total_duration || 0;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  // Total counts
  const totals = {
    count: delayStats.reduce((sum, reason) => sum + (reason.count || 0), 0),
    duration: delayStats.reduce((sum, reason) => sum + (reason.total_duration || 0), 0)
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Delay Reasons Analysis</h1>
      
      {/* Debug information */}
      {debug && (
        <div className="mb-4 p-2 bg-yellow-100 rounded">
          <p>Delay reasons: {debug.reasonsData}</p>
          <p>Stats records: {debug.statsData}</p>
        </div>
      )}
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            {delayTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Summary by Type */}
      <h2 className="text-xl font-bold mt-8 mb-4">Summary by Delay Type</h2>
      <div className="rounded-md border overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Total Duration (min)</TableHead>
              <TableHead>% of Incidents</TableHead>
              <TableHead>% of Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : typesSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              typesSummary.map((item) => (
                <TableRow key={item.type}>
                  <TableCell className="font-medium">{item.type}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{item.totalDuration.toFixed(0)}</TableCell>
                  <TableCell>{totals.count ? ((item.count / totals.count) * 100).toFixed(1) : '0'}%</TableCell>
                  <TableCell>{totals.duration ? ((item.totalDuration / totals.duration) * 100).toFixed(1) : '0'}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Summary by Head */}
      <h2 className="text-xl font-bold mt-8 mb-4">Summary by Delay Head</h2>
      <div className="rounded-md border overflow-x-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Head</TableHead>
              <TableHead>Count</TableHead>
              <TableHead>Total Duration (min)</TableHead>
              <TableHead>% of Incidents</TableHead>
              <TableHead>% of Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : headsSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              headsSummary.slice(0, 10).map((item) => (
                <TableRow key={item.head}>
                  <TableCell className="font-medium">{item.head}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>{item.totalDuration.toFixed(0)}</TableCell>
                  <TableCell>{totals.count ? ((item.count / totals.count) * 100).toFixed(1) : '0'}%</TableCell>
                  <TableCell>{totals.duration ? ((item.totalDuration / totals.duration) * 100).toFixed(1) : '0'}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detailed Table */}
      <h2 className="text-xl font-bold mt-8 mb-4">Detailed Delay Reasons</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('delaytype')}>
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('delayhead')}>
                  Head
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('delaydescription')}>
                  Description
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('count')}>
                  Count
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('total_duration')}>
                  Total Duration (min)
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>% of Incidents</TableHead>
              <TableHead>% of Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No delay reasons found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredStats.map((reason) => (
                <TableRow key={reason.id}>
                  <TableCell>{reason.delaytype}</TableCell>
                  <TableCell>{reason.delayhead}</TableCell>
                  <TableCell>{reason.delaydescription}</TableCell>
                  <TableCell>{reason.count || 0}</TableCell>
                  <TableCell>{reason.total_duration?.toFixed(0) || 0}</TableCell>
                  <TableCell>{totals.count ? ((reason.count || 0) / totals.count * 100).toFixed(1) : '0'}%</TableCell>
                  <TableCell>{totals.duration ? ((reason.total_duration || 0) / totals.duration * 100).toFixed(1) : '0'}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
