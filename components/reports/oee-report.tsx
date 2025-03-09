"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface OEEReportProps {
  line?: string
  startDate?: string
  endDate?: string
  shift?: string
  reportType?: string
}

const data = [
  { label: "Total Time", value: 40.0, type: "total", cumulative: 40.0 },
  { label: "Unscheduled", value: -7.0, type: "loss", cumulative: 33.0 },
  { label: "Available Time", value: 33.0, type: "subtotal", cumulative: 33.0 },
  { label: "Breakdown >15 minutes", value: -5.8, type: "loss", cumulative: 27.2 },
  { label: "External Cause", value: -3.3, type: "loss", cumulative: 23.9 },
  { label: "Preventive Maintenance", value: 0, type: "neutral", cumulative: 23.9 },
  { label: "Changeovers", value: 0, type: "neutral", cumulative: 23.9 },
  { label: "Operating Time", value: 23.9, type: "subtotal", cumulative: 23.9 },
  { label: "Minor Stops", value: 0, type: "neutral", cumulative: 23.9 },
  { label: "Speed Loss", value: -5.2, type: "loss", cumulative: 18.7 },
  { label: "Unknown", value: 0, type: "neutral", cumulative: 18.7 },
  { label: "Running Time", value: 18.7, type: "subtotal", cumulative: 18.7 },
  { label: "Waste", value: -6.5, type: "loss", cumulative: 12.2 },
  { label: "-", value: 0, type: "neutral", cumulative: 12.2 },
  { label: "Effective Time", value: 12.1, type: "subtotal", cumulative: 12.1 }
];

export function OEEReport({ line, startDate, endDate, shift, reportType }: OEEReportProps) {
  return (
    <Card className="border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="border-b bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            OEE Analysis
          </CardTitle>
          <div className="flex gap-4">
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">OEE1 = </span>
              <span className="font-bold text-blue-600">30.3%</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">OEE2 = </span>
              <span className="font-bold text-purple-600">36.7%</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full h-[500px] relative bg-gradient-to-b from-gray-50/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 rounded-lg shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2563EB" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.8" />
              </linearGradient>
              <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DC2626" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#EF4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#FCA5A5" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="subtotalGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.8" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.15"/>
              </filter>
            </defs>

            <g transform="translate(80, 40)">
              {/* Background grid */}
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map((tick, i) => {
                const y = 380 * (1 - tick / 45);
                return (
                  <g key={tick}>
                    <line 
                      x1="0" 
                      y1={y} 
                      x2="860" 
                      y2={y} 
                      stroke={i === 0 ? "#64748B" : "#CBD5E1"} 
                      strokeWidth={i === 0 ? 1 : 0.5} 
                      strokeDasharray={i === 0 ? "" : "3,3"} 
                    />
                    <text 
                      x="-10" 
                      y={y} 
                      textAnchor="end" 
                      dy="0.32em" 
                      className="text-xs font-medium fill-slate-700 dark:fill-slate-300"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {/* Bars */}
              {data.map((item, i) => {
                const barWidth = 40;
                const x = i * 55 + 10;
                const y = item.type === "loss" 
                  ? 380 * (1 - item.cumulative / 45)
                  : 380 * (1 - item.cumulative / 45);
                const height = Math.abs(item.value) * (380 / 45);

                return (
                  <g key={i}>
                    {item.value !== 0 && (
                      <>
                        <rect
                          x={x}
                          y={item.type === "loss" ? y - height : y}
                          width={barWidth}
                          height={height}
                          rx={2}
                          fill={
                            item.type === "loss" 
                              ? "url(#lossGradient)" 
                              : item.type === "subtotal" 
                                ? "url(#subtotalGradient)"
                                : "url(#barGradient)"
                          }
                          filter="url(#shadow)"
                          className="transition-all duration-300 hover:opacity-90"
                        />
                        <text
                          x={x + barWidth/2}
                          y={item.type === "loss" ? y - height - 8 : y - 8}
                          textAnchor="middle"
                          className="text-xs font-semibold fill-slate-700 dark:fill-slate-300"
                          filter="url(#glow)"
                        >
                          {Math.abs(item.value).toFixed(1)}
                        </text>
                      </>
                    )}
                    
                    {/* X-axis labels */}
                    <text
                      x={x + barWidth/2}
                      y={380 + 25}
                      transform={`rotate(-45, ${x + barWidth/2}, ${380 + 25})`}
                      textAnchor="end"
                      className="text-xs font-medium fill-slate-600 dark:fill-slate-400"
                    >
                      {item.label}
                    </text>
                  </g>
                );
              })}

              {/* OEE reference lines */}
              <line 
                x1="0" 
                y1={380 * (1 - 30.3/45)} 
                x2="860" 
                y2={380 * (1 - 30.3/45)} 
                stroke="#2563EB" 
                strokeWidth="1.5"
                strokeDasharray="4,4" 
              />
              <text 
                x="865" 
                y={380 * (1 - 30.3/45)} 
                dy="0.32em" 
                className="text-xs font-semibold fill-blue-700"
                filter="url(#glow)"
              >
                OEE1 = 30.3%
              </text>
              
              <line 
                x1="0" 
                y1={380 * (1 - 36.7/45)} 
                x2="860" 
                y2={380 * (1 - 36.7/45)} 
                stroke="#7C3AED" 
                strokeWidth="1.5"
                strokeDasharray="4,4" 
              />
              <text 
                x="865" 
                y={380 * (1 - 36.7/45)} 
                dy="0.32em" 
                className="text-xs font-semibold fill-violet-700"
                filter="url(#glow)"
              >
                OEE2 = 36.7%
              </text>

              {/* Y-axis label */}
              <text
                transform="rotate(-90) translate(-190, -50)"
                className="text-sm font-semibold fill-slate-700 dark:fill-slate-300"
                textAnchor="middle"
                filter="url(#glow)"
              >
                HOURS
              </text>
            </g>
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}