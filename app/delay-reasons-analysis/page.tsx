'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { CalendarIcon, ArrowUpDown, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

interface DelayTrend {
  date: string;
  count: number;
  duration: number;
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
  const [selectedReason, setSelectedReason] = useState<DelayReason | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [trends, setTrends] = useState<Record<string, DelayTrend[]>>({});

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

        if (reasonsError) throw reasonsError;

        // Fetch downtime data with dates for trends
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { data: downtimeData, error: downtimeError } = await supabase
          .from('downtime')
          .select('delay_reason_id, duration, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        if (downtimeError) throw downtimeError;

        // Process downtime data for trends
        const trendData: Record<string, DelayTrend[]> = {};
        downtimeData.forEach(item => {
          if (!item.delay_reason_id) return;
          
          const date = new Date(item.created_at).toISOString().split('T')[0];
          if (!trendData[item.delay_reason_id]) {
            trendData[item.delay_reason_id] = [];
          }
          
          const existingTrend = trendData[item.delay_reason_id].find(t => t.date === date);
          if (existingTrend) {
            existingTrend.count++;
            existingTrend.duration += parseFloat(item.duration) || 0;
          } else {
            trendData[item.delay_reason_id].push({
              date,
              count: 1,
              duration: parseFloat(item.duration) || 0
            });
          }
        });
        
        setTrends(trendData);

        // Process statistics
        const statsMap = new Map<string, { count: number, totalDuration: number }>();
        
        downtimeData.forEach(item => {
          if (!item.delay_reason_id) return;
          
          const existing = statsMap.get(item.delay_reason_id) || { count: 0, totalDuration: 0 };
          const duration = parseFloat(item.duration) || 0;
          
          statsMap.set(item.delay_reason_id, {
            count: existing.count + 1,
            totalDuration: existing.totalDuration + duration
          });
        });
        
        // Merge with delay reasons
        const reasonsWithStats = reasonsData?.map(reason => ({
          ...reason,
          count: statsMap.get(reason.id)?.count || 0,
          total_duration: statsMap.get(reason.id)?.totalDuration || 0
        })) || [];

        // Only keep reasons with non-zero contributions
        const activeReasons = reasonsWithStats.filter(
          reason => (reason.count || 0) > 0 || (reason.total_duration || 0) > 0
        );

        setDelayStats(activeReasons);
        setDelayReasons(reasonsData || []);

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

  const renderTrendChart = (reasonId: string) => {
    const reasonTrends = trends[reasonId] || [];
    if (reasonTrends.length === 0) return null;

    const dates = reasonTrends.map(t => t.date);
    const counts = reasonTrends.map(t => t.count);
    const durations = reasonTrends.map(t => t.duration);

    const options = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 2,
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            boxWidth: 15,
            padding: 8,
          },
        },
        title: {
          display: true,
          text: '30-Day Trend',
          padding: {
            top: 4,
            bottom: 4
          },
          font: {
            size: 14
          }
        },
      },
      scales: {
        x: {
          ticks: {
            maxRotation: 45,
            minRotation: 45
          }
        }
      }
    };

    const data = {
      labels: dates,
      datasets: [
        {
          label: 'Count',
          data: counts,
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Duration (min)',
          data: durations,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
        },
      ],
    };

    return <Line options={options} data={data} />;
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Delay Reasons Analysis</h1>
      
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
              <TableHead>Trend</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    <span className="ml-2">Loading...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : typesSummary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              typesSummary
                .filter(item => item.count > 0)
                .map((item) => (
                  <TableRow key={item.type} className="cursor-pointer hover:bg-gray-50">
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.totalDuration.toFixed(0)}</TableCell>
                    <TableCell>{totals.count ? ((item.count / totals.count) * 100).toFixed(1) : '0'}%</TableCell>
                    <TableCell>{totals.duration ? ((item.totalDuration / totals.duration) * 100).toFixed(1) : '0'}%</TableCell>
                    <TableCell>
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                    </TableCell>
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
              <TableHead>Details</TableHead>
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
            ) : filteredStats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No delay reasons found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredStats
                .filter(reason => (reason.count || 0) > 0)
                .map((reason) => (
                  <TableRow key={reason.id} className="cursor-pointer hover:bg-gray-50">
                    <TableCell>{reason.delaytype}</TableCell>
                    <TableCell>{reason.delayhead}</TableCell>
                    <TableCell>{reason.delaydescription}</TableCell>
                    <TableCell>{reason.count || 0}</TableCell>
                    <TableCell>{reason.total_duration?.toFixed(0) || 0}</TableCell>
                    <TableCell>{totals.count ? ((reason.count || 0) / totals.count * 100).toFixed(1) : '0'}%</TableCell>
                    <TableCell>{totals.duration ? ((reason.total_duration || 0) / totals.duration * 100).toFixed(1) : '0'}%</TableCell>
                    <TableCell>
                      <Button variant="ghost" onClick={() => {
                        setSelectedReason(reason);
                        setShowDialog(true);
                      }}>
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Detail Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader className="pb-2">
            <DialogTitle>Delay Reason Details</DialogTitle>
          </DialogHeader>
          {selectedReason && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Card className="h-fit">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="font-medium">Type</dt>
                        <dd>{selectedReason.delaytype}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Head</dt>
                        <dd>{selectedReason.delayhead}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Description</dt>
                        <dd>{selectedReason.delaydescription}</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
                <Card className="h-fit">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <dl className="space-y-1 text-sm">
                      <div>
                        <dt className="font-medium">Total Occurrences</dt>
                        <dd>{selectedReason.count || 0}</dd>
                      </div>
                      <div>
                        <dt className="font-medium">Total Duration</dt>
                        <dd>{selectedReason.total_duration?.toFixed(0) || 0} minutes</dd>
                      </div>
                      <div>
                        <dt className="font-medium">% of Total Incidents</dt>
                        <dd>{totals.count ? ((selectedReason.count || 0) / totals.count * 100).toFixed(1) : '0'}%</dd>
                      </div>
                      <div>
                        <dt className="font-medium">% of Total Time</dt>
                        <dd>{totals.duration ? ((selectedReason.total_duration || 0) / totals.duration * 100).toFixed(1) : '0'}%</dd>
                      </div>
                    </dl>
                  </CardContent>
                </Card>
              </div>
              <Card className="h-fit">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">30-Day Trend</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="h-[200px]">
                    {renderTrendChart(selectedReason.id)}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
