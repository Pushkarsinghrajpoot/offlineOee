import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  color: string
  delay?: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function MetricCard({ icon: Icon, title, value, color, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.3, delay }}
      className="group"
    >
      <Card className={`${color} border-0 overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/10 rounded-lg transform transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="text-3xl font-bold text-white">{value}</div>
              <div className="text-sm text-white/80 group-hover:text-white transition-colors">{title}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
