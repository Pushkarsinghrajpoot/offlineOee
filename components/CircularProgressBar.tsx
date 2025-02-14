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

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
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
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-bold" style={{ fontSize: `${size * 0.2}px` }}>
          {value}%
        </span>
        {label && (
          <span className="text-sm" style={{ fontSize: `${size * 0.1}px` }}>
            {label}
          </span>
        )}
      </div>
    </div>
  )
}

