interface ProductionRateGaugeProps {
  data: {
    current: number
    target: number
  }
}

export function ProductionRateGauge({ data }: ProductionRateGaugeProps) {
  const percentage = (data.current / data.target) * 100
  const rotation = (percentage / 100) * 180 - 90

  return (
    <div className="relative w-48 h-24">
      <svg className="w-48 h-24">
        <path d="M24 88 A 64 64 0 0 1 176 88" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
        <path
          d={`M24 88 A 64 64 0 0 1 ${24 + (152 * percentage) / 100} ${
            88 - Math.sin((percentage / 100) * Math.PI) * 64
          }`}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="16"
          strokeLinecap="round"
        />
      </svg>
      <div
        className="absolute w-1 h-16 bg-red-500 origin-bottom"
        style={{
          bottom: "0px",
          left: "50%",
          transform: `translateX(-50%) rotate(${rotation}deg)`,
        }}
      ></div>
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-lg font-bold">
        {data.current}/{data.target}
      </div>
    </div>
  )
}

