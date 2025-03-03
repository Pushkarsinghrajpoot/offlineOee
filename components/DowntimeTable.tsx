import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { DowntimeEntry } from "@/types/downtime"

interface DowntimeTableProps {
  downtimes: DowntimeEntry[]
  onEdit: (downtime: DowntimeEntry) => void
  onDelete: (id: string) => void
}

export function DowntimeTable({ downtimes, onEdit, onDelete }: DowntimeTableProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg"
    >
      <Table>
        <TableHeader className="bg-gray-50 dark:bg-gray-800">
          <TableRow>
            <TableHead className="font-semibold">Start Time</TableHead>
            <TableHead className="font-semibold">End Time</TableHead>
            <TableHead className="font-semibold">Duration (min)</TableHead>
            <TableHead className="font-semibold">Reason</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {downtimes.map((downtime) => (
              <motion.tr
                key={downtime.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <TableCell>{downtime.startTime}</TableCell>
                <TableCell>{downtime.endTime}</TableCell>
                <TableCell>{downtime.duration}</TableCell>
                <TableCell>{downtime.reason}</TableCell>
                <TableCell>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {downtime.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(downtime)}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(downtime.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-900 text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>
    </motion.div>
  )
}
