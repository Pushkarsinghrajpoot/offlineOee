interface CircularProgressBarProps {
  value: number
  color: string
  label?: string
  size: number
}

export function CircularProgressBar({ value, color, label, size }: CircularProgressBarProps) {
  const strokeWidth = size * 0.1
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (value / 100) * circumference

  // Define gradient IDs based on color
  const gradientId = `progress-gradient-${color.replace(/text-|dark:|\/.*$/g, '')}`

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className={`${color.replace('text-', 'text-')} stop-color:currentColor opacity-80`} />
            <stop offset="100%" className={`${color.replace('text-', 'text-')} stop-color:currentColor opacity-100`} />
          </linearGradient>
          <filter id="glow-progress">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          filter="url(#glow-progress)"
          style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold dark:text-white" style={{ fontSize: `${size * 0.2}px` }}>
          {value}%
        </span>
        {label && (
          <span className="text-sm text-gray-700 dark:text-gray-300" style={{ fontSize: `${size * 0.1}px` }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
