import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { motion } from "framer-motion"
import { Clock, FileText } from "lucide-react"
import { LineDetails } from "@/types/downtime"

interface LineDetailsCardProps {
  lineDetails: LineDetails
  onLineDetailsChange: (field: keyof LineDetails, value: string) => void
}

export function LineDetailsCard({ lineDetails, onLineDetailsChange }: LineDetailsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
              <FileText className="h-5 w-5 text-blue-500" />
              Line Details
            </h2>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <Input 
                  type="date" 
                  className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500" 
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 dark:text-gray-300">Shift Time</span>
                <Input 
                  type="time" 
                  className="w-32 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500" 
                />
                <span className="text-gray-600 dark:text-gray-300">to</span>
                <Input 
                  type="time" 
                  className="w-32 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500" 
                />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Input
              placeholder="Line"
              value={lineDetails.line}
              disabled
              className="bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
            />
            <Input
              placeholder="Shift"
              value={lineDetails.shift}
              onChange={(e) => onLineDetailsChange('shift', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Production Order"
              value={lineDetails.productionOrder}
              onChange={(e) => onLineDetailsChange('productionOrder', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Production Code"
              value={lineDetails.productionCode}
              onChange={(e) => onLineDetailsChange('productionCode', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Product Description"
              value={lineDetails.productDescription}
              onChange={(e) => onLineDetailsChange('productDescription', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Main Operator"
              value={lineDetails.mainOperator}
              onChange={(e) => onLineDetailsChange('mainOperator', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Assistant Operator"
              value={lineDetails.assistantOperator}
              onChange={(e) => onLineDetailsChange('assistantOperator', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <Input
              placeholder="Shift Incharge"
              value={lineDetails.shiftIncharge}
              onChange={(e) => onLineDetailsChange('shiftIncharge', e.target.value)}
              className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
