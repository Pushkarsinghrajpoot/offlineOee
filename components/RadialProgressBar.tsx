import React from 'react';

interface RadialProgressBarProps {
  value: number;
  color: string;
  label?: string;
  size: number;
}

export function RadialProgressBar({ value, color, label, size }: RadialProgressBarProps) {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate dimensions
  const strokeWidth = size * 0.1;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // Extract color name from the class for gradient ID
  const colorName = color.replace(/text-|dark:|\/.*$/g, '');
  const gradientId = `progress-${colorName}-${Math.random().toString(36).substring(2, 9)}`;
  
  // Map color classes to actual hex colors
  const colorMap: Record<string, { start: string, end: string }> = {
    'blue-500': { start: '#60a5fa', end: '#3b82f6' },
    'green-500': { start: '#4ade80', end: '#22c55e' },
    'yellow-500': { start: '#fcd34d', end: '#f59e0b' },
    'red-500': { start: '#f87171', end: '#ef4444' },
  };
  
  // Get the actual colors
  const selectedColor = colorMap[colorName] || { start: '#3b82f6', end: '#1d4ed8' };
  
  return (
    <div className="relative inline-flex flex-col items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={selectedColor.start} />
            <stop offset="100%" stopColor={selectedColor.end} />
          </linearGradient>
          <filter id={`glow-${colorName}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Background circle */}
        <circle
          strokeWidth={strokeWidth}
          stroke="#e5e7eb"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="dark:stroke-gray-700"
        />
        
        {/* Progress circle */}
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          filter={`url(#glow-${colorName})`}
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      
      {/* Center text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span 
          className="font-bold text-gray-900 dark:text-white" 
          style={{ fontSize: `${size * 0.2}px` }}
        >
          {normalizedValue}%
        </span>
        {label && (
          <span 
            className="text-gray-700 dark:text-gray-300 font-medium" 
            style={{ fontSize: `${size * 0.12}px` }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
